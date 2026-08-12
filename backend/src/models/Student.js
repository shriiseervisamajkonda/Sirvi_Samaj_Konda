import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember' },
    photo: String,
    name: { type: String, required: true },
    school: String,
    college: String,
    university: String,
    course: String,
    year: String,
    cgpa: String,
    scholarship: String,
    achievements: [String],
    certificates: [{ name: String, url: String }],
    village: { type: String, default: 'Konda' },
    villageRef: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageInformation' },
    status: { type: String, enum: ['active', 'graduated', 'inactive'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Student', studentSchema);
