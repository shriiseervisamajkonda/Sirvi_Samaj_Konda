import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiSearch, FiFileText, FiInfo, FiAward } from 'react-icons/fi';
import { socialInfoAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const SocialInfoPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const categories = [
    { id: 'all', label: 'सभी (All)' },
    { id: 'rules', label: 'समाज नियमावली (Rules)' },
    { id: 'customs', label: 'रीति-रिवाज (Customs)' },
    { id: 'reforms', label: 'सामाजिक सुधार (Reforms)' },
    { id: 'history', label: 'इतिहास (History)' },
    { id: 'general', label: 'अन्य सामान्य जानकारी (General)' },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, limit: 100 };
      if (activeCategory !== 'all') {
        params.category = activeCategory;
      }
      const res = await socialInfoAPI.getPublic(params);
      setItems(res.data.data || []);
    } catch (err) {
      console.error('Failed to load social information', err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-800 py-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/20 border border-white/30 rounded-full text-sm font-medium mb-4">
              संस्कृति, संस्कार व नियम
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3">सीरवी समाज सामाजिक जानकारी</h1>
            <p className="text-purple-100 text-lg">हमारे समाज के नियम, रीति-रिवाज, इतिहास एवं सुधार सम्बन्धी महत्वपूर्ण मार्गदर्शिका</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category filters & search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-6 mb-8">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="शीर्षक या विवरण से खोजें..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Content lists */}
        {loading ? (
          <LoadingSpinner />
        ) : items.length === 0 ? (
          <EmptyState icon={FiBookOpen} title="जानकारी उपलब्ध नहीं" description="इस श्रेणी में कोई सामाजिक जानकारी दर्ज नहीं की गई है।" />
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {items.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all duration-300"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
                      {item.category === 'rules' && <FiBookOpen className="w-5 h-5" />}
                      {item.category === 'reforms' && <FiAward className="w-5 h-5" />}
                      {item.category === 'customs' && <FiInfo className="w-5 h-5" />}
                      {['history', 'general'].includes(item.category) && <FiFileText className="w-5 h-5" />}
                    </span>
                    <span className="text-xs font-bold text-purple-500 dark:text-purple-400 uppercase tracking-wider">
                      {categories.find(c => c.id === item.category)?.label || item.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base whitespace-pre-line leading-relaxed mb-4">
                    {item.content}
                  </p>
                </div>

                {item.attachments && item.attachments.length > 0 && (
                  <div className="border-t border-gray-100 dark:border-slate-700 pt-4 mt-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">डाउनलोड / दस्तावेज (Attachments)</p>
                    <div className="flex flex-wrap gap-2">
                      {item.attachments.map((file, fIdx) => (
                        <a
                          key={fIdx}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 dark:bg-slate-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <FiFileText className="w-3.5 h-3.5 text-red-500" />
                          {file.name || 'दस्तावेज'}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialInfoPage;
