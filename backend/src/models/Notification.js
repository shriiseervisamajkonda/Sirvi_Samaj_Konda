import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    message: String,
    type: { type: String, enum: ['email', 'sms', 'whatsapp', 'push', 'in_app'], default: 'in_app' },
    isRead: { type: Boolean, default: false },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
