'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import authService from '../../services/auth.service';
import { Button } from '../ui/Button';

const schema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase(),
});

type FormData = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSubmitted(true);
      toast.success('Password reset instructions sent');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error sending reset email');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="card bg-base-100 border border-base-300 shadow-xl p-8 rounded-3xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center mx-auto mb-4 border border-success/20">
          <CheckCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-base-content">Check Your Inbox</h2>
        <p className="text-xs text-base-content/70 mt-2 mb-6">
          If an account exists with that email address, we have dispatched secure password reset instructions.
        </p>
        <Link href="/login">
          <Button variant="ghost" size="sm" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 border border-base-300 shadow-xl p-6 sm:p-8 rounded-3xl">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-base-content tracking-tight">Forgot Password</h2>
        <p className="text-xs text-base-content/60 mt-1">
          Enter your registered email address to receive password recovery instructions.
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
          {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          className="w-full mt-2 rounded-xl font-semibold"
        >
          Send Reset Link
        </Button>
      </form>

      <div className="mt-6 text-center text-xs">
        <Link href="/login" className="text-base-content/60 hover:text-base-content inline-flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}
