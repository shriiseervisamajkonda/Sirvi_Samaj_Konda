import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Role from '../models/Role.js';
import VillageInformation from '../models/VillageInformation.js';
import Settings from '../models/Settings.js';
import Family from '../models/Family.js';
import FamilyMember from '../models/FamilyMember.js';
import Committee from '../models/Committee.js';
import News from '../models/News.js';
import Event from '../models/Event.js';
import Student from '../models/Student.js';
import Business from '../models/Business.js';
import BloodDonor from '../models/BloodDonor.js';
import { generateFamilyId, generateFamilyQR } from '../utils/qrCode.js';

dotenv.config();

const seed = async () => {
  try {
    await connectDB();
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany(), Role.deleteMany(), VillageInformation.deleteMany(),
      Settings.deleteMany(), Family.deleteMany(), FamilyMember.deleteMany(),
      Committee.deleteMany(), News.deleteMany(), Event.deleteMany(),
      Student.deleteMany(), Business.deleteMany(), BloodDonor.deleteMany(),
    ]);

    const roles = [
      { name: 'super_admin', permissions: ['all'], description: 'Full system access' },
      { name: 'admin', permissions: ['manage_users', 'manage_content'], description: 'Administrative access' },
      { name: 'editor', permissions: ['manage_content'], description: 'Content management' },
      { name: 'member', permissions: ['view', 'submit'], description: 'Community member' },
      { name: 'visitor', permissions: ['view'], description: 'Public visitor' },
    ];
    await Role.insertMany(roles);
    console.log('Roles seeded');

    const village = await VillageInformation.create({
      communityName: 'Shri Seervi Samaj Konda',
      village: 'Konda',
      tehsil: 'Kukshi',
      district: 'Dhar',
      state: 'Madhya Pradesh',
      pinCode: '454335',
      country: 'India',
      communityCenter: 'Sirvi Samaj Dharmshala, Konda',
      purpose: 'Community meetings, weddings, social gatherings, religious programs, and cultural events.',
      religiousTradition: 'Followers of Shri Aai Mataji and the Aai Panth.',
      mainSpiritualSeat: 'Bilara, Jodhpur, Rajasthan.',
      communityHeritage: 'Historically associated with Rajasthan and Gujarat.',
      knownSurnames: ['Barfa', 'Kag'],
      majorCelebrations: [
        'Shri Aai Mata Pragatya Diwas',
        'Navratri Mahotsav',
        'Bader Establishment Anniversary',
        'Community Welfare Programs',
      ],
      history: 'The Shri Seervi Samaj of Konda has a rich heritage rooted in the traditions of Rajasthan and Gujarat. Our ancestors migrated to Madhya Pradesh and established a vibrant community centered around Shri Aai Mataji.',
      mission: 'To unite the Seervi community, preserve our cultural heritage, support education and welfare, and foster spiritual growth through the teachings of Shri Aai Mataji.',
      vision: 'A united, educated, and prosperous Seervi community that contributes positively to society while preserving our traditions for future generations.',
      about: 'Shri Seervi Samaj Konda is a vibrant community organization serving the Seervi families of Konda village and surrounding areas in Dhar district, Madhya Pradesh.',
      emergencyContacts: [
        { name: 'Community President', designation: 'President', phone: '+91-9876543210' },
        { name: 'Secretary', designation: 'Secretary', phone: '+91-9876543211' },
      ],
    });
    console.log('Village information seeded');

    await Settings.create({
      siteName: 'Shri Seervi Samaj Konda',
      siteTagline: 'Unity • Heritage • Progress',
      primaryColor: '#FF6B00',
      secondaryColor: '#0D6EFD',
      accentColor: '#198754',
      contactEmail: 'contact@seervisamajkonda.org',
      contactPhone: '+91-9876543210',
      address: 'Sirvi Samaj Dharmshala, Konda, Tehsil Kukshi, District Dhar, MP 454335',
      villageRef: village._id,
    });

    const admin = await User.create({
      name: 'Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@seervisamajkonda.org',
      password: process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456',
      role: 'super_admin',
      isEmailVerified: true,
      villageId: village._id,
    });
    console.log(`Admin created: ${admin.email}`);

    const familyId1 = await generateFamilyId('Barfa');
    const family1 = await Family.create({
      familyId: familyId1,
      headOfFamily: 'Ram Barfa',
      surname: 'Barfa',
      address: 'Ward No. 3, Konda',
      village: 'Konda',
      mobileNumber: '+91-9876543220',
      whatsappNumber: '+91-9876543220',
      numberOfMembers: 4,
      villageRef: village._id,
      createdBy: admin._id,
    });
    family1.qrCode = await generateFamilyQR(familyId1, process.env.CLIENT_URL || 'http://localhost:5173');
    await family1.save();

    const familyId2 = await generateFamilyId('Kag');
    const family2 = await Family.create({
      familyId: familyId2,
      headOfFamily: 'Shyam Kag',
      surname: 'Kag',
      address: 'Ward No. 5, Konda',
      village: 'Konda',
      mobileNumber: '+91-9876543230',
      numberOfMembers: 3,
      villageRef: village._id,
      createdBy: admin._id,
    });
    family2.qrCode = await generateFamilyQR(familyId2, process.env.CLIENT_URL || 'http://localhost:5173');
    await family2.save();

    const members = await FamilyMember.insertMany([
      {
        firstName: 'Ram', lastName: 'Barfa', gender: 'male', age: 55,
        occupation: 'Farmer', phoneNumber: '+91-9876543220', bloodGroup: 'O+',
        family: family1._id, isHeadOfFamily: true, villageRef: village._id, createdBy: admin._id,
      },
      {
        firstName: 'Sita', lastName: 'Barfa', gender: 'female', age: 50,
        occupation: 'Homemaker', bloodGroup: 'A+', family: family1._id,
        villageRef: village._id, createdBy: admin._id,
      },
      {
        firstName: 'Amit', lastName: 'Barfa', gender: 'male', age: 25,
        education: 'B.Tech', occupation: 'Software Engineer', bloodGroup: 'O+',
        family: family1._id, villageRef: village._id, createdBy: admin._id,
      },
      {
        firstName: 'Priya', lastName: 'Barfa', gender: 'female', age: 22,
        education: 'B.Com', occupation: 'Accountant', bloodGroup: 'A+',
        family: family1._id, villageRef: village._id, createdBy: admin._id,
      },
      {
        firstName: 'Shyam', lastName: 'Kag', gender: 'male', age: 48,
        occupation: 'Business Owner', phoneNumber: '+91-9876543230', bloodGroup: 'B+',
        family: family2._id, isHeadOfFamily: true, villageRef: village._id, createdBy: admin._id,
      },
    ]);

    family1.familyTree = members.filter((m) => m.family.toString() === family1._id.toString()).map((m) => m._id);
    family2.familyTree = members.filter((m) => m.family.toString() === family2._id.toString()).map((m) => m._id);
    await family1.save();
    await family2.save();

    await Committee.insertMany([
      { name: 'Ram Barfa', designation: 'President', phone: '+91-9876543220', order: 1, villageRef: village._id },
      { name: 'Shyam Kag', designation: 'Secretary', phone: '+91-9876543230', order: 2, villageRef: village._id },
      { name: 'Amit Barfa', designation: 'Treasurer', phone: '+91-9876543221', order: 3, villageRef: village._id },
    ]);

    await News.insertMany([
      {
        title: 'Navratri Mahotsav 2026 Announcement',
        content: 'We are pleased to announce the upcoming Navratri Mahotsav celebration at Sirvi Samaj Dharmshala. All community members are invited to participate.',
        excerpt: 'Navratri Mahotsav celebration announcement for 2026',
        category: 'news',
        isFeatured: true,
        status: 'published',
        publishedAt: new Date(),
        villageRef: village._id,
        createdBy: admin._id,
      },
      {
        title: 'Community Meeting - Monthly Update',
        content: 'Monthly community meeting will be held on the first Sunday of every month at 10 AM.',
        category: 'notice',
        status: 'published',
        publishedAt: new Date(),
        villageRef: village._id,
        createdBy: admin._id,
      },
    ]);

    await Event.insertMany([
      {
        title: 'Shri Aai Mata Pragatya Diwas',
        description: 'Annual celebration of Shri Aai Mata Pragatya Diwas with bhajan, prasad, and community gathering.',
        eventType: 'upcoming',
        startDate: new Date('2026-08-15'),
        location: 'Sirvi Samaj Dharmshala, Konda',
        registrationRequired: true,
        status: 'published',
        villageRef: village._id,
        createdBy: admin._id,
      },
      {
        title: 'Annual General Meeting 2025',
        description: 'Annual general meeting of Shri Seervi Samaj Konda.',
        eventType: 'past',
        startDate: new Date('2025-01-15'),
        location: 'Sirvi Samaj Dharmshala, Konda',
        status: 'published',
        villageRef: village._id,
        createdBy: admin._id,
      },
    ]);

    await Student.create({
      name: 'Priya Barfa',
      member: members[3]._id,
      school: 'Konda Higher Secondary School',
      college: 'Dhar College',
      course: 'B.Com',
      year: '3rd Year',
      cgpa: '8.5',
      achievements: ['District Topper 2024'],
      villageRef: village._id,
      createdBy: admin._id,
    });

    await Business.create({
      businessName: 'Kag General Store',
      owner: 'Shyam Kag',
      ownerMember: members[4]._id,
      category: 'Retail',
      address: 'Main Market, Konda',
      phone: '+91-9876543230',
      whatsapp: '+91-9876543230',
      villageRef: village._id,
      createdBy: admin._id,
    });

    await BloodDonor.insertMany([
      {
        name: 'Amit Barfa',
        member: members[2]._id,
        bloodGroup: 'O+',
        phone: '+91-9876543221',
        village: 'Konda',
        availability: 'available',
        villageRef: village._id,
        createdBy: admin._id,
      },
      {
        name: 'Ram Barfa',
        member: members[0]._id,
        bloodGroup: 'O+',
        phone: '+91-9876543220',
        village: 'Konda',
        availability: 'on_request',
        villageRef: village._id,
        createdBy: admin._id,
      },
    ]);

    console.log('Sample data seeded successfully!');
    console.log(`Login: ${admin.email} / ${process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456'}`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
