import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    subject: String,
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'read', 'replied', 'archived'], default: 'new' },
    villageRef: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageInformation' },
  },
  { timestamps: true }
);

export default mongoose.model('Contact', contactSchema);
