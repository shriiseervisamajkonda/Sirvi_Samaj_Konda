import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPhone, FiUsers } from 'react-icons/fi';
import { committeeAPI } from '../../services/api';
import { SkeletonCardGrid } from '../../components/common/Skeleton';
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
              संगठन एवं नेतृत्व
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3">समिती एवं संगठन संकल पंच</h1>
            <p className="text-[#FFF3DD] text-lg font-medium opacity-90">सीरवी समाज कोणदा के संगठन एवं समाज सुधारक प्रमुखों की सूची</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="flex flex-wrap justify-center border-b border-[#D4AF37]/20 mb-12 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-bold transition-all border-b-2 rounded-t-xl -mb-[2px] cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#D4AF37] text-[#D4AF37] bg-[#7A2525]/30'
                  : 'border-transparent text-[#CDBBA4] hover:text-[#FFF3DD] hover:bg-[#7A2525]/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <SkeletonCardGrid count={6} cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" />
        ) : filteredMembers.length === 0 ? (
          <EmptyState icon={FiUsers} title="कोई सदस्य उपलब्ध नहीं" description="इस सूची में वर्तमान में कोई सदस्य दर्ज नहीं किया गया है।" />
        ) : (
          <>
            {/* Key leadership */}
            {main.length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-[#FFF3DD] mb-8 text-center border-b border-[#D4AF37]/10 pb-4">
                  मुख्य पदाधिकारी (Key Leadership)
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {main.map((m, i) => (
                    <motion.div
                      key={m._id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-[#2A1010] rounded-2xl p-6 text-center border border-[#D4AF37]/15 hover:border-[#D4AF37]/45 transition-all duration-300 shadow-xl"
                    >
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C85A17] to-[#D4AF37] p-0.5 mx-auto mb-4 overflow-hidden shadow-lg">
                        {m.photo ? (
                          <img src={m.photo} alt={m.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <div className="w-full h-full bg-[#160D08] rounded-full flex items-center justify-center text-[#FFF3DD] text-2xl font-bold">
                            {m.name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-[#FFF3DD] mb-1 text-base">{m.name}</h3>
                      <p className="text-[#C85A17] text-sm font-semibold mb-3">{m.designation}</p>
                      {m.phone && (
                        <a
                          href={`tel:${m.phone}`}
                          className="flex items-center justify-center gap-1.5 text-xs text-[#CDBBA4] hover:text-[#D4AF37] transition-colors"
                        >
                          <FiPhone className="w-3.5 h-3.5" /> {m.phone}
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
                <h2 className="text-2xl font-bold text-[#FFF3DD] mb-8 text-center border-b border-[#D4AF37]/10 pb-4">
                  अन्य सदस्य (All Members)
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {others.map((m, i) => (
                    <motion.div
                      key={m._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 p-4 bg-[#2A1010] rounded-2xl border border-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-all duration-300"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C85A17] to-[#D4AF37] p-0.5 shrink-0 overflow-hidden">
                        {m.photo ? (
                          <img src={m.photo} alt={m.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <div className="w-full h-full bg-[#160D08] rounded-full flex items-center justify-center text-[#FFF3DD] font-bold">
                            {m.name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#FFF3DD] text-sm truncate">{m.name}</p>
                        <p className="text-[#C85A17] text-xs font-semibold truncate">{m.designation}</p>
                        {m.phone && <p className="text-[#CDBBA4] text-xs mt-0.5">{m.phone}</p>}
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
