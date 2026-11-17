import nodemailer from 'nodemailer';
import config from '../config';
import logger from './logger';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

const baseStyles = `
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9fafb;
`;

const buttonStyles = `
  display: inline-block;
  padding: 12px 32px;
  background-color: #2563eb;
  color: #ffffff;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  margin: 16px 0;
`;

export const sendVerificationEmail = async (to: string, token: string): Promise<void> => {
  const verificationUrl = `${config.cors.origin}/verify-email?token=${token}`;

  const html = `
    <div style="${baseStyles}">
      <h1 style="color: #1e293b; text-align: center;">Welcome to MailVault</h1>
      <div style="background: white; padding: 32px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h2 style="color: #334155;">Verify Your Email Address</h2>
        <p style="color: #64748b; line-height: 1.6;">
          Thank you for creating a MailVault account. Please verify your email address by clicking the button below.
        </p>
        <div style="text-align: center;">
          <a href="${verificationUrl}" style="${buttonStyles}">Verify Email</a>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${verificationUrl}" style="color: #2563eb;">${verificationUrl}</a>
        </p>
        <p style="color: #94a3b8; font-size: 12px;">This link expires in 24 hours.</p>
      </div>
      <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
        &copy; ${new Date().getFullYear()} MailVault. All rights reserved.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"MailVault" <${config.email.from}>`,
      to,
      subject: 'Verify Your Email - MailVault',
      html,
    });
    logger.info(`Verification email sent to ${to}`);
  } catch (error) {
    logger.error('Failed to send verification email:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (to: string, token: string): Promise<void> => {
  const resetUrl = `${config.cors.origin}/reset-password?token=${token}`;

  const html = `
    <div style="${baseStyles}">
      <h1 style="color: #1e293b; text-align: center;">MailVault</h1>
      <div style="background: white; padding: 32px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h2 style="color: #334155;">Reset Your Password</h2>
        <p style="color: #64748b; line-height: 1.6;">
          We received a request to reset your password. Click the button below to choose a new password.
        </p>
        <div style="text-align: center;">
          <a href="${resetUrl}" style="${buttonStyles}">Reset Password</a>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a>
        </p>
        <p style="color: #94a3b8; font-size: 12px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
      </div>
      <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
        &copy; ${new Date().getFullYear()} MailVault. All rights reserved.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"MailVault" <${config.email.from}>`,
      to,
      subject: 'Password Reset - MailVault',
      html,
    });
    logger.info(`Password reset email sent to ${to}`);
  } catch (error) {
    logger.error('Failed to send password reset email:', error);
    throw error;
  }
};

export const sendSecurityAlert = async (to: string, message: string): Promise<void> => {
  const html = `
    <div style="${baseStyles}">
      <h1 style="color: #1e293b; text-align: center;">MailVault</h1>
      <div style="background: white; padding: 32px; border-radius: 8px; border-left: 4px solid #ef4444; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h2 style="color: #dc2626;">⚠️ Security Alert</h2>
        <p style="color: #64748b; line-height: 1.6;">${message}</p>
        <p style="color: #64748b; line-height: 1.6;">
          If this was you, no action is needed. If you don't recognize this activity,
          please change your password immediately and enable two-factor authentication.
        </p>
      </div>
      <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
        &copy; ${new Date().getFullYear()} MailVault. All rights reserved.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"MailVault Security" <${config.email.from}>`,
      to,
      subject: '⚠️ Security Alert - MailVault',
      html,
    });
    logger.info(`Security alert email sent to ${to}`);
  } catch (error) {
    logger.error('Failed to send security alert email:', error);
    throw error;
  }
};
