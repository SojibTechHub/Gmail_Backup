import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  EmailProvider,
  RecoveryMethod,
  RecoverySessionStatus,
} from '../types';

export interface IRecoverySessionStep {
  step: number;
  description: string;
  completedAt?: Date;
}

export interface IRecoverySessionDocument extends Document {
  sessionId: string;
  userId: mongoose.Types.ObjectId;
  accountId: mongoose.Types.ObjectId;
  provider: EmailProvider;
  method: RecoveryMethod;
  status: RecoverySessionStatus;
  startTime: Date;
  completionTime?: Date;
  notes?: string;
  steps: IRecoverySessionStep[];
}

const RecoverySessionSchema = new Schema<IRecoverySessionDocument>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'EmailAccount',
      required: true,
    },
    provider: {
      type: String,
      enum: Object.values(EmailProvider),
      required: true,
    },
    method: {
      type: String,
      enum: Object.values(RecoveryMethod),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(RecoverySessionStatus),
      default: RecoverySessionStatus.INITIATED,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    completionTime: { type: Date },
    notes: { type: String },
    steps: [
      {
        step: { type: Number, required: true },
        description: { type: String, required: true },
        completedAt: { type: Date },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const RecoverySession: Model<IRecoverySessionDocument> =
  mongoose.model<IRecoverySessionDocument>('RecoverySession', RecoverySessionSchema);
export default RecoverySession;
