'use client';

import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/Button';

interface VaultUnlockProps {
  hasExistingVault: boolean;
  onUnlock: (passphrase: string) => Promise<boolean>;
  loading?: boolean;
}

export function VaultUnlock({ hasExistingVault, onUnlock, loading }: VaultUnlockProps) {
  const [passphrase, setPassphrase] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase || passphrase.length < 6) {
      toast.error('Passphrase must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      const ok = await onUnlock(passphrase);
      if (ok) {
        toast.success(
          hasExistingVault ? 'Vault successfully decrypted' : 'Vault passphrase established'
        );
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to decrypt vault');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card bg-base-100 border border-base-300 p-6 sm:p-8 rounded-3xl shadow-sm max-w-md mx-auto text-center">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 border border-primary/20">
        <KeyRound className="w-7 h-7" />
      </div>

      <h3 className="text-xl font-bold text-base-content">
        {hasExistingVault ? 'Unlock Encrypted Vault' : 'Initialize Vault Passphrase'}
      </h3>
      <p className="text-xs text-base-content/60 mt-1 mb-6">
        {hasExistingVault
          ? 'Enter your private vault encryption passphrase to decrypt credentials locally in your browser.'
          : 'Define a secure passphrase to encrypt your recovery credentials with AES-256-GCM before storage.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label className="label text-xs font-semibold text-base-content/80 pb-1">
            Vault Master Passphrase
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your secret passphrase"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="input input-bordered w-full pl-9 pr-9 text-sm rounded-xl focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content/40 hover:text-base-content"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={submitting || loading}
          className="w-full rounded-xl font-semibold mt-2"
        >
          {hasExistingVault ? 'Decrypt Vault' : 'Create Encrypted Vault'}
        </Button>
      </form>

      <div className="p-3.5 rounded-2xl bg-warning/10 border border-warning/20 text-left mt-6 flex items-start gap-2.5 text-xs text-base-content/80">
        <ShieldAlert className="w-4 h-4 text-warning shrink-0 mt-0.5" />
        <p className="text-[11px] leading-tight">
          <strong>Zero-Knowledge Architecture:</strong> Your passphrase is never transmitted to or stored on our servers. If forgotten, encrypted backup credentials cannot be decrypted or reset by administrators.
        </p>
      </div>
    </div>
  );
}
