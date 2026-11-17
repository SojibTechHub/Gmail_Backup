'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { toast } from 'sonner';
import accountService from '../../../../services/account.service';
import { AccountForm } from '../../../../components/accounts/AccountForm';

export default function AddAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      await accountService.createAccount(data);
      toast.success('Email account added successfully');
      router.push('/accounts');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top back link */}
      <div>
        <Link
          href="/accounts"
          className="inline-flex items-center gap-1.5 text-xs text-base-content/60 hover:text-base-content font-medium mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Accounts
        </Link>
        <h1 className="text-2xl font-extrabold text-base-content tracking-tight">
          Add New Email Account
        </h1>
        <p className="text-xs text-base-content/60 mt-1">
          Register an email address to assess recovery readiness and safeguard recovery credentials
        </p>
      </div>

      <div className="card bg-base-100 border border-base-300 p-6 sm:p-8 rounded-3xl shadow-sm">
        <AccountForm
          onSubmit={handleSubmit}
          loading={loading}
          onCancel={() => router.push('/accounts')}
        />
      </div>

      <div className="p-4 rounded-2xl bg-base-200/40 border border-base-300 flex items-start gap-3 text-xs text-base-content/70">
        <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p>
          <strong>Security Notice:</strong> MailVault never collects your master email account password or app-specific password. Only recovery readiness metadata and your client-side encrypted vault blobs are maintained.
        </p>
      </div>
    </div>
  );
}
