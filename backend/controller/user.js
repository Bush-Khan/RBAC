const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../model/user')
const apiError = require('../utils/apiError')
const asyncHandler = require('../middlewares/asyncHandler')
const blacklistToken = require('../model/blacklistToken')
const { redisClient } = require('../db-config/redis')

const generateToken = (userId, role) => {
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY
    })
}

const signupWOJoi = asyncHandler(async (req, res) => {
    const { firstname, lastname, email, password, mobilenumber } = req.body || {};

    if (!firstname) throw new apiError(400, 'First name is required')
    if (!lastname) throw new apiError(400, 'Last name is required')
    if (!email) throw new apiError(400, 'Email is required')
    if (!password) throw new apiError(400, 'Password is required')
    if (!mobilenumber) throw new apiError(400, 'Mobile number is required')

    let existingEmail = await User.findOne({ email })
    if (existingEmail) throw new apiError(409, 'Email id already exists.')

    const hashedPassword = await bcrypt.hash(password, 10)

    const userCount = await User.countDocuments()
    const role = userCount === 0 ? 'admin' : 'user'

    const user = await User.create({ firstname, lastname, email, password: hashedPassword, mobilenumber, role });
    const token = generateToken(user._id)

    res.status(201).json({ success: true, message: 'User created', token, user })

})

const signup = asyncHandler(async (req, res) => {
    const { firstname, lastname, email, password, mobilenumber } = req.body || {};

    let existingEmail = await User.findOne({ email })
    if (existingEmail) throw new apiError(409, 'Email id already exists.')

    const hashedPassword = await bcrypt.hash(password, 10)

    const userCount = await User.countDocuments()
    const role = userCount === 0 ? 'admin' : 'user'

    const user = await User.create({ firstname, lastname, email, password: hashedPassword, mobilenumber, role });

    res.status(201).json({ success: true, message: 'User created', user })

})

const loginWOJoi = asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};

    if (!email) throw new apiError(400, 'Email is required')
    if (!password) throw new apiError(400, 'Password is required')

    let user = await User.findOne({ email }).select("+password")

    if (!user) throw new apiError(401, "Invalid email")

    let compare = await bcrypt.compare(password, user.password)

    if (!compare) throw new apiError(401, "Invalid password")

    const token = generateToken(user._id)

    res.status(200).json({ success: true, message: 'Login successful', token, user })

})

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};

    let user = await User.findOne({ email }).select("+password")
    if (!user) throw new apiError(401, "Invalid email")

    let compare = await bcrypt.compare(password, user.password)
    if (!compare) throw new apiError(401, "Invalid password")

    const token = generateToken(user._id, user.role)

    const userResponse = {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        mobilenumber: user.mobilenumber,
        role: user.role
    }

    res.status(200).json({ success: true, message: 'Login successful', token, user: userResponse })

})

const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) throw new apiError(404, 'User not found.')

    return res.status(200).json({ success: true, user })
})

const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password')
    return res.status(200).json({ success: true, count: users.length, users })
})

const updateUser = asyncHandler(async (req, res) => {
    const { firstname, lastname, email, mobilenumber } = req.body || {}

    const existingEmail = await User.findOne({ email, _id: { $ne: req.body.id } })
    if (existingEmail) throw new apiError(409, 'Email already in use')

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { firstname, lastname, email, mobilenumber },
        { new: true, runValidators: true }
    ).select('-password')

    // const updatedUser = await User.findByIdAndUpdate(req.body.id, { firstname, lastname, email, mobilenumber }, { new: true, runValidators: true }).select('-password')
    // if (!updatedUser) throw new apiError(404, 'User not found')

    res.status(200).json({ success: true, message: 'Profile updated successfully', user: updatedUser })
})

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user.id).select('+password')
    if (!user) throw new apiError(404, 'User not found')

    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) throw new apiError(401, 'Old password is incorrect')

    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) throw new apiError(400, 'New password cannot be the same as old password')

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    await user.save()

    res.status(200).json({ success: true, message: 'Password changed successfully' })
})

const logout = asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) throw new apiError(401, 'Token not present')

    let token = authHeader.split(' ')[1]

    // Token decode karke uski expiry nikaalo (verify karne ki zaroorat nahi,
    // kyunki authenticate middleware pehle hi verify kar chuka hai)
    let decoded = jwt.decode(token)

    // with redis
    const expireInSeconds = decoded.exp - Math.floor(Date.now() / 1000)
    await redisClient.set(`blacklist:${token}`, 'true', { EX: expireInSeconds })

    // without redis
    // let blacklist = await blacklistToken.create({ token, expiresAt: new Date(decoded.exp * 1000) })

    res.status(200).json({ success: true, message: 'Logged out successfully' })
})

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params

    const user = await User.findById(id)
    if (!user) throw new apiError(404, 'User not found')

    if (user.role == 'admin') throw new apiError(403, 'Admin user cannot be deleted')

    await User.findByIdAndDelete(id)

    res.status(200).json({ success: true, message: 'User deleted successfully' })
})

const updateUserRole = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { role } = req.body || {}

    const allowedRoles = ['user', 'moderator', 'admin']
    if (!allowedRoles.includes(role)) throw new apiError(400, 'Invalid role value')

    const user = await User.findById(id)
    if (!user) throw new apiError(404, 'User not found')

    user.role = role
    await user.save()


    res.status(200).json({
        success: true, message: 'User role updated successfully',
        user: { _id: user._id, email: user.email, role: user.role }
    })
})

// Important technical point — jwt.decode() vs jwt.verify():

// jwt.verify() → signature check karta hai + expiry check karta hai + decode karta hai (sab kuch)
// jwt.decode() → sirf decode karta hai, koi verification nahi karta (signature check nahi hota)

module.exports = { signup, login, getProfile, getUsers, updateUser, changePassword, logout, deleteUser, updateUserRole }