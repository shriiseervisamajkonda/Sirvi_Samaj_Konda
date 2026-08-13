import mongoose from 'mongoose';

const marriageProfileSchema = new mongoose.Schema(
  {
    profileType: { type: String, enum: ['bride', 'groom'], required: true },
    photo: String,
    name: { type: String, required: true },
    education: String,
    occupation: String,
    height: String,
    dateOfBirth: Date,
    age: Number,
    familyDetails: {
      fatherName: String,
      motherName: String,
      siblings: Number,
      familyName: String,
      village: String,
    },
    contactDetails: {
      phone: String,
      email: String,
      address: String,
    },
    preferences: String,
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember' },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    isPublic: { type: Boolean, default: false },
    villageRef: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageInformation' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

marriageProfileSchema.index({ profileType: 1, approvalStatus: 1, isPublic: 1 });

export default mongoose.model('MarriageProfile', marriageProfileSchema);
