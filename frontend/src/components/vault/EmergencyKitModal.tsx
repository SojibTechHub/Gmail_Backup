'use client';

import React from 'react';
import { Shield, Printer, Download, AlertTriangle, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { IEmailAccount, VaultDecryptedData } from '../../types';

interface EmergencyKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  account?: IEmailAccount;
  vaultData?: VaultDecryptedData | null;
}

export function EmergencyKitModal({
  isOpen,
  onClose,
  account,
  vaultData,
}: EmergencyKitModalProps) {
  if (!account || !vaultData) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const backupObject = {
      title: 'MailVault Emergency Recovery Backup',
      exportedAt: new Date().toISOString(),
      account: {
        email: account.email,
        provider: account.provider,
        label: account.label,
      },
      recoveryContacts: {
        recoveryEmail: vaultData.recoveryEmail || null,
        recoveryPhone: vaultData.recoveryPhone || null,
      },
      backupCodes: vaultData.backupCodes || [],
      appPasswords: vaultData.appPasswords || [],
      previousPasswords: vaultData.previousPasswords || [],
      notes: vaultData.notes || '',
    };

    const blob = new Blob([JSON.stringify(backupObject, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mailvault-emergency-kit-${account.email.replace('@', '_at_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Emergency Recovery Kit"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Notice */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 print:hidden">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>
            Store this physical printout or JSON file in a fireproof safe or secure physical vault. Never share your recovery codes with anyone.
          </span>
        </div>

        {/* Printable Paper Document Container */}
        <div
          id="emergency-kit-document"
          className="p-6 sm:p-8 rounded-2xl border-2 border-dashed border-base-300 bg-base-100 text-base-content print:border-none print:p-0 print:m-0 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-base-300 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight uppercase">MailVault Emergency Kit</h2>
                <p className="text-[11px] text-base-content/60">
                  Official Account Identity & Recovery Reference
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-md bg-base-200 border border-base-300">
                CONFIDENTIAL
              </span>
              <p className="text-[10px] text-base-content/50 mt-1">
                Generated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Account Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-base-200/50 border border-base-300">
            <div>
              <p className="text-[11px] uppercase font-bold text-base-content/50">Target Email Address</p>
              <p className="text-sm font-extrabold text-base-content font-mono mt-0.5">{account.email}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase font-bold text-base-content/50">Provider / Service</p>
              <p className="text-sm font-bold text-base-content capitalize mt-0.5">{account.provider}</p>
            </div>
            {vaultData.recoveryEmail && (
              <div>
                <p className="text-[11px] uppercase font-bold text-base-content/50">Recovery Email</p>
                <p className="text-xs font-semibold text-base-content mt-0.5">{vaultData.recoveryEmail}</p>
              </div>
            )}
            {vaultData.recoveryPhone && (
              <div>
                <p className="text-[11px] uppercase font-bold text-base-content/50">Recovery Phone</p>
                <p className="text-xs font-semibold text-base-content mt-0.5">{vaultData.recoveryPhone}</p>
              </div>
            )}
          </div>

          {/* Two-Factor Backup Codes */}
          {vaultData.backupCodes && vaultData.backupCodes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-extrabold uppercase tracking-wider text-base-content flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  Two-Factor (2FA) Backup Codes ({vaultData.backupCodes.length})
                </p>
                <span className="text-[10px] text-base-content/50">Single-use emergency codes</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {vaultData.backupCodes.map((code, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-base-300 bg-base-200/60 font-mono text-xs font-bold text-center tracking-wider text-base-content"
                  >
                    {code}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* App Passwords */}
          {vaultData.appPasswords && vaultData.appPasswords.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-extrabold uppercase tracking-wider text-base-content">
                Stored App Passwords
              </p>
              <div className="space-y-1.5">
                {vaultData.appPasswords.map((appPass, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-base-300 bg-base-200/40 text-xs font-mono"
                  >
                    <span className="font-semibold text-base-content">App Password #{idx + 1}</span>
                    <span className="font-bold text-primary">{appPass}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Previous Passwords */}
          {vaultData.previousPasswords && vaultData.previousPasswords.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-extrabold uppercase tracking-wider text-base-content">
                Historical Passwords (For Identity Verification)
              </p>
              <div className="space-y-1.5">
                {vaultData.previousPasswords.map((oldPass, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-base-300 bg-base-200/40 text-xs font-mono"
                  >
                    <span className="text-base-content/70">Previous #{idx + 1}</span>
                    <span className="font-semibold text-base-content">{oldPass}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes & Security Advice */}
          <div className="p-4 rounded-xl border border-base-300 bg-base-200/30 text-xs space-y-1">
            <p className="font-bold text-base-content">Official Provider Procedures:</p>
            <p className="text-base-content/70 leading-relaxed text-[11px]">
              If access to this email is lost, immediately open the provider&apos;s verified recovery page from an authorized, familiar computer or network and follow their identity verification steps using the backup codes or phone recorded above.
            </p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-base-300 print:hidden">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={Download}
            onClick={handleDownloadJson}
            className="border border-base-300"
          >
            Download Backup JSON
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={Printer}
            onClick={handlePrint}
            className="shadow-md"
          >
            Print Emergency Sheet
          </Button>
        </div>
      </div>
    </Modal>
  );
}
