import mongoose from 'mongoose';

const panchSettlementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    parties: { type: String, required: true },
    settlementDate: { type: Date, default: Date.now },
    description: { type: String, required: true },
    panchs: String,
    documents: [{ name: String, url: String }],
    status: { type: String, enum: ['resolved', 'pending', 'ongoing'], default: 'resolved' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('PanchSettlement', panchSettlementSchema);
