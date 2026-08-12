import mongoose from 'mongoose';

const socialInfoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ['rules', 'history', 'customs', 'reforms', 'general'],
      default: 'general',
    },
    attachments: [{ name: String, url: String }],
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('SocialInfo', socialInfoSchema);
