'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sliders, Shield, Globe, Lock, Cpu, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import recoveryService from '../../../../services/recovery.service';
import { IProviderConfig } from '../../../../types';
import { ProviderIcon } from '../../../../components/accounts/ProviderIcon';
import { Button } from '../../../../components/ui/Button';

export default function AdminSettingsPage() {
  const [providers, setProviders] = useState<IProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recoveryService
      .getProviders()
      .then((data) => setProviders(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-base-content/60 hover:text-base-content font-medium mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Overview
        </Link>
        <h1 className="text-2xl font-extrabold text-base-content tracking-tight">
          System Configuration &amp; Providers
        </h1>
        <p className="text-xs text-base-content/60 mt-0.5">
          Provider connectors, cryptographic parameters, and platform rate limits
        </p>
      </div>

      {/* Security Architecture Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-base-100 border border-base-300 p-5 rounded-2xl">
          <div className="flex items-center gap-2.5 mb-2 text-primary">
            <Lock className="w-5 h-5" />
            <h4 className="font-bold text-sm text-base-content">Vault Encryption</h4>
          </div>
          <p className="text-xs text-base-content/70">
            Client-Side AES-256-GCM with PBKDF2 (100,000 rounds). Keys remain strictly in user browser memory.
          </p>
          <div className="mt-3">
            <span className="badge badge-success badge-sm text-white font-medium">Active &amp; Enforced</span>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 p-5 rounded-2xl">
          <div className="flex items-center gap-2.5 mb-2 text-info">
            <Shield className="w-5 h-5" />
            <h4 className="font-bold text-sm text-base-content">Password Hashing</h4>
          </div>
          <p className="text-xs text-base-content/70">
            Argon2id (Winner of Password Hashing Competition). Resistant against GPU and ASIC side-channel attacks.
          </p>
          <div className="mt-3">
            <span className="badge badge-success badge-sm text-white font-medium">Argon2id Enabled</span>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 p-5 rounded-2xl">
          <div className="flex items-center gap-2.5 mb-2 text-warning">
            <Cpu className="w-5 h-5" />
            <h4 className="font-bold text-sm text-base-content">Rate Limiting</h4>
          </div>
          <p className="text-xs text-base-content/70">
            Tiered Express rate limiting: 100 req/15m general, 20 req/15m auth, 5 req/15m strict vault access.
          </p>
          <div className="mt-3">
            <span className="badge badge-info badge-sm text-white font-medium">Distributed Limiter</span>
          </div>
        </div>
      </div>

      {/* Supported Providers List */}
      <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-base-content">
            Configured Email Recovery Providers ({providers.length})
          </h3>
          <p className="text-xs text-base-content/60 mt-0.5">
            Verified recovery endpoints and official documentation links
          </p>
        </div>

        <div className="divide-y divide-base-200">
          {providers.map((prov) => (
            <div
              key={prov.provider}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <ProviderIcon provider={prov.provider} size="sm" />
                <div>
                  <h4 className="font-bold text-base-content text-sm">{prov.name}</h4>
                  <p className="text-base-content/60 mt-0.5">
                    Domains: {prov.domains.length > 0 ? prov.domains.join(', ') : 'Any custom domain'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="badge badge-sm badge-success text-white">Active</span>
                {prov.hasOAuth && (
                  <span className="badge badge-sm badge-outline">OAuth 2.0</span>
                )}
                {prov.recoveryUrl && (
                  <a
                    href={prov.recoveryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-mono text-[11px]"
                  >
                    Recovery URL &nearr;
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
