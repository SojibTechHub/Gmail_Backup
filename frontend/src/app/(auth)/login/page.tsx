import React from 'react';
import { LoginForm } from '../../../components/auth/LoginForm';

export const metadata = {
  title: 'Sign In – MailVault',
  description: 'Sign in to access your secure email recovery vault and accounts',
};

export default function LoginPage() {
  return <LoginForm />;
}
