'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  Lock,
  Play,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Laptop,
  Users,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { Button } from '../components/ui/Button';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  const supportedProviders = [
    { name: 'Gmail / Google', color: '#EA4335' },
    { name: 'Outlook / Hotmail', color: '#0078D4' },
    { name: 'Yahoo Mail', color: '#6001D2' },
    { name: 'Apple iCloud', color: '#64748b' },
    { name: 'Zoho Mail', color: '#C8202B' },
    { name: 'Proton Mail', color: '#6D4AFF' },
    { name: 'GMX Mail', color: '#1C449B' },
    { name: 'AOL Mail', color: '#FF3300' },
    { name: 'Yandex Mail', color: '#FC3F1D' },
    { name: 'Custom Domain', color: '#10b981' },
  ];

  const features = [
    {
      title: 'Universal Recovery Assistant',
      description:
        'Guided, legitimate identity verification workflows mapped precisely to official Google, Microsoft, Yahoo, Apple, and IMAP provider procedures.',
      icon: Play,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Zero-Knowledge Client-Side Vault',
      description:
        'Client-side AES-256-GCM encryption with PBKDF2 (100,000 iterations). Your private backup codes and passwords never touch our servers unencrypted.',
      icon: Lock,
      color: 'bg-secondary/10 text-secondary',
    },
    {
      title: 'Recovery Readiness Health Score',
      description:
        'Intelligent heuristic assessment of 2FA configurations, secondary emails, SMS safeguards, and backup keys to prevent account lockout before it happens.',
      icon: ShieldCheck,
      color: 'bg-accent/10 text-accent',
    },
    {
      title: 'Forensic Audit History',
      description:
        'Comprehensive 90-day immutable logging of every authentication event, recovery session, and security change with zero secret leakage.',
      icon: KeyRound,
      color: 'bg-warning/10 text-warning',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-base-100 text-base-content antialiased">
      {/* Top Navbar */}
      <header className="border-b border-base-300/80 bg-base-100/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary text-primary-content shadow-md shadow-primary/20">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MailVault
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link href="/overview">
                <Button variant="primary" size="sm" rightIcon={ArrowRight} className="font-bold">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm" className="font-bold shadow-md">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 px-6 bg-gradient-to-b from-base-100 via-base-200/40 to-base-100">
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
            <Shield className="w-4 h-4" />
            <span>Universal Email Recovery &amp; Security Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-base-content leading-tight">
            Never lose access to your{' '}
            <span className="bg-gradient-to-r from-primary via-indigo-400 to-secondary bg-clip-text text-transparent">
              vital email accounts
            </span>
          </h1>

          <p className="text-base sm:text-lg text-base-content/70 max-w-2xl mx-auto leading-relaxed">
            The premier SaaS platform for legitimate email account owners to evaluate recovery readiness, store client-side encrypted backup secrets, and execute official restoration procedures.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link href={isAuthenticated ? '/overview' : '/register'}>
              <Button
                variant="primary"
                size="lg"
                rightIcon={ArrowRight}
                className="font-bold px-8 rounded-2xl shadow-xl shadow-primary/20"
              >
                {isAuthenticated ? 'Launch Security Dashboard' : 'Protect Your Accounts Now'}
              </Button>
            </Link>
            <Link href={isAuthenticated ? '/recovery' : '/login'}>
              <Button
                variant="ghost"
                size="lg"
                className="border border-base-300 font-semibold px-6 rounded-2xl"
              >
                Launch Recovery Center
              </Button>
            </Link>
          </div>

          {/* Supported Providers Ticker */}
          <div className="pt-12">
            <p className="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-4">
              Universal Provider Compatibility
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
              {supportedProviders.map((prov, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-base-100 border border-base-300/80 text-xs font-semibold text-base-content/80 shadow-sm"
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: prov.color }}
                  />
                  {prov.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-base-content">
            Built for Zero-Knowledge Security &amp; Compliance
          </h2>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1 max-w-lg mx-auto">
            Architected specifically for legal email owners and corporate security teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-3xl bg-base-100 border border-base-300/80 shadow-sm hover:shadow-md transition-shadow flex gap-4"
              >
                <div className={`p-3.5 rounded-2xl shrink-0 h-fit ${feat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-base-content">{feat.title}</h3>
                  <p className="text-xs text-base-content/70 mt-1.5 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Compliance Guarantee Banner */}
      <section className="py-12 px-6 max-w-4xl mx-auto w-full">
        <div className="p-6 rounded-3xl bg-base-200/60 border border-base-300 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-success uppercase">
            <CheckCircle2 className="w-4 h-4" />
            <span>Ethical Security &amp; Legal Compliance Guarantee</span>
          </div>
          <p className="text-xs text-base-content/70 max-w-xl mx-auto leading-relaxed">
            MailVault strictly facilitates legitimate owner recovery through verified provider procedures. We never automate brute-force attempts, bypass CAPTCHA, or simulate unauthorized access.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-base-300/80 py-8 px-6 text-center text-xs text-base-content/50">
        <p>&copy; {new Date().getFullYear()} MailVault Universal Email Recovery Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
