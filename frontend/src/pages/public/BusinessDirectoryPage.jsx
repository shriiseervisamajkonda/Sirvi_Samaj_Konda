import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBriefcase, FiSearch, FiPhone, FiMapPin, FiUser } from 'react-icons/fi';
import { businessAPI } from '../../services/api';
import { SkeletonCardGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';

const categories = ['सभी (All)', 'कृषि (Agriculture)', 'व्यापार / दुकान (Business)', 'सेवा / नौकरी (Job / Service)', 'ड्राइविंग / परिवहन (Transport)', 'कारीगरी / कौशल (Skilled)'];

const BusinessDirectoryPage = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('सभी (All)');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const filterCat = category === 'सभी (All)' ? undefined : category.split(' ')[0];
    const params = { page, limit: 12, search, category: filterCat };
    businessAPI.getAll(params)
      .then(res => {
        setBusinesses(res.data.data || []);
        setTotalPages(res.data.pagination?.pages || 1);
        setTotal(res.data.pagination?.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, category]);

  return (
    <div className="bg-[#160D08] min-h-screen text-[#FFF3DD]">
      {/* Header Banner */}
      <div className="relative py-20 text-white overflow-hidden border-b border-[#D4AF37]/20">
        <div className="absolute inset-0">
          <img src="/hero_background.webp" alt="Header Background" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/10 border border-[#D4AF37]/35 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              व्यापार एवं व्यवसाय निर्देशिका
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3">व्यापार निर्देशिका (Business Directory)</h1>
            <p className="text-[#FFF3DD] text-lg font-medium opacity-90">
              श्री सिर्वी समाज कोणदा के उद्यमी, व्यापारी, किसान एवं स्वरोजगार बंधु
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="mb-8 space-y-4 border-b border-[#D4AF37]/10 pb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative max-w-md w-full">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#CDBBA4]/55" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="व्यवसाय या स्वामी का नाम खोजें..."
                className="w-full pl-12 pr-4 py-3 bg-[#2A1010] border border-[#D4AF37]/15 rounded-2xl text-[#FFF3DD] placeholder-[#CDBBA4]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] font-medium"
              />
            </div>
            {!loading && <p className="text-[#CDBBA4] text-sm font-semibold">{total} कुल पंजीकृत व्यवसाय/व्यवसायी</p>}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  category === cat
                    ? 'bg-[#C85A17] border-[#D4AF37] text-white shadow-md'
                    : 'bg-[#2A1010] border-[#D4AF37]/15 text-[#CDBBA4] hover:border-[#D4AF37]/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <SkeletonCardGrid count={6} cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
        ) : businesses.length === 0 ? (
          <EmptyState icon={FiBriefcase} title="कोई व्यवसाय रिकॉर्ड नहीं मिला" description="व्यापार सूची शीघ्र उपलब्ध होगी।" />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {businesses.map((biz, i) => (
                <motion.div
                  key={biz.id || biz._id || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 12) * 0.04 }}
                  className="bg-[#2A1010] rounded-2xl p-6 border border-[#D4AF37]/15 hover:border-[#D4AF37]/45 hover:shadow-2xl transition-all duration-300 shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7A2525] to-[#C85A17] p-0.5 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-md">
                        <div className="w-full h-full bg-[#160D08] rounded-2xl flex items-center justify-center text-[#D4AF37]">
                          <FiBriefcase className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-[#FFF3DD] text-base truncate">{biz.ownerName || biz.businessName}</h3>
                        <span className="inline-block mt-1 px-2.5 py-0.5 bg-[#160D08] border border-[#D4AF37]/20 rounded-lg text-xs font-bold text-amber-300">
                          {biz.category || 'व्यवसाय'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#D4AF37]/10 text-xs text-[#CDBBA4]">
                      {biz.address && (
                        <div className="flex items-start gap-1.5">
                          <FiMapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#D4AF37]" />
                          <span className="line-clamp-1">{biz.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {biz.phone && (
                    <div className="mt-4 pt-3 border-t border-[#D4AF37]/10 flex items-center justify-between">
                      <a href={`tel:${biz.phone}`} className="flex items-center gap-1.5 text-amber-400 text-xs font-bold hover:text-amber-300 transition-colors">
                        <FiPhone className="w-3.5 h-3.5" /> {biz.phone}
                      </a>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            <div className="mt-8">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BusinessDirectoryPage;
