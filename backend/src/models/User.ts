import mongoose, { Schema, Document, Model } from 'mongoose';
import argon2 from 'argon2';
import { UserRole } from '../types';

export interface IUserDocument extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  mfaSecret?: string;
  isMfaEnabled: boolean;
  mfaBackupCodes: string[];
  googleId?: string;
  avatar?: string;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  refreshTokens: Array<{ token: string; expiresAt: Date }>;
  isLocked: boolean;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    mfaSecret: { type: String },
    isMfaEnabled: {
      type: Boolean,
      default: false,
    },
    mfaBackupCodes: {
      type: [String],
      default: [],
    },
    googleId: { type: String, index: true },
    avatar: { type: String },
    lastLogin: { type: Date },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: { type: Date },
    refreshTokens: [
      {
        token: { type: String, required: true },
        expiresAt: { type: Date, required: true },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual: isLocked
UserSchema.virtual('isLocked').get(function (this: IUserDocument): boolean {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
});

// Pre-save hook: hash password with argon2id when modified
UserSchema.pre<IUserDocument>('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  try {
    this.passwordHash = await argon2.hash(this.passwordHash, {
      type: argon2.argon2id,
    });
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Method: comparePassword
UserSchema.methods.comparePassword = async function (
  this: IUserDocument,
  password: string,
): Promise<boolean> {
  return argon2.verify(this.passwordHash, password);
};

const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', UserSchema);
export default User;
