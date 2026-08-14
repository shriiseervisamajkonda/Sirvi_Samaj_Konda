import { asyncHandler } from '../middleware/validate.js';
import Organization from '../models/Organization.js';
import GramUnit from '../models/GramUnit.js';
import GramUnitMember from '../models/GramUnitMember.js';
import FormationEvent from '../models/FormationEvent.js';

let isKondaDataSeeded = false;

// Auto-seed / Ensure initial real data exists
export const ensureKondaGramUnitData = async () => {
  if (isKondaDataSeeded) return;

  let org = await Organization.findOne({ name: 'अखिल भारतीय सिर्वी महासभा मध्यप्रदेश' }).lean();
  if (!org) {
    org = await Organization.create({
      name: 'अखिल भारतीय सिर्वी महासभा मध्यप्रदेश',
      level: 'state',
      state: 'मध्यप्रदेश',
      country: 'भारत',
      description: 'अखिल भारतीय सिर्वी महासभा मध्यप्रदेश राज्य संगठन',
      isActive: true,
    });
  }

  let unit = await GramUnit.findOne({ unitName: 'कोणदा ग्राम इकाई' }).lean();
  if (!unit) {
    unit = await GramUnit.create({
      organization: org._id,
      organizationName: org.name,
      unitName: 'कोणदा ग्राम इकाई',
      unitType: 'ग्राम इकाई',
      village: 'कोणदा',
      tehsil: 'कुक्षी',
      district: 'धार',
      state: 'मध्यप्रदेश',
      country: 'भारत',
      formationContext: 'नवीन मनोनयन प्रक्रिया',
      supervisor: 'हिरालालजी हम्मड कापसी',
      selectionMethod: 'सर्वसम्मति से',
      participants: ['सिर्वी समाज सकल पंच', 'समाज के नवयुवक', 'समाज के वरिष्ठजन'],
      description:
        'अखिल भारतीय सिर्वी महासभा मध्यप्रदेश के नवीन मनोनयन की प्रक्रिया के तहत कुक्षी तहसील के ग्राम कोणदा में ग्राम इकाई का गठन नियुक्त पर्यवेक्षक हिरालालजी हम्मड कापसी एवं स्थानीय पंचों की उपस्थिति में किया गया। इस अवसर पर पदाधिकारियों एवं प्रतिनिधियों का सर्वसम्मति से चयन किया गया। कार्यक्रम में सिर्वी समाज सकल पंच सहित समाज के नवयुवक एवं वरिष्ठजन उपस्थित रहे।',
      isActive: true,
    });
  }

  // Check members
  const memberCount = await GramUnitMember.countDocuments({ gramUnit: unit._id });
  if (memberCount === 0) {
    const officeBearers = [
      { name: 'सुनिल/पन्नालाल जी भायल', designation: 'अध्यक्ष', category: 'office_bearer', order: 1 },
      { name: 'अजय/गोपाल जी शिनदडा', designation: 'महासचिव', category: 'office_bearer', order: 2 },
      { name: 'कन्हैयालाल/रत्न जी चोहान', designation: 'उपाध्यक्ष', category: 'office_bearer', order: 3 },
      { name: 'दिनेश/गोविंद जी लछेटा', designation: 'सचिव', category: 'office_bearer', order: 4 },
      { name: 'कैलाश/रत्नजी अगल्चा', designation: 'कोषाध्यक्ष', category: 'office_bearer', order: 5 },
    ];

    const generalMembers = [
      { name: 'जिवन /गोपाल जी सोलंकी', designation: 'सदस्य', category: 'member', order: 1 },
      { name: 'दिलीप/मोतीलाल जी चोयल', designation: 'सदस्य', category: 'member', order: 2 },
      { name: 'कमल/लक्ष्मण जी पड़ियार', designation: 'सदस्य', category: 'member', order: 3 },
      { name: 'सुनिल/शंकर जी गेहलोत', designation: 'सदस्य', category: 'member', order: 4 },
      { name: 'सुनील/मुन्नालाल पवार', designation: 'सदस्य', category: 'member', order: 5 },
      { name: 'रवि/पारस जी लछेटा', designation: 'सदस्य', category: 'member', order: 6 },
    ];

    const tehsilReps = [
      { name: 'शान्तिलाल/काशिराम जी पवार', designation: 'तहसील प्रतिनिधि', category: 'representative', representativeLevel: 'tehsil', order: 1 },
      { name: 'मुकेश/हिराजी पड़ियार', designation: 'तहसील प्रतिनिधि', category: 'representative', representativeLevel: 'tehsil', order: 2 },
      { name: 'अनिल/हामाजी भायल', designation: 'तहसील प्रतिनिधि', category: 'representative', representativeLevel: 'tehsil', order: 3 },
      { name: 'महेन्द्र/मोहनजी काग', designation: 'तहसील प्रतिनिधि', category: 'representative', representativeLevel: 'tehsil', order: 4 },
      { name: 'कैलाश/मंगताजी राठौर', designation: 'तहसील प्रतिनिधि', category: 'representative', representativeLevel: 'tehsil', order: 5 },
    ];

    const districtReps = [
      { name: 'जगदीश /देवाजी भायल', designation: 'जिला प्रतिनिधि', category: 'representative', representativeLevel: 'district', order: 1 },
      { name: 'दिलीप/हामाजी चोयल', designation: 'जिला प्रतिनिधि', category: 'representative', representativeLevel: 'district', order: 2 },
      { name: 'खेमाजी/दुदाजी गेहलोत', designation: 'जिला प्रतिनिधि', category: 'representative', representativeLevel: 'district', order: 3 },
    ];

    const stateReps = [
      { name: 'जितेन्द्र/देवाजी शिनदडा', designation: 'प्रदेश प्रतिनिधि', category: 'representative', representativeLevel: 'state', order: 1 },
    ];

    const allMembersToInsert = [
      ...officeBearers,
      ...generalMembers,
      ...tehsilReps,
      ...districtReps,
      ...stateReps,
    ].map((item) => ({
      ...item,
      gramUnit: unit._id,
      organization: org._id,
      organizationName: org.name,
      gramUnitName: unit.unitName,
      tehsil: unit.tehsil,
      district: unit.district,
      state: unit.state,
      isActive: true,
    }));

    await GramUnitMember.insertMany(allMembersToInsert);
  }

  let formationEvent = await FormationEvent.findOne({ gramUnit: unit._id });
  if (!formationEvent) {
    formationEvent = await FormationEvent.create({
      gramUnit: unit._id,
      organization: org._id,
      title: 'कोणदा ग्राम इकाई गठन',
      eventType: 'ग्राम इकाई गठन / नवीन मनोनयन',
      location: 'ग्राम कोणदा, तहसील कुक्षी, मध्यप्रदेश',
      supervisor: 'हिरालालजी हम्मड कापसी',
      selectionMethod: 'सर्वसम्मति से',
      participants: ['सिर्वी समाज सकल पंच', 'समाज के नवयुवक', 'समाज के वरिष्ठजन'],
      description:
        'अखिल भारतीय सिर्वी महासभा मध्यप्रदेश के नवीन मनोनयन की प्रक्रिया के तहत कुक्षी तहसील के ग्राम कोणदा में ग्राम इकाई का गठन नियुक्त पर्यवेक्षक हिरालालजी हम्मड कापसी एवं स्थानीय पंचों की उपस्थिति में किया गया। इस अवसर पर पदाधिकारियों एवं प्रतिनिधियों का सर्वसम्मति से चयन किया गया। कार्यक्रम में सिर्वी समाज सकल पंच सहित समाज के नवयुवक एवं वरिष्ठजन उपस्थित रहे।',
      isActive: true,
    });
  }

  isKondaDataSeeded = true;
  return { org, unit };
};

