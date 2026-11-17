'use client';

import React, { useState } from 'react';
import { Check, Sparkles, Shield, Zap, Building2, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/Button';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleSelectPlan = (planName: string) => {
    if (planName === 'Free') {
      toast.info('You are currently on the Free Tier.');
      return;
    }
    toast.success(`Redirecting to payment checkout for ${planName} Plan... (Billing gateway sandbox active)`);
  };

  const plans = [
    {
      name: 'Free Starter',
      badge: 'Current Plan',
      priceMonthly: 0,
      priceYearly: 0,
      description: 'Essential recovery readiness for individuals managing personal email accounts.',
      features: [
        'Up to 3 Email Accounts',
        'Zero-Knowledge AES-256 Vault',
        'Universal Recovery Assistant (All Providers)',
        'Printable Emergency Recovery Kit',
        'Standard Community FAQ & Guides',
      ],
      isPopular: false,
      buttonText: 'Current Plan',
      buttonVariant: 'ghost' as const,
      isCurrent: true,
    },
    {
      name: 'Pro Security',
      badge: 'Most Popular',
      priceMonthly: 9,
      priceYearly: 7,
      description: 'Comprehensive account monitoring and automated credential hygiene for professionals.',
      features: [
        'Up to 25 Email Accounts',
        'Automated Security Health Monitor',
        'Active Device & Remote Session Logout',
        'Suspicious Sign-in Email Alerts',
        'Encrypted JSON Backup Import & Export',
        'Priority Technical Support Desk',
      ],
      isPopular: true,
      buttonText: 'Upgrade to Pro',
      buttonVariant: 'primary' as const,
      isCurrent: false,
    },
    {
      name: 'Business Enterprise',
      badge: 'Teams & Domains',
      priceMonthly: 29,
      priceYearly: 24,
      description: 'Advanced governance for domains, freelancers, and businesses managing client emails.',
      features: [
        'Unlimited Email Accounts',
        'Custom Domain & Workspaces',
        'Forensic 90-Day Audit Trail',
        'Multi-Device Zero-Knowledge Sync',
        '24/7 Priority Emergency Support',
        'Dedicated Security Account Manager',
      ],
      isPopular: false,
      buttonText: 'Upgrade to Business',
      buttonVariant: 'secondary' as const,
      isCurrent: false,
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Flexible Plans for Everyone</span>
        </div>
        <h1 className="text-3xl font-black text-base-content tracking-tight">
          Transparent, Predictable Security Pricing
        </h1>
        <p className="text-xs text-base-content/60 max-w-xl mx-auto">
          Start for free to protect your primary email accounts, or upgrade to Pro for automated health checks and multi-device session governance.
        </p>

        {/* Billing cycle switcher */}
        <div className="inline-flex items-center p-1 bg-base-200 rounded-2xl border border-base-300 mt-2">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              billingCycle === 'monthly' ? 'bg-base-100 text-base-content shadow-sm' : 'text-base-content/60'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              billingCycle === 'yearly' ? 'bg-base-100 text-base-content shadow-sm' : 'text-base-content/60'
            }`}
          >
            Yearly Billing <span className="text-success text-[10px] ml-1 font-extrabold">(Save 20%)</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;

          return (
            <div
              key={plan.name}
              className={`card bg-base-100 rounded-3xl p-6 sm:p-8 flex flex-col justify-between border transition-all relative ${
                plan.isPopular
                  ? 'border-primary shadow-xl shadow-primary/10 scale-105 z-10'
                  : 'border-base-300 shadow-sm'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-content text-[10px] font-extrabold uppercase tracking-wider">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-extrabold text-base-content">{plan.name}</h3>
                  <p className="text-xs text-base-content/60 mt-1">{plan.description}</p>
                </div>

                <div className="py-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-base-content">${price}</span>
                    <span className="text-xs text-base-content/50">/ month</span>
                  </div>
                  {billingCycle === 'yearly' && price > 0 && (
                    <span className="text-[10px] text-success font-semibold">Billed annually</span>
                  )}
                </div>

                <div className="space-y-2.5 pt-4 border-t border-base-200">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-base-content/50">
                    Included Capabilities:
                  </p>
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-base-content/80">
                      <div className="p-0.5 rounded-full bg-primary/10 text-primary mt-0.5 shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-base-200">
                <Button
                  variant={plan.buttonVariant}
                  size="md"
                  onClick={() => handleSelectPlan(plan.name)}
                  className={`w-full font-bold rounded-2xl ${
                    plan.isCurrent ? 'border border-base-300' : ''
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
