require('dotenv').config();
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const connectDB = require('./db-config/db')
const { connectRedis } = require('./db-config/redis')
const authRoute = require('./route/user.route')
const errHandler = require('./middlewares/errorHandler')
const apiError = require('./utils/apiError')

const app = express()

connectDB()
connectRedis()

// middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(cookieParser())

// route
app.use('/api/auth', authRoute)

// 404 handler
app.use((req, res, next) => {
    next(new apiError(404, 'Route not found'))
})

// global handler (always on last)
app.use(errHandler)

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is up and running on ${port}`);
})