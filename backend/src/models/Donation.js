import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    donorName: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    purpose: String,
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'bank_transfer', 'cheque', 'online'],
      default: 'cash',
    },
    transactionId: String,
    receiptNumber: String,
    isAnonymous: { type: Boolean, default: false },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember' },
    notes: String,
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
    villageRef: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageInformation' },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Donation', donationSchema);
