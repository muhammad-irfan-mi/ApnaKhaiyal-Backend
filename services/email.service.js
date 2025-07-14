const transport = require('../config/email');

const verificationMail = async (to, token) => {
    const verifyUrl = `${process.env.BASE_URL}/auth/verify/${token}`;
    const mailOption = {
        from: process.env.EMAIL_SENDER,
        to,
        subject: "Email Verification",
        html: `
        <h1>Verify Your Email</h1>
        <p>Click the button below to verify your email:</p>
        <a href="${verifyUrl}" style="padding: 10px 15px; background: blue; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>`,
    };

    await transport.sendMail(mailOption);
};

const verifyOtp = async (email, code) => {
    const mailOptions = {
        from: process.env.EMAIL_SENDER,
        to: email,
        subject: 'Password Reset Code',
        html: `
        <h1>Password Reset</h1>
        <p>Your 6-digit code to reset the password is: <strong>${code}</strong></p>
        <p>If you didn't request this, please ignore this email.</p>
        `,
    };

    try {
        await transport.sendMail(mailOptions);
        console.log('Verification code sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const verificationInvite = async (to, token) => {
    const verifyUrl = `${process.env.BASE_URL}/admin/invite/accept/${token}`;

    console.log("Generated Verify URL:", verifyUrl);
    const mailOption = {
        from: process.env.EMAIL_SENDER,
        to,
        subject: "Email Verification",
        html: `
        <h1>Verify Your Email</h1>
        <p>Click the button and accept Invite:</p>
        <a href="${verifyUrl}" style="padding: 10px 15px; background: blue; color: white; text-decoration: none; border-radius: 5px;">Accept Invite</a>`,
    };

    await transport.sendMail(mailOption);
};

module.exports = {
    verificationMail,
    verifyOtp,
    verificationInvite
};
