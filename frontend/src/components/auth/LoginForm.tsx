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

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-base-300" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-base-100 px-2 text-base-content/50 font-bold">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            toast.info('Google Cloud OAuth 2.0 active. Authenticating via Google client...');
            // Google OAuth Client ID provided by user
            const clientId = '474689305894-dlgv3e770r5dm1sag9ltnofat9o6ja6t.apps.googleusercontent.com';
            const redirectUri = window.location.origin + '/overview';
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
              redirectUri
            )}&response_type=token&scope=email%20profile`;
            window.location.href = authUrl;
          }}
          className="btn btn-outline w-full rounded-xl gap-2 font-semibold text-xs border-base-300 hover:bg-base-200 hover:border-base-content/30"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>
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
