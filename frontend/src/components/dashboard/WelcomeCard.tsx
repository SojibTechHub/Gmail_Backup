'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Plus, Play, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export function WelcomeCard() {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/90 via-primary to-secondary p-6 sm:p-8 text-white shadow-xl">
      {/* Decorative background effects */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute right-12 top-6 hidden lg:block opacity-20">
        <ShieldCheck className="w-40 h-40" />
      </div>

      <div className="relative z-10 max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium mb-3 border border-white/20">
          <Sparkles className="w-3.5 h-3.5 text-warning" />
          <span>Universal Email Security & Recovery Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Welcome back, {user?.name || 'Security Leader'}!
        </h1>
        <p className="mt-2 text-sm text-white/80 leading-relaxed">
          Monitor your recovery readiness score, maintain end-to-end encrypted backup credentials, and execute guided recovery workflows across all email providers.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/accounts/add">
            <Button
              variant="accent"
              size="sm"
              leftIcon={Plus}
              className="bg-white text-slate-900 hover:bg-white/90 border-none font-semibold shadow-md"
            >
              Add Email Account
            </Button>
          </Link>
          <Link href="/recovery">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={Play}
              className="bg-black/20 text-white hover:bg-black/30 border-white/20 font-medium"
            >
              Start Recovery
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
