const express = require("express");
const {
  openAccount,
  hasAccount,
  getCard,
  transferMoney,
  requestPin2,
  getCardOwner,
  charge,
  blockCard,
  getTransactions,
  getCardSummary,
} = require("../controllers/cardController");

const router = express.Router();

router.get("/has-account", async (req, res, next) => {
    const { id: userId } = req.user;
    const exists = await hasAccount({userId});
    res.sendResponse({status: 1, exists});
  });

router.post("/open-account", async (req, res) => {
  try {
    const { amount, pin1 } = req.body;
    const data = await openAccount({ userId: req.user.id, amount, pin1 });
    res.sendResponse(data);
  } catch (err) {
    res.sendError(err);
  }
});

router.use("/", async (req, res, next) => {
  const { id: userId } = req.user;
  if (!hasAccount({ userId }))
    return res.sendError("user doesn't have card", 403);
  next();
});

router.get("/view-account", async (req, res) => {
  try {
    const { id: userId } = req.user;
    const card = await getCard({ userId });
    res.sendResponse({ status: 1, card });
  } catch (err) {
    res.sendError(err);
  }
});

router.get("/owner/:cardNumber", async (req, res) => {
  try {
    const { cardNumber } = req.params;
    const data = await getCardOwner({ cardNumber });
    res.sendResponse(data);
  } catch (err) {
    res.sendError(err);
  }
});

router.get("/pin2", async (req, res) => {
  try {
    const { id: userId } = req.user;
    const data = await requestPin2({ userId });
    res.sendResponse(data);
  } catch (err) {
    res.sendError(err);
  }
});

router.post("/card-to-card", async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { cardNumber, pin2 } = req.body;
    const data = await transferMoney({ userId, cardNumber, pin2 });
    res.sendResponse(data);
  } catch (err) {
    res.sendError(err);
  }
});

router.post("/charge", async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { mobile, operator, chargeType, pin2 } = req.body;
    const data = await charge({ userId, mobile, operator, chargeType, pin2 });
    res.sendResponse(data);
  } catch (err) {
    res.sendError(err);
  }
});

router.post("/block", async (req, res) => {
  try {
    const { id: userId } = req.user;
    const data = await blockCard({ userId });
    res.sendResponse(data);
  } catch (err) {
    res.sendError(err);
  }
});

router.get("/transactions", async (req, res) => {
  try {
    const { id: userId } = req.user;
    const transactions = await getTransactions({ userId });
    res.sendResponse({ status: 1, transactions });
  } catch (err) {
    res.sendError(err);
  }
});

router.get("/summary", async (req, res) => {
  try {
    const { id: userId } = req.user;
    const result = await getCardSummary({ userId });
    res.sendResponse({ status: 1, card: result });
  } catch (err) {
    res.sendError(err);
  }
});

module.exports = router;
