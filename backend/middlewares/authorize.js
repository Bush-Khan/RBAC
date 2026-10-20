const apiError = require('../utils/apiError')

const authorize = (...allowedRoles) => (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        throw new apiError(403, 'You do not have access')
    }
    next()
}

module.exports = authorize