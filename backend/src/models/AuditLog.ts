import mongoose, { Schema, Document, Model } from 'mongoose';
import { AuditAction } from '../types';

export interface IAuditLogDocument extends Document {
  userId: mongoose.Types.ObjectId;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress: string;
  userAgent: string;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: true,
    },
    resource: {
      type: String,
      required: true,
    },
    resourceId: { type: String },
    details: { type: String },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

// TTL index: auto-delete after 90 days (7776000 seconds)
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

const AuditLog: Model<IAuditLogDocument> =
  mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
export default AuditLog;
