import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiUsers, FiMapPin, FiPhone } from 'react-icons/fi';
import { familyAPI } from '../../services/api';
import { SkeletonCardGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const FamilyCard = ({ family }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="bg-white rounded-3xl p-6 border border-[#E8DCC8] shadow-md hover:shadow-xl hover:border-[#C9A44C]/50 hover:-translate-y-1 transition-all duration-300"
  >
    <div className="flex items-start gap-4">
      <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#C85A17] to-[#C9A44C] text-white text-lg font-bold shadow-lg shadow-orange-500/10 shrink-0 bg-white">
        {family.familyPhoto ? (
          <img src={family.familyPhoto} alt="Family" className="w-full h-full object-cover" />
        ) : (
          family.surname?.charAt(0) || 'F'
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-[#2B211B] text-base leading-tight">{family.headOfFamily}</p>
            <p className="text-[#C85A17] text-xs font-semibold mt-0.5">{family.surname} परिवार</p>
          </div>
          <span className="shrink-0 text-[10px] px-2 py-0.5 bg-[#FFF8EC] border border-[#E8DCC8] text-[#C85A17] rounded-full font-bold">
            ID: {family.familyId}
          </span>
        </div>
        <div className="mt-4 space-y-1.5 border-t border-[#E8DCC8]/40 pt-3 text-xs">
          {family.village && (
            <div className="flex items-center gap-2 text-[#766A60] font-medium">
              <FiMapPin className="w-3.5 h-3.5 text-[#C9A44C]" />
              {[family.village, family.district, family.state].filter(Boolean).join(', ')}
            </div>
          )}
          {family.mobileNumber && (
            <div className="flex items-center gap-2 text-[#766A60] font-medium">
              <FiPhone className="w-3.5 h-3.5 text-[#C9A44C]" />
              {family.mobileNumber}
            </div>
          )}
          <div className="flex items-center gap-2 text-[#766A60] font-medium">
            <FiUsers className="w-3.5 h-3.5 text-[#C9A44C]" />
            {family.numberOfMembers || 0} सदस्य (Members)
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
      console.error('Failed to fetch families:', err);
      setFamilies([]); // Fallback to prevent rendering crashes
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchFamilies();
  }, [fetchFamilies]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="bg-[#FFF8EC] min-h-screen text-[#2B211B]">
      {/* Header Banner */}
      <div className="relative py-20 text-white overflow-hidden">
        {/* Background image overlay */}
        <div className="absolute inset-0">
          <img src="/hero_background.webp" alt="Header Background" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/20 border border-amber-400/30 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              समाज निर्देशिका
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3">परिवार निर्देशिका (Family Directory)</h1>
            <p className="text-orange-100 text-lg font-medium">श्री सीरवी समाज कोणदा के सभी पंजीकृत परिवारों की सूची</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="mb-10 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-xl w-full">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="परिवार का नाम, मुखिया का नाम खोजें..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E8DCC8] rounded-2xl text-[#2B211B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C85A17]/20 focus:border-[#C85A17] shadow-sm transition-all"
            />
          </div>
          {!loading && (
            <p className="text-[#766A60] text-sm font-semibold shrink-0">
              कुल {total} परिवार मिले
            </p>
          )}
        </div>

        {/* List Content */}
        {loading ? (
          <SkeletonCardGrid count={6} />
        ) : families.length === 0 ? (
          <EmptyState
            icon={FiUsers}
            title="कोई परिवार नहीं मिला"
            description={search ? `"${search}" के लिए कोई परिणाम नहीं मिले।` : 'अभी तक कोई परिवार पंजीकृत नहीं किया गया है।'}
          />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {families.map((family) => (
                <FamilyCard key={family._id} family={family} />
              ))}
            </div>
            <div className="mt-10">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FamilyDirectoryPage;
