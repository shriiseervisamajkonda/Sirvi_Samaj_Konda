import mongoose from 'mongoose';

const familySchema = new mongoose.Schema(
  {
    familyId: { type: String, unique: true, required: true },
    photo: String,
    headOfFamily: { type: String, required: true },
    surname: { type: String, required: true },
    address: String,
    village: { type: String, default: 'Konda' },
    tehsil: { type: String, default: 'Kukshi' },
    district: { type: String, default: 'Dhar' },
    state: { type: String, default: 'Madhya Pradesh' },
    pinCode: { type: String, default: '454335' },
    mobileNumber: String,
    whatsappNumber: String,
    numberOfMembers: { type: Number, default: 0 },
    familyTree: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember' }],
    qrCode: String,
    status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
    villageRef: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageInformation' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

familySchema.index({ surname: 1, village: 1 });
familySchema.index({ headOfFamily: 'text', surname: 'text' });

export default mongoose.model('Family', familySchema);
