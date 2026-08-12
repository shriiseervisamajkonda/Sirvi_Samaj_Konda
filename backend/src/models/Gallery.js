import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    title: String,
    imageUrl: { type: String, required: true },
    thumbnailUrl: String,
    category: {
      type: String,
      enum: ['festival', 'community_event', 'general', 'video'],
      default: 'general',
    },
    album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
    videoUrl: String,
    isVideo: { type: Boolean, default: false },
    tags: [String],
    villageRef: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageInformation' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Gallery', gallerySchema);
