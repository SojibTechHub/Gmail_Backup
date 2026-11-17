import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserSessionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  userAgent: string;
  ipAddress: string;
  expiresAt: Date;
  isValid: boolean;
}

const UserSessionSchema = new Schema<IUserSessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// TTL index: automatically remove expired sessions
UserSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const UserSession: Model<IUserSessionDocument> =
  mongoose.model<IUserSessionDocument>('UserSession', UserSessionSchema);
export default UserSession;
