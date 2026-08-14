import mongoose from 'mongoose';

const gramUnitSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    organizationName: { type: String, default: 'अखिल भारतीय सिर्वी महासभा मध्यप्रदेश' },
    unitName: { type: String, required: true, default: 'कोणदा ग्राम इकाई' },
    unitType: { type: String, default: 'ग्राम इकाई' },
    village: { type: String, required: true, default: 'कोणदा' },
    tehsil: { type: String, required: true, default: 'कुक्षी' },
    district: { type: String, required: true, default: 'धार' },
    state: { type: String, required: true, default: 'मध्यप्रदेश' },
    country: { type: String, required: true, default: 'भारत' },
    formationContext: { type: String, default: 'नवीन मनोनयन प्रक्रिया' },
    supervisor: { type: String, default: 'हिरालालजी हम्मड कापसी' },
    selectionMethod: { type: String, default: 'सर्वसम्मति से' },
    participants: {
      type: [String],
      default: ['सिर्वी समाज सकल पंच', 'समाज के नवयुवक', 'समाज के वरिष्ठजन'],
    },
    description: {
      type: String,
      default:
        'अखिल भारतीय सिर्वी महासभा मध्यप्रदेश के नवीन मनोनयन की प्रक्रिया के तहत कुक्षी तहसील के ग्राम कोणदा में ग्राम इकाई का गठन नियुक्त पर्यवेक्षक हिरालालजी हम्मड कापसी एवं स्थानीय पंचों की उपस्थिति में किया गया। इस अवसर पर पदाधिकारियों एवं प्रतिनिधियों का सर्वसम्मति से चयन किया गया। कार्यक्रम में सिर्वी समाज सकल पंच सहित समाज के नवयुवक एवं वरिष्ठजन उपस्थित रहे।',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('GramUnit', gramUnitSchema);
