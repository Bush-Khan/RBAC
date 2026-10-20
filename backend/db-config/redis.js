const redis = require('redis')

const redisClient = redis.createClient({
    url: process.env.REDIS_URL
})

redisClient.on('error', (err) => {
    console.log('Redis error ==>>', err)
})

const connectRedis = async () => {
    try {
        await redisClient.connect()
        console.log('Redis connected!!')
    }
    catch (error) {
        console.log(error)
    }
}

module.exports = { redisClient, connectRedis }