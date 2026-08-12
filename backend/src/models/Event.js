import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    eventType: { type: String, enum: ['upcoming', 'past'], default: 'upcoming' },
    startDate: { type: Date, required: true },
    endDate: Date,
    location: String,
    image: String,
    gallery: [String],
    videos: [{ title: String, url: String }],
    registrationRequired: { type: Boolean, default: false },
    maxAttendees: Number,
    registrations: [{
      member: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember' },
      name: String,
      phone: String,
      registeredAt: { type: Date, default: Date.now },
    }],
    attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember' }],
    certificates: [{ name: String, url: String }],
    status: { type: String, enum: ['draft', 'published', 'cancelled', 'completed'], default: 'draft' },
    villageRef: { type: mongoose.Schema.Types.ObjectId, ref: 'VillageInformation' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Event', eventSchema);
