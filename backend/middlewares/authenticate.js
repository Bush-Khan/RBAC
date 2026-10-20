const jwt = require('jsonwebtoken')
const apiError = require('../utils/apiError')
const asyncHandler = require('../middlewares/asyncHandler')
const blacklistToken = require('../model/blacklistToken')
const { redisClient } = require('../db-config/redis')
const User = require('../model/user')

const authenticate = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) throw new apiError(401, 'No token provided, access denied');

    const token = authHeader.split(' ')[1];

    // Step 1: signature aur expiry check
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    }
    catch (err) {
        throw new apiError(401, 'Invalid or expired token')
    }

    // redis implemented
    const isBlacklisted = await redisClient.get(`blacklist:${token}`)
    if (isBlacklisted) throw new apiError(401, 'Token has been logged out, please login again')

    // Step 2: blacklist check (w/o redis)
    // let blacklistedToken = await blacklistToken.findOne({ token })
    // if (blacklistedToken) throw new apiError(401, 'Token has been logged out, please login again')

    // NEW: user abhi bhi exist karta hai ya nahi, DB se confirm karo
    const currentUser = await User.findById(decoded.id)
    if (!currentUser) throw new apiError(401, 'User no longer exists, please login again')

    // Step 3: user info request me attach karo
    req.user = { id: currentUser._id, role: currentUser.role }

    next()
})

module.exports = authenticate