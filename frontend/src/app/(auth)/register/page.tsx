import React from 'react';
import { RegisterForm } from '../../../components/auth/RegisterForm';

export const metadata = {
  title: 'Register – MailVault',
  description: 'Create a new MailVault account with client-side encrypted recovery storage',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
