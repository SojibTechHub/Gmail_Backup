'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EmailProvider, AccountOwnershipStatus, IEmailAccount } from '../../types';
import { Button } from '../ui/Button';

const accountSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  provider: z.nativeEnum(EmailProvider),
  label: z.string().min(1, 'Account label is required').max(100),
  ownershipStatus: z.nativeEnum(AccountOwnershipStatus),
  hasRecoveryEmail: z.boolean(),
  hasRecoveryPhone: z.boolean(),
  has2FA: z.boolean(),
  hasBackupCodes: z.boolean(),
  notes: z.string().max(1000).optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountFormProps {
  initialData?: IEmailAccount | null;
  onSubmit: (data: AccountFormData) => Promise<void>;
  loading?: boolean;
  onCancel?: () => void;
}

export function AccountForm({
  initialData,
  onSubmit,
  loading = false,
  onCancel,
}: AccountFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      email: initialData?.email || '',
      provider: initialData?.provider || EmailProvider.GMAIL,
      label: initialData?.label || '',
      ownershipStatus: initialData?.ownershipStatus || AccountOwnershipStatus.OWNER,
      hasRecoveryEmail: initialData?.hasRecoveryEmail || false,
      hasRecoveryPhone: initialData?.hasRecoveryPhone || false,
      has2FA: initialData?.has2FA || false,
      hasBackupCodes: initialData?.hasBackupCodes || false,
      notes: initialData?.notes || '',
    },
  });

  const emailValue = watch('email');

  // Auto-detect provider from domain
  useEffect(() => {
    if (!initialData && emailValue && emailValue.includes('@')) {
      const domain = emailValue.split('@')[1]?.toLowerCase();
      if (domain === 'gmail.com' || domain === 'googlemail.com') {
        setValue('provider', EmailProvider.GMAIL);
      } else if (['outlook.com', 'hotmail.com', 'live.com', 'msn.com'].includes(domain)) {
        setValue('provider', EmailProvider.OUTLOOK);
      } else if (['yahoo.com', 'ymail.com', 'rocketmail.com'].includes(domain)) {
        setValue('provider', EmailProvider.YAHOO);
      } else if (['icloud.com', 'me.com', 'mac.com'].includes(domain)) {
        setValue('provider', EmailProvider.ICLOUD);
      } else if (['zoho.com', 'zohomail.com'].includes(domain)) {
        setValue('provider', EmailProvider.ZOHO);
      } else if (['proton.me', 'protonmail.com', 'pm.me'].includes(domain)) {
        setValue('provider', EmailProvider.PROTONMAIL);
      } else if (['gmx.com', 'gmx.net', 'gmx.de'].includes(domain)) {
        setValue('provider', EmailProvider.GMX);
      } else if (['aol.com', 'aim.com'].includes(domain)) {
        setValue('provider', EmailProvider.AOL);
      } else if (['yandex.com', 'yandex.ru'].includes(domain)) {
        setValue('provider', EmailProvider.YANDEX);
      } else if (domain) {
        setValue('provider', EmailProvider.CUSTOM);
      }
    }
  }, [emailValue, initialData, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Email */}
        <div>
          <label className="label text-xs font-semibold text-base-content/80 pb-1">
            Email Address *
          </label>
          <input
            type="email"
            placeholder="user@example.com"
            disabled={!!initialData}
            {...register('email')}
            className="input input-bordered w-full text-sm rounded-xl focus:border-primary"
          />
          {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
        </div>

        {/* Label */}
        <div>
          <label className="label text-xs font-semibold text-base-content/80 pb-1">
            Account Label *
          </label>
          <input
            type="text"
            placeholder="e.g. Primary Personal, Work Google"
            {...register('label')}
            className="input input-bordered w-full text-sm rounded-xl focus:border-primary"
          />
          {errors.label && <p className="text-xs text-error mt-1">{errors.label.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Provider */}
        <div>
          <label className="label text-xs font-semibold text-base-content/80 pb-1">
            Email Provider *
          </label>
          <select
            {...register('provider')}
            className="select select-bordered w-full text-sm rounded-xl focus:border-primary"
          >
            <option value={EmailProvider.GMAIL}>Gmail / Google Workspace</option>
            <option value={EmailProvider.OUTLOOK}>Microsoft Outlook / Hotmail</option>
            <option value={EmailProvider.YAHOO}>Yahoo Mail</option>
            <option value={EmailProvider.ICLOUD}>Apple iCloud</option>
            <option value={EmailProvider.ZOHO}>Zoho Mail</option>
            <option value={EmailProvider.PROTONMAIL}>Proton Mail</option>
            <option value={EmailProvider.GMX}>GMX Mail</option>
            <option value={EmailProvider.AOL}>AOL Mail</option>
            <option value={EmailProvider.YANDEX}>Yandex Mail</option>
            <option value={EmailProvider.CUSTOM}>Custom Domain Email</option>
            <option value={EmailProvider.OTHER}>Other IMAP / SMTP</option>
          </select>
          {errors.provider && <p className="text-xs text-error mt-1">{errors.provider.message}</p>}
        </div>

        {/* Ownership Status */}
        <div>
          <label className="label text-xs font-semibold text-base-content/80 pb-1">
            Account Ownership Status *
          </label>
          <select
            {...register('ownershipStatus')}
            className="select select-bordered w-full text-sm rounded-xl focus:border-primary"
          >
            <option value={AccountOwnershipStatus.OWNER}>Direct Account Owner</option>
            <option value={AccountOwnershipStatus.AUTHORIZED}>
              Explicitly Authorized Representative
            </option>
            <option value={AccountOwnershipStatus.PENDING_VERIFICATION}>
              Pending Verification
            </option>
          </select>
          {errors.ownershipStatus && (
            <p className="text-xs text-error mt-1">{errors.ownershipStatus.message}</p>
          )}
        </div>
      </div>

      {/* Recovery Readiness Checkboxes / Toggles */}
      <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/70">
          Recovery Readiness Indicators
        </h4>
        <p className="text-xs text-base-content/60">
          Select which legitimate recovery mechanisms are currently configured for this account.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <label className="flex items-center gap-3 p-2.5 rounded-xl bg-base-100 border border-base-300/60 cursor-pointer hover:border-primary/50 transition-colors">
            <input
              type="checkbox"
              {...register('hasRecoveryEmail')}
              className="checkbox checkbox-primary checkbox-sm rounded"
            />
            <span className="text-xs font-medium text-base-content">
              Recovery Email Configured
            </span>
          </label>

          <label className="flex items-center gap-3 p-2.5 rounded-xl bg-base-100 border border-base-300/60 cursor-pointer hover:border-primary/50 transition-colors">
            <input
              type="checkbox"
              {...register('hasRecoveryPhone')}
              className="checkbox checkbox-primary checkbox-sm rounded"
            />
            <span className="text-xs font-medium text-base-content">
              Recovery Phone Configured
            </span>
          </label>

          <label className="flex items-center gap-3 p-2.5 rounded-xl bg-base-100 border border-base-300/60 cursor-pointer hover:border-primary/50 transition-colors">
            <input
              type="checkbox"
              {...register('has2FA')}
              className="checkbox checkbox-primary checkbox-sm rounded"
            />
            <span className="text-xs font-medium text-base-content">
              2FA / Authenticator App Enabled
            </span>
          </label>

          <label className="flex items-center gap-3 p-2.5 rounded-xl bg-base-100 border border-base-300/60 cursor-pointer hover:border-primary/50 transition-colors">
            <input
              type="checkbox"
              {...register('hasBackupCodes')}
              className="checkbox checkbox-primary checkbox-sm rounded"
            />
            <span className="text-xs font-medium text-base-content">
              Emergency Backup Codes Available
            </span>
          </label>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="label text-xs font-semibold text-base-content/80 pb-1">
          Internal Security Notes (Optional)
        </label>
        <textarea
          rows={3}
          placeholder="e.g. Associated with billing services, recovery contact belongs to IT manager"
          {...register('notes')}
          className="textarea textarea-bordered w-full text-sm rounded-xl focus:border-primary"
        />
        {errors.notes && <p className="text-xs text-error mt-1">{errors.notes.message}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-3">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" size="md" loading={loading} className="px-6 rounded-xl">
          {initialData ? 'Update Account' : 'Register Account'}
        </Button>
      </div>
    </form>
  );
}
