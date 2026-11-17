'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 text-center p-6">
      <div className="max-w-md space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-error/10 text-error flex items-center justify-center mx-auto mb-2 border border-error/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-base-content">404 – Page Not Found</h1>
        <p className="text-xs text-base-content/60">
          The requested security resource or page does not exist or has been relocated.
        </p>
        <Link href="/overview">
          <Button variant="primary" size="md" leftIcon={ArrowLeft} className="mt-4">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
