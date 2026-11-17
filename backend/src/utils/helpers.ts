import crypto from 'crypto';
import { EmailProvider } from '../types';
import type { ApiResponse } from '../types';

export const generateToken = (bytes = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const formatResponse = <T = unknown>(
  success: boolean,
  message: string,
  data?: T,
  meta?: ApiResponse['meta']
): ApiResponse<T> => {
  const response: ApiResponse<T> = { success, message };
  if (data !== undefined) response.data = data;
  if (meta) response.meta = meta;
  return response;
};

export interface PaginationResult {
  skip: number;
  limit: number;
  page: number;
}

export const paginate = (
  page: number | string = 1,
  limit: number | string = 20
): PaginationResult => {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  return {
    skip: (pageNum - 1) * limitNum,
    limit: limitNum,
    page: pageNum,
  };
};

const PROVIDER_DOMAIN_MAP: Record<string, EmailProvider> = {
  'gmail.com': EmailProvider.GMAIL,
  'googlemail.com': EmailProvider.GMAIL,
  'outlook.com': EmailProvider.OUTLOOK,
  'hotmail.com': EmailProvider.OUTLOOK,
  'live.com': EmailProvider.OUTLOOK,
  'msn.com': EmailProvider.OUTLOOK,
  'yahoo.com': EmailProvider.YAHOO,
  'yahoo.co.uk': EmailProvider.YAHOO,
  'yahoo.co.in': EmailProvider.YAHOO,
  'ymail.com': EmailProvider.YAHOO,
  'rocketmail.com': EmailProvider.YAHOO,
  'icloud.com': EmailProvider.ICLOUD,
  'me.com': EmailProvider.ICLOUD,
  'mac.com': EmailProvider.ICLOUD,
  'zoho.com': EmailProvider.ZOHO,
  'zohomail.com': EmailProvider.ZOHO,
  'protonmail.com': EmailProvider.PROTONMAIL,
  'proton.me': EmailProvider.PROTONMAIL,
  'pm.me': EmailProvider.PROTONMAIL,
  'gmx.com': EmailProvider.GMX,
  'gmx.net': EmailProvider.GMX,
  'gmx.de': EmailProvider.GMX,
  'aol.com': EmailProvider.AOL,
  'aim.com': EmailProvider.AOL,
  'yandex.com': EmailProvider.YANDEX,
  'yandex.ru': EmailProvider.YANDEX,
  'ya.ru': EmailProvider.YANDEX,
};

export const detectProvider = (email: string): EmailProvider => {
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return EmailProvider.OTHER;
  return PROVIDER_DOMAIN_MAP[domain] || EmailProvider.OTHER;
};