import Committee from '../models/Committee.js';
import { sanitizeDocument } from './baseController.js';

// Public aggregated details endpoint
export const getPublicGramUnitDetails = asyncHandler(async (req, res) => {
  await ensureKondaGramUnitData();

  const unit = await GramUnit.findOne({ unitName: 'कोणदा ग्राम इकाई' }).select('-__v -internalNotes -adminNotes').lean();
  if (!unit) {
    return res.status(404).json({ success: false, message: 'Gram Unit not found' });
  }

  const [org, rawMembers, formationEvent, rawSakalPanch] = await Promise.all([
    Organization.findById(unit.organization).select('-__v -internalNotes -adminNotes').lean(),
    GramUnitMember.find({ gramUnit: unit._id, isActive: true }).select('-__v -internalNotes -adminNotes').sort({ order: 1, createdAt: 1 }).lean(),
    FormationEvent.findOne({ gramUnit: unit._id }).select('-__v -internalNotes -adminNotes').lean(),
    Committee.find({ type: 'sankal_panch', isActive: true }).select('-__v -internalNotes -adminNotes').sort({ order: 1, createdAt: 1 }).lean(),
  ]);

  const members = (rawMembers || []).map(sanitizeDocument);
  const sakalPanch = (rawSakalPanch || []).map(sanitizeDocument);

  const officeBearers = members.filter((m) => m.category === 'office_bearer');
  const generalMembers = members.filter((m) => m.category === 'member');
  const tehsilRepresentatives = members.filter((m) => m.category === 'representative' && m.representativeLevel === 'tehsil');
  const districtRepresentatives = members.filter((m) => m.category === 'representative' && m.representativeLevel === 'district');
  const stateRepresentatives = members.filter((m) => m.category === 'representative' && m.representativeLevel === 'state');

  res.json({
    success: true,
    data: {
      organization: sanitizeDocument(org),
      sakalPanch,
      unit: sanitizeDocument(unit),
      officeBearers,
      members: generalMembers,
      representatives: {
        tehsil: tehsilRepresentatives,
        district: districtRepresentatives,
        state: stateRepresentatives,
      },
      allRepresentatives: members.filter((m) => m.category === 'representative'),
      formationEvent: sanitizeDocument(formationEvent),
    },
  });
});
