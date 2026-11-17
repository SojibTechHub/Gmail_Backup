import React from 'react';
import { ForgotPasswordForm } from '../../../components/auth/ForgotPasswordForm';

export const metadata = {
  title: 'Forgot Password – MailVault',
  description: 'Request a password reset link for your MailVault account',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
