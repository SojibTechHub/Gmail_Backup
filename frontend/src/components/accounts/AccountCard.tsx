'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Play,
  MoreVertical,
  Edit,
  Trash2,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { IEmailAccount } from '../../types';
import { ProviderIcon } from './ProviderIcon';
import {
  getReadinessBadge,
  getOwnershipBadge,
  getProviderName,
  timeAgo,
} from '../../utils/helpers';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Button } from '../ui/Button';

interface AccountCardProps {
  account: IEmailAccount;
  onDelete: (id: string) => Promise<void>;
  onEdit?: (account: IEmailAccount) => void;
}

export function AccountCard({ account, onDelete, onEdit }: AccountCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const readiness = getReadinessBadge(account.recoveryReadiness);
  const ownership = getOwnershipBadge(account.ownershipStatus);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(account._id);
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const recoveryItems = [
    { label: 'Recovery Email', ready: account.hasRecoveryEmail },
    { label: 'Recovery Phone', ready: account.hasRecoveryPhone },
    { label: '2FA Enabled', ready: account.has2FA },
    { label: 'Backup Codes', ready: account.hasBackupCodes },
  ];

  return (
    <>
      <div className="card bg-base-100 border border-base-300 hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-200 rounded-3xl p-5 flex flex-col justify-between">
        {/* Top Header */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <ProviderIcon provider={account.provider} size="md" />
              <div className="min-w-0">
                <h4 className="font-bold text-base text-base-content truncate">
                  {account.label || account.email}
                </h4>
                <p className="text-xs text-base-content/60 truncate">{account.email}</p>
              </div>
            </div>

            {/* Actions Dropdown */}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle btn-xs text-base-content/50"
              >
                <MoreVertical className="w-4 h-4" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-20 menu menu-xs p-2 shadow-lg bg-base-100 border border-base-300 rounded-2xl w-40"
              >
                <li>
                  <Link href={`/accounts/${account._id}`} className="py-1.5">
                    <ExternalLink className="w-3.5 h-3.5" /> Details
                  </Link>
                </li>
                {onEdit && (
                  <li>
                    <button
                      type="button"
                      onClick={() => onEdit(account)}
                      className="py-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                  </li>
                )}
                <li>
                  <button
                    type="button"
                    onClick={() => setDeleteOpen(true)}
                    className="py-1.5 text-error"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            <span className={`badge badge-sm font-medium ${readiness.className}`}>
              {readiness.label}
            </span>
            <span className={`badge badge-sm font-medium ${ownership.className}`}>
              {ownership.label}
            </span>
          </div>

          {/* Recovery Item Checklist */}
          <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-base-200/50 border border-base-300/50 text-xs mb-4">
            {recoveryItems.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px]">
                {item.ready ? (
                  <Check className="w-3.5 h-3.5 text-success shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-base-content/40 shrink-0" />
                )}
                <span className={item.ready ? 'text-base-content font-medium' : 'text-base-content/50'}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card Footer / Actions */}
        <div className="pt-3 border-t border-base-200 flex items-center justify-between gap-2">
          <span className="text-[10px] text-base-content/50">
            Updated {timeAgo(account.lastUpdated)}
          </span>

          <div className="flex items-center gap-1.5">
            <Link href={`/vault?account=${account._id}`}>
              <Button variant="ghost" size="xs" leftIcon={Lock} className="text-base-content/70">
                Vault
              </Button>
            </Link>
            <Link href={`/recovery?account=${account._id}`}>
              <Button variant="primary" size="xs" leftIcon={Play} className="font-semibold">
                Recover
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Email Account"
        message={`Are you sure you want to remove ${account.email} from your MailVault? All associated recovery sessions and encrypted vault records will be permanently erased.`}
      />
    </>
  );
}
