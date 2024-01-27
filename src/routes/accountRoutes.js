const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  register,
  active,
  resetPassword,
  forgetPassword,
  login,
  existsMobile,
  existsNationalCode,
} = require("../controllers/accountController");
const { randomCode } = require("../utils/helper");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "storage/uploads/");
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${randomCode()}${path.extname(file.originalname)}`
    );
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/; // Choose Types you want...
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Images only!"); // custom this message to fit your needs
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

const router = express.Router();

router.post("/register", upload.array("images"), async (req, res) => {
  try {
    const data = await register(req.body, req.files);
    if (data.status === 2) return res.sendError("mobile must be unique", 400);
    if (data.status === 3) return res.sendError("username must be unique", 400);
    res.sendResponse(data);
  } catch (err) {
    res.sendError(err);
  }
});

router.get("/active-code", async (req, res) => {
  try {
    const code = randomCode();
    console.log(`active code: ${code}`);
    res.sendResponse({ status: 1, code });
  } catch (err) {
    res.sendError(err);
  }
});

router.post("/active", async (req, res) => {
  try {
    const { userId, code } = req.body;
    const data = await active({ userId, code });
    if (data.status === 2) return res.sendError("invalid code", 400);
    res.sendResponse(data);
  } catch (err) {
    res.sendError(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    const data = await login(req.body);
    res.sendResponse(data);
  } catch (err) {
    res.sendError(err);
  }
});

router.post("/forget-password", async (req, res) => {
  try {
    const data = await forgetPassword(req.body);
    if (data.status === 2) return res.sendError("user not found", 404);
    console.log(`active code: ${data.code}`);
    res.sendResponse(data);
  } catch (err) {
    res.sendError(err);
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const data = await resetPassword(req.body);
    if (data.status === 2) return res.sendError("user not found", 404);
    res.sendResponse(data);
  } catch (err) {
    res.sendError(err);
  }
});

router.get("/exists-mobile/:mobile", async (req, res) => {
  try {
    const { mobile } = req.params;
    const exists = await existsMobile(mobile);
    res.sendResponse({ status: 1, exists });
  } catch (err) {
    res.sendError(err);
  }
});

router.get("/exists-nationalCode/:nationalCode", async (req, res) => {
  try {
    const { nationalCode } = req.params;
    const exists = await existsNationalCode(nationalCode);
    res.sendResponse({ status: 1, exists });
  } catch (err) {
    res.sendError(err);
  }
});

module.exports = router;
