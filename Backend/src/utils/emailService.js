const nodemailer = require('nodemailer');
const config = require('../config/env');

// Email service for sending verification emails
// This is a placeholder - implement based on your email provider

let transporter = null;

if (config.email.host && config.email.user && config.email.pass) {
  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass
    }
  });
}

/**
 * Send email verification
 * @param {String} email - Recipient email
 * @param {String} token - Verification token
 * @returns {Promise}
 */
const sendVerificationEmail = async (email, token) => {
  if (!transporter) {
    console.log('Email service not configured. Verification token:', token);
    return;
  }

  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

  const mailOptions = {
    from: config.email.user,
    to: email,
    subject: 'Verify your Dayflow account',
    html: `
      <h2>Welcome to Dayflow HRMS</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>Or copy and paste this token: ${token}</p>
      <p>This link will expire in 24 hours.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail
};

