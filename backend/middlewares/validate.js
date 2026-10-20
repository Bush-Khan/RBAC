const apiError = require('../utils/apiError')

// for single single error
const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body || {}, { abortEarly: true })

    if (error) {
        const message = error.details[0].message
        return next(new apiError(400, message))
    }

    next()
}

// for combine error
const validateCombine = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body || {}, { abortEarly: false })

  if (error) {
    const messages = error.details.map((detail) => detail.message)
    return next(new apiError(400, messages))
  }

  next()
}

module.exports = validate 