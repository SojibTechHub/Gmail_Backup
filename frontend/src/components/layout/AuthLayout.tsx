'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Lock } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-base-200/60 relative overflow-hidden">
      {/* Decorative background grid & radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between relative z-10 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-base-content">
          <div className="p-1.5 rounded-xl bg-primary text-primary-content shadow-md shadow-primary/20">
            <Shield className="w-5 h-5" />
          </div>
          <span className="tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-extrabold text-xl">
            MailVault
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Centered Auth Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10 my-4">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer Notice */}
      <footer className="p-4 text-center text-xs text-base-content/50 relative z-10">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Lock className="w-3.5 h-3.5 text-primary" />
          <span>Zero-Knowledge Client-Side AES-256 Encryption Architecture</span>
        </div>
        <p>&copy; {new Date().getFullYear()} MailVault Security Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}
