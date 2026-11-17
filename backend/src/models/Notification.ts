import mongoose, { Schema, Document, Model } from 'mongoose';
import { NotificationType } from '../types';

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

const Notification: Model<INotificationDocument> =
  mongoose.model<INotificationDocument>('Notification', NotificationSchema);
export default Notification;
