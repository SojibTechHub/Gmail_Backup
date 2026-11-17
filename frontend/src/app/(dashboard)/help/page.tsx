'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  ExternalLink,
  ShieldAlert,
  Send,
  MessageSquare,
  BookOpen,
  Mail,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/Button';

interface FaqItem {
  q: string;
  a: string;
  category: 'Gmail' | 'Outlook' | 'Yahoo' | 'Apple' | 'General';
}

const faqs: FaqItem[] = [
  {
    category: 'Gmail',
    q: 'Can I recover my Gmail account without my recovery phone number?',
    a: 'Yes. If your recovery phone is unavailable, Google allows identity verification using an active recovery email, 8-digit two-factor backup codes, or previously authorized devices where your Google account was signed in.',
  },
  {
    category: 'Gmail',
    q: 'How long does Google account recovery take if I have 2FA enabled?',
    a: 'If you provide verified ownership proofs (recovery email + prompt approval), restoration is usually immediate. If manual security evaluation is required, Google may impose a 48 to 72 hour security hold to protect against account takeover.',
  },
  {
    category: 'Outlook',
    q: 'What is the Microsoft Account Recovery Form (ACSR)?',
    a: 'Microsoft ACSR (account.live.com/acsr) is the official automated questionnaire used when password and two-factor options are lost. You must provide previous passwords, subject lines of recent emails, and billing details.',
  },
  {
    category: 'Yahoo',
    q: 'How does Yahoo Account Key or sign-in recovery work?',
    a: 'Yahoo sends verification codes to your alternate email or phone. If you have Yahoo Account Key enabled, you can approve the sign-in notification from your mobile Yahoo Mail app.',
  },
  {
    category: 'Apple',
    q: 'What should I do if I forget my Apple ID password and lose trusted devices?',
    a: 'Go to iforgot.apple.com to request Account Recovery. Apple will initiate a waiting period during which they evaluate your account history and contact your registered telephone number.',
  },
  {
    category: 'General',
    q: 'Does MailVault store my actual email passwords?',
    a: 'No. MailVault uses client-side AES-256-GCM zero-knowledge encryption. Your passwords and 2FA backup codes are encrypted directly in your browser with your master passphrase before transmission. MailVault servers and administrators cannot decrypt your data.',
  },
];

export default function HelpCenterPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Support ticket form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);

  const filteredFaqs = faqs.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      toast.error('Please enter both subject and message for your support request');
      return;
    }

    setTicketSubmitting(true);
    setTimeout(() => {
      setTicketSubmitting(false);
      setTicketSubject('');
      setTicketMessage('');
      toast.success('Support inquiry submitted. A ticket confirmation has been sent to your email.');
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card bg-gradient-to-r from-base-100 to-base-200 border border-base-300 p-8 rounded-3xl shadow-sm">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Knowledge Base &amp; Technical Support</span>
          </div>
          <h1 className="text-2xl font-black text-base-content tracking-tight">
            Universal Recovery Help Center
          </h1>
          <p className="text-xs text-base-content/70 leading-relaxed">
            Find official recovery procedures, step-by-step guides for Gmail, Microsoft, Yahoo, and submit inquiries to our technical support team.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search recovery questions or policies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered input-sm w-full pl-10 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Gmail', 'Outlook', 'Yahoo', 'Apple', 'General'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn btn-xs rounded-xl font-semibold px-3 ${
                selectedCategory === cat ? 'btn-primary' : 'btn-ghost border border-base-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: FAQs & Ticket Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* FAQs */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/70 mb-2">
            Frequently Answered Recovery Questions
          </h3>

          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-base-300 text-xs text-base-content/60">
              No articles match your search keyword.
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="card bg-base-100 border border-base-300 rounded-2xl p-4 shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex items-center justify-between w-full text-left gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="badge badge-primary badge-xs text-[9px] uppercase font-bold py-2">
                      {faq.category}
                    </span>
                    <span className="text-xs font-bold text-base-content">{faq.q}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-base-content/40 transition-transform ${
                      openFaq === idx ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>

                {openFaq === idx && (
                  <div className="pt-3 mt-3 border-t border-base-200 text-xs text-base-content/70 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Support Ticket Desk */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-base-content">Open Support Ticket</h3>
                <p className="text-[11px] text-base-content/60">Need assistance with your vault?</p>
              </div>
            </div>

            <form onSubmit={handleTicketSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase text-base-content/70">
                  Topic / Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Question regarding Outlook recovery instructions"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="input input-bordered input-sm w-full rounded-xl text-xs mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-base-content/70">
                  Detailed Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your inquiry or issue. (Never write your passwords or backup codes in support tickets)."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="textarea textarea-bordered w-full rounded-xl text-xs mt-1"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={ticketSubmitting}
                leftIcon={Send}
                className="w-full font-semibold rounded-xl"
              >
                Submit Support Request
              </Button>
            </form>
          </div>

          {/* Quick Notice */}
          <div className="p-4 rounded-2xl border border-base-300 bg-base-200/40 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-base-content">
              <ShieldAlert className="w-4 h-4 text-primary" />
              <span>Official Provider Portals</span>
            </div>
            <p className="text-[11px] text-base-content/60 leading-relaxed">
              MailVault technical support will never ask for your email passwords, 2FA codes, or vault master passphrase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
