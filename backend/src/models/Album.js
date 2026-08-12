import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    coverImage: String,
    category: {
      type: String,
      enum: ['festival', 'community_event', 'general', 'videos'],
      default: 'general',
    },
    villageRef: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageInformation' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Album', albumSchema);
