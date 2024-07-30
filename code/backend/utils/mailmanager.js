const config = require('../config');
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: 'sloth.selfie@gmail.com',
        pass: "tdju rikq pooo ihqo"
    },
});


module.exports = {
    transporter: transporter,
    mailSender: '"Selfie" <sloth.selfie@gmail.com>',
}