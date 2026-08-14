import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, default: 'अखिल भारतीय सिर्वी महासभा मध्यप्रदेश' },
    level: { type: String, default: 'state' },
    state: { type: String, default: 'मध्यप्रदेश' },
    country: { type: String, default: 'भारत' },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Organization', organizationSchema);
