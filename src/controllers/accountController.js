const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');

const {User} = require('../models');
const { randomCode } = require('../utils/helper');
const { encrypt, comparePassword } = require('../utils/security');
const {JWTKEY} = process.env;

exports.register = async (body, files) => {
    const {fullname, username, mobile, nationalCode, birthDate, password} = body;
    // mobile must be unique
    let existUser = await User.findOne({mobile});
    if (existUser) return {status: 2};
    // username must be unique
    existUser = await User.findOne({username});
    if (existUser) return {status: 3};
    // hash password
    const hash = encrypt(password);
    // create user in database
    const user = new User({
        fullname,
        username,
        mobile,
        nationalCode,
        birthDate,
        password: hash,
        activeCode: randomCode(),
        isActive: true,
    });
    await user.save();
    // add images to storage
    let tempPath = files[0].path;
    let targetPath = path.join(__dirname, `../.././storage/birthCertificates/${user.id}${path.extname(files[0].originalname)}`);
    fs.cpSync(tempPath, targetPath);
    
    tempPath = files[1].path;
    targetPath = path.join(__dirname, `../.././storage/idCards/${user.id}${path.extname(files[1].originalname)}`);
    fs.cpSync(tempPath, targetPath);

    fs.unlinkSync(files[0].path);
    fs.unlinkSync(files[1].path);

    return {status: 1, userId: user.id, code: user.activeCode};
}

exports.active = async ({userId, code}) => {
    const user = await User.findById(userId);
    if (user.activeCode !== code) return {status: 2};
    user.activeCode = randomCode();
    user.isActive = true;
    await user.save();
    return {status: 1};
}

exports.login = async body => {
    const {username, password} = body;
    
    let user = await User.findOne({username});
    if (!user) return {status: 4};
    if (!user.isActive) return {status: 3};
    if (user.verified !== 1) return {status: user.verified};
    const compare = await comparePassword(user.password, password);
    if (!compare) return {status: 4};

    const token = jwt.sign({id: user.id, username: user.username, fullname: user.fullname, registerDate: user.registerDate, lastLoginDate: user.lastLoginDate}, JWTKEY, { expiresIn: '24h' });
    user.lastLoginDate = Date.now();
    await user.save();
    return {status: 1, token};
}

exports.forgetPassword = async body => {
    const {mobile} = body;
    const user = await User.findOne({mobile});
    if (!user) return {status: 2};
    return {status: 1, code: randomCode()};
}

exports.resetPassword = async body => {
    const {mobile, newPassword} = body;
    const user = await User.findOne({mobile});
    if (!user) return {status: 2};
    const hash = encrypt(newPassword);
    user.password = hash;
    await user.save();
    return {status: 1};
}

exports.existsMobile = async mobile => {
    const user = await User.findOne({mobile});
    if (user) return true;
    return false;
}

exports.existsNationalCode = async nationalCode => {
    const user = await User.findOne({nationalCode});
    if (user) return true;
    return false;
}