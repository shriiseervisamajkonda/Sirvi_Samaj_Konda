import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiUser, FiMapPin, FiBriefcase, FiDroplet } from 'react-icons/fi';
import { memberAPI } from '../../services/api';
import { SkeletonCardGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const MemberCard = ({ member }) => {
  const name = member.full_name || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'सदस्य';
  const guardian = member.relative_name || member.guardianName;
  const blood = member.blood_group || member.bloodGroup;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-[#2A1010] rounded-2xl p-5 border border-[#D4AF37]/15 hover:border-[#D4AF37]/45 hover:shadow-2xl transition-all duration-300 shadow-lg"
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C85A17] to-[#D4AF37] p-0.5 flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg overflow-hidden">
          {member.photo ? (
            <img src={member.photo} alt={name} className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <div className="w-full h-full bg-[#160D08] rounded-2xl flex items-center justify-center text-[#FFF3DD]">
              {name.charAt(0) || 'M'}
            </div>
          )}
        </div>
        <h3 className="font-bold text-[#FFF3DD] text-base mb-1">
          {name}
        </h3>
        {blood && blood !== 'Unknown' && (
          <Badge variant="danger" size="xs">
            <FiDroplet className="w-3 h-3" /> {blood}
          </Badge>
        )}
        <div className="mt-4 space-y-1.5 text-left w-full border-t border-[#D4AF37]/10 pt-3">
          {guardian && (
            <div className="flex items-center gap-2 text-[#CDBBA4] text-xs font-semibold">
              <span className="text-xs">👤</span> पिता/पति: {guardian}
            </div>
          )}
          {member.occupation && (
            <div className="flex items-center gap-2 text-[#CDBBA4] text-xs font-semibold">
              <FiBriefcase className="w-3.5 h-3.5 text-[#C85A17]" /> {member.occupation}
            </div>
          )}
          <div className="flex items-center gap-2 text-[#CDBBA4] text-xs font-semibold">
            <FiMapPin className="w-3.5 h-3.5 text-[#C85A17]" /> {member.village === 'Konda' || !member.village ? 'कोणदा' : member.village}
          </div>
          {member.education && (
            <div className="flex items-center gap-2 text-[#CDBBA4] text-xs font-semibold">
              <span className="text-xs">📚</span> {member.education}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

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
              समाज निर्देशिका
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3">सदस्य सूची (Member Directory)</h1>
            <p className="text-[#FFF3DD] text-lg font-medium opacity-90">श्री सिर्वी समाज कोणदा के सभी पंजीकृत सदस्यों की सूची</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="mb-8 space-y-4 border-b border-[#D4AF37]/10 pb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-xl w-full">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#CDBBA4]/55" />
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="नाम, व्यवसाय या शिक्षा से खोजें (Search)..."
                className="w-full pl-12 pr-4 py-3 bg-[#2A1010] border border-[#D4AF37]/15 rounded-2xl text-[#FFF3DD] placeholder-[#CDBBA4]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] shadow-inner font-medium"
              />
            </div>
            {!loading && <p className="text-[#CDBBA4] text-sm font-semibold shrink-0">{total} कुल सदस्य</p>}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => { setBloodGroup(''); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                !bloodGroup
                  ? 'bg-[#C85A17] text-white shadow-md'
                  : 'bg-[#2A1010] text-[#CDBBA4] border border-[#D4AF37]/20 hover:border-[#D4AF37]'
              }`}
            >
              सभी रक्त समूह (All)
            </button>
            {bloodGroups.map((bg) => (
              <button
                key={bg}
                onClick={() => handleBloodGroup(bg)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  bloodGroup === bg
                    ? 'bg-[#C85A17] text-white shadow-md'
                    : 'bg-[#2A1010] text-[#CDBBA4] border border-[#D4AF37]/20 hover:border-[#D4AF37]'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <SkeletonCardGrid count={8} cols="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
        ) : members.length === 0 ? (
          <EmptyState icon={FiUser} title="कोई सदस्य नहीं मिला" description={search ? `No results for "${search}"` : 'No members registered yet.'} />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {members.map(member => <MemberCard key={member._id} member={member} />)}
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

export default MemberDirectoryPage;
