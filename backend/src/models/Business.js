import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },
    owner: { type: String, required: true },
    ownerMember: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember' },
    category: String,
    gstNumber: String,
    address: String,
    village: { type: String, default: 'Konda' },
    phone: String,
    whatsapp: String,
    email: String,
    website: String,
    googleMapsLocation: String,
    gallery: [String],
    logo: String,
    description: String,
    villageRef: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageInformation' },
    status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

businessSchema.index({ businessName: 'text', owner: 'text', category: 'text' });
businessSchema.index({ status: 1, category: 1, village: 1 });

export default mongoose.model('Business', businessSchema);
