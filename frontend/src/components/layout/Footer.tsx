'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="footer footer-center p-4 bg-base-100/60 border-t border-base-300 text-base-content/60 text-xs">
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
        <div className="flex items-center gap-1.5 font-medium text-base-content/80">
          <ShieldCheck className="w-4 h-4 text-success" />
          <span>MailVault Enterprise Recovery & Security Platform</span>
        </div>
        <span>&bull;</span>
        <span>Standard Official Provider APIs & Workflows</span>
        <span>&bull;</span>
        <span>&copy; {new Date().getFullYear()} MailVault Inc.</span>
      </div>
    </footer>
  );
}
