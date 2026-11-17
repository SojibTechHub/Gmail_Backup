'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Lock, Shield, KeyRound, AlertTriangle, RefreshCw, Printer, Download } from 'lucide-react';
import { toast } from 'sonner';
import accountService from '../../../services/account.service';
import vaultService from '../../../services/vault.service';
import { IEmailAccount, IRecoveryVault, VaultDecryptedData } from '../../../types';
import { encryptClientVault, decryptClientVault } from '../../../lib/encryption';
import { VaultStatus } from '../../../components/vault/VaultStatus';
import { VaultUnlock } from '../../../components/vault/VaultUnlock';
import { VaultForm } from '../../../components/vault/VaultForm';
import { EmergencyKitModal } from '../../../components/vault/EmergencyKitModal';
import { ProviderIcon } from '../../../components/accounts/ProviderIcon';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

function VaultPageContent() {
  const searchParams = useSearchParams();
  const urlAccountId = searchParams.get('account');

  const [accounts, setAccounts] = useState<IEmailAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(urlAccountId || '');
  const [vaultRecord, setVaultRecord] = useState<IRecoveryVault | null>(null);

  // Client-side decryption state
  const [unlocked, setUnlocked] = useState(false);
  const [activePassphrase, setActivePassphrase] = useState<string | null>(null);
  const [decryptedData, setDecryptedData] = useState<VaultDecryptedData | null>(null);
  const [emergencyKitOpen, setEmergencyKitOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [vaultLoading, setVaultLoading] = useState(false);

  // Fetch accounts on mount
  useEffect(() => {
    accountService
      .getAccounts({ limit: 100 })
      .then((data) => {
        setAccounts(data.accounts);
        if (!selectedAccountId && data.accounts.length > 0) {
          setSelectedAccountId(data.accounts[0]._id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedAccountId]);

  // When selected account changes, fetch encrypted vault blob
  useEffect(() => {
    if (!selectedAccountId) return;
    setVaultLoading(true);
    setUnlocked(false);
    setActivePassphrase(null);
    setDecryptedData(null);

    vaultService
      .getVault(selectedAccountId)
      .then((res) => {
        setVaultRecord(res || null);
      })
      .catch((err) => {
        toast.error('Failed to load encrypted vault metadata');
      })
      .finally(() => setVaultLoading(false));
  }, [selectedAccountId]);

  // Handle client-side unlock
  const handleUnlock = async (passphrase: string): Promise<boolean> => {
    if (!selectedAccountId) return false;

    // Case 1: First time initializing vault (no existing ciphertext)
    if (!vaultRecord?.hasVault || !vaultRecord.encryptedData) {
      setActivePassphrase(passphrase);
      setDecryptedData({});
      setUnlocked(true);
      return true;
    }

    // Case 2: Existing ciphertext -> decrypt using Web Crypto AES-256-GCM
    try {
      // The salt is stored with the IV or derived from metadata
      // For salt, we take the first 32 hex chars (16 bytes) of IV or authTag
      const salt = vaultRecord.iv?.slice(0, 32) || '00'.repeat(16);

      const decrypted = await decryptClientVault<VaultDecryptedData>(
        vaultRecord.encryptedData,
        vaultRecord.iv!,
        vaultRecord.authTag!,
        passphrase,
        salt
      );

      setActivePassphrase(passphrase);
      setDecryptedData(decrypted);
      setUnlocked(true);
      return true;
    } catch (err: unknown) {
      toast.error('Decryption failed: Incorrect passphrase or damaged ciphertext');
      return false;
    }
  };

  // Handle client-side save
  const handleSave = async (data: VaultDecryptedData) => {
    if (!selectedAccountId || !activePassphrase) {
      toast.error('Vault is locked. Passphrase required to encrypt.');
      return;
    }

    const salt = '00'.repeat(16);
    const { encryptedData, iv, authTag } = await encryptClientVault(
      data,
      activePassphrase,
      salt
    );

    // Transmit only the ciphertext, iv, and authTag to the backend
    await vaultService.updateVault(selectedAccountId, {
      encryptedData,
      iv,
      authTag,
    });

    setVaultRecord({
      hasVault: true,
      accountId: selectedAccountId,
      encryptedData,
      iv,
      authTag,
      updatedAt: new Date(),
    });
    setDecryptedData(data);
  };

  const handleLock = () => {
    setUnlocked(false);
    setActivePassphrase(null);
    setDecryptedData(null);
    toast.info('Vault locked. Credentials cleared from browser memory.');
  };

  const selectedAccount = accounts.find((a) => a._id === selectedAccountId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-base-content tracking-tight">
            Secure Recovery Information Vault
          </h1>
          <p className="text-xs text-base-content/60 mt-1">
            Zero-knowledge client-side encrypted storage for backup codes, contacts, and identity verification credentials
          </p>
        </div>

        {unlocked && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEmergencyKitOpen(true)}
              leftIcon={Printer}
            >
              Emergency Kit
            </Button>
            <Button variant="error" size="sm" onClick={handleLock} leftIcon={Lock}>
              Lock Vault
            </Button>
          </div>
        )}
      </div>

      {/* Account Selector Bar */}
      <div className="card bg-base-100 border border-base-300 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-base-content/60 shrink-0">
            Active Account:
          </label>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="select select-bordered select-sm rounded-xl text-xs max-w-xs font-semibold"
          >
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.label || acc.email} ({acc.email})
              </option>
            ))}
          </select>
        </div>

        {selectedAccount && (
          <div className="flex items-center gap-2">
            <ProviderIcon provider={selectedAccount.provider} size="sm" showName />
          </div>
        )}
      </div>

      {/* Vault Status Banner */}
      <VaultStatus
        unlocked={unlocked}
        hasVaultData={!!vaultRecord?.hasVault}
        onLock={handleLock}
        accountEmail={selectedAccount?.email}
      />

      {/* Vault Body */}
      {vaultLoading ? (
        <div className="py-16 text-center">
          <LoadingSpinner size="lg" label="Querying encrypted vault records..." />
        </div>
      ) : !unlocked ? (
        <VaultUnlock
          hasExistingVault={!!vaultRecord?.hasVault && !!vaultRecord.encryptedData}
          onUnlock={handleUnlock}
        />
      ) : (
        <div className="card bg-base-100 border border-base-300 p-6 sm:p-8 rounded-3xl shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-base-content">
              Decrypted Recovery Credentials
            </h3>
            <p className="text-xs text-base-content/60 mt-0.5">
              Edit the recovery secrets for {selectedAccount?.email}. Data is encrypted in your browser before saving.
            </p>
          </div>

          <VaultForm initialData={decryptedData || undefined} onSave={handleSave} />
        </div>
      )}

      {/* Emergency Kit Modal */}
      <EmergencyKitModal
        isOpen={emergencyKitOpen}
        onClose={() => setEmergencyKitOpen(false)}
        account={selectedAccount}
        vaultData={decryptedData}
      />
    </div>
  );
}

export default function VaultPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading Security Vault..." />}>
      <VaultPageContent />
    </Suspense>
  );
}
