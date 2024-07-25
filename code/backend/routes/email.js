// routes/email.js
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const { authenticateJWT } = require('../middleware/authorization');

// Configure your SMTP transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services like Outlook, Yahoo, etc.
    auth: {
        user: 'your-email@gmail.com', // Your email
        pass: 'your-password' // Your email password
    }
});

// Email sending endpoint
router.post('/sendInvitation', authenticateJWT, async (req, res) => {
    const { email, feature, permissions } = req.body;
    try {
        let mailOptions = {
            from: 'your-email@gmail.com', // Sender address
            to: email, // List of recipients
            subject: 'Invitation to collaborate', // Subject line
            html: `
                <h1>You are invited!</h1>
                <p>Sei stato invitato a ${permissions.viewAndEdit ? 'visulizzare ed editare' : 'visualizzare solo'} le ${feature === 'notes' ? 'note' : ''}</p>
                <button style="color: green;">Accept</button>
                <button style="color: red;">Decline</button>
            ` // HTML body content
        };

        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        res.status(200).send({ success: true, message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email: ', error);
        res.status(500).send({ success: false, message: 'Failed to send email' });
    }
});

module.exports = router;
