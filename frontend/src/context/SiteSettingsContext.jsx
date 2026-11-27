import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsAPI } from '../services/api';

const DEFAULT_SETTINGS = {
  appName: 'श्री सिर्वी समाज कोणदा',
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

const SiteSettingsContext = createContext(null);

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await settingsAPI.get();
      if (res.data?.data) {
        setSettings((prev) => ({
          ...prev,
          ...res.data.data,
        }));
      }
    } catch (err) {
      console.warn('Failed to load site settings, using default values:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateLocalSettings = (newSettings) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        loading,
        fetchSettings,
        updateLocalSettings,
        logoUrl: settings.logoUrl || '/Logo.webp',
        heroBgUrl: settings.heroBgUrl || '/hero_background.webp',
        aaiMatajiUrl: settings.aaiMatajiUrl || '/aai_mataji_portrait.jpg',
        templeBaderUrl: settings.templeBaderUrl || '/aai_mata_temple.webp',
        contactEmail: settings.contactEmail || 'shriseervisamajkonda@gmail.com',
        contactPhone: settings.contactPhone || '+91-9981644585',
        facebookUrl: settings.facebookUrl || 'https://facebook.com/',
        instagramUrl: settings.instagramUrl || 'https://instagram.com/',
        youtubeUrl: settings.youtubeUrl || 'https://youtube.com/',
        whatsappNumber: settings.whatsappNumber || '+919981644585',
        twitterUrl: settings.twitterUrl || '',
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    return {
      settings: DEFAULT_SETTINGS,
      loading: false,
      fetchSettings: () => {},
      updateLocalSettings: () => {},
      logoUrl: '/Logo.webp',
      heroBgUrl: '/hero_background.webp',
      aaiMatajiUrl: '/aai_mataji_portrait.jpg',
      templeBaderUrl: '/aai_mata_temple.webp',
      contactEmail: 'shriseervisamajkonda@gmail.com',
      contactPhone: '+91-9981644585',
      facebookUrl: 'https://facebook.com/',
      instagramUrl: 'https://instagram.com/',
      youtubeUrl: 'https://youtube.com/',
      whatsappNumber: '+919981644585',
      twitterUrl: '',
    };
  }
  return context;
};
