import supabase from '../config/supabase.js';
import { asyncHandler } from '../middleware/validate.js';

// GET /api/settings
export const getSettings = asyncHandler(async (_req, res) => {
  const { data: village } = await supabase
    .from('village_information')
    .select('*')
    .limit(1)
    .maybeSingle();

  const settings = {
    appName: 'Shri Seervi Samaj Konda',
    contactEmail: 'contact@seervisamajkonda.org',
    contactPhone: '+91 98765 43210',
    enableNotifications: true,
    maintenanceMode: false,
    villageDetails: village || null,
  };

  res.json({ success: true, data: settings });
});

// PUT /api/settings
export const updateSettings = asyncHandler(async (req, res) => {
  const { appName, contactEmail, contactPhone, enableNotifications, maintenanceMode } = req.body;

  const updatedSettings = {
    appName: appName || 'Shri Seervi Samaj Konda',
    contactEmail: contactEmail || 'contact@seervisamajkonda.org',
    contactPhone: contactPhone || '+91 98765 43210',
    enableNotifications: Boolean(enableNotifications),
    maintenanceMode: Boolean(maintenanceMode),
    updated_at: new Date().toISOString(),
  };

  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: updatedSettings,
  });
});
