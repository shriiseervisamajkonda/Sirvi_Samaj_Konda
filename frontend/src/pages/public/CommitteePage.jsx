import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPhone, FiUsers, FiArrowRight, FiAward } from 'react-icons/fi';
import { committeeAPI } from '../../services/api';
import { SkeletonCardGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const CommitteePage = () => {
  const [committee, setCommittee] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    committeeAPI.getAll({ limit: 100 })
      .then(res => setCommittee(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { id: 'all', label: 'सभी (All)' },
    { id: 'sankal_panch', label: 'सकल पंच' },
    { id: 'committee', label: 'कार्यकारिणी समिति' },
    { id: 'women_committee', label: 'महिला समिती' },
    { id: 'konda_gram_unit', label: 'ग्राम इकाई' },
    { id: 'yuva_sangathan', label: 'युवा संगठन' },
    { id: 'sahayata_kosh', label: 'सहायता कोष' },
    { id: 'bhavan_samiti', label: 'भवन समिति' },
    { id: 'sangathan', label: 'संगठन' },
  ];

  const filteredMembers = activeTab === 'all'
    ? committee
    : committee.filter(m => m.committee_type === activeTab);

  const designationOrder = ['President', 'Vice President', 'Secretary', 'Joint Secretary', 'Treasurer', 'अध्यक्ष', 'उपाध्यक्ष', 'सचिव', 'सह सचिव', 'कोषाध्यक्ष'];
  const main = filteredMembers.filter(m => designationOrder.some(d => m.designation?.includes(d)));
  const others = filteredMembers.filter(m => !designationOrder.some(d => m.designation?.includes(d)));

  return (
    <div className="bg-[#FFF8EC] min-h-screen text-[#2B211B]">
      {/* Header Banner */}
      <div className="relative py-20 text-white overflow-hidden border-b border-[#E8DCC8] bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]">
        {/* Background image overlay */}
        <div className="absolute inset-0">
          <img src="/hero_background.webp" alt="Header Background" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/20 border border-amber-400/30 rounded-full text-xs font-bold uppercase tracking-wider mb-4 text-white shadow-sm">
              संगठन एवं नेतृत्व
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3 text-white">समिती एवं संगठन संकल पंच</h1>
            <p className="text-orange-100 text-lg font-medium">सिर्वी समाज कोणदा के संगठन एवं समाज सुधारक प्रमुखों की सूची</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mahasabha Gram Unit Callout Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 p-6 rounded-3xl bg-white border border-[#E8DCC8] shadow-md flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7A2525] to-[#C85A17] flex items-center justify-center text-white shrink-0 shadow-md">
              <FiAward className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#2B211B]">
                अखिल भारतीय सिर्वी महासभा मध्यप्रदेश — कोणदा ग्राम इकाई
              </h3>
              <p className="text-xs sm:text-sm text-[#766A60] font-medium">
                नवीन मनोनयन, पदाधिकारी, सदस्य, प्रतिनिधि एवं गठन समारोह का अधिकृत विवरण देखें
              </p>
            </div>
          </div>
          <Link
            to="/konda-gram-unit"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C85A17] to-[#C9A44C] text-white font-bold text-xs sm:text-sm rounded-2xl hover:shadow-lg transition-all shrink-0 cursor-pointer shadow-md"
          >
            इकाई विवरण देखें <FiArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center border-b border-[#E8DCC8] mb-12 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-bold transition-all border-b-2 rounded-t-2xl -mb-[2px] cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#C85A17] text-[#C85A17] bg-white shadow-sm font-black'
                  : 'border-transparent text-[#766A60] hover:text-[#2B211B] hover:bg-white/50'
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
                <h2 className="text-2xl font-extrabold text-[#2B211B] mb-8 text-center border-b border-[#E8DCC8] pb-4">
                  मुख्य पदाधिकारी
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {main.map((m, i) => (
                    <motion.div
                      key={m.id || m._id || i}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-white rounded-3xl p-6 text-center border border-[#E8DCC8] hover:border-[#C9A44C]/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-md"
                    >
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7A2525] via-[#C85A17] to-[#C9A44C] p-1 mx-auto mb-4 overflow-hidden shadow-md">
                        {(m.photo || m.photo_url) ? (
                          <img src={m.photo || m.photo_url} alt={m.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <div className="w-full h-full bg-[#FFF8EC] rounded-xl flex items-center justify-center text-[#7A2525] text-2xl font-black">
                            {m.name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-[#2B211B] mb-1 text-base leading-snug">{m.name}</h3>
                      <p className="text-[#C85A17] text-sm font-semibold mb-3">{m.designation}</p>
                      {m.phone && (
                        <a
                          href={`tel:${m.phone}`}
                          className="flex items-center justify-center gap-1.5 text-xs text-[#766A60] hover:text-[#C85A17] transition-colors"
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
                <h2 className="text-2xl font-extrabold text-[#2B211B] mb-8 text-center border-b border-[#E8DCC8] pb-4">
                  अन्य सदस्य
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {others.map((m, i) => (
                    <motion.div
                      key={m.id || m._id || i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-[#E8DCC8] hover:border-[#C9A44C]/60 hover:shadow-lg transition-all duration-300 shadow-md"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7A2525] to-[#C85A17] p-0.5 shrink-0 overflow-hidden shadow-sm">
                        {(m.photo || m.photo_url) ? (
                          <img src={m.photo || m.photo_url} alt={m.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <div className="w-full h-full bg-[#FFF8EC] rounded-xl flex items-center justify-center text-[#7A2525] font-bold">
                            {m.name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#2B211B] text-sm truncate">{m.name}</p>
                        <p className="text-[#C85A17] text-xs font-semibold truncate">{m.designation}</p>
                        {m.phone && <p className="text-[#766A60] text-xs mt-0.5">{m.phone}</p>}
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

