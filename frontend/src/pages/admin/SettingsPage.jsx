import { useState, useEffect } from 'react';
import { FiSave, FiSettings, FiVolume2, FiMail } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    // Mock general system settings or local settings
    const savedSettings = {
      appName: 'Shri Seervi Samaj Konda',
      contactEmail: 'contact@seervisamajkonda.org',
      contactPhone: '+91 98765 43210',
      enableNotifications: true,
      maintenanceMode: false,
    };
    reset(savedSettings);
  }, [reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Settings saved successfully!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const preventEnterSubmit = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 ">System Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure general portal settings and system preferences</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ">
        <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <FiSettings className="w-5 h-5 text-orange-500" /> General Configuration
        </h2>
        <form onKeyDown={preventEnterSubmit} onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application Name</label>
              <input {...register('appName')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input {...register('contactEmail')} type="email" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input {...register('contactPhone')} className="input-field" />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <input {...register('enableNotifications')} type="checkbox" id="notify" className="w-4 h-4 text-orange-500 rounded" />
              <label htmlFor="notify" className="text-sm font-medium text-gray-700 ">Enable Email Notifications for New Events</label>
            </div>
            <div className="flex items-center gap-3">
              <input {...register('maintenanceMode')} type="checkbox" id="mMode" className="w-4 h-4 text-orange-500 rounded" />
              <label htmlFor="mMode" className="text-sm font-medium text-gray-700 ">Maintenance Mode (restrict public access)</label>
            </div>
          </div>

          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave className="w-4 h-4" />}
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
