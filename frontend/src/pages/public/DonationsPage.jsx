import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiPhone, FiHome, FiUsers, FiShield, FiHeart, FiCheckCircle } from 'react-icons/fi';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const DonationsPage = () => {
  const { heroBgUrl } = useSiteSettings();

  const upcomingFeatures = [
    {
      title: 'सुरक्षित 1-क्लिक UPI एवं डिजिटल भुगतान',
      desc: 'Google Pay, PhonePe, Paytm एवं नेट बैंकिंग द्वारा समाज कोष में सीधा व सुरक्षित अंशदान।',
      icon: '💳',
    },
    {
      title: 'तत्काल डिजिटल रसीद एवं SMS पुष्टि',
      desc: 'भुगतान होते ही प्रमाणित डिजिटल रसीद डाउनलोड व स्वचालित SMS पुष्टि प्रणाली।',
      icon: '📜',
    },
    {
      title: 'पारदर्शी आय-व्यय व सामाजिक रिपोर्ट',
      desc: 'मंदिर निर्माण, सहायता कोष एवं अन्नपूर्णा भवन में प्राप्त प्रत्येक दान की सार्वजनिक पारदर्शिता।',
      icon: '📊',
    },
  ];

  return (
    <div className="bg-[#FFF8EC] min-h-screen text-[#2B211B] flex flex-col justify-between">
      {/* Header Banner */}
      <div className="relative py-20 text-white overflow-hidden border-b border-[#E8DCC8] bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]">
        <div className="absolute inset-0">
          <img
            src={heroBgUrl || '/hero_background.webp'}
            alt="Header Background"
            className="w-full h-full object-cover opacity-20"
            onError={(e) => { e.currentTarget.src = '/hero_background.webp'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 backdrop-blur-md text-amber-200 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-400/30">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              शीघ्र उपलब्ध होगा • Coming Soon
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
              दान एवं चंदा व्यवस्था
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-orange-100 font-medium leading-relaxed">
              श्री सिर्वी समाज कोणदा की ऑनलाइन दान एवं डिजिटल चंदा रसीद प्रणाली का निर्माण कार्य प्रगति पर है।
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Coming Soon Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-3xl border border-[#E8DCC8] shadow-xl p-8 sm:p-12 text-center relative overflow-hidden"
        >
          {/* Top Decorative Graphic */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#FFF8EC] via-[#FAF1E0] to-[#E8DCC8] border border-[#E8DCC8] flex items-center justify-center text-5xl mx-auto mb-6 shadow-inner">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            >
              🚧
            </motion.span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#7A2525] mb-3">
            ऑनलाइन पोर्टल शीघ्र प्रारंभ किया जाएगा
          </h2>
          <p className="text-[#766A60] text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-medium mb-10">
            समाजजनों की सुविधा, सुरक्षा एवं पारदर्शिता हेतु गेटवे एकीकरण (Payment Gateway Integration) व डिजिटल रसीद सत्यापन पर कार्य चल रहा है।
          </p>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left mb-10">
            {upcomingFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="bg-[#FAF1E0]/50 border border-[#E8DCC8] rounded-2xl p-5 hover:border-[#C9A44C] transition-all"
              >
                <div className="text-2xl mb-2">{feat.icon}</div>
                <h3 className="font-bold text-[#2B211B] text-sm mb-1">{feat.title}</h3>
                <p className="text-xs text-[#766A60] leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>

          {/* Offline Assistance Box */}
          <div className="bg-[#FFF8EC] border border-[#E8DCC8] rounded-2xl p-6 sm:p-8 text-left max-w-2xl mx-auto space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C85A17] to-[#C9A44C] flex items-center justify-center text-white shrink-0 shadow-sm">
                <FiPhone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#7A2525]">वर्तमान में दान / सहयोग हेतु संपर्क करें</h3>
                <p className="text-xs text-[#766A60]">श्री सिर्वी समाज केन्द्रीय समिति एवं सहायता कोष कोणदा</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-semibold text-[#2B211B]">
              <div className="p-3 bg-white rounded-xl border border-[#E8DCC8]">
                <span className="text-[#766A60] block font-normal text-[11px]">अध्यक्ष / संपर्क:</span>
                <span className="font-bold text-sm text-[#7A2525]">+91-9981644585</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#E8DCC8]">
                <span className="text-[#766A60] block font-normal text-[11px]">आधिकारिक ईमेल:</span>
                <span className="font-bold text-xs text-[#7A2525]">shriseervisamajkonda@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C85A17] to-[#C9A44C] text-white font-bold rounded-2xl hover:shadow-lg transition-all text-sm cursor-pointer"
            >
              <FiHome className="w-4 h-4" /> मुख्य पृष्ठ पर जाएं (Home)
            </Link>
            <Link
              to="/committee"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FAF1E0] border border-[#E8DCC8] text-[#2B211B] hover:text-[#C85A17] font-bold rounded-2xl hover:bg-white transition-all text-sm cursor-pointer"
            >
              <FiUsers className="w-4 h-4" /> समिति सदस्य देखें (Committee)
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer spacer */}
      <div className="pb-8" />
    </div>
  );
};

export default DonationsPage;
