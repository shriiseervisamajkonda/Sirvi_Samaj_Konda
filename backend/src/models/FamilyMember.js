import mongoose from 'mongoose';

const familyMemberSchema = new mongoose.Schema(
  {
    photo: String,
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    dateOfBirth: Date,
    age: Number,
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
    },
    education: String,
    occupation: String,
    company: String,
    business: String,
    phoneNumber: String,
    email: String,
    address: String,
    village: { type: String, default: 'Konda' },
    tehsil: { type: String, default: 'Kukshi' },
    district: { type: String, default: 'Dhar' },
    state: { type: String, default: 'Madhya Pradesh' },
    pinCode: { type: String, default: '454335' },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'widowed', 'divorced'],
      default: 'single',
    },
    skills: [String],
    achievements: [String],
    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
    },
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String,
    },
    documents: [{ name: String, url: String, type: String }],
    family: { type: mongoose.Schema.Types.ObjectId, ref: 'Family' },
    isHeadOfFamily: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive', 'deceased'], default: 'active' },
    villageRef: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageInformation' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

familyMemberSchema.index({ firstName: 'text', lastName: 'text', occupation: 'text' });
familyMemberSchema.index({ bloodGroup: 1, village: 1 });

export default mongoose.model('FamilyMember', familyMemberSchema);
