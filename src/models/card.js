const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
    userId: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
    cardNumber: {type: String, required: true, minLength: 16, maxLength: 16, unique: true},
    accountNumber: {type: String, required: true, unique: true},
    shaba: {type: String, required: true, minLength: 10, maxLength: 50},
    expireDate: {type: Date, required: true},
    pin1: {type: Number, required: true},
    pin2: {type: Number, required: true},
    expiredPin: {type: Boolean, default: true},
    cvv2: {type: Number, required: true},
    balance: {type: BigInt, required: true, default: 0},
});

module.exports = mongoose.model('Card', cardSchema);