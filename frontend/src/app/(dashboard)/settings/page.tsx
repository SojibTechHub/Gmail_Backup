'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Shield,
  KeyRound,
  Lock,
  QrCode,
  Bell,
  Eye,
  EyeOff,
  CheckCircle,
  Copy,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import authService from '../../../services/auth.service';
import { Button } from '../../../components/ui/Button';
import { ThemeToggle } from '../../../components/ui/ThemeToggle';
import { Modal } from '../../../components/ui/Modal';
import { PasswordStrength } from '../../../components/auth/PasswordStrength';
import { DeviceSessionManager } from '../../../components/settings/DeviceSessionManager';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ['confirmNewPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();

  // Password change state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // MFA state
  const [mfaModalOpen, setMfaModalOpen] = useState(false);
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaQrCode, setMfaQrCode] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [mfaBackupCodes, setMfaBackupCodes] = useState<string[]>([]);
  const [mfaLoading, setMfaLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const newPasswordValue = watch('newPassword');

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    setPasswordLoading(true);
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      toast.success('Master password updated successfully');
      reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleStartMfaSetup = async () => {
    setMfaLoading(true);
    try {
      const data = await authService.enableMfa();
      if (data) {
        setMfaSecret(data.secret);
        setMfaQrCode(data.qrCode);
        setMfaModalOpen(true);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to initialize MFA');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyMfa = async () => {
    if (!mfaToken || mfaToken.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setMfaLoading(true);
    try {
      const res = await authService.verifyMfa(mfaToken);
      if (res?.backupCodes) {
        setMfaBackupCodes(res.backupCodes);
      }
      toast.success('Two-factor authentication enabled successfully');
      await refreshUser();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    const code = prompt('Enter 6-digit MFA code to confirm disabling:');
    if (!code) return;

    try {
      await authService.disableMfa(code);
      toast.success('Two-factor authentication disabled');
      await refreshUser();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to disable MFA');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-base-content tracking-tight">
          Security &amp; Account Settings
        </h1>
        <p className="text-xs text-base-content/60 mt-1">
          Configure authentication safeguards, multi-factor tokens, and session parameters
        </p>
      </div>

      {/* MFA Card */}
      <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-base-content">
                  Two-Factor Authentication (TOTP)
                </h3>
                <span
                  className={`badge badge-sm font-semibold ${
                    user?.isMfaEnabled ? 'badge-success text-white' : 'badge-ghost'
                  }`}
                >
                  {user?.isMfaEnabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-base-content/60 mt-0.5">
                Protect your MailVault account with rotating TOTP codes from Google Authenticator
              </p>
            </div>
          </div>

          <div>
            {user?.isMfaEnabled ? (
              <Button variant="error" size="sm" onClick={handleDisableMfa}>
                Disable 2FA
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartMfaSetup}
                loading={mfaLoading}
                className="font-semibold"
              >
                Setup Authenticator
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="card bg-base-100 border border-base-300 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2.5 mb-6">
          <Lock className="w-5 h-5 text-primary" />
          <h3 className="text-base font-bold text-base-content">Update Master Password</h3>
        </div>

        <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-lg">
          <div>
            <label className="label text-xs font-semibold text-base-content/80 pb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                {...register('currentPassword')}
                className="input input-bordered w-full pr-9 text-sm rounded-xl focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content/40 hover:text-base-content"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-error mt-1">{errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="label text-xs font-semibold text-base-content/80 pb-1">
              New Master Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                {...register('newPassword')}
                className="input input-bordered w-full pr-9 text-sm rounded-xl focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content/40 hover:text-base-content"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrength password={newPasswordValue} />
            {errors.newPassword && (
              <p className="text-xs text-error mt-1">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="label text-xs font-semibold text-base-content/80 pb-1">
              Confirm New Master Password
            </label>
            <input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              {...register('confirmNewPassword')}
              className="input input-bordered w-full text-sm rounded-xl focus:border-primary"
            />
            {errors.confirmNewPassword && (
              <p className="text-xs text-error mt-1">{errors.confirmNewPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={passwordLoading}
            className="rounded-xl font-semibold mt-2"
          >
            Save New Password
          </Button>
        </form>
      </div>

      {/* Device & Session Management */}
      <DeviceSessionManager />

      {/* Preferences & Appearance Card */}
      <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl shadow-sm space-y-4">
        <h3 className="text-base font-bold text-base-content">System Preferences</h3>
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-base-200/50 border border-base-300">
          <div>
            <p className="font-semibold text-xs text-base-content">Interface Color Theme</p>
            <p className="text-[11px] text-base-content/60">
              Toggle between cybersecurity dark mode and clean daylight mode
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* MFA Setup Modal */}
      <Modal
        open={mfaModalOpen}
        onClose={() => {
          setMfaModalOpen(false);
          setMfaBackupCodes([]);
        }}
        title="Setup Two-Factor Authenticator"
        maxWidth="md"
      >
        <div className="space-y-4 text-center py-2">
          {mfaBackupCodes.length === 0 ? (
            <>
              <p className="text-xs text-base-content/70">
                Scan this QR code using Google Authenticator, Microsoft Authenticator, or 1Password:
              </p>

              {mfaQrCode && (
                <div className="p-4 bg-white rounded-2xl inline-block shadow-inner mx-auto my-2">
                  <img src={mfaQrCode} alt="MFA QR Code" className="w-48 h-48 mx-auto" />
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-base-200 font-mono text-xs text-base-content select-all">
                Manual Key: <span className="font-bold">{mfaSecret}</span>
              </div>

              <div className="pt-2 text-left">
                <label className="label text-xs font-semibold text-base-content/80 pb-1">
                  Enter 6-digit verification code:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={mfaToken}
                  onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, ''))}
                  className="input input-bordered w-full text-center text-lg font-mono tracking-widest rounded-xl focus:border-primary"
                />
              </div>

              <div className="modal-action">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMfaModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  loading={mfaLoading}
                  onClick={handleVerifyMfa}
                >
                  Verify &amp; Activate
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-base-content">
                Save Emergency Backup Codes
              </h3>
              <p className="text-xs text-base-content/70">
                Store these single-use codes safely. If you lose your phone, each can be used once to access your account:
              </p>

              <div className="grid grid-cols-2 gap-2 p-4 rounded-2xl bg-base-200/80 font-mono text-xs font-bold text-base-content select-all">
                {mfaBackupCodes.map((code, i) => (
                  <div key={i} className="p-1.5 bg-base-100 rounded-lg border border-base-300">
                    {code}
                  </div>
                ))}
              </div>

              <div className="modal-action">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setMfaModalOpen(false);
                    setMfaBackupCodes([]);
                  }}
                  className="w-full"
                >
                  I have saved my backup codes
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
