const apiError = require('../utils/apiError')

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let msg = err.message || 'Internal Server Error'

    res.status(statusCode).json({ success: false, msg })
}

module.exports = errorHandler