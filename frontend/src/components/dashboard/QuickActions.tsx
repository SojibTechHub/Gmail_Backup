'use client';

import React from 'react';
import Link from 'next/link';
import { PlusCircle, ShieldCheck, Lock, Sliders, ArrowUpRight } from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      title: 'Add Email Account',
      description: 'Register an account and check its recovery readiness',
      icon: PlusCircle,
      href: '/accounts/add',
      color: 'bg-primary/10 text-primary border-primary/20',
    },
    {
      title: 'Launch Recovery Assistant',
      description: 'Follow legitimate provider procedures to recover access',
      icon: ShieldCheck,
      href: '/recovery',
      color: 'bg-secondary/10 text-secondary border-secondary/20',
    },
    {
      title: 'Security Vault',
      description: 'Manage client-side AES-256 encrypted backup secrets',
      icon: Lock,
      href: '/vault',
      color: 'bg-accent/10 text-accent border-accent/20',
    },
    {
      title: 'Security Settings',
      description: 'Configure multi-factor authentication and master security',
      icon: Sliders,
      href: '/settings',
      color: 'bg-warning/10 text-warning border-warning/20',
    },
  ];

  return (
    <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl shadow-sm">
      <h3 className="text-base font-bold text-base-content mb-1">Quick Security Actions</h3>
      <p className="text-xs text-base-content/60 mb-4">
        Direct workflows for account safety and recovery management
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((act, i) => {
          const Icon = act.icon;
          return (
            <Link
              key={i}
              href={act.href}
              className="group p-4 rounded-2xl border border-base-300 hover:border-primary/50 bg-base-200/30 hover:bg-base-200/80 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl border ${act.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-base-content/40 group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-base-content group-hover:text-primary transition-colors">
                  {act.title}
                </h4>
                <p className="text-xs text-base-content/60 mt-1 line-clamp-2">
                  {act.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
