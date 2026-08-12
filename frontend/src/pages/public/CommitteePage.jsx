import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPhone, FiMail, FiUsers } from 'react-icons/fi';
import { committeeAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const CommitteePage = () => {
  const [committee, setCommittee] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('committee'); // 'committee', 'sangathan', 'sankal_panch'

  useEffect(() => {
    committeeAPI.getAll({ limit: 100 })
      .then(res => setCommittee(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { id: 'committee', label: 'कार्यकारिणी समिति (Executive Committee)' },
    { id: 'sangathan', label: 'संगठन (Organization)' },
    { id: 'sankal_panch', label: 'संकल पंच (Sankal Panch Council)' },
  ];

  const filteredMembers = committee.filter(m => m.type === activeTab || (!m.type && activeTab === 'committee'));

  const designationOrder = ['President', 'Vice President', 'Secretary', 'Joint Secretary', 'Treasurer'];
  const main = filteredMembers.filter(m => designationOrder.some(d => m.designation?.includes(d)));
  const others = filteredMembers.filter(m => !designationOrder.some(d => m.designation?.includes(d)));

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-700 py-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/20 border border-white/30 rounded-full text-sm font-medium mb-4">
              संगठन एवं नेतृत्व
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3">समिती एवं संगठन संकल पंच</h1>
            <p className="text-orange-100 text-lg">सीरवी समाज कोणदा के संगठन एवं समाज सुधारक प्रमुखों की सूची</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap justify-center border-b border-gray-200 dark:border-slate-800 mb-12 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 rounded-t-lg -mb-[2px] ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-500 bg-orange-50/50 dark:bg-orange-500/10'
                  : 'border-transparent text-gray-500 hover:text-orange-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : filteredMembers.length === 0 ? (
          <EmptyState icon={FiUsers} title="कोई सदस्य उपलब्ध नहीं" description="इस सूची में वर्तमान में कोई सदस्य दर्ज नहीं किया गया है।" />
        ) : (
          <>
            {/* Key leadership */}
            {main.length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">मुख्य पदाधिकारी (Key Leadership)</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {main.map((m, i) => (
                    <motion.div
                      key={m._id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-white dark:bg-slate-800 rounded-2xl p-6 text-center shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg shadow-orange-500/30 overflow-hidden">
                        {m.photo ? (
                          <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          m.name?.charAt(0)
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">{m.name}</h3>
                      <p className="text-orange-500 text-sm font-semibold mb-3">{m.designation}</p>
                      {m.phone && (
                        <a href={`tel:${m.phone}`} className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">
                          <FiPhone className="w-3 h-3" /> {m.phone}
                        </a>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Other members */}
            {others.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">अन्य सदस्य (All Members)</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {others.map((m, i) => (
                    <motion.div
                      key={m._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-500/30 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
                        {m.photo ? (
                          <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          m.name?.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{m.name}</p>
                        <p className="text-orange-500 text-xs font-medium truncate">{m.designation}</p>
                        {m.phone && <p className="text-gray-500 text-xs mt-0.5">{m.phone}</p>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CommitteePage;
