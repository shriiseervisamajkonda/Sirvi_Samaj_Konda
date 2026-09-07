import { useState, useEffect } from 'react';
import { FiSave, FiSettings, FiImage, FiShare2, FiCheckCircle } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { settingsAPI } from '../../services/api';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import ImageUpload from '../../components/common/ImageUpload';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('branding'); // 'branding' | 'social' | 'general'
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const { fetchSettings: refreshGlobalSettings, updateLocalSettings } = useSiteSettings();

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await settingsAPI.get();
        if (res.data?.data) {
          reset({
            appName: res.data.data.appName || 'श्री सिर्वी समाज कोणदा',
            contactEmail: res.data.data.contactEmail || 'shriseervisamajkonda@gmail.com',
            contactPhone: res.data.data.contactPhone || '+91-9981644585',
            logoUrl: res.data.data.logoUrl || '/Logo.webp',
            heroBgUrl: res.data.data.heroBgUrl || '/hero_background.webp',
            aaiMatajiUrl: res.data.data.aaiMatajiUrl || '/aai_mataji_portrait.jpg',
            templeBaderUrl: res.data.data.templeBaderUrl || '/aai_mata_temple.webp',
            facebookUrl: res.data.data.facebookUrl || 'https://facebook.com/',
            instagramUrl: res.data.data.instagramUrl || 'https://instagram.com/',
            youtubeUrl: res.data.data.youtubeUrl || 'https://youtube.com/',
            whatsappNumber: res.data.data.whatsappNumber || '+919981644585',
            twitterUrl: res.data.data.twitterUrl || '',
            enableNotifications: res.data.data.enableNotifications ?? true,
            maintenanceMode: res.data.data.maintenanceMode ?? false,
          });
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
      const res = await settingsAPI.update(data);
      updateLocalSettings(res.data?.data || data);
      await refreshGlobalSettings();
      toast.success('सेटिंग्स व सोशल मीडिया लिंक्स सफलतापूर्वक सहेज ली गई हैं!');
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

  const watchedLogo = watch('logoUrl');
  const watchedHeroBg = watch('heroBgUrl');
  const watchedAaiMataji = watch('aaiMatajiUrl');
  const watchedTempleBader = watch('templeBaderUrl');

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">सिस्टम सेटिंग्स एवं ब्रांडिंग (System Settings)</h1>
          <p className="text-gray-500 text-sm mt-1">लोगो, होम पेज छवियां, सोशल मीडिया लिंक्स एवं सामान्य प्राथमिकताएं प्रबंधित करें</p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap bg-gray-100 p-1 rounded-2xl border border-gray-200 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'branding'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiImage className="w-4 h-4" /> लोगो व छवियाँ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'social'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiShare2 className="w-4 h-4" /> सोशल मीडिया
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'general'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiSettings className="w-4 h-4" /> सामान्य सेटिंग्स
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 flex justify-center items-center">
          <div className="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        </div>
      ) : (
        <form onKeyDown={preventEnterSubmit} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* TAB 1: BRANDING & IMAGES */}
          {activeTab === 'branding' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-8">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-1">
                  <FiImage className="w-5 h-5 text-orange-500" /> पोर्टल लोगो एवं होम पेज मीडिया
                </h2>
                <p className="text-xs text-gray-500">यहाँ से आप वेबसाइट का लोगो और मुख्य पृष्ठ के सभी मुख्य फ़ोटो कभी भी बदल सकते हैं।</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Logo */}
                <div className="bg-[#FAF1E0]/50 p-5 rounded-2xl border border-[#E8DCC8] space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-[#7A2525]">१. संस्था का मुख्य लोगो (Portal Logo)</h3>
                    <p className="text-xs text-gray-500 mt-0.5">हेडर, फुटर, लॉगिन और एडमिन पैनल पर प्रदर्शित होता है</p>
                  </div>
                  <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-[#E8DCC8]">
                    <div className="w-16 h-16 rounded-full bg-[#FAF1E0] border-2 border-amber-400/50 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                      <img
                        src={watchedLogo || '/Logo.webp'}
                        alt="Logo Preview"
                        className="w-12 h-12 object-contain"
                        onError={(e) => { e.currentTarget.src = '/Logo.webp'; }}
                      />
                    </div>
                    <div className="text-xs text-gray-600">
                      <span className="font-bold text-[#2B211B] block">लोगो पूर्वावलोकन (Preview)</span>
                      अनुशंसित प्रारूप: पारदर्शी PNG या WebP (1:1 अनुपात)
                    </div>
                  </div>
                  <ImageUpload
                    value={watchedLogo}
                    onChange={(url) => setValue('logoUrl', url, { shouldDirty: true })}
                    label="नया लोगो अपलोड करें (Upload Logo)"
                    folder="branding"
                  />
                </div>

                {/* 2. Hero Background */}
                <div className="bg-[#FAF1E0]/50 p-5 rounded-2xl border border-[#E8DCC8] space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-[#7A2525]">२. मुख्य पृष्ठ हीरो बैकग्राउंड (Hero Banner Image)</h3>
                    <p className="text-xs text-gray-500 mt-0.5">होम पेज के शीर्ष मुख्य बैनर के पीछे बैकग्राउंड में प्रदर्शित होता है</p>
                  </div>
                  <div className="relative h-24 rounded-2xl overflow-hidden border border-[#E8DCC8] bg-black/20">
                    <img
                      src={watchedHeroBg || '/hero_background.webp'}
                      alt="Hero Background Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = '/hero_background.webp'; }}
                    />
                    <div className="absolute inset-0 bg-[#7A2525]/40 flex items-center justify-center">
                      <span className="text-white text-xs font-bold px-3 py-1 bg-black/40 rounded-full backdrop-blur-sm">बैनर पूर्वावलोकन</span>
                    </div>
                  </div>
                  <ImageUpload
                    value={watchedHeroBg}
                    onChange={(url) => setValue('heroBgUrl', url, { shouldDirty: true })}
                    label="हीरो बैकग्राउंड फ़ोटो बदलें"
                    folder="branding"
                  />
                </div>

                {/* 3. Aai Mataji Portrait */}
                <div className="bg-[#FAF1E0]/50 p-5 rounded-2xl border border-[#E8DCC8] space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-[#7A2525]">३. श्री आई माताजी पावन चित्र (Goddess Portrait)</h3>
                    <p className="text-xs text-gray-500 mt-0.5">होम पेज पर श्री आई माताजी परिचय खंड में प्रदर्शित होता है</p>
                  </div>
                  <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-[#E8DCC8]">
                    <div className="w-16 h-20 rounded-xl bg-[#FAF1E0] border border-amber-400/50 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                      <img
                        src={watchedAaiMataji || '/aai_mataji_portrait.jpg'}
                        alt="Aai Mataji Portrait Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = '/aai_mataji_portrait.jpg'; }}
                      />
                    </div>
                    <div className="text-xs text-gray-600">
                      <span className="font-bold text-[#2B211B] block">चित्र पूर्वावलोकन (Preview)</span>
                      अनुशंसित: उच्च गुणवत्ता वाला पोर्ट्रेट चित्र
                    </div>
                  </div>
                  <ImageUpload
                    value={watchedAaiMataji}
                    onChange={(url) => setValue('aaiMatajiUrl', url, { shouldDirty: true })}
                    label="श्री आई माताजी चित्र अपलोड करें"
                    folder="branding"
                  />
                </div>

                {/* 4. Temple / Bader Image */}
                <div className="bg-[#FAF1E0]/50 p-5 rounded-2xl border border-[#E8DCC8] space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-[#7A2525]">४. श्री आई जी मंदिर (बडेर) फ़ोटो (Temple / Bader Image)</h3>
                    <p className="text-xs text-gray-500 mt-0.5">होम पेज पर मंदिर एवं धर्मशाला परिचय खंड में प्रदर्शित होता है</p>
                  </div>
                  <div className="relative h-24 rounded-2xl overflow-hidden border border-[#E8DCC8] bg-black/20">
                    <img
                      src={watchedTempleBader || '/aai_mata_temple.webp'}
                      alt="Temple Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = '/aai_mata_temple.webp'; }}
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="text-white text-xs font-bold px-3 py-1 bg-black/50 rounded-full backdrop-blur-sm">मंदिर फ़ोटो पूर्वावलोकन</span>
                    </div>
                  </div>
                  <ImageUpload
                    value={watchedTempleBader}
                    onChange={(url) => setValue('templeBaderUrl', url, { shouldDirty: true })}
                    label="मंदिर / बडेर फ़ोटो बदलें"
                    folder="branding"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SOCIAL MEDIA ACCOUNTS */}
          {activeTab === 'social' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-1">
                  <FiShare2 className="w-5 h-5 text-orange-500" /> आधिकारिक सोशल मीडिया खाते (Social Media Accounts)
                </h2>
                <p className="text-xs text-gray-500">यहाँ दर्ज किए गए सोशल मीडिया लिंक्स वेबसाइट के फुटर (Footer), संपर्क पृष्ठ (Contact) एवं अन्य पृष्ठों पर सक्रिय रूप से प्रदर्शित होंगे।</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* WhatsApp */}
                <div className="p-4 bg-[#FAF1E0]/40 rounded-2xl border border-[#E8DCC8] space-y-2">
                  <label className="text-xs font-bold text-[#7A2525] flex items-center gap-2">
                    <FaWhatsapp className="w-4 h-4 text-green-600" /> WhatsApp हेल्पलाइन नंबर / लिंक
                  </label>
                  <input
                    {...register('whatsappNumber')}
                    placeholder="+919981644585 या https://wa.me/919981644585"
                    className="input-field"
                  />
                  <p className="text-[11px] text-gray-500">उदा: +919981644585 या पूर्ण wa.me लिंक</p>
                </div>

                {/* Facebook */}
                <div className="p-4 bg-[#FAF1E0]/40 rounded-2xl border border-[#E8DCC8] space-y-2">
                  <label className="text-xs font-bold text-[#7A2525] flex items-center gap-2">
                    <FaFacebook className="w-4 h-4 text-blue-600" /> Facebook पेज URL
                  </label>
                  <input
                    {...register('facebookUrl')}
                    placeholder="https://facebook.com/seervisamajkonda"
                    className="input-field"
                  />
                  <p className="text-[11px] text-gray-500">आधिकारिक Facebook पेज का वेब लिंक</p>
                </div>

                {/* Instagram */}
                <div className="p-4 bg-[#FAF1E0]/40 rounded-2xl border border-[#E8DCC8] space-y-2">
                  <label className="text-xs font-bold text-[#7A2525] flex items-center gap-2">
                    <FaInstagram className="w-4 h-4 text-pink-600" /> Instagram प्रोफाइल URL
                  </label>
                  <input
                    {...register('instagramUrl')}
                    placeholder="https://instagram.com/seervisamajkonda"
                    className="input-field"
                  />
                  <p className="text-[11px] text-gray-500">आधिकारिक Instagram पेज का वेब लिंक</p>
                </div>

                {/* YouTube */}
                <div className="p-4 bg-[#FAF1E0]/40 rounded-2xl border border-[#E8DCC8] space-y-2">
                  <label className="text-xs font-bold text-[#7A2525] flex items-center gap-2">
                    <FaYoutube className="w-4 h-4 text-red-600" /> YouTube चैनल URL
                  </label>
                  <input
                    {...register('youtubeUrl')}
                    placeholder="https://youtube.com/@seervisamajkonda"
                    className="input-field"
                  />
                  <p className="text-[11px] text-gray-500">आधिकारिक YouTube चैनल का वेब लिंक</p>
                </div>

                {/* Twitter / X */}
                <div className="p-4 bg-[#FAF1E0]/40 rounded-2xl border border-[#E8DCC8] space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold text-[#7A2525] flex items-center gap-2">
                    <FaTwitter className="w-4 h-4 text-sky-500" /> Twitter (X) हैंडल / URL
                  </label>
                  <input
                    {...register('twitterUrl')}
                    placeholder="https://x.com/seervisamaj"
                    className="input-field"
                  />
                  <p className="text-[11px] text-gray-500">आधिकारिक X (Twitter) प्रोफाइल का वेब लिंक (वैकल्पिक)</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GENERAL SETTINGS */}
          {activeTab === 'general' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
              <h2 className="font-bold text-gray-900 flex items-center gap-2 text-lg mb-2">
                <FiSettings className="w-5 h-5 text-orange-500" /> सामान्य कॉन्फ़िगरेशन (General Configuration)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">संस्था / पोर्टल का नाम</label>
                  <input {...register('appName')} className="input-field" placeholder="श्री सिर्वी समाज कोणदा" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">संपर्क ईमेल</label>
                  <input {...register('contactEmail')} type="email" className="input-field" placeholder="shriseervisamajkonda@gmail.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">संपर्क फ़ोन नंबर</label>
                  <input {...register('contactPhone')} className="input-field" placeholder="+91-9981644585" />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <input {...register('enableNotifications')} type="checkbox" id="notify" className="w-4 h-4 text-orange-500 rounded cursor-pointer" />
                  <label htmlFor="notify" className="text-sm font-medium text-gray-700 cursor-pointer">नए कार्यक्रमों एवं सूचनाओं हेतु ईमेल सूचनाएं सक्षम करें</label>
                </div>
                <div className="flex items-center gap-3">
                  <input {...register('maintenanceMode')} type="checkbox" id="mMode" className="w-4 h-4 text-orange-500 rounded cursor-pointer" />
                  <label htmlFor="mMode" className="text-sm font-medium text-gray-700 cursor-pointer">रखरखाव मोड (Maintenance Mode - सीमित सार्वजनिक पहुँच)</label>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 bg-gradient-to-r from-[#C85A17] to-[#C9A44C] text-white rounded-2xl font-bold hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-lg shadow-orange-500/25"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiSave className="w-5 h-5" />
              )}
              <span>सेटिंग्स एवं सोशल मीडिया लिंक्स सहेजें (Save All Changes)</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SettingsPage;
