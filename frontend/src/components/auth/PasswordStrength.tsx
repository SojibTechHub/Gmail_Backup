'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import clsx from 'clsx';

export function PasswordStrength({ password }: { password?: string }) {
  const pwd = password || '';

  const requirements = [
    { label: 'At least 8 characters', valid: pwd.length >= 8 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(pwd) },
    { label: 'One lowercase letter', valid: /[a-z]/.test(pwd) },
    { label: 'One number (0-9)', valid: /[0-9]/.test(pwd) },
    { label: 'One special symbol (!@#$...)', valid: /[^A-Za-z0-9]/.test(pwd) },
  ];

  const validCount = requirements.filter((r) => r.valid).length;

  const getStrengthBar = () => {
    if (validCount <= 2) return 'bg-error w-1/4';
    if (validCount <= 4) return 'bg-warning w-3/4';
    return 'bg-success w-full';
  };

  const getStrengthText = () => {
    if (validCount <= 2) return { text: 'Weak', color: 'text-error' };
    if (validCount <= 4) return { text: 'Moderate', color: 'text-warning' };
    return { text: 'Strong', color: 'text-success' };
  };

  if (!pwd) return null;

  const strength = getStrengthText();

  return (
    <div className="space-y-2 mt-2 p-3 rounded-xl bg-base-200/60 border border-base-300 text-xs">
      <div className="flex justify-between items-center">
        <span className="text-base-content/70">Password Strength:</span>
        <span className={clsx('font-semibold', strength.color)}>{strength.text}</span>
      </div>
      <div className="w-full h-1.5 bg-base-300 rounded-full overflow-hidden">
        <div className={clsx('h-full transition-all duration-300', getStrengthBar())} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
        {requirements.map((req, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[11px]">
            {req.valid ? (
              <Check className="w-3.5 h-3.5 text-success shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-base-content/40 shrink-0" />
            )}
            <span className={req.valid ? 'text-success font-medium' : 'text-base-content/60'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
