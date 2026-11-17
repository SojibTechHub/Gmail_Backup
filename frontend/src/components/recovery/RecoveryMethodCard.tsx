'use client';

import React from 'react';
import {
  Mail,
  Phone,
  KeyRound,
  ShieldCheck,
  Laptop,
  HelpCircle,
  FileText,
  Headphones,
} from 'lucide-react';
import { RecoveryMethod } from '../../types';
import clsx from 'clsx';

interface RecoveryMethodCardProps {
  method: RecoveryMethod;
  selected?: boolean;
  available?: boolean;
  onSelect: (method: RecoveryMethod) => void;
}

export function RecoveryMethodCard({
  method,
  selected = false,
  available = true,
  onSelect,
}: RecoveryMethodCardProps) {
  const getMethodInfo = (m: RecoveryMethod) => {
    switch (m) {
      case RecoveryMethod.RECOVERY_EMAIL:
        return {
          title: 'Secondary Recovery Email',
          description: 'Receive single-use verification links or confirmation codes at your alternative inbox.',
          icon: Mail,
        };
      case RecoveryMethod.RECOVERY_PHONE:
        return {
          title: 'Verified Mobile Phone (SMS / Voice)',
          description: 'Receive OTP verification codes via SMS or automated phone call from provider.',
          icon: Phone,
        };
      case RecoveryMethod.BACKUP_CODES:
        return {
          title: 'Emergency 2FA Backup Codes',
          description: 'Input single-use 8 or 10-digit emergency backup alphanumeric codes.',
          icon: KeyRound,
        };
      case RecoveryMethod.AUTHENTICATOR_APP:
        return {
          title: 'Authenticator TOTP App',
          description: 'Generate rotating 6-digit TOTP codes using Google Authenticator, Authy, or Microsoft Authenticator.',
          icon: ShieldCheck,
        };
      case RecoveryMethod.TRUSTED_DEVICE:
        return {
          title: 'Trusted Device / Security Key',
          description: 'Approve push prompts or hardware security keys (YubiKey/FIDO2) on an already signed-in device.',
          icon: Laptop,
        };
      case RecoveryMethod.ACCOUNT_RECOVERY_FORM:
        return {
          title: 'Official Provider Recovery Form',
          description: 'Submit an in-depth ownership questionnaire with historical billing and usage evidence.',
          icon: FileText,
        };
      case RecoveryMethod.SUPPORT_CONTACT:
        return {
          title: 'Provider Technical Helpdesk',
          description: 'Contact enterprise or provider tier customer support for identity verification.',
          icon: Headphones,
        };
      case RecoveryMethod.SECURITY_QUESTIONS:
      default:
        return {
          title: 'Security Questions',
          description: 'Answer pre-configured personal identity questions configured on provider portal.',
          icon: HelpCircle,
        };
    }
  };

  const info = getMethodInfo(method);
  const Icon = info.icon;

  return (
    <div
      onClick={() => onSelect(method)}
      className={clsx(
        'p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left',
        selected
          ? 'bg-primary/10 border-primary ring-2 ring-primary/20 shadow-sm'
          : 'bg-base-100 border-base-300 hover:border-primary/40 hover:bg-base-200/50',
        !available && 'opacity-60'
      )}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div
            className={clsx(
              'p-2.5 rounded-xl border',
              selected
                ? 'bg-primary text-white border-primary'
                : 'bg-base-200 text-base-content/80 border-base-300'
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
          {available ? (
            <span className="badge badge-success badge-xs text-white">Configured</span>
          ) : (
            <span className="badge badge-warning badge-xs">Setup Recommended</span>
          )}
        </div>

        <h4 className="text-sm font-bold text-base-content">{info.title}</h4>
        <p className="text-xs text-base-content/70 mt-1 line-clamp-3">{info.description}</p>
      </div>

      <div className="mt-4 pt-3 border-t border-base-200 flex justify-between items-center text-xs">
        <span className="font-semibold text-primary">
          {selected ? 'Active Selection' : 'Click to select'}
        </span>
      </div>
    </div>
  );
}
