const apiError = require('../utils/apiError')
const asyncHandler = require('./asyncHandler')
const { redisClient } = require('../db-config/redis')

const loginRateLimiter = asyncHandler(async (req, res, next) => {
    const ip = req.ip;
    const key = `ratelimit:login:${ip}`

    const attempts = await redisClient.incr(key)

    const ttl = await redisClient.ttl(key)

    if (ttl === -1) {
        await redisClient.expire(key, 60)
    }

    if (attempts > 5) {
        throw new apiError(429, 'Too many login attempts. Please try again after some time.')
    }

    next()
})

module.exports = loginRateLimiter