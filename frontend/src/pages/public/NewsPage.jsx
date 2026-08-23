import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiSearch } from 'react-icons/fi';
import { newsAPI } from '../../services/api';
import { SkeletonCardGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';

const categoryColors = {
  'news': 'primary', 'announcement': 'success', 'notice': 'warning', 'emergency': 'danger', 'update': 'info',
};

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    newsAPI.getAll({ page, limit: 9, search, status: 'published' })
      .then(res => {
        setNews(res.data.data || []);
        setTotalPages(res.data.pagination?.pages || 1);
        setTotal(res.data.pagination?.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search]);

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
              सूचना एवं समाचार
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3">समाचार और घोषणाएँ</h1>
            <p className="text-[#FFF3DD] text-lg font-medium opacity-90">सिर्वी समाज कोणदा की गतिविधियों और समाचारों से जुड़े रहें</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-[#D4AF37]/10 pb-6">
          <div className="relative flex-1 max-w-md w-full">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#CDBBA4]/60" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="खोजें (Search news)..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#2A1010] border border-[#D4AF37]/15 rounded-xl text-sm text-[#FFF3DD] placeholder-[#CDBBA4]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 shadow-inner"
            />
          </div>
          {!loading && <p className="text-[#CDBBA4] text-sm font-semibold shrink-0">{total} लेख (Articles)</p>}
        </div>

        {loading ? (
          <SkeletonCardGrid count={6} cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
        ) : news.length === 0 ? (
          <EmptyState icon={FiFileText} title="कोई समाचार नहीं मिला" description="वर्तमान में कोई समाचार प्रकाशित नहीं किया गया है।" />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item, i) => (
                <motion.article
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#2A1010] rounded-2xl overflow-hidden border border-[#D4AF37]/15 hover:border-[#D4AF37]/45 hover:shadow-2xl transition-all duration-300 flex flex-col shadow-lg"
                >
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-48 object-cover border-b border-[#D4AF37]/10" />
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-[#C85A17] to-[#7A2525] flex items-center justify-center text-5xl border-b border-[#D4AF37]/10">📰</div>
                  )}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant={categoryColors[item.category] || 'default'} size="xs">
                          {item.category || 'News'}
                        </Badge>
                        <span className="text-[#CDBBA4] text-xs font-semibold ml-auto">
                          {new Date(item.createdAt || item.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <h2 className="font-bold text-[#FFF3DD] text-base mb-2 line-clamp-2 leading-tight">{item.title}</h2>
                      <p className="text-[#CDBBA4]/90 text-sm line-clamp-3 leading-relaxed mb-4">
                        {item.excerpt || item.content?.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </p>
                    </div>
                    {item.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-[#D4AF37]/10">
                        {item.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs text-[#D4AF37] bg-[#7A2525]/30 px-2 py-0.5 rounded-lg border border-[#D4AF37]/10">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
            <div className="mt-12 flex justify-center">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
