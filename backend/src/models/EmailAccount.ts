import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  EmailProvider,
  AccountOwnershipStatus,
  RecoveryReadiness,
} from '../types';

export interface IEmailAccountDocument extends Document {
  userId: mongoose.Types.ObjectId;
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
  lastUpdated: Date;
}

const EmailAccountSchema = new Schema<IEmailAccountDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    provider: {
      type: String,
      enum: Object.values(EmailProvider),
      required: true,
    },
    label: {
      type: String,
      trim: true,
      default: '',
    },
    ownershipStatus: {
      type: String,
      enum: Object.values(AccountOwnershipStatus),
      default: AccountOwnershipStatus.PENDING_VERIFICATION,
    },
    hasRecoveryEmail: { type: Boolean, default: false },
    hasRecoveryPhone: { type: Boolean, default: false },
    has2FA: { type: Boolean, default: false },
    hasBackupCodes: { type: Boolean, default: false },
    recoveryReadiness: {
      type: String,
      enum: Object.values(RecoveryReadiness),
      default: RecoveryReadiness.SETUP_RECOMMENDED,
    },
    notes: { type: String },
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

// Compound unique index
EmailAccountSchema.index({ userId: 1, email: 1 }, { unique: true });

// Pre-save hook: compute recoveryReadiness from boolean flags
EmailAccountSchema.pre<IEmailAccountDocument>('save', function (next) {
  const flags = [
    this.hasRecoveryEmail,
    this.hasRecoveryPhone,
    this.has2FA,
    this.hasBackupCodes,
  ];
  const trueCount = flags.filter(Boolean).length;

  if (trueCount === 4) {
    this.recoveryReadiness = RecoveryReadiness.READY;
  } else if (trueCount >= 2) {
    this.recoveryReadiness = RecoveryReadiness.PARTIALLY_READY;
  } else if (trueCount === 1) {
    this.recoveryReadiness = RecoveryReadiness.MISSING_INFO;
  } else {
    this.recoveryReadiness = RecoveryReadiness.SETUP_RECOMMENDED;
  }

  this.lastUpdated = new Date();
  next();
});

const EmailAccount: Model<IEmailAccountDocument> =
  mongoose.model<IEmailAccountDocument>('EmailAccount', EmailAccountSchema);
export default EmailAccount;
