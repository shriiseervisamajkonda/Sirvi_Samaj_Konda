import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiUser, FiMapPin, FiBriefcase, FiDroplet } from 'react-icons/fi';
import { memberAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const MemberCard = ({ member }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:border-orange-200 dark:hover:border-orange-500/30 hover:-translate-y-1 transition-all duration-300"
  >
    <div className="flex flex-col items-center text-center">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg shadow-blue-500/20 overflow-hidden">
        {member.photo ? (
          <img src={member.photo} alt={`${member.firstName} ${member.lastName}`} className="w-full h-full object-cover" />
        ) : (
          member.firstName?.charAt(0)
        )}
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white mb-1">
        {member.firstName} {member.lastName}
      </h3>
      {member.bloodGroup && (
        <Badge variant="danger" size="xs">
          <FiDroplet className="w-3 h-3" /> {member.bloodGroup}
        </Badge>
      )}
      <div className="mt-3 space-y-1.5 text-left w-full">
        {member.occupation && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
            <FiBriefcase className="w-3.5 h-3.5 text-blue-400" /> {member.occupation}
          </div>
        )}
        {member.village && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
            <FiMapPin className="w-3.5 h-3.5 text-blue-400" /> {member.village}
          </div>
        )}
        {member.education && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
            📚 {member.education}
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

const MemberDirectoryPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, search, status: 'active' };
      if (bloodGroup) params.bloodGroup = bloodGroup;
      const res = await memberAPI.getAll(params);
      setMembers(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, bloodGroup]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handleBloodGroup = (bg) => { setBloodGroup(bg === bloodGroup ? '' : bg); setPage(1); };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 py-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3">Member Directory</h1>
            <p className="text-blue-100 text-lg">All registered members of Shri Seervi Samaj Konda</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-xl">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Search by name, occupation, education..."
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 shadow-sm transition-all"
              />
            </div>
            {!loading && <p className="text-gray-500 text-sm shrink-0">{total} members</p>}
          </div>

          {/* Blood group filter */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center">Blood Group:</span>
            {bloodGroups.map(bg => (
              <button
                key={bg}
                onClick={() => handleBloodGroup(bg)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  bloodGroup === bg
                    ? 'bg-red-500 border-red-500 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-red-300 hover:text-red-500'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : members.length === 0 ? (
          <EmptyState icon={FiUser} title="No members found" description={search ? `No results for "${search}"` : 'No members registered yet.'} />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {members.map(member => <MemberCard key={member._id} member={member} />)}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default MemberDirectoryPage;
