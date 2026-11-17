'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import authService from '../../../services/auth.service';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error');
  const [errorMessage, setErrorMessage] = useState(token ? '' : 'No verification token provided in URL.');

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    authService
      .verifyEmail(token)
      .then(() => {
        if (isMounted) setStatus('success');
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setStatus('error');
          setErrorMessage(err instanceof Error ? err.message : 'Invalid or expired verification token');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="card bg-base-100 border border-base-300 shadow-xl p-8 rounded-3xl text-center">
      {status === 'loading' && (
        <div className="py-6">
          <LoadingSpinner size="lg" label="Verifying your email address..." />
        </div>
      )}

      {status === 'success' && (
        <div className="py-4">
          <div className="w-14 h-14 rounded-2xl bg-success/10 text-success flex items-center justify-center mx-auto mb-4 border border-success/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-base-content">Email Verified!</h2>
          <p className="text-xs text-base-content/70 mt-2 mb-6">
            Your email address has been successfully verified. Your account is now fully secured.
          </p>
          <Link href="/login">
            <Button variant="primary" size="md" className="w-full">
              Proceed to Sign In <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="py-4">
          <div className="w-14 h-14 rounded-2xl bg-error/10 text-error flex items-center justify-center mx-auto mb-4 border border-error/20">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-base-content">Verification Failed</h2>
          <p className="text-xs text-error mt-2 mb-6">{errorMessage}</p>
          <Link href="/login">
            <Button variant="ghost" size="sm" className="w-full">
              Return to Sign In
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading..." />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
