import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiUsers, FiMapPin, FiPhone } from 'react-icons/fi';
import { familyAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const FamilyCard = ({ family }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:border-orange-200 dark:hover:border-orange-500/30 hover:-translate-y-1 transition-all duration-300"
  >
    <div className="flex items-start gap-4">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-orange-500/20 shrink-0">
        {family.familyPhoto ? (
          <img src={family.familyPhoto} alt="Family" className="w-full h-full rounded-2xl object-cover" />
        ) : (
          family.surname?.charAt(0) || 'F'
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-gray-900 dark:text-white">{family.headOfFamily}</p>
            <p className="text-orange-500 text-sm font-medium">{family.surname} Family</p>
          </div>
          <span className="shrink-0 text-xs px-2.5 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-full font-medium">
            ID: {family.familyId}
          </span>
        </div>
        <div className="mt-3 space-y-1.5">
          {family.village && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
              <FiMapPin className="w-3.5 h-3.5 text-orange-400" />
              {[family.village, family.district, family.state].filter(Boolean).join(', ')}
            </div>
          )}
          {family.mobileNumber && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
              <FiPhone className="w-3.5 h-3.5 text-orange-400" />
              {family.mobileNumber}
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
            <FiUsers className="w-3.5 h-3.5 text-orange-400" />
            {family.numberOfMembers || 0} members
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const FamilyDirectoryPage = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchFamilies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await familyAPI.getAll({ page, limit: 12, search, status: 'active' });
      setFamilies(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchFamilies(); }, [fetchFamilies]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-700 py-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/20 border border-white/30 rounded-full text-sm font-medium mb-4">
              Community Directory
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3">Family Directory</h1>
            <p className="text-orange-100 text-lg">Explore all registered families of Shri Seervi Samaj Konda</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search bar */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-xl">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by family name, head of family..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 shadow-sm transition-all"
            />
          </div>
          {!loading && (
            <p className="text-gray-500 dark:text-gray-400 text-sm shrink-0">
              {total} families found
            </p>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : families.length === 0 ? (
          <EmptyState
            icon={FiUsers}
            title="No families found"
            description={search ? `No results for "${search}"` : 'No families registered yet.'}
          />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {families.map((family) => (
                <FamilyCard key={family._id} family={family} />
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default FamilyDirectoryPage;
