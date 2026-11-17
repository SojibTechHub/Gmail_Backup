'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { User, Mail, Shield, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import authService from '../../../services/auth.service';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { formatDate } from '../../../utils/helpers';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  avatar: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      avatar: user?.avatar || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      await authService.updateProfile({
        name: data.name,
        avatar: data.avatar || undefined,
      });
      await refreshUser();
      toast.success('Profile updated successfully');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-base-content tracking-tight">
          User Profile
        </h1>
        <p className="text-xs text-base-content/60 mt-1">
          Manage your account credentials, display identity, and security roles
        </p>
      </div>

      {/* User Summary Card */}
      <div className="card bg-base-100 border border-base-300 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <Avatar name={user?.name || 'User'} src={user?.avatar} size="lg" />

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-base-content">{user?.name}</h2>
            <span className="badge badge-primary badge-sm uppercase font-bold tracking-wider">
              {user?.role}
            </span>
            {user?.isEmailVerified ? (
              <span className="badge badge-success badge-sm text-white gap-1">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            ) : (
              <span className="badge badge-warning badge-sm gap-1">
                <AlertTriangle className="w-3 h-3" /> Pending Verification
              </span>
            )}
          </div>

          <p className="text-xs text-base-content/70">{user?.email}</p>

          <div className="grid grid-cols-2 gap-4 pt-3 text-xs text-base-content/60">
            <div>
              <span className="block font-semibold text-base-content/40 uppercase text-[10px]">
                Member Since
              </span>
              <span>{formatDate(user?.createdAt)}</span>
            </div>
            <div>
              <span className="block font-semibold text-base-content/40 uppercase text-[10px]">
                Last Login
              </span>
              <span>{formatDate(user?.lastLogin)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="card bg-base-100 border border-base-300 p-6 sm:p-8 rounded-3xl shadow-sm">
        <h3 className="text-base font-bold text-base-content mb-4">Edit Profile Information</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
          <div>
            <label className="label text-xs font-semibold text-base-content/80 pb-1">
              Display Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                {...register('name')}
                className="input input-bordered w-full pl-9 text-sm rounded-xl focus:border-primary"
              />
            </div>
            {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label text-xs font-semibold text-base-content/80 pb-1">
              Avatar Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://example.com/avatar.png"
              {...register('avatar')}
              className="input input-bordered w-full text-sm rounded-xl focus:border-primary"
            />
            {errors.avatar && <p className="text-xs text-error mt-1">{errors.avatar.message}</p>}
          </div>

          <Button type="submit" variant="primary" size="md" loading={loading} className="rounded-xl">
            Update Profile
          </Button>
        </form>
      </div>
    </div>
  );
}
