const { default: mongoose } = require('mongoose');
const {Card, Transaction, User} = require('../models');
const { randomCardNumber, randomAccountNumber, randomShaba, randomCvv2, randomCode } = require('../utils/helper');

exports.openAccount = async ({userId, amount, pin1}) => {
    const expireDate = new Date();
    expireDate.setUTCFullYear(expireDate.getFullYear() + 5);
    expireDate.setUTCDate(0);
    expireDate.setUTCHours(0, 0, 0);
    const accountNumber = randomAccountNumber();
    const card = new Card({
        userId,
        cardNumber: randomCardNumber(),
        accountNumber,
        shaba: randomShaba(accountNumber),
        cvv2: randomCvv2(),
        pin1,
        pin2: randomCode(),
        expireDate,
        balance: amount,
    });
    await card.save();
    return {status: 1};
}

exports.hasAccount = async ({userId}) => {
    const card = await Card.findOne({userId});
    if (card) return true;
    return false;
}

exports.getCard = async ({userId}) => {
    const card = await Card.findOne({userId});
    const {cardNumber, cvv2, expireDate, balance} = card;
    const result = {
        cardNumber,
        cvv2,
        expireDate,
        balance: balance.toLocaleString(),
    }
    const user = await User.findById(userId);
    result.owner = user.fullname;
    return result;
}

exports.getCardOwner = async ({cardNumber}) => {
    const card = await Card.findOne({cardNumber}).populate('userId');
    if (!card) return {status: 2};
    return {status: 1, owner: card.userId.fullname};
}

exports.requestPin2 = async ({userId}) => {
    const card = await Card.findOne({userId});
    card.pin2 = randomCode();
    console.log(`pin2 => ${card.pin2}`);
    card.expiredPin = false;
    await card.save();
    // expire pin2 after two minutes
    setTimeout(async () => {
        card.expiredPin = true;
        await card.save();
    }, 120000);
    return {status: 1, pin2: card.pin2};
}

exports.transferMoney = async ({userId, cardNumber, amount, pin2}) => {
    const destCard = await Card.findOne({cardNumber});
    if (!destCard) return {status: 2};
    const card = await Card.findOne({userId});
    if (card.pin2 !== pin2) return {status: 3};
    if (card.pin2 === pin2 && card.expiredPin) return {status: 4};
    if (card.cardNumber === destCard.cardNumber) return {status: 5};
    if (card.balance < (BigInt)(amount)) return {status: 6};

    // card to card
    card.balance -= (BigInt)(amount);
    destCard.balance += (BigInt)(amount);
    await card.save();
    await destCard.save();

    // add transaction
    const transaction1 = new Transaction({
        cardId: card._id,
        type: 'deposit',
        amount,
        description: 'card to card'
    });
    const transaction2 = new Transaction({
        cardId: destCard._id,
        type: 'withdraw',
        amount,
        description: 'card to card',
    });
    await transaction1.save();
    await transaction2.save();
}

exports.charge = async ({userId, mobile, operator, chargeType, pin2}) => {
    const card = await Card.findOne({userId});
    if (card.pin2 !== pin2) return {status: 3};
    if (card.pin2 === pin2 && card.expiredPin) return {status: 4};
    if (card.balance < (BigInt)(chargeType * 1000)) return {status: 6};

    card.balance -= (BigInt)(chargeType * 1000);
    await card.save();

    const transaction = new Transaction({
        cardId: card._id,
        description: "charge",
        type: "deposit",
        amount: chargeType * 1000,
    });
    await transaction.save();
    return {status: 1};
}

exports.blockCard = async ({userId}) => {
    const card = await Card.findOne({userId});
    await Transaction.deleteMany({cardId: card._id});
    await Card.deleteOne({_id: card._id});
    return {status: 1};
}

exports.getTransactions = async ({userId}) => {
    const card = await Card.findOne({userId});
    const transactions = await Transaction.find({cardId: card._id});
    return transactions;
}

exports.getCardSummary = async ({userId}) => {
    const result = await Card.aggregate([
        {
            $match: {userId: new mongoose.Types.ObjectId(userId)}
        },
        {
            $lookup: {
                from: "transactions",
                localField: "_id",
                foreignField: "cardId",
                as: "transactions"
            }
        },
        {
            $project: {
                balance: {$toString: "$balance"},
                transactions: 1,
            }
        }
    ]);
    return result[0];
}