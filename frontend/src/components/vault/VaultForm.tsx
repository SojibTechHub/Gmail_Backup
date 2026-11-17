'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Lock,
  Plus,
  Trash2,
  Mail,
  Phone,
  KeyRound,
  HelpCircle,
  Laptop,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { VaultDecryptedData } from '../../types';
import { Button } from '../ui/Button';

interface VaultFormProps {
  initialData?: VaultDecryptedData;
  onSave: (data: VaultDecryptedData) => Promise<void>;
  loading?: boolean;
}

export function VaultForm({ initialData, onSave, loading = false }: VaultFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const { register, control, handleSubmit } = useForm<VaultDecryptedData>({
    defaultValues: {
      recoveryEmail: initialData?.recoveryEmail || '',
      recoveryPhone: initialData?.recoveryPhone || '',
      backupCodes: initialData?.backupCodes || [],
      securityQuestions: initialData?.securityQuestions || [],
      previousPasswords: initialData?.previousPasswords || [],
      authenticatorKey: initialData?.authenticatorKey || '',
      trustedDevices: initialData?.trustedDevices || [],
      notes: initialData?.notes || '',
    },
  });

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control,
    name: 'securityQuestions',
  });

  const [backupCodesText, setBackupCodesText] = useState(
    initialData?.backupCodes?.join('\n') || ''
  );
  const [appPasswordsText, setAppPasswordsText] = useState(
    initialData?.appPasswords?.join('\n') || ''
  );
  const [prevPasswordsText, setPrevPasswordsText] = useState(
    initialData?.previousPasswords?.join('\n') || ''
  );
  const [trustedDevicesText, setTrustedDevicesText] = useState(
    initialData?.trustedDevices?.join('\n') || ''
  );

  const onSubmit = async (data: VaultDecryptedData) => {
    setSubmitting(true);
    try {
      const payload: VaultDecryptedData = {
        ...data,
        backupCodes: backupCodesText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        appPasswords: appPasswordsText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        previousPasswords: prevPasswordsText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        trustedDevices: trustedDevicesText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      await onSave(payload);
      toast.success('Vault data encrypted with AES-256-GCM and saved successfully');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save vault');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Recovery Email */}
        <div>
          <label className="label text-xs font-semibold text-base-content/80 pb-1 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-primary" />
            <span>Configured Recovery Email</span>
          </label>
          <input
            type="email"
            placeholder="secondary-backup@domain.com"
            {...register('recoveryEmail')}
            className="input input-bordered w-full text-sm rounded-xl focus:border-primary"
          />
        </div>

        {/* Recovery Phone */}
        <div>
          <label className="label text-xs font-semibold text-base-content/80 pb-1 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-primary" />
            <span>Configured Recovery Phone</span>
          </label>
          <input
            type="tel"
            placeholder="+1 (555) 000-0000"
            {...register('recoveryPhone')}
            className="input input-bordered w-full text-sm rounded-xl focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Backup Codes */}
        <div>
          <label className="label text-xs font-semibold text-base-content/80 pb-1 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-primary" />
            <span>2FA Backup Codes (One per line)</span>
          </label>
          <textarea
            rows={4}
            value={backupCodesText}
            onChange={(e) => setBackupCodesText(e.target.value)}
            placeholder={'8829-1920\n3829-1092\n4819-2091'}
            className="textarea textarea-bordered w-full text-xs font-mono rounded-xl focus:border-primary"
          />
          <span className="text-[11px] text-base-content/50 mt-1 block">
            Emergency 8 or 10-digit backup codes for bypass / recovery.
          </span>
        </div>

        {/* App Passwords */}
        <div>
          <label className="label text-xs font-semibold text-base-content/80 pb-1 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-secondary" />
            <span>Provider App Passwords (One per line)</span>
          </label>
          <textarea
            rows={4}
            value={appPasswordsText}
            onChange={(e) => setAppPasswordsText(e.target.value)}
            placeholder={'eijk srer wzft hbby\nabcd efgh ijkl mnop'}
            className="textarea textarea-bordered w-full text-xs font-mono rounded-xl focus:border-primary"
          />
          <span className="text-[11px] text-base-content/50 mt-1 block">
            16-character provider-generated app passwords for IMAP/SMTP services.
          </span>
        </div>
      </div>

      {/* Security Questions */}
      <div className="space-y-3 p-4 rounded-2xl bg-base-200/40 border border-base-300">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-base-content/80 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span>Security Questions &amp; Answers</span>
          </label>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            leftIcon={Plus}
            onClick={() => appendQuestion({ question: '', answer: '' })}
          >
            Add Question
          </Button>
        </div>

        {questionFields.length === 0 ? (
          <p className="text-xs text-base-content/50 italic py-2">
            No security questions added. Add any questions configured on your provider.
          </p>
        ) : (
          <div className="space-y-3">
            {questionFields.map((field, idx) => (
              <div key={field.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  placeholder="Question (e.g. First pet's name)"
                  {...register(`securityQuestions.${idx}.question`)}
                  className="input input-bordered input-sm sm:col-span-6 text-xs rounded-xl"
                />
                <input
                  type="text"
                  placeholder="Exact Answer"
                  {...register(`securityQuestions.${idx}.answer`)}
                  className="input input-bordered input-sm sm:col-span-5 text-xs rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => removeQuestion(idx)}
                  className="btn btn-ghost btn-circle btn-xs text-error sm:col-span-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Previous Passwords (Reference for recovery questionnaires) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label text-xs font-semibold text-base-content/80 pb-1">
            Previous Passwords (One per line)
          </label>
          <textarea
            rows={3}
            value={prevPasswordsText}
            onChange={(e) => setPrevPasswordsText(e.target.value)}
            placeholder={'PastPassword2023!\nOlderPassword2022'}
            className="textarea textarea-bordered w-full text-xs font-mono rounded-xl focus:border-primary"
          />
          <span className="text-[10px] text-base-content/50 mt-1 block">
            Providers (like Google and Microsoft) frequently ask for the last password you remember.
          </span>
        </div>

        <div>
          <label className="label text-xs font-semibold text-base-content/80 pb-1">
            Known Trusted Devices (One per line)
          </label>
          <textarea
            rows={3}
            value={trustedDevicesText}
            onChange={(e) => setTrustedDevicesText(e.target.value)}
            placeholder={'MacBook Pro 16" - Chrome\nPixel 8 Pro - Android 14'}
            className="textarea textarea-bordered w-full text-xs rounded-xl focus:border-primary"
          />
          <span className="text-[10px] text-base-content/50 mt-1 block">
            List of devices where you were previously authorized or signed in.
          </span>
        </div>
      </div>

      {/* Private Notes */}
      <div>
        <label className="label text-xs font-semibold text-base-content/80 pb-1">
          Confidential Recovery Notes
        </label>
        <textarea
          rows={2}
          {...register('notes')}
          placeholder="Any custom ownership details, billing IDs, or reference codes..."
          className="textarea textarea-bordered w-full text-sm rounded-xl focus:border-primary"
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-base-200">
        <div className="flex items-center gap-1.5 text-xs text-success font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Will be encrypted client-side with AES-256-GCM before dispatch</span>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          leftIcon={Save}
          loading={submitting || loading}
          className="font-bold px-6 rounded-xl shadow-md"
        >
          Save Encrypted Vault
        </Button>
      </div>
    </form>
  );
}
