import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRecoveryVaultDocument extends Document {
  userId: mongoose.Types.ObjectId;
  accountId: mongoose.Types.ObjectId;
  encryptedData: string;
  iv: string;
  authTag: string;
}

const RecoveryVaultSchema = new Schema<IRecoveryVaultDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'EmailAccount',
      required: true,
      unique: true,
      index: true,
    },
    encryptedData: {
      type: String,
      required: true,
    },
    iv: {
      type: String,
      required: true,
    },
    authTag: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const RecoveryVault: Model<IRecoveryVaultDocument> =
  mongoose.model<IRecoveryVaultDocument>('RecoveryVault', RecoveryVaultSchema);
export default RecoveryVault;
