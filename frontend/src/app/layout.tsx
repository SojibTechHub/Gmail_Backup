import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MailVault – Universal Email Recovery & Security Platform',
  description:
    'Comprehensive enterprise SaaS platform for legitimate email account recovery management, readiness assessment, and zero-knowledge client-side AES-256 encrypted vault.',
  keywords: [
    'email recovery',
    'account recovery',
    'cybersecurity',
    'two-factor backup',
    'zero-knowledge encryption',
    'password restoration',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                style: {
                  borderRadius: '16px',
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
