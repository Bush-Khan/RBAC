const mongoose = require('mongoose')

const blacklistToken = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true }
})

// TTL index — jab bhi current time 'expiresAt' se aage nikal jaayega,
// MongoDB khud is document ko background me delete kar dega
blacklistToken.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model('BlacklistToken', blacklistToken)