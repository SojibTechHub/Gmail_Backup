import mongoose, { Schema, Document, Model } from 'mongoose';
import { EmailProvider, RecoveryMethod } from '../types';

export interface IProviderConfigDocument extends Document {
  provider: EmailProvider;
  name: string;
  logo: string;
  domains: string[];
  recoveryUrl: string;
  supportedMethods: RecoveryMethod[];
  hasOAuth: boolean;
  documentationUrl: string;
  instructions: Map<string, string[]>;
  isActive: boolean;
}

const ProviderConfigSchema = new Schema<IProviderConfigDocument>(
  {
    provider: {
      type: String,
      enum: Object.values(EmailProvider),
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    domains: {
      type: [String],
      default: [],
    },
    recoveryUrl: {
      type: String,
      default: '',
    },
    supportedMethods: {
      type: [String],
      enum: Object.values(RecoveryMethod),
      default: [],
    },
    hasOAuth: {
      type: Boolean,
      default: false,
    },
    documentationUrl: {
      type: String,
      default: '',
    },
    instructions: {
      type: Map,
      of: [String],
      default: new Map(),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const ProviderConfig: Model<IProviderConfigDocument> =
  mongoose.model<IProviderConfigDocument>('ProviderConfig', ProviderConfigSchema);
export default ProviderConfig;
