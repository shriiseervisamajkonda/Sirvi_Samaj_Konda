import mongoose from 'mongoose';

const villageInformationSchema = new mongoose.Schema(
  {
    communityName: { type: String, default: 'Shri Seervi Samaj Konda' },
    village: { type: String, required: true, unique: true },
    tehsil: String,
    district: String,
    state: String,
    pinCode: String,
    country: { type: String, default: 'India' },
    communityCenter: String,
    purpose: String,
    religiousTradition: String,
    mainSpiritualSeat: String,
    communityHeritage: String,
    knownSurnames: [String],
    majorCelebrations: [String],
    history: String,
    mission: String,
    vision: String,
    about: String,
    emergencyContacts: [{
      name: String,
      designation: String,
      phone: String,
    }],
    socialMedia: {
      facebook: String,
      instagram: String,
      youtube: String,
      whatsapp: String,
    },
    googleMapsEmbed: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('VillageInformation', villageInformationSchema);
