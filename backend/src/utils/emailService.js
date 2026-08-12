import nodemailer from 'nodemailer';

const createTransporter = () => {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  
  if (!transporter || !process.env.SMTP_USER || process.env.SMTP_USER.includes('your_email') || process.env.SMTP_USER === '') {
    console.log(`\n--- [EMAIL IN DEVELOPMENT MODE] ---`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content:\n${html.replace(/<[^>]*>/g, '').trim()}`);
    console.log(`------------------------------------\n`);
    return { success: true, dev: true };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    console.error('SMTP sending error, falling back to console log:', error.message);
    console.log(`\n--- [EMAIL IN DEVELOPMENT MODE (FALLBACK)] ---`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content:\n${html.replace(/<[^>]*>/g, '').trim()}`);
    console.log(`----------------------------------------------\n`);
    return { success: true, dev: true, error: error.message };
  }
};

export const sendVerificationEmail = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  return sendEmail({
    to: user.email,
    subject: 'Verify Your Email - Shri Seervi Samaj Konda',
    html: `
      <h2>Welcome to Shri Seervi Samaj Konda</h2>
      <p>Hello ${user.name},</p>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${url}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `,
  });
};

export const sendPasswordResetEmail = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  return sendEmail({
    to: user.email,
    subject: 'Password Reset - Shri Seervi Samaj Konda',
    html: `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.name},</p>
      <p>Click the link below to reset your password:</p>
      <a href="${url}">Reset Password</a>
      <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    `,
  });
};

export const sendOTPEmail = async (user, otp) => {
  return sendEmail({
    to: user.email,
    subject: 'OTP Verification - Shri Seervi Samaj Konda',
    html: `
      <h2>OTP Verification</h2>
      <p>Hello ${user.name},</p>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This OTP expires in 10 minutes.</p>
    `,
  });
};
