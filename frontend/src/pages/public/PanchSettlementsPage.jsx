import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBook, FiSearch, FiCalendar, FiUsers, FiChevronDown, FiChevronUp, FiFileText, FiCheckCircle } from 'react-icons/fi';
import { panchSettlementAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
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
    <div className="bg-white dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 py-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/20 border border-white/30 rounded-full text-sm font-medium mb-4">
              स्थानीय न्यायिक समाधान
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3">पंचों द्वारा न्यायिक समझौतों का रिकॉर्ड</h1>
            <p className="text-blue-100 text-lg">पंचों द्वारा आपसी सहमति से सुलझाए गए सामाजिक व पारिवारिक विवादों का ब्यौरा</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search */}
        <div className="relative mb-10">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="केस का नाम, पक्षकार या पंचों के नाम से खोजें..."
            className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
          />
        </div>

        {loading ? (
          <LoadingSpinner />
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
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpand(item._id)}
                    className="w-full text-left p-6 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <FiCheckCircle className="w-3.5 h-3.5" />
                          सुलझाया गया (Resolved)
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <FiCalendar className="w-3 h-3" />
                          {new Date(item.settlementDate).toLocaleDateString('hi-IN')}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>पक्षकार (Parties):</strong> {item.parties}
                      </p>
                    </div>
                    <div className="text-gray-400 dark:text-gray-500 mt-2">
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
                        className="border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50"
                      >
                        <div className="p-6 space-y-4 text-gray-700 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">समझौते / निर्णय का विवरण (Settlement Details)</h4>
                            <p className="whitespace-pre-line bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
                              {item.description}
                            </p>
                          </div>

                          {item.panchs && (
                            <div className="flex items-start gap-2 pt-2">
                              <FiUsers className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-gray-900 dark:text-white">मध्यस्थता करने वाले पंच (Panch arbitrators):</span>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">{item.panchs}</p>
                              </div>
                            </div>
                          )}

                          {item.documents && item.documents.length > 0 && (
                            <div className="pt-2">
                              <span className="font-bold text-gray-900 dark:text-white block mb-2">दस्तावेज़ / समझौता पत्रक (Documents):</span>
                              <div className="flex flex-wrap gap-2">
                                {item.documents.map((doc, idx) => (
                                  <a
                                    key={idx}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-lg text-xs font-semibold transition-colors"
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
