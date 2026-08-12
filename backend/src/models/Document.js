import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    fileUrl: { type: String, required: true },
    fileType: String,
    category: {
      type: String,
      enum: ['pdf', 'certificate', 'form', 'government_scheme', 'meeting_minutes', 'other'],
      default: 'pdf',
    },
    downloadCount: { type: Number, default: 0 },
    villageRef: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageInformation' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Document', documentSchema);
