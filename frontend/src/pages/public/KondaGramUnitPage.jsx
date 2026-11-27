import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiMapPin,
  FiUserCheck,
  FiUsers,
  FiAward,
  FiCalendar,
  FiCheckCircle,
  FiShield,
  FiCompass,
  FiFlag,
  FiInfo,
} from 'react-icons/fi';
import { gramUnitAPI } from '../../services/api';
import { supabase } from '../../config/supabase';
import { SkeletonCardGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
// TODO: This is mock/fallback data. Remove when actual data is filled in the database.
import fallbackUnitPayload from '../../data/mock/kondaGramUnitFallback.json';

const { officialFallbackData, defaultSakalPanch } = fallbackUnitPayload;

const KondaGramUnitPage = () => {
  const [data, setData] = useState(officialFallbackData);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'sakal_panch', 'office_bearers', 'members', 'representatives', 'formation'

  const fetchGramUnitData = () => {
    gramUnitAPI
      .getPublicDetails()
      .then((res) => {
        if (res.data?.success && res.data.data) {
          setData(res.data.data);
        }
      })
      .catch((err) => {
        console.warn('Using official fallback data for gram unit:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGramUnitData();

    let debounceTimer = null;
    const handleRealtimeChange = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchGramUnitData();
      }, 300);
    };

    const channel = supabase
      .channel('public:gram_unit_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gram_unit_members' }, handleRealtimeChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gram_units' }, handleRealtimeChange)
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, []);

  const unit = data?.unit || officialFallbackData.unit;
  const organization = data?.organization || officialFallbackData.organization;
  const sakalPanchList = data?.sakalPanch?.length ? data.sakalPanch : defaultSakalPanch;
  const officeBearers = data?.officeBearers?.length ? data.officeBearers : officialFallbackData.officeBearers;
  const members = data?.members?.length ? data.members : officialFallbackData.members;
  const tehsilReps = data?.representatives?.tehsil?.length ? data.representatives.tehsil : officialFallbackData.representatives.tehsil;
  const districtReps = data?.representatives?.district?.length ? data.representatives.district : officialFallbackData.representatives.district;
  const stateReps = data?.representatives?.state?.length ? data.representatives.state : officialFallbackData.representatives.state;
  const formationEvent = data?.formationEvent || officialFallbackData.formationEvent;

  return (
    <div className="min-h-screen bg-[#FFF8EC] text-[#2B211B]">
      {/* Hero Header Banner */}
      <div className="relative py-16 md:py-24 overflow-hidden border-b border-[#E8DCC8] bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525] text-white">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero_background.webp"
            alt="Header Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 border border-amber-400/30 rounded-full text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-5 backdrop-blur-md shadow-lg">
              <FiFlag className="w-4 h-4 text-[#FDE68A]" />
              संगठनात्मक संरचना • अखिल भारतीय सिर्वी महासभा
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight leading-tight text-white drop-shadow-md">
              {organization.name || 'अखिल भारतीय सिर्वी महासभा मध्यप्रदेश'}
            </h1>

            <div className="inline-block p-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent w-48 h-[2px] mb-4" />

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#FDE68A] spiritual-title">
              सकल पंच एवं {unit.unitName || 'कोणदा ग्राम इकाई'} ({unit.tehsil || 'कुक्षी'}, {unit.state || 'मध्यप्रदेश'})
            </h2>

            <p className="mt-4 text-orange-100 text-sm sm:text-base max-w-3xl mx-auto font-medium leading-relaxed">
              सिर्वी समाज के सामाजिक उत्थान, एकता, सुशासन एवं संगठन को सुदृढ़ बनाने हेतु गठित अधिकृत व्यवस्था
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Quick Nav Filter Tabs in exact required hierarchy */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-[#E8DCC8] pb-4">
          {[
            { id: 'all', label: 'समग्र विवरण (All)', icon: FiInfo },
            { id: 'sakal_panch', label: '01 — सकल पंच', icon: FiShield },
            { id: 'office_bearers', label: '02 — कोणदा ग्राम इकाई पदाधिकारी', icon: FiAward },
            { id: 'members', label: '03 — ग्राम सदस्य', icon: FiUsers },
            { id: 'representatives', label: '04 — समाज प्रतिनिधि मण्डल', icon: FiUserCheck },
            { id: 'formation', label: '05 — गठन एवं पर्यवेक्षण', icon: FiCalendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#C85A17] to-[#C9A44C] text-white shadow-md font-black'
                    : 'bg-white text-[#2B211B] hover:bg-[#FFF8EC] border border-[#E8DCC8]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <SkeletonCardGrid count={8} cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" />
        ) : !data ? (
          <EmptyState
            icon={FiUsers}
            title="विवरण लोड करने में असमर्थ"
            description="वर्तमान में ग्राम इकाई की जानकारी उपलब्ध नहीं हो सकी है।"
          />
        ) : (
          <>
            {/* Top Cards: Location Card & Formation Overview */}
            {(activeTab === 'all' || activeTab === 'formation') && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Location Information Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-3xl p-6 border border-[#E8DCC8] shadow-md relative overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-5 border-b border-[#E8DCC8] pb-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C85A17] to-[#C9A44C] flex items-center justify-center text-white shadow-sm">
                        <FiMapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-[#2B211B]">भौगोलिक एवं प्रशासनिक स्थिति</h3>
                        <p className="text-xs text-[#766A60]">इकाई का स्थान विवरण</p>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                        <span className="text-[#766A60] font-semibold">ग्राम:</span>
                        <span className="text-[#2B211B] font-bold">{unit.village || 'कोणदा'}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                        <span className="text-[#766A60] font-semibold">तहसील:</span>
                        <span className="text-[#2B211B] font-bold">{unit.tehsil || 'कुक्षी'}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                        <span className="text-[#766A60] font-semibold">जिला:</span>
                        <span className="text-[#2B211B] font-bold">{unit.district || 'धार'}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                        <span className="text-[#766A60] font-semibold">राज्य:</span>
                        <span className="text-[#2B211B] font-bold">{unit.state || 'मध्यप्रदेश'}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                        <span className="text-[#766A60] font-semibold">देश:</span>
                        <span className="text-[#2B211B] font-bold">{unit.country || 'भारत'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E8DCC8] text-center">
                    <span className="text-xs font-bold text-[#C85A17]">
                      संलग्न संगठन: {organization.name || 'अखिल भारतीय सिर्वी महासभा मध्यप्रदेश'}
                    </span>
                  </div>
                </motion.div>

                {/* Formation Context & Supervisor Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-3xl p-6 border border-[#E8DCC8] shadow-md lg:col-span-2 relative overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-5 border-b border-[#E8DCC8] pb-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7A2525] to-[#C85A17] flex items-center justify-center text-white shadow-sm">
                        <FiShield className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-[#2B211B]">ग्राम इकाई गठन संदर्भ एवं पर्यवेक्षण</h3>
                        <p className="text-xs text-[#766A60]">नवीन मनोनयन एवं सर्वसम्मत प्रक्रिया</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                      <div className="p-4 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                        <p className="text-xs text-[#766A60] font-semibold mb-1">नियुक्त पर्यवेक्षक</p>
                        <p className="text-base font-bold text-[#2B211B] flex items-center gap-2">
                          <FiUserCheck className="text-[#C85A17] shrink-0" />
                          {unit.supervisor || 'हिरालालजी हम्मड कापसी'}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                        <p className="text-xs text-[#766A60] font-semibold mb-1">चयन प्रक्रिया / पद्धति</p>
                        <p className="text-base font-bold text-green-700 flex items-center gap-2">
                          <FiCheckCircle className="text-green-600 shrink-0" />
                          {unit.selectionMethod || 'सर्वसम्मति से'}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                        <p className="text-xs text-[#766A60] font-semibold mb-1">गठन प्रक्रिया संदर्भ</p>
                        <p className="text-sm font-bold text-[#2B211B]">
                          {unit.formationContext || 'नवीन मनोनयन प्रक्रिया'}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                        <p className="text-xs text-[#766A60] font-semibold mb-1">उपस्थिति एवं सहभागिता</p>
                        <p className="text-xs font-bold text-[#2B211B] leading-relaxed">
                          {(unit.participants && unit.participants.join(' • ')) ||
                            'सिर्वी समाज सकल पंच • समाज के नवयुवक • समाज के वरिष्ठजन'}
                        </p>
                      </div>
                    </div>

                    {/* Official Description Quote Box */}
                    <div className="p-4 rounded-2xl bg-[#FFF8EC] border-l-4 border-[#C85A17] border-y border-r border-[#E8DCC8] shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#C85A17] mb-1.5 flex items-center gap-1.5">
                        <FiInfo className="w-3.5 h-3.5" /> आधिकारिक गठन विवरण
                      </p>
                      <p className="text-sm text-[#2B211B] leading-relaxed italic font-medium">
                        "{unit.description ||
                          'अखिल भारतीय सिर्वी महासभा मध्यप्रदेश के नवीन मनोनयन की प्रक्रिया के तहत कुक्षी तहसील के ग्राम कोणदा में ग्राम इकाई का गठन नियुक्त पर्यवेक्षक हिरालालजी हम्मड कापसी एवं स्थानीय पंचों की उपस्थिति में किया गया। इस अवसर पर पदाधिकारियों एवं प्रतिनिधियों का सर्वसम्मति से चयन किया गया। कार्यक्रम में सिर्वी समाज सकल पंच सहित समाज के नवयुवक एवं वरिष्ठजन उपस्थित रहे।'}"
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* SECTION 01: SAKAL PANCH (सकल पंच) — Always before Gram Unit */}
            {(activeTab === 'all' || activeTab === 'sakal_panch') && (
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DCC8] pb-3">
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#7A2525] flex items-center gap-2.5">
                      <FiShield className="text-[#C85A17]" />
                      01 — सकल पंच
                    </h2>
                    <p className="text-xs sm:text-sm text-[#766A60] font-medium mt-1">
                      समाज की स्थानीय सामाजिक एवं संगठनात्मक व्यवस्था में सकल पंचों की महत्वपूर्ण भूमिका होती है।
                    </p>
                  </div>
                  <span className="self-start sm:self-auto px-3.5 py-1 bg-white border border-[#E8DCC8] rounded-full text-xs font-extrabold text-[#C85A17] shadow-sm">
                    वरिष्ठ पंच मण्डल ({sakalPanchList.length})
                  </span>
                </div>

                {sakalPanchList.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center border border-[#E8DCC8] text-[#766A60]">
                    <p className="text-sm font-bold">सकल पंच की जानकारी शीघ्र उपलब्ध कराई जाएगी।</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                    {sakalPanchList.map((panch, idx) => (
                      <motion.div
                        key={panch._id || idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.06 }}
                        className="bg-white rounded-3xl p-6 text-center border border-[#E8DCC8] hover:border-[#C9A44C]/60 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 relative group flex flex-col justify-between"
                      >
                        <div>
                          {/* Avatar / Icon */}
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7A2525] via-[#C85A17] to-[#C9A44C] p-1 mx-auto mb-4 shadow-lg group-hover:scale-105 transition-transform">
                            {panch.photo ? (
                              <img src={panch.photo} alt={panch.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <div className="w-full h-full bg-[#FFF8EC] rounded-full flex items-center justify-center text-[#7A2525] text-2xl font-black">
                                👑
                              </div>
                            )}
                          </div>

                          {/* Designation Badge */}
                          <div className="inline-block px-3 py-1 bg-[#FFF8EC] border border-[#E8DCC8] rounded-full text-xs font-extrabold text-[#7A2525] mb-3">
                            {panch.designation || 'सकल पंच'}
                          </div>

                          {/* Name */}
                          <h3 className="font-bold text-[#2B211B] text-base leading-snug mb-2">
                            {panch.name}
                          </h3>

                          {panch.village && (
                            <p className="text-xs text-[#766A60] font-semibold flex items-center justify-center gap-1">
                              <FiMapPin className="w-3 h-3 text-[#C85A17]" /> {panch.village}, {panch.tehsil || 'कुक्षी'}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#E8DCC8] text-xs text-[#C85A17] font-bold">
                          सिर्वी समाज सकल पंच
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* SECTION 02: Office Bearers (02 — कोणदा ग्राम इकाई पदाधिकारी) */}
            {(activeTab === 'all' || activeTab === 'office_bearers') && (
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DCC8] pb-3">
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#2B211B] flex items-center gap-2.5">
                      <FiAward className="text-[#C85A17]" />
                      02 — कोणदा ग्राम इकाई पदाधिकारी
                    </h2>
                    <p className="text-xs sm:text-sm text-[#766A60]">
                      सर्वसम्मति से मनोनीत मुख्य नेतृत्व एवं कार्यसमिति
                    </p>
                  </div>
                  <span className="self-start sm:self-auto px-3 py-1 bg-white border border-[#E8DCC8] rounded-full text-xs font-bold text-[#C85A17] shadow-sm">
                    कुल {officeBearers.length} पदाधिकारी
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                  {officeBearers.map((ob, idx) => (
                    <motion.div
                      key={ob._id || idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.06 }}
                      className="bg-white rounded-3xl p-6 text-center border border-[#E8DCC8] hover:border-[#C9A44C]/60 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 relative group flex flex-col justify-between"
                    >
                      <div>
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7A2525] via-[#C85A17] to-[#C9A44C] p-1 mx-auto mb-4 shadow-lg group-hover:scale-105 transition-transform">
                          <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[#7A2525] text-2xl font-black">
                            {ob.name?.charAt(0) || 'प'}
                          </div>
                        </div>

                        {/* Designation Badge */}
                        <div className="inline-block px-3 py-1 bg-[#FFF8EC] border border-[#E8DCC8] rounded-full text-xs font-extrabold text-[#C85A17] mb-3">
                          {ob.designation}
                        </div>

                        {/* Exact Name */}
                        <h3 className="font-bold text-[#2B211B] text-base leading-snug mb-2">
                          {ob.name}
                        </h3>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#E8DCC8] text-xs text-[#766A60] font-semibold">
                        कोणदा ग्राम इकाई
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* SECTION 2: Members (सदस्य) */}
            {(activeTab === 'all' || activeTab === 'members') && (
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DCC8] pb-3">
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#2B211B] flex items-center gap-2.5">
                      <FiUsers className="text-[#C85A17]" />
                      ग्राम इकाई सदस्य
                    </h2>
                    <p className="text-xs sm:text-sm text-[#766A60]">
                      ग्राम कोणदा इकाई के मनोनीत सक्रिय सदस्य
                    </p>
                  </div>
                  <span className="self-start sm:self-auto px-3 py-1 bg-white border border-[#E8DCC8] rounded-full text-xs font-bold text-[#C85A17] shadow-sm">
                    कुल {members.length} सदस्य
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map((m, idx) => (
                    <motion.div
                      key={m._id || idx}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-4 p-5 bg-white rounded-3xl border border-[#E8DCC8] hover:border-[#C9A44C]/60 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C85A17] to-[#C9A44C] flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md">
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-[#2B211B] text-sm sm:text-base leading-snug">
                          {m.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#C85A17]">
                            <FiCheckCircle className="w-3 h-3" /> {m.designation || 'सदस्य'}
                          </span>
                          <span className="text-xs text-[#766A60]">• कोणदा ग्राम इकाई</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* SECTION 3: Representatives (प्रतिनिधि - तहसील, जिला, प्रदेश) */}
            {(activeTab === 'all' || activeTab === 'representatives') && (
              <section className="space-y-8">
                <div className="border-b border-[#E8DCC8] pb-3">
                  <h2 className="text-2xl font-extrabold text-[#2B211B] flex items-center gap-2.5">
                    <FiUserCheck className="text-[#C85A17]" />
                    समाज प्रतिनिधि मण्डल
                  </h2>
                  <p className="text-xs sm:text-sm text-[#766A60]">
                    तहसील, जिला एवं प्रदेश स्तर पर मनोनीत समाज प्रतिनिधि
                  </p>
                </div>

                {/* Sub-section A: Tehsil Representatives (तहसील प्रतिनिधि) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8DCC8] rounded-2xl w-fit shadow-sm">
                    <FiCompass className="text-[#C85A17] w-4 h-4" />
                    <h3 className="font-bold text-sm sm:text-base text-[#2B211B]">
                      तहसील प्रतिनिधि (कुक्षी तहसील) — {tehsilReps.length} प्रतिनिधि
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {tehsilReps.map((rep, idx) => (
                      <motion.div
                        key={rep._id || idx}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-5 bg-white rounded-3xl border border-[#E8DCC8] hover:border-[#C9A44C]/60 transition-all shadow-md flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[#C85A17] bg-[#FFF8EC] px-2.5 py-0.5 rounded-lg border border-[#E8DCC8]">
                              तहसील प्रतिनिधि
                            </span>
                            <span className="text-xs text-[#766A60]">#{idx + 1}</span>
                          </div>
                          <h4 className="font-bold text-[#2B211B] text-sm leading-snug mt-1">
                            {rep.name}
                          </h4>
                        </div>
                        <div className="mt-3 pt-2 border-t border-[#E8DCC8] text-[11px] text-[#766A60]">
                          कुक्षी • धार • मध्यप्रदेश
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Sub-section B: District Representatives (जिला प्रतिनिधि) */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8DCC8] rounded-2xl w-fit shadow-sm">
                    <FiCompass className="text-[#7A2525] w-4 h-4" />
                    <h3 className="font-bold text-sm sm:text-base text-[#2B211B]">
                      जिला प्रतिनिधि (धार जिला) — {districtReps.length} प्रतिनिधि
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {districtReps.map((rep, idx) => (
                      <motion.div
                        key={rep._id || idx}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-5 bg-white rounded-3xl border border-[#E8DCC8] hover:border-[#7A2525]/50 transition-all shadow-md flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[#7A2525] bg-[#FFF8EC] px-2.5 py-0.5 rounded-lg border border-[#E8DCC8]">
                              जिला प्रतिनिधि
                            </span>
                            <span className="text-xs text-[#766A60]">#{idx + 1}</span>
                          </div>
                          <h4 className="font-bold text-[#2B211B] text-sm leading-snug mt-1">
                            {rep.name}
                          </h4>
                        </div>
                        <div className="mt-3 pt-2 border-t border-[#E8DCC8] text-[11px] text-[#766A60]">
                          धार जिला • मध्यप्रदेश
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Sub-section C: State Representative (प्रदेश प्रतिनिधि) */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8DCC8] rounded-2xl w-fit shadow-sm">
                    <FiCompass className="text-[#C85A17] w-4 h-4" />
                    <h3 className="font-bold text-sm sm:text-base text-[#2B211B]">
                      प्रदेश प्रतिनिधि (मध्यप्रदेश राज्य) — {stateReps.length} प्रतिनिधि
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stateReps.map((rep, idx) => (
                      <motion.div
                        key={rep._id || idx}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-6 bg-gradient-to-br from-[#FFF8EC] to-[#FAF1E0] rounded-3xl border border-[#E8DCC8] shadow-md flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-black text-white bg-[#7A2525] px-3 py-1 rounded-xl shadow-sm">
                              प्रदेश प्रतिनिधि
                            </span>
                            <span className="text-xs text-[#766A60]">अखिल भारतीय सिर्वी महासभा</span>
                          </div>
                          <h4 className="font-extrabold text-[#2B211B] text-base leading-snug">
                            {rep.name}
                          </h4>
                        </div>
                        <div className="mt-4 pt-2 border-t border-[#E8DCC8] text-xs text-[#766A60] font-semibold">
                          अखिल भारतीय सिर्वी महासभा मध्यप्रदेश
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 4: Formation Ceremony / Event Details */}
            {(activeTab === 'all' || activeTab === 'formation') && (
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCC8] shadow-md relative overflow-hidden text-[#2B211B]">
                <div className="flex items-center gap-3 mb-6 border-b border-[#E8DCC8] pb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7A2525] to-[#C85A17] flex items-center justify-center text-white shadow-md">
                    <FiCalendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#2B211B]">
                      {formationEvent.title || 'कोणदा ग्राम इकाई गठन समारोह'}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#766A60]">
                      {formationEvent.eventType || 'ग्राम इकाई गठन / नवीन मनोनयन'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="p-4 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                    <span className="text-xs text-[#766A60] font-semibold block mb-1">स्थान</span>
                    <span className="text-sm font-bold text-[#2B211B]">
                      {formationEvent.location || 'ग्राम कोणदा, तहसील कुक्षी, मध्यप्रदेश'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                    <span className="text-xs text-[#766A60] font-semibold block mb-1">नियुक्त पर्यवेक्षक</span>
                    <span className="text-sm font-bold text-[#2B211B]">
                      {formationEvent.supervisor || 'हिरालालजी हम्मड कापसी'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                    <span className="text-xs text-[#766A60] font-semibold block mb-1">चयन प्रक्रिया</span>
                    <span className="text-sm font-bold text-green-700">
                      {formationEvent.selectionMethod || 'सर्वसम्मति से'}
                    </span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60 text-sm leading-relaxed text-[#766A60] font-medium">
                  <h4 className="font-bold text-[#7A2525] text-sm uppercase tracking-wider mb-2">
                    कार्यक्रम विवरण एवं सकल पंच उपस्थिति
                  </h4>
                  <p>
                    {formationEvent.description ||
                      'अखिल भारतीय सिर्वी महासभा मध्यप्रदेश के नवीन मनोनयन की प्रक्रिया के तहत कुक्षी तहसील के ग्राम कोणदा में ग्राम इकाई का गठन नियुक्त पर्यवेक्षक हिरालालजी हम्मड कापसी एवं स्थानीय पंचों की उपस्थिति में किया गया। इस अवसर पर पदाधिकारियों एवं प्रतिनिधियों का सर्वसम्मति से चयन किया गया। कार्यक्रम में सिर्वी समाज सकल पंच सहित समाज के नवयुवक एवं वरिष्ठजन उपस्थित रहे।'}
                  </p>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default KondaGramUnitPage;
