'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MfaInput } from './MfaInput';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [cachedCredentials, setCachedCredentials] = useState<LoginFormData | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const res = await login(data.email, data.password);
      if (res.mfaRequired) {
        setMfaRequired(true);
        setCachedCredentials(data);
        toast.info('Two-Factor Authentication required. Enter the 6-digit code from your authenticator app.');
      } else {
        toast.success('Signed in successfully');
        router.push('/overview');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (code: string) => {
    if (!cachedCredentials) return;
    setLoading(true);
    try {
      await login(cachedCredentials.email, cachedCredentials.password, code);
      toast.success('MFA verification successful');
      router.push('/overview');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid 2FA code');
    } finally {
      setLoading(false);
    }
  };

  if (mfaRequired) {
    return (
      <div className="card bg-base-100 border border-base-300 shadow-xl p-6 sm:p-8 rounded-3xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 border border-primary/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-base-content">Two-Factor Authentication</h2>
        <p className="text-xs text-base-content/70 mt-1 mb-6">
          Enter the 6-digit code from your Google Authenticator or registered 2FA app.
        </p>
        <MfaInput onComplete={handleMfaSubmit} loading={loading} />
        <div className="mt-6 flex justify-between items-center text-xs">
          <button
            type="button"
            onClick={() => setMfaRequired(false)}
            className="text-base-content/60 hover:text-base-content"
          >
            &larr; Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 border border-base-300 shadow-xl p-6 sm:p-8 rounded-3xl">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-base-content tracking-tight">Sign In to MailVault</h2>
        <p className="text-xs text-base-content/60 mt-1">
          Access your secure recovery information vault and accounts
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label text-xs font-semibold text-base-content/80 pb-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              placeholder="name@example.com"
              {...register('email')}
              className="input input-bordered w-full pl-9 text-sm rounded-xl focus:border-primary"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-error mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center pb-1">
            <label className="label text-xs font-semibold text-base-content/80 p-0">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              {...register('password')}
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
          {errors.password && (
            <p className="text-xs text-error mt-1">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          className="w-full mt-2 rounded-xl font-semibold"
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-base-content/60">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary font-semibold hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}
