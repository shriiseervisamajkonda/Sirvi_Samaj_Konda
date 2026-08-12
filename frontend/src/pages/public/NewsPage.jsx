import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiSearch } from 'react-icons/fi';
import { newsAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
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
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 py-16 text-white relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3">News & Announcements</h1>
            <p className="text-blue-100 text-lg">Stay updated with the latest from our community</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search news..."
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-sm"
            />
          </div>
          {!loading && <p className="text-gray-500 text-sm shrink-0">{total} articles</p>}
        </div>

        {loading ? <LoadingSpinner /> : news.length === 0 ? (
          <EmptyState icon={FiFileText} title="No news found" description="No articles have been published yet." />
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
                  className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {item.image && (
                    <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
                  )}
                  {!item.image && (
                    <div className="h-32 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-4xl">📰</div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant={categoryColors[item.category] || 'default'} size="xs">
                        {item.category || 'News'}
                      </Badge>
                      <span className="text-gray-400 text-xs ml-auto">
                        {new Date(item.createdAt || item.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <h2 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{item.title}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3">
                      {item.excerpt || item.content?.replace(/<[^>]*>/g, '').substring(0, 150)}...
                    </p>
                    {item.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {item.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-lg">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
