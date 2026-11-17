'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Play,
  History,
  ExternalLink,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import recoveryService from '../../../services/recovery.service';
import { IRecoverySession, IProviderConfig, EmailProvider } from '../../../types';
import { RecoveryWizard } from '../../../components/recovery/RecoveryWizard';
import { SessionCard } from '../../../components/recovery/SessionCard';
import { ProviderIcon } from '../../../components/accounts/ProviderIcon';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

function RecoveryCenterContent() {
  const searchParams = useSearchParams();
  const initialAccountId = searchParams.get('account') || undefined;

  const [activeSessions, setActiveSessions] = useState<IRecoverySession[]>([]);
  const [providers, setProviders] = useState<IProviderConfig[]>([]);
  const [wizardOpen, setWizardOpen] = useState(!!initialAccountId);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [sessionsData, providersData] = await Promise.all([
        recoveryService.getSessions({ limit: 5 }),
        recoveryService.getProviders(),
      ]);
      setActiveSessions(sessionsData.sessions);
      setProviders(providersData);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-base-content tracking-tight">
            Universal Recovery Center
          </h1>
          <p className="text-xs text-base-content/60 mt-1">
            Restore access to your email accounts through official provider procedures and security channels
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/recovery/history">
            <Button variant="ghost" size="sm" leftIcon={History} className="border border-base-300">
              Recovery History
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            leftIcon={Play}
            onClick={() => setWizardOpen(true)}
            className="font-semibold shadow-md"
          >
            Launch Recovery Assistant
          </Button>
        </div>
      </div>

      {/* Main Wizard Section */}
      {wizardOpen ? (
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-primary">Interactive Assistant Active</span>
            <button
              type="button"
              onClick={() => setWizardOpen(false)}
              className="text-xs text-base-content/60 hover:text-base-content"
            >
              Close Assistant &times;
            </button>
          </div>
          <RecoveryWizard
            initialAccountId={initialAccountId}
            onFinish={() => {
              setWizardOpen(false);
              fetchData();
            }}
          />
        </div>
      ) : (
        /* Recovery Hero CTA */
        <div className="card bg-gradient-to-r from-base-100 to-base-200 border border-base-300 p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Provider Guided Restoration</span>
            </div>
            <h2 className="text-xl font-bold text-base-content">
              Locked out or updating security credentials?
            </h2>
            <p className="text-xs text-base-content/70 leading-relaxed">
              Our intelligent recovery engine examines your configured 2FA backups, trusted contacts, and device tokens, matching them with the verified identity verification paths of Gmail, Microsoft, Yahoo, Apple, and 7+ other providers.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            leftIcon={Play}
            onClick={() => setWizardOpen(true)}
            className="shrink-0 font-bold px-8 rounded-2xl shadow-lg shadow-primary/20"
          >
            Start Account Recovery
          </Button>
        </div>
      )}

      {/* Active & Recent Recovery Sessions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-base-content">Recent Recovery Operations</h3>
          <Link
            href="/recovery/history"
            className="text-xs text-primary font-medium hover:underline"
          >
            View all history &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 skeleton rounded-2xl" />
            ))}
          </div>
        ) : activeSessions.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-base-300 bg-base-100/50 text-xs text-base-content/60">
            No recovery attempts initiated yet. Click &apos;Launch Recovery Assistant&apos; above when you need to recover an account.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSessions.map((session) => (
              <SessionCard key={session._id || session.sessionId} session={session} />
            ))}
          </div>
        )}
      </div>

      {/* Official Provider Fast Links */}
      <div className="space-y-3 pt-4">
        <div>
          <h3 className="text-base font-bold text-base-content">
            Verified Official Provider Recovery Portals
          </h3>
          <p className="text-xs text-base-content/60 mt-0.5">
            Direct access to official provider identity verification portals
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {providers
            .filter((p) => p.recoveryUrl)
            .map((prov) => (
              <a
                key={prov.provider}
                href={prov.recoveryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-base-100 border border-base-300 hover:border-primary/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ProviderIcon provider={prov.provider} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-base-content truncate group-hover:text-primary transition-colors">
                      {prov.name}
                    </p>
                    <span className="text-[10px] text-base-content/50">Official Recovery</span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-base-content/40 group-hover:text-primary transition-colors shrink-0" />
              </a>
            ))}
        </div>
      </div>
    </div>
  );
}

export default function RecoveryPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading Recovery Center..." />}>
      <RecoveryCenterContent />
    </Suspense>
  );
}
