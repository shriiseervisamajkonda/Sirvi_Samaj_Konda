import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'Shri Seervi Samaj Konda' },
    siteTagline: String,
    logo: String,
    favicon: String,
    primaryColor: { type: String, default: '#FF6B00' },
    secondaryColor: { type: String, default: '#0D6EFD' },
    accentColor: { type: String, default: '#198754' },
    contactEmail: String,
    contactPhone: String,
    address: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      youtube: String,
      twitter: String,
    },
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
    features: {
      enableDonations: { type: Boolean, default: true },
      enableMarriageBiodata: { type: Boolean, default: true },
      enableBloodDonors: { type: Boolean, default: true },
      enableEvents: { type: Boolean, default: true },
    },
    maintenanceMode: { type: Boolean, default: false },
    villageRef: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageInformation' },
  },
  { timestamps: true }
);

export default mongoose.model('Settings', settingsSchema);
