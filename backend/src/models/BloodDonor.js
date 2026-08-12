import mongoose from 'mongoose';

const bloodDonorSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember' },
    photo: String,
    name: { type: String, required: true },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    phone: { type: String, required: true },
    village: { type: String, default: 'Konda' },
    availability: { type: String, enum: ['available', 'unavailable', 'on_request'], default: 'available' },
    lastDonationDate: Date,
    emergencyContact: {
      name: String,
      phone: String,
    },
    villageRef: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageInformation' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

bloodDonorSchema.index({ bloodGroup: 1, village: 1 });

export default mongoose.model('BloodDonor', bloodDonorSchema);
