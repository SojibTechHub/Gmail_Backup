'use client';

import React from 'react';
import { Lock, Unlock, ShieldCheck, Key } from 'lucide-react';

interface VaultStatusProps {
  unlocked: boolean;
  hasVaultData: boolean;
  onLock?: () => void;
  accountEmail?: string;
}

export function VaultStatus({
  unlocked,
  hasVaultData,
  onLock,
  accountEmail,
}: VaultStatusProps) {
  return (
    <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div
          className={`p-2.5 rounded-xl border ${
            unlocked
              ? 'bg-success/10 text-success border-success/30'
              : 'bg-primary/10 text-primary border-primary/30'
          }`}
        >
          {unlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-base-content">
              {unlocked ? 'Vault Unlocked & Decrypted' : 'Encrypted Storage Locked'}
            </h4>
            <span
              className={`badge badge-xs ${
                unlocked ? 'badge-success text-white' : 'badge-neutral text-white'
              }`}
            >
              {unlocked ? 'Decrypted in Memory' : 'Zero-Knowledge Blob'}
            </span>
          </div>
          <p className="text-xs text-base-content/60 mt-0.5">
            {accountEmail ? `Target Account: ${accountEmail}` : 'Select an email account below'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-base-100 border border-base-300 text-[11px] font-mono text-base-content/70">
          <Key className="w-3.5 h-3.5 text-primary" />
          <span>AES-256-GCM / PBKDF2</span>
        </div>
        {unlocked && onLock && (
          <button
            type="button"
            onClick={onLock}
            className="btn btn-ghost btn-sm text-xs text-error hover:bg-error/10"
          >
            Lock Vault
          </button>
        )}
      </div>
    </div>
  );
}
