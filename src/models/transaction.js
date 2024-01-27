const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    cardId: {type: mongoose.Types.ObjectId, required: true, ref: 'Card'},
    amount: {type: Number, required: true},
    date: {type: Date, required: true, default: Date.now},
    type: {type: String, required: true, enum: ['withdraw', 'deposit']},
    description: {type: String},
});

module.exports = mongoose.model('Transaction', TransactionSchema);