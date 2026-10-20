const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstname: { type: String, required: [true, 'First name is required'], trim: true },
    lastname: { type: String, required: [true, 'Last name is required'], trim: true },
    email: { type: String, unique: true, required: [true, 'Email is required'], trim: true },
    password: { type: String, required: [true, 'Password is required'], trim: true, select: false },
    mobilenumber: { type: String, required: [true, 'Mobile number is required'], minlength: 10, trim: true },
    role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)