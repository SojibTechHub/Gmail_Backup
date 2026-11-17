'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  ExternalLink,
  Play,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import recoveryService from '../../services/recovery.service';
import accountService from '../../services/account.service';
import {
  IEmailAccount,
  RecoveryMethod,
  ReadinessReportData,
  IProviderConfig,
  RecoverySessionStatus,
  IRecoverySession,
} from '../../types';
import { RecoveryMethodCard } from './RecoveryMethodCard';
import { ProviderInstructions } from './ProviderInstructions';
import { ReadinessReport } from './ReadinessReport';
import { ProviderIcon } from '../accounts/ProviderIcon';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface RecoveryWizardProps {
  initialAccountId?: string;
  onFinish?: () => void;
}

export function RecoveryWizard({ initialAccountId, onFinish }: RecoveryWizardProps) {
  const router = useRouter();

  // Wizard Steps: 1: Select Account -> 2: Assess Readiness -> 3: Select Method -> 4: Recovery Guide & Portal -> 5: Record Outcome
  const [currentStep, setCurrentStep] = useState(initialAccountId ? 2 : 1);

  // Data state
  const [accounts, setAccounts] = useState<IEmailAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(initialAccountId || '');
  const [readinessReport, setReadinessReport] = useState<ReadinessReportData | null>(null);
  const [providerConfig, setProviderConfig] = useState<IProviderConfig | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<RecoveryMethod>(RecoveryMethod.RECOVERY_EMAIL);
  const [activeSession, setActiveSession] = useState<IRecoverySession | null>(null);

  // Outcome recording state
  const [outcomeStatus, setOutcomeStatus] = useState<RecoverySessionStatus>(
    RecoverySessionStatus.COMPLETED
  );
  const [userNotes, setUserNotes] = useState('');

  // Loading flags
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch accounts on mount
  useEffect(() => {
    accountService
      .getAccounts({ limit: 100 })
      .then((data) => setAccounts(data.accounts))
      .catch(() => {});
  }, []);

  // When selected account changes, fetch readiness & provider details
  useEffect(() => {
    if (!selectedAccountId) return;
    setLoading(true);

    recoveryService
      .getReadiness(selectedAccountId)
      .then(async (report) => {
        setReadinessReport(report);
        if (report.availableMethods.length > 0) {
          setSelectedMethod(report.availableMethods[0]);
        }
        if (report.provider) {
          const config = await recoveryService
            .getProviderDetails(report.provider)
            .catch(() => null);
          setProviderConfig(config);
        }
      })
      .catch((err) => {
        toast.error('Failed to load readiness assessment for selected account');
      })
      .finally(() => setLoading(false));
  }, [selectedAccountId]);

  // Step 3 -> 4: Initialize recovery session in DB
  const startRecoverySession = async () => {
    if (!selectedAccountId) return;
    setActionLoading(true);
    try {
      const session = await recoveryService.createSession({
        accountId: selectedAccountId,
        method: selectedMethod,
      });
      setActiveSession(session || null);
      setCurrentStep(4);
      toast.success('Recovery procedure session initiated');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to initiate recovery session');
    } finally {
      setActionLoading(false);
    }
  };

  // Step 5: Finalize session outcome
  const finalizeOutcome = async () => {
    if (!activeSession) return;
    setActionLoading(true);
    try {
      await recoveryService.updateSession(activeSession.sessionId, {
        status: outcomeStatus,
        notes: userNotes,
      });
      toast.success('Recovery attempt record updated successfully');
      if (onFinish) {
        onFinish();
      } else {
        router.push('/recovery/history');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to record session outcome');
    } finally {
      setActionLoading(false);
    }
  };

  const selectedAccount = accounts.find((a) => a._id === selectedAccountId);

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6">
      {/* Wizard Step Progress Tracker */}
      <div className="flex items-center justify-between border-b border-base-200 pb-4 text-xs font-semibold text-base-content/60">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <span className="text-base-content font-bold">Universal Recovery Assistant</span>
        </div>
        <div>Step {currentStep} of 5</div>
      </div>

      {/* STEP 1: Select Email Account */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-base-content">Select Email Account</h3>
            <p className="text-xs text-base-content/60 mt-1">
              Choose the email address you wish to recover or review procedures for.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {accounts.map((acc) => (
              <div
                key={acc._id}
                onClick={() => setSelectedAccountId(acc._id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedAccountId === acc._id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-base-300 bg-base-200/30 hover:border-primary/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ProviderIcon provider={acc.provider} size="sm" />
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-base-content truncate">
                      {acc.label || acc.email}
                    </p>
                    <p className="text-xs text-base-content/60 truncate">{acc.email}</p>
                  </div>
                </div>
                {selectedAccountId === acc._id && (
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              variant="primary"
              size="md"
              disabled={!selectedAccountId}
              onClick={() => setCurrentStep(2)}
              rightIcon={ArrowRight}
            >
              Continue to Readiness Check
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Assess Recovery Readiness */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-base-content">
              Recovery Readiness Assessment
            </h3>
            <p className="text-xs text-base-content/60 mt-1">
              Evaluating supported recovery channels and safety configurations for this account.
            </p>
          </div>

          {loading || !readinessReport ? (
            <div className="py-12">
              <LoadingSpinner size="lg" label="Analyzing account recovery readiness..." />
            </div>
          ) : (
            <ReadinessReport report={readinessReport} />
          )}

          <div className="flex justify-between pt-4 border-t border-base-200">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={ArrowLeft}
              onClick={() => setCurrentStep(1)}
            >
              Change Account
            </Button>
            <Button
              variant="primary"
              size="md"
              rightIcon={ArrowRight}
              onClick={() => setCurrentStep(3)}
            >
              Proceed to Recovery Method
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Select Legitimate Recovery Method */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-base-content">Select Recovery Method</h3>
            <p className="text-xs text-base-content/60 mt-1">
              Choose the identity verification channel you have active access to.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(
              providerConfig?.supportedMethods || [
                RecoveryMethod.RECOVERY_EMAIL,
                RecoveryMethod.RECOVERY_PHONE,
                RecoveryMethod.BACKUP_CODES,
                RecoveryMethod.AUTHENTICATOR_APP,
                RecoveryMethod.ACCOUNT_RECOVERY_FORM,
              ]
            ).map((method) => {
              const isConfigured = readinessReport?.availableMethods.includes(method);
              return (
                <RecoveryMethodCard
                  key={method}
                  method={method}
                  available={isConfigured}
                  selected={selectedMethod === method}
                  onSelect={(m) => setSelectedMethod(m)}
                />
              );
            })}
          </div>

          <div className="flex justify-between pt-4 border-t border-base-200">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={ArrowLeft}
              onClick={() => setCurrentStep(2)}
            >
              Back
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={actionLoading}
              rightIcon={Play}
              onClick={startRecoverySession}
            >
              Start Recovery Procedure
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Provider Instructions & Official Link */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-base-content">Execute Provider Recovery</h3>
            <p className="text-xs text-base-content/60 mt-1">
              Follow official identity verification steps on the verified provider recovery portal.
            </p>
          </div>

          <ProviderInstructions
            providerConfig={providerConfig}
            method={selectedMethod}
            email={selectedAccount?.email}
          />

          <div className="flex justify-between pt-4 border-t border-base-200">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={ArrowLeft}
              onClick={() => setCurrentStep(3)}
            >
              Choose Different Method
            </Button>
            <Button
              variant="primary"
              size="md"
              rightIcon={ArrowRight}
              onClick={() => setCurrentStep(5)}
            >
              Record Recovery Outcome
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5: Record Recovery Outcome */}
      {currentStep === 5 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-bold text-base-content">Record Recovery Outcome</h3>
            <p className="text-xs text-base-content/60 mt-1">
              Confirm the outcome of your account restoration attempt. Important: Only record &apos;Completed&apos; if access has been verified on the official provider portal.
            </p>
          </div>

          {/* Outcome Status Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              onClick={() => setOutcomeStatus(RecoverySessionStatus.COMPLETED)}
              className={`p-4 rounded-2xl border cursor-pointer text-center transition-all ${
                outcomeStatus === RecoverySessionStatus.COMPLETED
                  ? 'border-success bg-success/10 text-success ring-2 ring-success/20'
                  : 'border-base-300 hover:border-success/40'
              }`}
            >
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-success" />
              <h4 className="font-bold text-sm">Access Restored</h4>
              <p className="text-[11px] text-base-content/70 mt-1">
                Password reset and account successfully recovered
              </p>
            </div>

            <div
              onClick={() => setOutcomeStatus(RecoverySessionStatus.IN_PROGRESS)}
              className={`p-4 rounded-2xl border cursor-pointer text-center transition-all ${
                outcomeStatus === RecoverySessionStatus.IN_PROGRESS
                  ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                  : 'border-base-300 hover:border-primary/40'
              }`}
            >
              <RotateCcw className="w-6 h-6 mx-auto mb-2 text-primary" />
              <h4 className="font-bold text-sm">In Progress</h4>
              <p className="text-[11px] text-base-content/70 mt-1">
                Awaiting provider review or 24-72h cooldown
              </p>
            </div>

            <div
              onClick={() => setOutcomeStatus(RecoverySessionStatus.FAILED)}
              className={`p-4 rounded-2xl border cursor-pointer text-center transition-all ${
                outcomeStatus === RecoverySessionStatus.FAILED
                  ? 'border-error bg-error/10 text-error ring-2 ring-error/20'
                  : 'border-base-300 hover:border-error/40'
              }`}
            >
              <XCircle className="w-6 h-6 mx-auto mb-2 text-error" />
              <h4 className="font-bold text-sm">Attempt Failed</h4>
              <p className="text-[11px] text-base-content/70 mt-1">
                Identity verification was rejected by provider
              </p>
            </div>
          </div>

          {/* User Notes */}
          <div>
            <label className="label text-xs font-semibold text-base-content/80 pb-1">
              Recovery Session Audit Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="e.g. Received verification code at alternative email; updated account password and rotated backup codes."
              className="textarea textarea-bordered w-full text-sm rounded-xl focus:border-primary"
            />
          </div>

          <div className="flex justify-between pt-4 border-t border-base-200">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={ArrowLeft}
              onClick={() => setCurrentStep(4)}
            >
              Back to Guidance
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={actionLoading}
              onClick={finalizeOutcome}
            >
              Finalize &amp; Save Record
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
