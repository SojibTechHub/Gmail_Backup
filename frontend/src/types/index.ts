export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum AccountOwnershipStatus {
  OWNER = 'owner',
  AUTHORIZED = 'authorized',
  PENDING_VERIFICATION = 'pending_verification',
}

export enum RecoveryReadiness {
  READY = 'ready',
  PARTIALLY_READY = 'partially_ready',
  MISSING_INFO = 'missing_info',
  SETUP_RECOMMENDED = 'setup_recommended',
}

export enum RecoverySessionStatus {
  INITIATED = 'initiated',
  IN_PROGRESS = 'in_progress',
  AWAITING_VERIFICATION = 'awaiting_verification',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum EmailProvider {
  GMAIL = 'gmail',
  OUTLOOK = 'outlook',
  YAHOO = 'yahoo',
  ICLOUD = 'icloud',
  ZOHO = 'zoho',
  PROTONMAIL = 'protonmail',
  GMX = 'gmx',
  AOL = 'aol',
  YANDEX = 'yandex',
  CUSTOM = 'custom',
  OTHER = 'other',
}

export enum RecoveryMethod {
  RECOVERY_EMAIL = 'recovery_email',
  RECOVERY_PHONE = 'recovery_phone',
  BACKUP_CODES = 'backup_codes',
  AUTHENTICATOR_APP = 'authenticator_app',
  TRUSTED_DEVICE = 'trusted_device',
  SECURITY_QUESTIONS = 'security_questions',
  ID_VERIFICATION = 'id_verification',
  ACCOUNT_RECOVERY_FORM = 'account_recovery_form',
  SUPPORT_CONTACT = 'support_contact',
}

export enum AuditAction {
  USER_REGISTER = 'user_register',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  MFA_ENABLE = 'mfa_enable',
  MFA_DISABLE = 'mfa_disable',
  ACCOUNT_ADD = 'account_add',
  ACCOUNT_UPDATE = 'account_update',
  ACCOUNT_DELETE = 'account_delete',
  VAULT_ACCESS = 'vault_access',
  VAULT_UPDATE = 'vault_update',
  RECOVERY_START = 'recovery_start',
  RECOVERY_COMPLETE = 'recovery_complete',
  RECOVERY_FAIL = 'recovery_fail',
  ADMIN_ACTION = 'admin_action',
}

export enum NotificationType {
  SECURITY_ALERT = 'security_alert',
  RECOVERY_UPDATE = 'recovery_update',
  ACCOUNT_UPDATE = 'account_update',
  SYSTEM = 'system',
  INFO = 'info',
}

export interface IUser {
  id: string;
  _id?: string;
  email: string;
  name: string;
  role: UserRole;
  isEmailVerified: boolean;
  isMfaEnabled: boolean;
  avatar?: string;
  lastLogin?: string | Date;
  createdAt?: string | Date;
}

export interface IEmailAccount {
  _id: string;
  id?: string;
  userId: string;
  email: string;
  provider: EmailProvider;
  label: string;
  ownershipStatus: AccountOwnershipStatus;
  hasRecoveryEmail: boolean;
  hasRecoveryPhone: boolean;
  has2FA: boolean;
  hasBackupCodes: boolean;
  recoveryReadiness: RecoveryReadiness;
  notes?: string;
  lastUpdated: string | Date;
  createdAt?: string | Date;
}

export interface IRecoveryVault {
  hasVault: boolean;
  accountId: string;
  encryptedData: string | null;
  iv: string | null;
  authTag: string | null;
  updatedAt?: string | Date;
}

export interface VaultDecryptedData {
  recoveryEmail?: string;
  recoveryPhone?: string;
  backupCodes?: string[];
  securityQuestions?: Array<{ question: string; answer: string }>;
  previousPasswords?: string[];
  authenticatorKey?: string;
  trustedDevices?: string[];
  notes?: string;
}

export interface IRecoverySessionStep {
  step: number;
  description: string;
  completedAt?: string | Date;
}

export interface IRecoverySession {
  _id: string;
  sessionId: string;
  userId: string;
  accountId: IEmailAccount | string;
  provider: EmailProvider;
  method: RecoveryMethod;
  status: RecoverySessionStatus;
  startTime: string | Date;
  completionTime?: string | Date;
  notes?: string;
  steps: IRecoverySessionStep[];
  createdAt: string | Date;
}

export interface IProviderConfig {
  provider: EmailProvider;
  name: string;
  logo: string;
  domains: string[];
  recoveryUrl: string;
  supportedMethods: RecoveryMethod[];
  hasOAuth: boolean;
  documentationUrl: string;
  instructions: Record<string, string[]>;
  isActive: boolean;
}

export interface IAuditLog {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  } | string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string | Date;
}

export interface INotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string | Date;
  createdAt: string | Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface UserDashboardStats {
  totalAccounts: number;
  recoveryReady: number;
  partiallyReady: number;
  missingInfo: number;
  recentActivities: IRecoverySession[];
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalAccounts: number;
  totalRecoverySessions: number;
  providerDistribution: Record<string, number>;
  recentAuditLogs: IAuditLog[];
}

export interface ReadinessReportData {
  accountId: string;
  email: string;
  provider: EmailProvider;
  label: string;
  readiness: RecoveryReadiness;
  score: number;
  availableMethods: RecoveryMethod[];
  missingMethods: RecoveryMethod[];
  recommendations: string[];
  providerConfig: {
    name: string;
    logo: string;
    recoveryUrl: string;
    documentationUrl: string;
    supportedMethods: RecoveryMethod[];
    instructions: Record<string, string[]>;
  } | null;
}
