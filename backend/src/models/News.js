import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    excerpt: String,
    image: String,
    category: {
      type: String,
      enum: ['news', 'notice', 'update', 'emergency'],
      default: 'news',
    },
    isFeatured: { type: Boolean, default: false },
    isEmergency: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    publishedAt: Date,
    villageRef: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageInformation' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

newsSchema.index({ title: 'text', content: 'text' });
newsSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('News', newsSchema);
