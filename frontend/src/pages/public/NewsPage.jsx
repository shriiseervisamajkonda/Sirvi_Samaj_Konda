import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFileText, FiSearch, FiCalendar, FiTag, FiX, FiArrowRight, FiClock } from 'react-icons/fi';
import { newsAPI } from '../../services/api';
import { SkeletonCardGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import { useSiteSettings } from '../../context/SiteSettingsContext';

// TODO: This is mock/fallback data. Remove when actual data is filled in the database.
import fallbackNews from '../../data/mock/newsFallback.json';

const categoryLabels = {
  news: 'समाचार (News)',
  announcement: 'घोषणा (Announcement)',
  notice: 'सूचना (Notice)',
  emergency: 'महत्वपूर्ण (Alert)',
  update: 'अपडेट (Update)',
  obituary: 'शोक संदेश (Obituary)',
  social: 'सामाजिक (Social)',
  general: 'सामान्य (General)',
};

const categoryBadgeVariants = {
  news: 'primary',
  announcement: 'success',
  notice: 'warning',
  emergency: 'danger',
  update: 'info',
  obituary: 'neutral',
  social: 'secondary',
  general: 'default',
};

const getNewsImage = (item) => {
  if (!item) return '/hero_background.webp';
  if (typeof item.image_url === 'string' && item.image_url.trim()) return item.image_url;
  if (typeof item.image === 'string' && item.image.trim()) return item.image;
  if (typeof item.photo_url === 'string' && item.photo_url.trim()) return item.photo_url;
  if (typeof item.banner_url === 'string' && item.banner_url.trim()) return item.banner_url;
  if (typeof item.imageUrl === 'string' && item.imageUrl.trim()) return item.imageUrl;
  if (Array.isArray(item.images) && item.images.length > 0) {
    const first = item.images[0];
    if (typeof first === 'string' && first.trim()) return first;
    if (first && typeof first.url === 'string' && first.url.trim()) return first.url;
  }
  return '/hero_background.webp';
};

const NewsPage = () => {
  const [news, setNews] = useState(fallbackNews);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const { heroBgUrl } = useSiteSettings();

  useEffect(() => {
    setLoading(true);
    newsAPI
      .getAll({ page, limit: 9, search, status: 'published' })
      .then((res) => {
        const fetched = res.data?.data || [];
        setNews(fetched.length > 0 ? fetched : fallbackNews);
        setTotalPages(res.data.pagination?.pages || 1);
        setTotal(res.data.pagination?.total || fetched.length || fallbackNews.length);
      })
      .catch((err) => {
        console.warn('Failed to load news, using fallback:', err);
        setNews(fallbackNews);
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  return (
    <div className="bg-[#FFF8EC] min-h-screen text-[#2B211B]">
      {/* Header Banner */}
      <div className="relative py-20 text-white overflow-hidden border-b border-[#E8DCC8] bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]">
        {/* Background image overlay */}
        <div className="absolute inset-0">
          <img
            src={heroBgUrl || '/hero_background.webp'}
            alt="Header Background"
            className="w-full h-full object-cover opacity-20"
            onError={(e) => { e.currentTarget.src = '/hero_background.webp'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/20 border border-amber-400/30 rounded-full text-xs font-bold uppercase tracking-wider mb-4 text-white shadow-sm">
              सूचना एवं समाचार
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3 text-white">
              समाचार और घोषणाएँ
            </h1>
            <p className="text-orange-100 text-base sm:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              श्री सिर्वी समाज कोणदा की गतिविधियों, निर्णयों, सूचनाओं और समाचारों से निरंतर जुड़े रहें
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar & Filter */}
        <div className="mb-10 flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-[#E8DCC8] pb-6">
          <div className="relative flex-1 max-w-md w-full">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#766A60]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="समाचार या घोषणा खोजें..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#E8DCC8] rounded-2xl text-sm font-semibold text-[#2B211B] placeholder-[#766A60]/60 focus:outline-none focus:border-[#C85A17] focus:ring-2 focus:ring-[#C85A17]/20 shadow-sm"
            />
          </div>
          {!loading && (
            <p className="text-[#766A60] text-sm font-bold shrink-0">
              कुल {total} लेख (Articles)
            </p>
          )}
        </div>

        {loading ? (
          <SkeletonCardGrid count={6} cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
        ) : news.length === 0 ? (
          <EmptyState
            icon={FiFileText}
            title="कोई समाचार नहीं मिला"
            description="वर्तमान में कोई समाचार प्रकाशित नहीं किया गया है।"
          />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item, i) => {
                const imgSrc = getNewsImage(item);
                const d = new Date(item.created_at || item.createdAt || item.publishedAt || Date.now());

                return (
                  <motion.article
                    key={item.id || item._id || i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 9) * 0.05 }}
                    className="bg-white rounded-3xl overflow-hidden border border-[#E8DCC8] hover:border-[#C9A44C]/70 hover:shadow-2xl transition-all duration-300 flex flex-col shadow-md group cursor-pointer"
                    onClick={() => setSelectedArticle(item)}
                  >
                    {/* Image Header */}
                    <div className="relative w-full h-52 overflow-hidden bg-[#FAF1E0]">
                      <img
                        src={imgSrc}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/hero_background.webp';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge variant={categoryBadgeVariants[item.category] || 'default'} size="sm">
                          {categoryLabels[item.category] || item.category || 'समाचार'}
                        </Badge>
                      </div>

                      {/* Date Badge */}
                      <div className="absolute bottom-3 left-4 text-white text-xs font-semibold flex items-center gap-1.5 drop-shadow-md">
                        <FiCalendar className="w-3.5 h-3.5 text-amber-300" />
                        <span>
                          {d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-extrabold text-[#2B211B] text-lg sm:text-xl leading-snug group-hover:text-[#C85A17] transition-colors mb-2 line-clamp-2">
                          {item.title}
                        </h3>

                        <p className="text-[#554A42] text-sm leading-relaxed line-clamp-3 font-medium">
                          {item.excerpt || item.content}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#E8DCC8]/60 flex items-center justify-between">
                        <span className="text-xs font-bold text-[#C85A17] group-hover:text-[#7A2525] transition-colors flex items-center gap-1">
                          पूरा पढ़ें (Read More) <FiArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(p) => {
                    setPage(p);
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Full Article Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E8DCC8] shadow-2xl p-6 sm:p-8 relative space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-[#FAF1E0] hover:bg-[#E8DCC8] text-[#2B211B] transition cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>

              <div className="relative rounded-2xl overflow-hidden h-64 bg-[#FAF1E0]">
                <img
                  src={getNewsImage(selectedArticle)}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/hero_background.webp';
                  }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={categoryBadgeVariants[selectedArticle.category] || 'default'} size="sm">
                  {categoryLabels[selectedArticle.category] || selectedArticle.category || 'समाचार'}
                </Badge>
                <span className="text-xs font-semibold text-[#766A60] flex items-center gap-1">
                  <FiCalendar className="w-3.5 h-3.5 text-[#C85A17]" />
                  {new Date(selectedArticle.created_at || selectedArticle.createdAt || Date.now()).toLocaleDateString('hi-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#7A2525] leading-snug">
                {selectedArticle.title}
              </h2>

              <div className="text-sm sm:text-base leading-relaxed text-[#2B211B] space-y-4 font-medium whitespace-pre-line border-t border-[#E8DCC8] pt-4">
                {selectedArticle.content || selectedArticle.excerpt}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewsPage;
