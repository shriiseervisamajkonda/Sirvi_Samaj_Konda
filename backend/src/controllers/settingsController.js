import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import supabase from '../config/supabase.js';
import { asyncHandler } from '../middleware/validate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_FILE = path.join(__dirname, '..', 'config', 'siteSettings.json');

const DEFAULT_SETTINGS = {
  appName: 'Shri Seervi Samaj Konda',
  contactEmail: 'shriseervisamajkonda@gmail.com',
  contactPhone: '+91-9981644585',
  logoUrl: '/Logo.webp',
  heroBgUrl: '/hero_background.webp',
  aaiMatajiUrl: '/aai_mataji_portrait.jpg',
  templeBaderUrl: '/aai_mata_temple.webp',
  facebookUrl: 'https://facebook.com/',
  instagramUrl: 'https://instagram.com/',
  youtubeUrl: 'https://youtube.com/',
  whatsappNumber: '+919981644585',
  twitterUrl: '',
  enableNotifications: true,
  maintenanceMode: false,
};

const getLocalSettings = () => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const fileData = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
      return { ...DEFAULT_SETTINGS, ...fileData };
    }
  } catch (e) {
    console.error('Error reading settings file:', e);
  }
  return DEFAULT_SETTINGS;
};

const saveLocalSettings = (data) => {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving settings file:', e);
  }
};

// GET /api/settings
export const getSettings = asyncHandler(async (_req, res) => {
  const localSettings = getLocalSettings();

  const { data: village } = await supabase
    .from('village_information')
    .select('*')
    .limit(1)
    .maybeSingle();

  const settings = {
    ...localSettings,
    villageDetails: village || null,
  };

  res.json({ success: true, data: settings });
});

// PUT /api/settings
export const updateSettings = asyncHandler(async (req, res) => {
  const current = getLocalSettings();
  const {
    appName,
    contactEmail,
    contactPhone,
    logoUrl,
    heroBgUrl,
    aaiMatajiUrl,
    templeBaderUrl,
    facebookUrl,
    instagramUrl,
    youtubeUrl,
    whatsappNumber,
    twitterUrl,
    enableNotifications,
    maintenanceMode,
  } = req.body;

  const updatedSettings = {
    ...current,
    appName: appName !== undefined ? appName : current.appName,
    contactEmail: contactEmail !== undefined ? contactEmail : current.contactEmail,
    contactPhone: contactPhone !== undefined ? contactPhone : current.contactPhone,
    logoUrl: logoUrl !== undefined ? logoUrl : current.logoUrl,
    heroBgUrl: heroBgUrl !== undefined ? heroBgUrl : current.heroBgUrl,
    aaiMatajiUrl: aaiMatajiUrl !== undefined ? aaiMatajiUrl : current.aaiMatajiUrl,
    templeBaderUrl: templeBaderUrl !== undefined ? templeBaderUrl : current.templeBaderUrl,
    facebookUrl: facebookUrl !== undefined ? facebookUrl : current.facebookUrl,
    instagramUrl: instagramUrl !== undefined ? instagramUrl : current.instagramUrl,
    youtubeUrl: youtubeUrl !== undefined ? youtubeUrl : current.youtubeUrl,
    whatsappNumber: whatsappNumber !== undefined ? whatsappNumber : current.whatsappNumber,
    twitterUrl: twitterUrl !== undefined ? twitterUrl : current.twitterUrl,
    enableNotifications: enableNotifications !== undefined ? Boolean(enableNotifications) : current.enableNotifications,
    maintenanceMode: maintenanceMode !== undefined ? Boolean(maintenanceMode) : current.maintenanceMode,
    updated_at: new Date().toISOString(),
  };

  saveLocalSettings(updatedSettings);

  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: updatedSettings,
  });
});
