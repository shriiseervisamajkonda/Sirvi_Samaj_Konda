import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiHome } from 'react-icons/fi';
import { villageAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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
    <div className="bg-white dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-green-800 py-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/20 border border-white/30 rounded-full text-sm font-medium mb-4">
              Our Home
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3">Village Information</h1>
            <p className="text-green-100 text-lg">Know about our beloved Konda village</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? <LoadingSpinner /> : (
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Info */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                {info.name || 'Konda'} Village
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: 'Village', value: info.name || 'Konda' },
                  { label: 'Tehsil', value: info.tehsil || 'Kukshi' },
                  { label: 'District', value: info.district || 'Dhar' },
                  { label: 'State', value: info.state || 'Madhya Pradesh' },
                  { label: 'PIN Code', value: info.pinCode || '454335' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
                    <p className="text-xs font-semibold text-green-500 uppercase tracking-wider mb-1">{label}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>

              {info.description && (
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">{info.description}</p>
              )}

              {/* Community Center */}
              <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
                    <FiHome className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">Community Center</h3>
                    <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">{info.communityCenter || 'Sirvi Samaj Dharmshala, Konda'}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {info.purpose || 'Community meetings, weddings, social gatherings, religious programs, and cultural events.'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="bg-gray-100 dark:bg-slate-800 rounded-3xl overflow-hidden h-96 border border-gray-200 dark:border-slate-700 relative">
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
                  <div className="bg-white dark:bg-slate-800 rounded-2xl px-6 py-3 shadow-xl border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <FiMapPin className="w-5 h-5" />
                      <span className="font-bold">Konda Village</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">Kukshi, Dhar, MP 454335</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">📍 How to Reach Konda</h3>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex gap-3">
                    <span className="font-semibold text-green-500 shrink-0">🚌 Bus:</span>
                    <span>Regular bus services from Dhar and Kukshi to Konda village</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-semibold text-green-500 shrink-0">🚂 Train:</span>
                    <span>Nearest railway station at Dhar (approx. 40 km)</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-semibold text-green-500 shrink-0">✈️ Air:</span>
                    <span>Nearest airport at Indore (approx. 110 km)</span>
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
