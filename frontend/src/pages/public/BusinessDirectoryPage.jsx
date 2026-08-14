import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBriefcase, FiSearch, FiPhone, FiGlobe, FiMapPin } from 'react-icons/fi';
import { businessAPI } from '../../services/api';
import { SkeletonCardGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';

const categories = ['All', 'Agriculture', 'Retail', 'Manufacturing', 'Services', 'Education', 'Healthcare', 'Technology', 'Food & Beverage', 'Construction', 'Transport'];

const BusinessDirectoryPage = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12, search, status: 'active' };
    if (category !== 'All') params.category = category;
    businessAPI.getAll(params)
      .then(res => {
        setBusinesses(res.data.data || []);
        setTotalPages(res.data.pagination?.pages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, category]);

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen">
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 py-16 text-white relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3">Business Directory</h1>
            <p className="text-purple-100 text-lg">Discover businesses owned by our community members</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search businesses..."
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 shadow-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  category === cat ? 'bg-purple-500 border-purple-500 text-white' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-purple-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? <SkeletonCardGrid count={6} cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" /> : businesses.length === 0 ? (
          <EmptyState icon={FiBriefcase} title="No businesses found" description="Business listings will be available soon." />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {businesses.map((biz, i) => (
                <motion.div
                  key={biz._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                      {biz.businessPhoto ? <img src={biz.businessPhoto} alt={biz.businessName} className="w-full h-full rounded-2xl object-cover" /> : biz.businessName?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">{biz.businessName}</h3>
                      <Badge variant="purple" size="xs">{biz.category}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {biz.ownerName && <p className="text-gray-500 dark:text-gray-400 text-sm">👤 {biz.ownerName}</p>}
                    {biz.address && (
                      <div className="flex items-start gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
                        <FiMapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-purple-400" />
                        <span className="line-clamp-1">{biz.address}</span>
                      </div>
                    )}
                    <div className="flex gap-3 mt-3">
                      {biz.phone && (
                        <a href={`tel:${biz.phone}`} className="flex items-center gap-1 text-purple-500 text-xs hover:text-purple-700 transition-colors">
                          <FiPhone className="w-3 h-3" /> {biz.phone}
                        </a>
                      )}
                      {biz.website && (
                        <a href={biz.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 text-xs hover:underline">
                          <FiGlobe className="w-3 h-3" /> Website
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default BusinessDirectoryPage;
