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
              संस्कृति, संस्कार व नियम
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3">सीरवी समाज सामाजिक जानकारी</h1>
            <p className="text-[#FFF3DD] text-lg font-medium opacity-90">हमारे समाज के नियम, रीति-रिवाज, इतिहास एवं सुधार सम्बन्धी महत्वपूर्ण मार्गदर्शिका</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category filters & search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#D4AF37]/10 pb-6 mb-8">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#7A2525] border-[#D4AF37]/40 text-[#D4AF37] shadow-lg'
                    : 'bg-[#2A1010] border-[#D4AF37]/15 text-[#CDBBA4] hover:border-[#D4AF37]/45'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#CDBBA4]/55 w-4.5 h-4.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="शीर्षक या विवरण से खोजें..."
              className="w-full pl-9 pr-4 py-2 bg-[#2A1010] border border-[#D4AF37]/15 rounded-xl text-sm text-[#FFF3DD] placeholder-[#CDBBA4]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all font-medium"
            />
          </div>
        </div>

        {/* Content lists */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
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
                className="bg-[#2A1010] rounded-2xl p-6 border border-[#D4AF37]/15 hover:border-[#D4AF37]/40 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3 border-b border-[#D4AF37]/10 pb-3">
                    <span className="p-2 bg-[#7A2525]/30 text-[#D4AF37] rounded-xl">
                      {item.category === 'rules' && <FiBookOpen className="w-5 h-5" />}
                      {item.category === 'reforms' && <FiAward className="w-5 h-5" />}
                      {item.category === 'customs' && <FiInfo className="w-5 h-5" />}
                      {['history', 'general'].includes(item.category) && <FiFileText className="w-5 h-5" />}
                    </span>
                    <span className="text-xs font-bold text-[#C85A17] uppercase tracking-wider">
                      {categories.find(c => c.id === item.category)?.label || item.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#FFF3DD] mb-2">{item.title}</h3>
                  <p className="text-[#CDBBA4] text-sm whitespace-pre-line leading-relaxed mb-4 font-semibold">
                    {item.content}
                  </p>
                </div>

                {item.attachments && item.attachments.length > 0 && (
                  <div className="border-t border-[#D4AF37]/10 pt-4 mt-2">
                    <p className="text-xs font-bold text-[#CDBBA4] uppercase tracking-wider mb-2">डाउनलोड / दस्तावेज (Attachments)</p>
                    <div className="flex flex-wrap gap-2">
                      {item.attachments.map((file, fIdx) => (
                        <a
                          key={fIdx}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#160D08] text-[#CDBBA4] hover:text-[#D4AF37] hover:bg-[#7A2525]/30 rounded-lg text-xs font-bold border border-[#D4AF37]/15 transition-all"
                        >
                          <FiFileText className="w-3.5 h-3.5 text-[#C85A17]" />
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
