const Joi = require('joi')

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
const mobNumreg = /^[0-9]{10}$/

const signupSchema = Joi.object({
    firstname: Joi.string().trim().min(2).max(20).required().messages({
        'string.empty': 'First name is required',
        'string.min': 'First name should be atleast 2 characters',
        'any.required': 'First name is required'
    }),
    lastname: Joi.string().trim().min(2).max(30).required().messages({
        'string.empty': 'Last name is required',
        'string.min': 'Last name must be of at least 2 characters',
        'any.required': 'Last name is required'
    }),
    email: Joi.string().trim().pattern(emailRegex).required().email().messages({
        'string.empty': 'Email is required',
        'string.pattern.base': 'Please enter valid email',
        'any.required': 'Email is required'
    }),
    password: Joi.string().trim().pattern(passwordRegex).required().messages({
        'string.empty': 'Password is required',
        'string.min': 'Password should contain atlest 6 characters',
        'any.required': 'Password is required'
    }),
    mobilenumber: Joi.string().trim().pattern(mobNumreg).required().messages({
        'string.empty': 'Mobile number is required',
        'string.pattern.base': 'Mobile number must be of 10 digits',
        'any.required': 'Mobile number is required'
    })
})

const loginSchema = Joi.object({
    email: Joi.string().trim().pattern(emailRegex).required().messages({
        'string.empty': 'Email is required',
        'string.pattern.base': 'Invalid email format',
        'any.required': 'Email is required'
    }),
    password: Joi.string().trim().required().messages({
        'string.empty': 'Password is required',
        'any.required': 'Password is required'
    })
})

const updateSchema = Joi.object({
    firstname: Joi.string().trim().min(2).messages({
        'string.min': 'First name should be atleast 2 characters'
    }),
    lastname: Joi.string().trim().min(2).messages({
        'string.min': 'Last name should be atleast 2 characters'
    }),
    email: Joi.string().trim().pattern(emailRegex).messages({
        'string.pattern.base': 'Please enter valid email'
    }),
    mobilenumber: Joi.string().trim().pattern(mobNumreg).messages({
        'string.pattern.base': 'Mobile number mast be of 10 digits'
    })
})

const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required().messages({
        'string.empty': 'Old password is required',
        'any.required': 'Old password is required',
    }),
    newPassword: Joi.string().trim().pattern(passwordRegex).required().messages({
        'string.empty': 'New password is required',
        'string.pattern.base': 'New password must be at least 8 characters and include uppercase, lowercase, number, and special character',
        'any.required': 'New password is required',
    }),
})

module.exports = { signupSchema, loginSchema, updateSchema, changePasswordSchema }