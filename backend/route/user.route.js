const express = require('express')
const router = express.Router()
const validate = require('../middlewares/validate')
const { signupSchema, loginSchema, updateSchema, changePasswordSchema } = require('../validation/user.validation')
const { signup, login, getProfile, getUsers, updateUser, logout, changePassword, deleteUser, updateUserRole } = require('../controller/user')
const authenticate = require('../middlewares/authenticate')
const authorize = require('../middlewares/authorize')
const loginRateLimiter = require('../middlewares/rateLimiter')
// public routes
router.post('/register', validate(signupSchema), signup)
router.post('/login', loginRateLimiter, validate(loginSchema), login)

// self (koi bhi logged-in role — sirf apna data)
router.get('/profile', authenticate, getProfile)
router.post('/updateUser', authenticate, validate(updateSchema), updateUser)
router.post('/changePassword', authenticate, validate(changePasswordSchema), changePassword)
router.post('/logout', authenticate, logout)

// admin + moderator (sabka data — read-only power)
router.get('/getUsers', authenticate, authorize('admin', 'moderator'), getUsers)

// admin only (write/delete power)
router.delete('/delete/:id', authenticate, authorize('admin'), deleteUser)
router.patch('/update/userRole/:id', authenticate, authorize('admin'), updateUserRole)

module.exports = router