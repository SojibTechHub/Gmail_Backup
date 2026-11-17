'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { PasswordStrength } from './PasswordStrength';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50),
    email: z.string().email('Please enter a valid email address').toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Terms of Service and Privacy Policy',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { register: registerAuth } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      agreeTerms: false,
    },
  });

  const passwordValue = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      await registerAuth(data.name, data.email, data.password);
      toast.success('Registration successful! Please check your email to verify.');
      router.push('/overview');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-xl p-6 sm:p-8 rounded-3xl">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-base-content tracking-tight">Create MailVault Account</h2>
        <p className="text-xs text-base-content/60 mt-1">
          Zero-knowledge protection for your email recovery credentials
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label text-xs font-semibold text-base-content/80 pb-1">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Alex Johnson"
              {...register('name')}
              className="input input-bordered w-full pl-9 text-sm rounded-xl focus:border-primary"
            />
          </div>
          {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="label text-xs font-semibold text-base-content/80 pb-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              placeholder="alex@example.com"
              {...register('email')}
              className="input input-bordered w-full pl-9 text-sm rounded-xl focus:border-primary"
            />
          </div>
          {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label text-xs font-semibold text-base-content/80 pb-1">Master Password</label>
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
          <PasswordStrength password={passwordValue} />
          {errors.password && <p className="text-xs text-error mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="label text-xs font-semibold text-base-content/80 pb-1">Confirm Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              {...register('confirmPassword')}
              className="input input-bordered w-full pl-9 pr-9 text-sm rounded-xl focus:border-primary"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-error mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex items-start gap-2 pt-1">
          <input
            type="checkbox"
            id="agreeTerms"
            {...register('agreeTerms')}
            className="checkbox checkbox-primary checkbox-xs rounded mt-0.5"
          />
          <label htmlFor="agreeTerms" className="text-xs text-base-content/70 cursor-pointer">
            I agree to the Terms of Service, Privacy Policy, and declare that I only recover accounts I legally own or am authorized to manage.
          </label>
        </div>
        {errors.agreeTerms && (
          <p className="text-xs text-error mt-0.5">{errors.agreeTerms.message}</p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          className="w-full mt-2 rounded-xl font-semibold"
        >
          Create Secure Account
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-base-content/60">
        Already registered?{' '}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
