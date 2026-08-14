import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiHome } from 'react-icons/fi';
import { villageAPI } from '../../services/api';
import { SkeletonPage } from '../../components/common/Skeleton';

const VillagePage = () => {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    villageAPI.getAll()
      .then(res => setVillages(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const defaultInfo = {
    name: 'Konda',
    tehsil: 'Kukshi',
    district: 'Dhar',
    state: 'Madhya Pradesh',
    pinCode: '454335',
    communityCenter: 'Sirvi Samaj Dharmshala, Konda',
    purpose: 'Community meetings, weddings, social gatherings, religious programs, and cultural events.',
    description: 'Konda is a peaceful village in Kukshi tehsil of Dhar district, Madhya Pradesh. Home to the Seervi Samaj community, the village is known for its unity, cultural traditions, and devotion to Shri Aai Mataji.',
  };

  const info = villages[0] || defaultInfo;

  return (
    <div className="bg-[#160D08] min-h-screen text-[#FFF3DD]">
      {/* Header Banner */}
      <div className="relative py-20 text-white overflow-hidden border-b border-[#D4AF37]/20">
        {/* Background image overlay */}
        <div className="absolute inset-0">
          <img src="/hero_background.webp" alt="Header Background" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/10 border border-[#D4AF37]/35 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              हमारा गाँव
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3">गाँव की जानकारी (Village Information)</h1>
            <p className="text-[#FFF3DD] text-lg font-medium opacity-90">सीरवी समाज कोणदा एवं हमारे गाँव का गौरवशाली इतिहास</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <SkeletonPage />
        ) : (
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Info */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl font-extrabold text-[#FFF3DD] mb-8 border-b border-[#D4AF37]/10 pb-4">
                ग्राम {info.name || 'कोणदा'} (Village Profile)
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: 'गाँव (Village)', value: info.name === 'Konda' ? 'कोणदा' : (info.name || 'कोणदा') },
                  { label: 'तहसील (Tehsil)', value: info.tehsil || 'कुक्षी' },
                  { label: 'जिला (District)', value: info.district || 'धार' },
                  { label: 'राज्य (State)', value: info.state || 'मध्य प्रदेश' },
                  { label: 'पिन कोड (PIN Code)', value: info.pinCode || '454335' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#2A1010] rounded-2xl p-4 border border-[#D4AF37]/15">
                    <p className="text-xs font-bold text-[#C85A17] uppercase tracking-wider mb-1">{label}</p>
                    <p className="font-semibold text-[#FFF3DD]">{value}</p>
                  </div>
                ))}
              </div>

              {info.description && (
                <p className="text-[#CDBBA4] leading-relaxed mb-8 text-base font-medium">
                  {info.description.replace(/कोंडा/g, 'कोणदा')}
                </p>
              )}

              {/* Community Center */}
              <div className="bg-[#2A1010] border border-[#D4AF37]/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#C85A17] to-[#D4AF37] rounded-xl flex items-center justify-center shrink-0">
                    <FiHome className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#FFF3DD] mb-1 text-lg">सामुदायिक केंद्र (Community Center)</h3>
                    <p className="text-[#CDBBA4] font-semibold mb-2">{info.communityCenter === 'Sirvi Samaj Dharmshala, Konda' ? 'सीरवी समाज धर्मशाला, कोणदा' : (info.communityCenter || 'सीरवी समाज धर्मशाला, कोणदा')}</p>
                    <p className="text-[#CDBBA4]/80 text-sm leading-relaxed">
                      {info.purpose || 'विवाह, सामाजिक बैठकें, मेधावी छात्र सम्मान समारोह, धार्मिक उत्सव एवं सांस्कृतिक आयोजन।'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Map & Travel Guideline */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="bg-[#2A1010] rounded-3xl overflow-hidden h-96 border border-[#D4AF37]/15 relative">
                <iframe
                  title="Konda Village Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3686.4!2d74.7!3d22.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDE4JzAwLjAiTiA3NMKwNDInMDAuMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  className="grayscale dark:contrast-75 dark:brightness-75"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-[#160D08] rounded-2xl px-6 py-3 shadow-2xl border border-[#D4AF37]/35">
                    <div className="flex items-center gap-2 text-[#D4AF37]">
                      <FiMapPin className="w-5 h-5" />
                      <span className="font-extrabold text-base">कोणदा गाँव (Konda)</span>
                    </div>
                    <p className="text-[#CDBBA4] text-xs mt-0.5 font-semibold">कुक्षी, धार, मध्य प्रदेश 454335</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#2A1010] rounded-2xl p-6 border border-[#D4AF37]/15 shadow-xl">
                <h3 className="font-bold text-[#FFF3DD] text-lg mb-4">📍 कोणदा कैसे पहुँचें? (How to Reach)</h3>
                <div className="space-y-4 text-sm text-[#CDBBA4] font-medium">
                  <div className="flex gap-3">
                    <span className="font-bold text-[#C85A17] shrink-0">🚌 बस (Bus):</span>
                    <span>कुक्षी, धार और इंदौर से कोणदा ग्राम के लिए नियमित बस सेवा उपलब्ध है।</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-bold text-[#C85A17] shrink-0">🚂 ट्रेन (Train):</span>
                    <span>निकटतम मुख्य रेलवे स्टेशन मेघनगर या इंदौर (लगभग 110 किमी) है।</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-bold text-[#C85A17] shrink-0">✈️ हवाई मार्ग (Air):</span>
                    <span>निकटतम हवाई अड्डा देवी अहिल्याबाई होल्कर अंतर्राष्ट्रीय हवाई अड्डा, इंदौर है।</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VillagePage;
