import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: String,
    photo: String,
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'editor', 'member', 'visitor'],
      default: 'member',
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    otp: String,
    otpExpire: Date,
    refreshToken: String,
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    villageId: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageInformation' },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
