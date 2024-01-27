const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    fullname: {type: String, required: true, minLength: 3, maxLength: 50},
    username: {type: String, required: true, minLength: 3, maxLength: 50, unique: true},
    password: {type: String, required: true, minLength: 4},
    birthDate: {type: Date, default: Date.now},
    registerDate: {type: Date, default: Date.now},
    lastLoginDate: {type: Date, default: Date.now},
    nationalCode: {type: String, required: true, minLength: 10, maxLength: 10},
    mobile: {type: String, required: true, minLength: 11, maxLength: 11, unique: true},
    activeCode: {type: Number, required: true, default: 0},
    isActive: {type: Boolean, default: false},
    verified: {type: Number, default: 0},
});

module.exports = mongoose.model('User', UserSchema);