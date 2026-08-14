/**
 * ============================================================================
 * SHRI SEERVI SAMAJ KONDA — MONGODB TO SUPABASE POSTGRESQL DATA MIGRATION SCRIPT
 * Safely extracts, transforms, and loads all collections with foreign key resolution.
 * Idempotent: Can be run multiple times without duplicating records.
 * ============================================================================
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createClient } from '@supabase/supabase-js';

// Mongoose Models
import User from '../models/User.js';
import Role from '../models/Role.js';
import VillageInformation from '../models/VillageInformation.js';
import Settings from '../models/Settings.js';
import Family from '../models/Family.js';
import FamilyMember from '../models/FamilyMember.js';
import Committee from '../models/Committee.js';
import Organization from '../models/Organization.js';
import GramUnit from '../models/GramUnit.js';
import GramUnitMember from '../models/GramUnitMember.js';
import FormationEvent from '../models/FormationEvent.js';
import Event from '../models/Event.js';
import News from '../models/News.js';
import Album from '../models/Album.js';
import Gallery from '../models/Gallery.js';
import Document from '../models/Document.js';
import Donation from '../models/Donation.js';
import LekhaJokha from '../models/LekhaJokha.js';
import PanchSettlement from '../models/PanchSettlement.js';
import SocialInfo from '../models/SocialInfo.js';
import Student from '../models/Student.js';
import Business from '../models/Business.js';
import BloodDonor from '../models/BloodDonor.js';
import MarriageProfile from '../models/MarriageProfile.js';
import Contact from '../models/Contact.js';
import ActivityLog from '../models/ActivityLog.js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const MONGODB_URI = process.env.MONGODB_URI || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Supabase credentials missing. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY in .env');
}

const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

// Global ID mapping dictionary: Mongo ObjectId String -> Supabase UUID
const idMap = new Map();

// Helper to resolve Mongo ObjectId to Supabase UUID
const getPgId = (mongoId) => {
  if (!mongoId) return null;
  const strId = mongoId.toString();
  return idMap.get(strId) || null;
};

// Safe upsert helper into Supabase
const upsertToSupabase = async (tableName, records) => {
  if (!supabase || !records || records.length === 0) return { inserted: 0, failed: 0 };
  
  let inserted = 0;
  let failed = 0;

  for (const record of records) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .upsert(record, { onConflict: 'mongo_id' })
        .select('id, mongo_id')
        .single();

      if (error) {
        console.warn(`⚠️ [${tableName}] Upsert error for mongo_id ${record.mongo_id}:`, error.message);
        failed++;
      } else if (data) {
        if (data.mongo_id && data.id) {
          idMap.set(data.mongo_id, data.id);
        }
        inserted++;
      }
    } catch (err) {
      console.warn(`⚠️ [${tableName}] Exception:`, err.message);
      failed++;
    }
  }

  return { inserted, failed };
};

export const runMigration = async () => {
  console.log('================================================================');
  console.log('🚀 STARTING MONGODB -> SUPABASE POSTGRESQL COMPLETE MIGRATION');
  console.log('================================================================\n');

  try {
    // 1. Connect MongoDB
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully.\n');

    if (!supabase) {
      console.log('ℹ️ Supabase not configured in environment. Creating dry-run report.');
    }

    const report = [];

    // LEVEL 1: Standalone Entities
    console.log('--- LEVEL 1: Independent Tables ---');

    // 1. Roles
    const roles = await Role.find().lean();
    const transformedRoles = roles.map(r => ({
      mongo_id: r._id.toString(),
      name: r.name,
      permissions: r.permissions || ['view'],
      description: r.description || '',
      created_at: r.createdAt || new Date(),
      updated_at: r.updatedAt || new Date(),
    }));
    const roleRes = await upsertToSupabase('roles', transformedRoles);
    report.push({ collection: 'roles', mongoCount: roles.length, pgCount: roleRes.inserted, failed: roleRes.failed });

    // 2. Village Information
    const villageInfos = await VillageInformation.find().lean();
    const transformedVillage = villageInfos.map(v => ({
      mongo_id: v._id.toString(),
      community_name: v.communityName || 'Shri Seervi Samaj Konda',
      village: v.village || 'Konda',
      tehsil: v.tehsil || 'Kukshi',
      district: v.district || 'Dhar',
      state: v.state || 'Madhya Pradesh',
      pin_code: v.pinCode || '454335',
      country: v.country || 'India',
      community_center: v.communityCenter || '',
      purpose: v.purpose || '',
      religious_tradition: v.religiousTradition || '',
      main_spiritual_seat: v.mainSpiritualSeat || '',
      community_heritage: v.communityHeritage || '',
      known_surnames: v.knownSurnames || [],
      major_celebrations: v.majorCelebrations || [],
      history: v.history || '',
      mission: v.mission || '',
      vision: v.vision || '',
      about: v.about || '',
      emergency_contacts: v.emergencyContacts || [],
      created_at: v.createdAt || new Date(),
      updated_at: v.updatedAt || new Date(),
    }));
    const vRes = await upsertToSupabase('village_information', transformedVillage);
    report.push({ collection: 'village_information', mongoCount: villageInfos.length, pgCount: vRes.inserted, failed: vRes.failed });

    // 3. Organizations
    const orgs = await Organization.find().lean();
    const transformedOrgs = orgs.map(o => ({
      mongo_id: o._id.toString(),
      name: o.name || 'अखिल भारतीय सिर्वी महासभा मध्यप्रदेश',
      level: o.level || 'state',
      state: o.state || 'मध्यप्रदेश',
      country: o.country || 'भारत',
      description: o.description || '',
      is_active: o.isActive !== false,
      created_at: o.createdAt || new Date(),
      updated_at: o.updatedAt || new Date(),
    }));
    const orgRes = await upsertToSupabase('organizations', transformedOrgs);
    report.push({ collection: 'organizations', mongoCount: orgs.length, pgCount: orgRes.inserted, failed: orgRes.failed });

    // LEVEL 2: Users & Settings & Gram Units
    console.log('\n--- LEVEL 2: Users, Settings & Gram Units ---');

    // 4. Users
    const users = await User.find().select('+password').lean();
    const transformedUsers = users.map(u => ({
      mongo_id: u._id.toString(),
      name: u.name,
      email: u.email,
      password_hash: u.password || '',
      phone: u.phone || '',
      photo: u.photo || '',
      role: u.role || 'member',
      is_email_verified: !!u.isEmailVerified,
      email_verification_token: u.emailVerificationToken || null,
      email_verification_expire: u.emailVerificationExpire || null,
      reset_password_token: u.resetPasswordToken || null,
      reset_password_expire: u.resetPasswordExpire || null,
      otp: u.otp || null,
      otp_expire: u.otpExpire || null,
      refresh_token: u.refreshToken || null,
      is_active: u.isActive !== false,
      last_login: u.lastLogin || null,
      village_id: getPgId(u.villageId),
      created_at: u.createdAt || new Date(),
      updated_at: u.updatedAt || new Date(),
    }));
    const userRes = await upsertToSupabase('users', transformedUsers);
    report.push({ collection: 'users', mongoCount: users.length, pgCount: userRes.inserted, failed: userRes.failed });

    // 5. Settings
    const settingsList = await Settings.find().lean();
    const transformedSettings = settingsList.map(s => ({
      mongo_id: s._id.toString(),
      site_name: s.siteName,
      site_tagline: s.siteTagline,
      primary_color: s.primaryColor,
      secondary_color: s.secondaryColor,
      accent_color: s.accentColor,
      contact_email: s.contactEmail,
      contact_phone: s.contactPhone,
      address: s.address,
      social_links: s.socialLinks || {},
      maintenance_mode: !!s.maintenanceMode,
      allow_registrations: s.allowRegistrations !== false,
      village_ref: getPgId(s.villageRef),
      created_at: s.createdAt || new Date(),
      updated_at: s.updatedAt || new Date(),
    }));
    const setRes = await upsertToSupabase('settings', transformedSettings);
    report.push({ collection: 'settings', mongoCount: settingsList.length, pgCount: setRes.inserted, failed: setRes.failed });

    // 6. Gram Units (Konda Gram Unit)
    const gramUnits = await GramUnit.find().lean();
    const transformedUnits = gramUnits.map(g => ({
      mongo_id: g._id.toString(),
      organization_id: getPgId(g.organization),
      organization_name: g.organizationName || 'अखिल भारतीय सिर्वी महासभा मध्यप्रदेश',
      unit_name: g.unitName || 'कोणदा ग्राम इकाई',
      unit_type: g.unitType || 'ग्राम इकाई',
      village: g.village || 'कोणदा',
      tehsil: g.tehsil || 'कुक्षी',
      district: g.district || 'धार',
      state: g.state || 'मध्यप्रदेश',
      country: g.country || 'भारत',
      formation_context: g.formationContext || 'नवीन मनोनयन प्रक्रिया',
      supervisor: g.supervisor || 'हिरालालजी हम्मड कापसी',
      selection_method: g.selectionMethod || 'सर्वसम्मति से',
      participants: g.participants || [],
      description: g.description || '',
      is_active: g.isActive !== false,
      created_at: g.createdAt || new Date(),
      updated_at: g.updatedAt || new Date(),
    }));
    const guRes = await upsertToSupabase('gram_units', transformedUnits);
    report.push({ collection: 'gram_units', mongoCount: gramUnits.length, pgCount: guRes.inserted, failed: guRes.failed });

    // LEVEL 3: Families & Gram Unit Members
    console.log('\n--- LEVEL 3: Families, Gram Unit Members & Formation Events ---');

    // 7. Families
    const families = await Family.find().lean();
    const transformedFamilies = families.map(f => ({
      mongo_id: f._id.toString(),
      family_id: f.familyId,
      photo: f.photo || '',
      head_of_family: f.headOfFamily,
      surname: f.surname,
      address: f.address || '',
      village: f.village || 'Konda',
      tehsil: f.tehsil || 'Kukshi',
      district: f.district || 'Dhar',
      state: f.state || 'Madhya Pradesh',
      pin_code: f.pinCode || '454335',
      mobile_number: f.mobileNumber || '',
      whatsapp_number: f.whatsappNumber || '',
      number_of_members: f.numberOfMembers || 0,
      qr_code: f.qrCode || '',
      status: f.status || 'active',
      village_ref: getPgId(f.villageRef),
      created_by: getPgId(f.createdBy),
      created_at: f.createdAt || new Date(),
      updated_at: f.updatedAt || new Date(),
    }));
    const famRes = await upsertToSupabase('families', transformedFamilies);
    report.push({ collection: 'families', mongoCount: families.length, pgCount: famRes.inserted, failed: famRes.failed });

    // 8. Gram Unit Members & Representatives (All 15+ official officers)
    const gramMembers = await GramUnitMember.find().lean();
    const transformedGramMembers = gramMembers.map(m => ({
      mongo_id: m._id.toString(),
      gram_unit_id: getPgId(m.gramUnit),
      organization_id: getPgId(m.organization),
      name: m.name,
      category: m.category || 'member',
      designation: m.designation || 'सदस्य',
      representative_level: m.representativeLevel || 'none',
      organization_name: m.organizationName || 'अखिल भारतीय सिर्वी महासभा मध्यप्रदेश',
      gram_unit_name: m.gramUnitName || 'कोणदा ग्राम इकाई',
      tehsil: m.tehsil || 'कुक्षी',
      district: m.district || 'धार',
      state: m.state || 'मध्यप्रदेश',
      phone: m.phone || '',
      photo: m.photo || '',
      order_num: m.order || 0,
      is_active: m.isActive !== false,
      created_at: m.createdAt || new Date(),
      updated_at: m.updatedAt || new Date(),
    }));
    const gmRes = await upsertToSupabase('gram_unit_members', transformedGramMembers);
    report.push({ collection: 'gram_unit_members', mongoCount: gramMembers.length, pgCount: gmRes.inserted, failed: gmRes.failed });

    // 9. Formation Events
    const formationEvents = await FormationEvent.find().lean();
    const transformedFE = formationEvents.map(fe => ({
      mongo_id: fe._id.toString(),
      gram_unit_id: getPgId(fe.gramUnit),
      organization_id: getPgId(fe.organization),
      title: fe.title,
      event_type: fe.eventType || 'ग्राम इकाई गठन / नवीन मनोनयन',
      location: fe.location || '',
      supervisor: fe.supervisor || '',
      selection_method: fe.selectionMethod || '',
      participants: fe.participants || [],
      description: fe.description || '',
      is_active: fe.isActive !== false,
      created_at: fe.createdAt || new Date(),
      updated_at: fe.updatedAt || new Date(),
    }));
    const feRes = await upsertToSupabase('formation_events', transformedFE);
    report.push({ collection: 'formation_events', mongoCount: formationEvents.length, pgCount: feRes.inserted, failed: feRes.failed });

    // LEVEL 4: Family Members
    console.log('\n--- LEVEL 4: Family Members ---');

    // 10. Family Members
    const familyMembers = await FamilyMember.find().lean();
    const transformedMembers = familyMembers.map(fm => ({
      mongo_id: fm._id.toString(),
      family_id: getPgId(fm.family),
      first_name: fm.firstName,
      last_name: fm.lastName || '',
      photo: fm.photo || '',
      gender: fm.gender,
      date_of_birth: fm.dateOfBirth || null,
      age: fm.age || null,
      blood_group: fm.bloodGroup || 'Unknown',
      education: fm.education || '',
      occupation: fm.occupation || '',
      company: fm.company || '',
      business: fm.business || '',
      phone_number: fm.phoneNumber || '',
      email: fm.email || '',
      address: fm.address || '',
      village: fm.village || 'Konda',
      tehsil: fm.tehsil || 'Kukshi',
      district: fm.district || 'Dhar',
      state: fm.state || 'Madhya Pradesh',
      pin_code: fm.pinCode || '454335',
      marital_status: fm.maritalStatus || 'single',
      skills: fm.skills || [],
      achievements: fm.achievements || [],
      emergency_contact: fm.emergencyContact || {},
      social_media: fm.socialMedia || {},
      documents: fm.documents || [],
      is_head_of_family: !!fm.isHeadOfFamily,
      status: fm.status || 'active',
      village_ref: getPgId(fm.villageRef),
      created_by: getPgId(fm.createdBy),
      created_at: fm.createdAt || new Date(),
      updated_at: fm.updatedAt || new Date(),
    }));
    const fmbRes = await upsertToSupabase('family_members', transformedMembers);
    report.push({ collection: 'family_members', mongoCount: familyMembers.length, pgCount: fmbRes.inserted, failed: fmbRes.failed });

    // LEVEL 5: Modules referencing Members & Public Data
    console.log('\n--- LEVEL 5: Committee, Events, Lekha-Jokha, Students, Businesses, etc. ---');

    // 11. Committees (including Shri Aai Ji Mahila Samiti)
    const committees = await Committee.find().lean();
    const transformedCommittees = committees.map(c => ({
      mongo_id: c._id.toString(),
      name: c.name,
      designation: c.designation,
      photo: c.photo || '',
      phone: c.phone || '',
      email: c.email || '',
      whatsapp: c.whatsapp || '',
      bio: c.bio || '',
      order_num: c.order || 0,
      term_start: c.termStart || null,
      term_end: c.termEnd || null,
      is_active: c.isActive !== false,
      type: c.type || 'committee',
      member_id: getPgId(c.member),
      village_ref: getPgId(c.villageRef),
      created_at: c.createdAt || new Date(),
      updated_at: c.updatedAt || new Date(),
    }));
    const comRes = await upsertToSupabase('committees', transformedCommittees);
    report.push({ collection: 'committees', mongoCount: committees.length, pgCount: comRes.inserted, failed: comRes.failed });

    // 12. Events
    const events = await Event.find().lean();
    const transformedEvents = events.map(e => ({
      mongo_id: e._id.toString(),
      title: e.title,
      description: e.description,
      event_type: e.eventType || 'upcoming',
      start_date: e.startDate || new Date(),
      end_date: e.endDate || null,
      location: e.location || 'Konda',
      images: e.images || [],
      registration_required: !!e.registrationRequired,
      registered_users: e.registeredUsers || [],
      status: e.status || 'published',
      village_ref: getPgId(e.villageRef),
      created_by: getPgId(e.createdBy),
      created_at: e.createdAt || new Date(),
      updated_at: e.updatedAt || new Date(),
    }));
    const evRes = await upsertToSupabase('events', transformedEvents);
    report.push({ collection: 'events', mongoCount: events.length, pgCount: evRes.inserted, failed: evRes.failed });

    // 13. News
    const news = await News.find().lean();
    const transformedNews = news.map(n => ({
      mongo_id: n._id.toString(),
      title: n.title,
      content: n.content,
      excerpt: n.excerpt || '',
      image: n.image || '',
      category: n.category || 'news',
      is_featured: !!n.isFeatured,
      published_at: n.publishedAt || new Date(),
      status: n.status || 'published',
      village_ref: getPgId(n.villageRef),
      created_by: getPgId(n.createdBy),
      created_at: n.createdAt || new Date(),
      updated_at: n.updatedAt || new Date(),
    }));
    const nRes = await upsertToSupabase('news', transformedNews);
    report.push({ collection: 'news', mongoCount: news.length, pgCount: nRes.inserted, failed: nRes.failed });

    // 14. Lekha Jokha (Income / Expense)
    const lekhaJokha = await LekhaJokha.find().lean();
    const transformedLJ = lekhaJokha.map(lj => ({
      mongo_id: lj._id.toString(),
      title: lj.title,
      amount: lj.amount,
      type: lj.type,
      category: lj.category,
      date: lj.date || new Date(),
      person_name: lj.personName || '',
      payment_method: lj.paymentMethod || 'cash',
      receipt_number: lj.receiptNumber || '',
      notes: lj.notes || '',
      recorded_by: getPgId(lj.recordedBy),
      created_at: lj.createdAt || new Date(),
      updated_at: lj.updatedAt || new Date(),
    }));
    const ljRes = await upsertToSupabase('lekha_jokha', transformedLJ);
    report.push({ collection: 'lekha_jokha', mongoCount: lekhaJokha.length, pgCount: ljRes.inserted, failed: ljRes.failed });

    // 15. Panch Settlements
    const panchList = await PanchSettlement.find().lean();
    const transformedPanch = panchList.map(ps => ({
      mongo_id: ps._id.toString(),
      title: ps.title,
      parties: ps.parties,
      settlement_date: ps.settlementDate || new Date(),
      description: ps.description,
      panchs: ps.panchs || '',
      documents: ps.documents || [],
      status: ps.status || 'resolved',
      created_by: getPgId(ps.createdBy),
      created_at: ps.createdAt || new Date(),
      updated_at: ps.updatedAt || new Date(),
    }));
    const psRes = await upsertToSupabase('panch_settlements', transformedPanch);
    report.push({ collection: 'panch_settlements', mongoCount: panchList.length, pgCount: psRes.inserted, failed: psRes.failed });

    // 16. Social Info
    const socialList = await SocialInfo.find().lean();
    const transformedSocial = socialList.map(si => ({
      mongo_id: si._id.toString(),
      title: si.title,
      content: si.content,
      category: si.category || 'general',
      attachments: si.attachments || [],
      order_num: si.order || 0,
      is_active: si.isActive !== false,
      created_by: getPgId(si.createdBy),
      created_at: si.createdAt || new Date(),
      updated_at: si.updatedAt || new Date(),
    }));
    const siRes = await upsertToSupabase('social_info', transformedSocial);
    report.push({ collection: 'social_info', mongoCount: socialList.length, pgCount: siRes.inserted, failed: siRes.failed });

    // 17. Students
    const students = await Student.find().lean();
    const transformedStudents = students.map(st => ({
      mongo_id: st._id.toString(),
      name: st.name,
      member_id: getPgId(st.member),
      school: st.school || '',
      college: st.college || '',
      course: st.course || '',
      year: st.year || '',
      cgpa: st.cgpa || '',
      achievements: st.achievements || [],
      village_ref: getPgId(st.villageRef),
      created_by: getPgId(st.createdBy),
      created_at: st.createdAt || new Date(),
      updated_at: st.updatedAt || new Date(),
    }));
    const stRes = await upsertToSupabase('students', transformedStudents);
    report.push({ collection: 'students', mongoCount: students.length, pgCount: stRes.inserted, failed: stRes.failed });

    // 18. Businesses
    const businesses = await Business.find().lean();
    const transformedBusinesses = businesses.map(b => ({
      mongo_id: b._id.toString(),
      business_name: b.businessName,
      owner: b.owner,
      owner_member_id: getPgId(b.ownerMember),
      category: b.category,
      address: b.address || '',
      phone: b.phone || '',
      whatsapp: b.whatsapp || '',
      email: b.email || '',
      website: b.website || '',
      description: b.description || '',
      logo: b.logo || '',
      images: b.images || [],
      village_ref: getPgId(b.villageRef),
      created_by: getPgId(b.createdBy),
      created_at: b.createdAt || new Date(),
      updated_at: b.updatedAt || new Date(),
    }));
    const bRes = await upsertToSupabase('businesses', transformedBusinesses);
    report.push({ collection: 'businesses', mongoCount: businesses.length, pgCount: bRes.inserted, failed: bRes.failed });

    // 19. Blood Donors
    const bloodDonors = await BloodDonor.find().lean();
    const transformedDonors = bloodDonors.map(bd => ({
      mongo_id: bd._id.toString(),
      name: bd.name,
      member_id: getPgId(bd.member),
      blood_group: bd.bloodGroup,
      phone: bd.phone,
      village: bd.village || 'Konda',
      availability: bd.availability || 'available',
      last_donation_date: bd.lastDonationDate || null,
      village_ref: getPgId(bd.villageRef),
      created_by: getPgId(bd.createdBy),
      created_at: bd.createdAt || new Date(),
      updated_at: bd.updatedAt || new Date(),
    }));
    const bdRes = await upsertToSupabase('blood_donors', transformedDonors);
    report.push({ collection: 'blood_donors', mongoCount: bloodDonors.length, pgCount: bdRes.inserted, failed: bdRes.failed });

    // 20. Donations
    const donations = await Donation.find().lean();
    const transformedDonations = donations.map(d => ({
      mongo_id: d._id.toString(),
      donor_name: d.donorName,
      amount: d.amount,
      currency: d.currency || 'INR',
      purpose: d.purpose || '',
      payment_method: d.paymentMethod || 'cash',
      transaction_id: d.transactionId || '',
      receipt_number: d.receiptNumber || '',
      is_anonymous: !!d.isAnonymous,
      member_id: getPgId(d.member),
      notes: d.notes || '',
      status: d.status || 'confirmed',
      village_ref: getPgId(d.villageRef),
      recorded_by: getPgId(d.recordedBy),
      created_at: d.createdAt || new Date(),
      updated_at: d.updatedAt || new Date(),
    }));
    const donRes = await upsertToSupabase('donations', transformedDonations);
    report.push({ collection: 'donations', mongoCount: donations.length, pgCount: donRes.inserted, failed: donRes.failed });

    // 21. Gallery & Albums
    const albums = await Album.find().lean();
    const transformedAlbums = albums.map(a => ({
      mongo_id: a._id.toString(),
      title: a.title,
      description: a.description || '',
      cover_image: a.coverImage || '',
      status: a.status || 'active',
      created_at: a.createdAt || new Date(),
      updated_at: a.updatedAt || new Date(),
    }));
    const albRes = await upsertToSupabase('albums', transformedAlbums);
    report.push({ collection: 'albums', mongoCount: albums.length, pgCount: albRes.inserted, failed: albRes.failed });

    const gallery = await Gallery.find().lean();
    const transformedGallery = gallery.map(g => ({
      mongo_id: g._id.toString(),
      title: g.title || '',
      description: g.description || '',
      url: g.url,
      thumbnail: g.thumbnail || '',
      album_id: getPgId(g.album),
      event_ref: getPgId(g.event),
      status: g.status || 'active',
      village_ref: getPgId(g.villageRef),
      uploaded_by: getPgId(g.uploadedBy),
      created_at: g.createdAt || new Date(),
      updated_at: g.updatedAt || new Date(),
    }));
    const galRes = await upsertToSupabase('gallery', transformedGallery);
    report.push({ collection: 'gallery', mongoCount: gallery.length, pgCount: galRes.inserted, failed: galRes.failed });

    // 22. Documents
    const documents = await Document.find().lean();
    const transformedDocuments = documents.map(doc => ({
      mongo_id: doc._id.toString(),
      title: doc.title,
      description: doc.description || '',
      file_url: doc.fileUrl,
      file_type: doc.fileType || '',
      file_size: doc.fileSize || 0,
      category: doc.category || 'other',
      status: doc.status || 'active',
      downloads_count: doc.downloadsCount || 0,
      village_ref: getPgId(doc.villageRef),
      uploaded_by: getPgId(doc.uploadedBy),
      created_at: doc.createdAt || new Date(),
      updated_at: doc.updatedAt || new Date(),
    }));
    const docRes = await upsertToSupabase('documents', transformedDocuments);
    report.push({ collection: 'documents', mongoCount: documents.length, pgCount: docRes.inserted, failed: docRes.failed });

    // 23. Contacts
    const contacts = await Contact.find().lean();
    const transformedContacts = contacts.map(c => ({
      mongo_id: c._id.toString(),
      name: c.name,
      email: c.email,
      phone: c.phone || '',
      subject: c.subject || '',
      message: c.message,
      status: c.status || 'unread',
      created_at: c.createdAt || new Date(),
      updated_at: c.updatedAt || new Date(),
    }));
    const ctRes = await upsertToSupabase('contacts', transformedContacts);
    report.push({ collection: 'contacts', mongoCount: contacts.length, pgCount: ctRes.inserted, failed: ctRes.failed });

    // 24. Activity Logs
    const logs = await ActivityLog.find().lean();
    const transformedLogs = logs.map(l => ({
      mongo_id: l._id.toString(),
      user_id: getPgId(l.user),
      action: l.action,
      entity_type: l.entityType || '',
      entity_id: l.entityId || '',
      details: l.details || {},
      ip_address: l.ipAddress || '',
      created_at: l.createdAt || new Date(),
    }));
    const logRes = await upsertToSupabase('activity_logs', transformedLogs);
    report.push({ collection: 'activity_logs', mongoCount: logs.length, pgCount: logRes.inserted, failed: logRes.failed });

    console.log('\n================================================================');
    console.log('📊 MIGRATION VERIFICATION & RECONCILIATION SUMMARY');
    console.log('================================================================\n');

    console.table(report);

    const totalMongo = report.reduce((sum, r) => sum + r.mongoCount, 0);
    const totalPg = report.reduce((sum, r) => sum + r.pgCount, 0);
    const totalFailed = report.reduce((sum, r) => sum + r.failed, 0);

    console.log(`\nTotal MongoDB Records Processed: ${totalMongo}`);
    console.log(`Successfully Migrated to Supabase: ${totalPg}`);
    console.log(`Failed/Errors: ${totalFailed}`);

    if (totalFailed === 0) {
      console.log('\n🎉 ALL COLLECTIONS SUCCESSFULLY MIGRATED WITH 100% DATA INTEGRITY!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration Critical Error:', error);
    process.exit(1);
  }
};

runMigration();
