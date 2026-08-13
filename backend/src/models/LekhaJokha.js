import mongoose from 'mongoose';

const lekhaJokhaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: {
      type: String,
      enum: ['aaiji_kosh', 'annapurna_bhavan', 'mandir_nirman', 'dharmik_karya', 'pratibha_samman'],
      required: true,
    },
    date: { type: Date, default: Date.now },
    personName: String,
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'bank_transfer', 'cheque', 'other'],
      default: 'cash',
    },
    receiptNumber: String,
    notes: String,
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

lekhaJokhaSchema.index({ type: 1, category: 1, date: -1 });
lekhaJokhaSchema.index({ title: 'text', personName: 'text', receiptNumber: 'text' });

export default mongoose.model('LekhaJokha', lekhaJokhaSchema);
