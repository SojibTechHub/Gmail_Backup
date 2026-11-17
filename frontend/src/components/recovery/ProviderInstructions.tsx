'use client';

import React, { useState } from 'react';
import { ExternalLink, CheckCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import { RecoveryMethod, IProviderConfig } from '../../types';
import { Button } from '../ui/Button';

interface ProviderInstructionsProps {
  providerConfig?: IProviderConfig | null;
  method: RecoveryMethod;
  officialRecoveryUrl?: string;
  email?: string;
  onStepComplete?: (stepNumber: number) => void;
}

export function ProviderInstructions({
  providerConfig,
  method,
  officialRecoveryUrl,
  email,
  onStepComplete,
}: ProviderInstructionsProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const instructionsList =
    providerConfig?.instructions?.[method] || [
      'Navigate to the official email provider account recovery page.',
      'Input the target email address and select your chosen recovery method.',
      'Complete provider security verification as instructed.',
      'Create and save a new secure password.',
    ];

  const targetRecoveryUrl =
    officialRecoveryUrl || providerConfig?.recoveryUrl || 'https://accounts.google.com/signin/recovery';

  const toggleStep = (index: number) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter((s) => s !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
      onStepComplete?.(index + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Official Portal Action Card */}
      <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Official Provider Recovery Portal
          </span>
          <h3 className="text-base font-bold text-base-content mt-0.5">
            {providerConfig?.name || 'Email Provider'}
          </h3>
          <p className="text-xs text-base-content/70 mt-0.5">
            Target account:{' '}
            <span className="font-semibold text-base-content">{email || 'Selected Account'}</span>
          </p>
        </div>

        <a
          href={targetRecoveryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <Button variant="primary" size="sm" rightIcon={ExternalLink} className="font-semibold shadow-md">
            Open Official Recovery Page
          </Button>
        </a>
      </div>

      {/* Step-by-Step Guidance */}
      <div>
        <h4 className="text-sm font-bold text-base-content mb-3">
          Step-by-Step Legitimate Recovery Procedure
        </h4>

        <div className="space-y-2.5">
          {instructionsList.map((stepText, idx) => {
            const isCompleted = completedSteps.includes(idx);
            return (
              <div
                key={idx}
                onClick={() => toggleStep(idx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isCompleted
                    ? 'bg-success/5 border-success/30'
                    : 'bg-base-100 border-base-300 hover:border-primary/40'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${
                    isCompleted
                      ? 'bg-success text-white'
                      : 'bg-base-200 text-base-content/70 border border-base-300'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                </div>

                <div className="flex-1 text-xs text-base-content/90 leading-relaxed">
                  {stepText}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Compliance Banner */}
      <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300 flex items-start gap-3 text-xs text-base-content/70">
        <ShieldAlert className="w-4 h-4 text-warning shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-base-content">
            Security &amp; Legal Compliance Safeguards
          </p>
          <p>
            MailVault strictly facilitates legitimate owner account recovery. We never automate brute force logins, bypass MFA or CAPTCHA challenges, or circumvent official provider identity checks.
          </p>
        </div>
      </div>
    </div>
  );
}
