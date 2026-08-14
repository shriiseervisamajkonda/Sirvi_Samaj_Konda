import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBook, FiSearch, FiCalendar, FiUsers, FiChevronDown, FiChevronUp, FiFileText, FiCheckCircle } from 'react-icons/fi';
import { panchSettlementAPI } from '../../services/api';
import { SkeletonList } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const PanchSettlementsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await panchSettlementAPI.getPublic({ search, limit: 100 });
      setItems(res.data.data || []);
    } catch (err) {
      console.error('Failed to load panch settlements', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
              स्थानीय न्यायिक समाधान
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3">पंचों द्वारा न्यायिक समझौतों का रिकॉर्ड</h1>
            <p className="text-[#FFF3DD] text-lg font-medium opacity-90">पंचों द्वारा आपसी सहमति से सुलझाए गए सामाजिक व पारिवारिक विवादों का ब्यौरा</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search */}
        <div className="relative mb-10">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#CDBBA4]/55 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="केस का नाम, पक्षकार या पंचों के नाम से खोजें (Search)..."
            className="w-full pl-12 pr-4 py-3.5 bg-[#2A1010] border border-[#D4AF37]/15 text-[#FFF3DD] rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all text-base font-semibold"
          />
        </div>

        {loading ? (
          <SkeletonList items={5} />
        ) : items.length === 0 ? (
          <EmptyState icon={FiBook} title="कोई रिकॉर्ड नहीं मिला" description="वर्तमान में कोई भी समझौता रिकॉर्ड दर्ज नहीं है।" />
        ) : (
          <div className="space-y-4">
            {items.map((item, i) => {
              const isExpanded = expandedId === item._id;
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#2A1010] rounded-2xl border border-[#D4AF37]/15 shadow-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpand(item._id)}
                    className="w-full text-left p-6 flex items-start justify-between gap-4 cursor-pointer"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#3F7655]/20 text-[#3F7655]">
                          <FiCheckCircle className="w-3.5 h-3.5" />
                          सुलझाया गया (Resolved)
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[#CDBBA4] font-semibold">
                          <FiCalendar className="w-3 h-3 text-[#C85A17]" />
                          {new Date(item.settlementDate).toLocaleDateString('hi-IN')}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-[#FFF3DD]">
                        {item.title}
                      </h3>
                      <p className="text-sm text-[#CDBBA4]">
                        <strong>पक्षकार (Parties):</strong> <span className="font-bold text-[#FFF3DD]">{item.parties}</span>
                      </p>
                    </div>
                    <div className="text-[#CDBBA4] mt-2 shrink-0">
                      {isExpanded ? <FiChevronUp className="w-6 h-6" /> : <FiChevronDown className="w-6 h-6" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-[#D4AF37]/10 bg-[#160D08]/50"
                      >
                        <div className="p-6 space-y-4 text-[#CDBBA4] text-sm md:text-base leading-relaxed">
                          <div>
                            <h4 className="font-bold text-[#D4AF37] mb-2 text-sm uppercase tracking-wider">समझौते / निर्णय का विवरण (Settlement Details)</h4>
                            <p className="whitespace-pre-line bg-[#2A1010] p-4 rounded-xl border border-[#D4AF37]/10 text-sm font-semibold text-[#FFF3DD] leading-relaxed">
                              {item.description}
                            </p>
                          </div>

                          {item.panchs && (
                            <div className="flex items-start gap-2 pt-2 border-t border-[#D4AF37]/5">
                              <FiUsers className="w-5 h-5 text-[#C85A17] shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-[#D4AF37] text-sm uppercase tracking-wider">मध्यस्थता करने वाले पंच (Panch arbitrators):</span>
                                <p className="text-[#FFF3DD] font-semibold mt-1 text-sm">{item.panchs}</p>
                              </div>
                            </div>
                          )}

                          {item.documents && item.documents.length > 0 && (
                            <div className="pt-2 border-t border-[#D4AF37]/5">
                              <span className="font-bold text-[#D4AF37] text-sm uppercase tracking-wider block mb-2">दस्तावेज़ / समझौता पत्रक (Documents):</span>
                              <div className="flex flex-wrap gap-2">
                                {item.documents.map((doc, idx) => (
                                  <a
                                    key={idx}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7A2525]/30 text-[#D4AF37] hover:bg-[#7A2525]/60 rounded-lg text-xs font-bold border border-[#D4AF37]/15 transition-colors"
                                  >
                                    <FiFileText className="w-3.5 h-3.5" />
                                    {doc.name || `दस्तावेज़ ${idx + 1}`}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PanchSettlementsPage;
