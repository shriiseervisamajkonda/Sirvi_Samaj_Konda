import { useState, useEffect } from 'react';
import { FiSave, FiSettings } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { settingsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await settingsAPI.get();
        if (res.data?.data) {
          reset(res.data.data);
        }
      } catch {
        toast.error('सेटिंग्स लोड करने में त्रुटि');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await settingsAPI.update(data);
      toast.success('सेटिंग्स सफलतापूर्वक सहेज ली गई हैं!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'सेटिंग्स सहेजने में विफल');
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
        <h1 className="text-2xl font-bold text-gray-900 ">सिस्टम सेटिंग्स (System Settings)</h1>
        <p className="text-gray-500 text-sm mt-1">सामान्य पोर्टल सेटिंग्स एवं प्राथमिकताएं प्रबंधित करें</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ">
        <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <FiSettings className="w-5 h-5 text-orange-500" /> सामान्य कॉन्फ़िगरेशन (General Configuration)
        </h2>
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="w-8 h-8 border-3 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : (
          <form onKeyDown={preventEnterSubmit} onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">संस्था / पोर्टल का नाम</label>
                <input {...register('appName')} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">संपर्क ईमेल</label>
                <input {...register('contactEmail')} type="email" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">संपर्क फ़ोन नंबर</label>
                <input {...register('contactPhone')} className="input-field" />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <input {...register('enableNotifications')} type="checkbox" id="notify" className="w-4 h-4 text-orange-500 rounded cursor-pointer" />
                <label htmlFor="notify" className="text-sm font-medium text-gray-700 cursor-pointer">नए कार्यक्रमों हेतु ईमेल सूचनाएं सक्षम करें</label>
              </div>
              <div className="flex items-center gap-3">
                <input {...register('maintenanceMode')} type="checkbox" id="mMode" className="w-4 h-4 text-orange-500 rounded cursor-pointer" />
                <label htmlFor="mMode" className="text-sm font-medium text-gray-700 cursor-pointer">रखरखाव मोड (Maintenance Mode - सीमित सार्वजनिक पहुँच)</label>
              </div>
            </div>

            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-md shadow-orange-500/20">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave className="w-4 h-4" />}
              सेटिंग्स सहेजें (Save Settings)
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
