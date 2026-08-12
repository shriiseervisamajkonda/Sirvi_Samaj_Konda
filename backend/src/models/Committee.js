import mongoose from 'mongoose';

const committeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    designation: { type: String, required: true },
    photo: String,
    phone: String,
    email: String,
    whatsapp: String,
    bio: String,
    order: { type: Number, default: 0 },
    termStart: Date,
    termEnd: Date,
    isActive: { type: Boolean, default: true },
    type: { type: String, enum: ['committee', 'sangathan', 'sankal_panch'], default: 'committee' },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember' },
    villageRef: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageInformation' },
  },
  { timestamps: true }
);

export default mongoose.model('Committee', committeeSchema);
