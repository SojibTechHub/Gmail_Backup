import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import {
  EmailProvider,
  RecoveryReadiness,
  RecoverySessionStatus,
  AccountOwnershipStatus,
} from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | undefined): string {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  } catch {
    return 'Invalid Date';
  }
}

export function timeAgo(date: string | Date | undefined): string {
  if (!date) return 'N/A';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return 'N/A';
  }
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}***@${domain}`;
  return `${user.slice(0, 2)}***${user.slice(-1)}@${domain}`;
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return phone;
  return `***-***-${phone.slice(-4)}`;
}

export function getProviderColor(provider: EmailProvider): string {
  switch (provider) {
    case EmailProvider.GMAIL:
      return '#EA4335';
    case EmailProvider.OUTLOOK:
      return '#0078D4';
    case EmailProvider.YAHOO:
      return '#6001D2';
    case EmailProvider.ICLOUD:
      return '#64748b';
    case EmailProvider.ZOHO:
      return '#C8202B';
    case EmailProvider.PROTONMAIL:
      return '#6D4AFF';
    case EmailProvider.GMX:
      return '#1C449B';
    case EmailProvider.AOL:
      return '#FF3300';
    case EmailProvider.YANDEX:
      return '#FC3F1D';
    case EmailProvider.CUSTOM:
      return '#10b981';
    default:
      return '#6366f1';
  }
}

export function getProviderName(provider: EmailProvider): string {
  switch (provider) {
    case EmailProvider.GMAIL:
      return 'Gmail / Google';
    case EmailProvider.OUTLOOK:
      return 'Microsoft Outlook';
    case EmailProvider.YAHOO:
      return 'Yahoo Mail';
    case EmailProvider.ICLOUD:
      return 'Apple iCloud';
    case EmailProvider.ZOHO:
      return 'Zoho Mail';
    case EmailProvider.PROTONMAIL:
      return 'Proton Mail';
    case EmailProvider.GMX:
      return 'GMX Mail';
    case EmailProvider.AOL:
      return 'AOL Mail';
    case EmailProvider.YANDEX:
      return 'Yandex Mail';
    case EmailProvider.CUSTOM:
      return 'Custom Domain';
    default:
      return 'Other IMAP/SMTP';
  }
}

export function getReadinessBadge(readiness: RecoveryReadiness): {
  label: string;
  className: string;
} {
  switch (readiness) {
    case RecoveryReadiness.READY:
      return {
        label: 'Recovery Ready',
        className: 'badge-success text-white',
      };
    case RecoveryReadiness.PARTIALLY_READY:
      return {
        label: 'Partially Ready',
        className: 'badge-warning text-slate-900',
      };
    case RecoveryReadiness.MISSING_INFO:
      return {
        label: 'Missing Info',
        className: 'badge-error text-white',
      };
    case RecoveryReadiness.SETUP_RECOMMENDED:
    default:
      return {
        label: 'Setup Recommended',
        className: 'badge-info text-white',
      };
  }
}

export function getStatusBadge(status: RecoverySessionStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case RecoverySessionStatus.COMPLETED:
      return { label: 'Completed', className: 'badge-success text-white' };
    case RecoverySessionStatus.IN_PROGRESS:
      return { label: 'In Progress', className: 'badge-primary text-white' };
    case RecoverySessionStatus.AWAITING_VERIFICATION:
      return { label: 'Awaiting Verification', className: 'badge-warning text-slate-900' };
    case RecoverySessionStatus.FAILED:
      return { label: 'Failed', className: 'badge-error text-white' };
    case RecoverySessionStatus.CANCELLED:
      return { label: 'Cancelled', className: 'badge-ghost' };
    case RecoverySessionStatus.INITIATED:
    default:
      return { label: 'Initiated', className: 'badge-neutral text-white' };
  }
}

export function getOwnershipBadge(status: AccountOwnershipStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case AccountOwnershipStatus.OWNER:
      return { label: 'Owner', className: 'badge-primary' };
    case AccountOwnershipStatus.AUTHORIZED:
      return { label: 'Authorized Agent', className: 'badge-secondary' };
    case AccountOwnershipStatus.PENDING_VERIFICATION:
    default:
      return { label: 'Pending Verification', className: 'badge-warning' };
  }
}
