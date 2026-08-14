import mongoose from 'mongoose';

const gramUnitMemberSchema = new mongoose.Schema(
  {
    gramUnit: { type: mongoose.Schema.Types.ObjectId, ref: 'GramUnit', required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['office_bearer', 'member', 'representative'],
      required: true,
      default: 'member',
    },
    designation: {
      type: String,
      required: true,
      default: 'सदस्य',
    },
    representativeLevel: {
      type: String,
      enum: ['gram', 'tehsil', 'district', 'state', 'none'],
      default: 'none',
    },
    organizationName: { type: String, default: 'अखिल भारतीय सिर्वी महासभा मध्यप्रदेश' },
    gramUnitName: { type: String, default: 'कोणदा ग्राम इकाई' },
    tehsil: { type: String, default: 'कुक्षी' },
    district: { type: String, default: 'धार' },
    state: { type: String, default: 'मध्यप्रदेश' },
    phone: { type: String, default: '' },
    photo: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

gramUnitMemberSchema.index({ gramUnit: 1, category: 1, representativeLevel: 1 });

export default mongoose.model('GramUnitMember', gramUnitMemberSchema);
