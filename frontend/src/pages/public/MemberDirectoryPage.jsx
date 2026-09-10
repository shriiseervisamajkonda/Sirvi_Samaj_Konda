import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiSearch,
  FiUser,
  FiMapPin,
  FiBriefcase,
  FiDroplet,
  FiUsers,
  FiGrid,
  FiList,
  FiBookOpen,
} from 'react-icons/fi';
import { memberAPI } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import FamilyMembersModal from '../../components/common/FamilyMembersModal';
import { SkeletonCardGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const MemberCard = ({ member, onSelectFamily }) => {
  const name = member.full_name || `${member.first_name || member.firstName || ''} ${member.last_name || member.lastName || ''}`.trim() || 'सदस्य';
  const guardian = member.relative_name || member.guardianName;
  const blood = member.blood_group || member.bloodGroup;
  const edu = member.education || member.qualification;
  const village = member.village || member.families?.village || 'कोणदा';
  const headName = member.families?.head_name || member.family?.headOfFamily;
  const famId = member.panchayat_family_id || member.families?.panchayat_family_id || member.family?.familyId || member.family_id;

  const familyObj = member.families || member.family || (famId ? {
    id: member.family_id,
    panchayat_family_id: famId,
    head_name: headName,
    gotra: member.families?.gotra || member.last_name,
  } : null);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-white rounded-3xl p-5 border border-[#E8DCC8] hover:border-[#C85A17]/60 hover:shadow-xl transition-all duration-300 shadow-xs flex flex-col justify-between"
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7A2525] to-[#C85A17] p-0.5 flex items-center justify-center text-white text-xl font-black mb-3 shadow-md overflow-hidden">
          {member.photo ? (
            <img src={member.photo} alt={name} className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <div className="w-full h-full bg-[#FFF8EC] rounded-2xl flex items-center justify-center text-[#7A2525] font-black">
              {name.charAt(0) || 'M'}
            </div>
          )}
        </div>

        <h3 className="font-extrabold text-[#2B211B] text-base mb-1">
          {name}
        </h3>

        <div className="flex items-center gap-1.5 flex-wrap justify-center mb-2">
          {blood && blood !== 'Unknown' && blood !== 'unknown' && (
            <Badge variant="danger" size="xs">
              <FiDroplet className="w-3 h-3" /> {blood}
            </Badge>
          )}
          <Badge variant={member.gender === 'female' ? 'warning' : 'info'} size="xs">
            {member.gender === 'female' ? 'महिला' : 'पुरुष'}
          </Badge>
        </div>

        <div className="mt-3 space-y-2 text-left w-full border-t border-[#E8DCC8]/70 pt-3 text-xs">
          {guardian && (
            <div className="flex items-center gap-2 text-[#766A60] font-medium">
              <span className="text-[#C85A17] font-bold">👤</span>
              <span>पिता/पति: <strong className="text-[#2B211B]">{guardian}</strong></span>
            </div>
          )}

          {familyObj && (
            <div className="flex items-center gap-2 text-[#766A60] font-medium">
              <FiUsers className="w-3.5 h-3.5 text-[#C85A17]" />
              <span>
                परिवार:{' '}
                <button
                  type="button"
                  onClick={() => onSelectFamily(familyObj)}
                  className="font-bold text-[#7A2525] hover:underline cursor-pointer"
                >
                  {headName || `परिवार #${famId}`} {famId && `(#${famId})`}
                </button>
              </span>
            </div>
          )}

          {member.occupation && (
            <div className="flex items-center gap-2 text-[#766A60] font-medium">
              <FiBriefcase className="w-3.5 h-3.5 text-[#C85A17]" />
              <span>व्यवसाय: <strong className="text-[#2B211B]">{member.occupation}</strong></span>
            </div>
          )}

          {edu && (
            <div className="flex items-center gap-2 text-[#766A60] font-medium">
              <FiBookOpen className="w-3.5 h-3.5 text-[#C85A17]" />
              <span>शिक्षा: <strong className="text-[#7A2525]">{edu}</strong></span>
            </div>
          )}

          <div className="flex items-center gap-2 text-[#766A60] font-medium">
            <FiMapPin className="w-3.5 h-3.5 text-[#C85A17]" />
            <span>गाँव: <strong className="text-[#2B211B]">{village}</strong></span>
          </div>
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
  const [viewMode, setViewMode] = useState('table'); // Default Table View as requested
  const [selectedFamilyForMembers, setSelectedFamilyForMembers] = useState(null);

  useEffect(() => {
    let ignore = false;
    const params = { page, limit: 12, search, status: 'active' };
    if (bloodGroup) params.bloodGroup = bloodGroup;

    memberAPI.getAll(params)
      .then((res) => {
        if (!ignore) {
          setMembers(res.data.data || []);
          setTotalPages(res.data.pagination?.pages || 1);
          setTotal(res.data.pagination?.total || 0);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error(err);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [page, search, bloodGroup]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleBloodGroup = (bg) => {
    setBloodGroup(bg === bloodGroup ? '' : bg);
    setPage(1);
  };

  // Structured Table Columns
  const columns = [
    {
      key: 'photo',
      label: 'फ़ोटो',
      render: (v, r) => {
        const name = r.full_name || `${r.first_name || r.firstName || ''} ${r.last_name || r.lastName || ''}`.trim() || 'M';
        return (
          <div className="w-10 h-10 rounded-2xl overflow-hidden bg-gradient-to-br from-[#7A2525] to-[#C85A17] p-0.5 shadow-xs shrink-0">
            {v || r.photo ? (
              <img src={v || r.photo} alt={name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <div className="w-full h-full bg-[#FFF8EC] rounded-2xl flex items-center justify-center font-black text-xs text-[#7A2525]">
                {name.charAt(0) || 'M'}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'fullName',
      label: 'सदस्य का नाम (Member Name)',
      sortable: true,
      render: (_, r) => {
        const name = r.full_name || `${r.first_name || r.firstName || ''} ${r.last_name || r.lastName || ''}`.trim() || '—';
        const guardian = r.relative_name || r.guardianName;
        return (
          <div>
            <div className="font-bold text-[#2B211B] text-sm">{name}</div>
            {guardian && (
              <div className="text-xs text-[#766A60]">
                {r.gender === 'female' && r.marital_status === 'married' ? 'W/O' : 'S/O, D/O'}: {guardian}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'family',
      label: 'संबंधित परिवार (Family)',
      sortable: true,
      render: (_, r) => {
        const headName = r.families?.head_name || r.family?.headOfFamily;
        const famId = r.panchayat_family_id || r.families?.panchayat_family_id || r.family?.familyId || r.family_id;
        if (!headName && !famId) return '—';

        const familyObj = r.families || r.family || {
          id: r.family_id,
          panchayat_family_id: famId,
          head_name: headName,
          gotra: r.families?.gotra || r.last_name,
        };

        return (
          <button
            type="button"
            onClick={() => setSelectedFamilyForMembers(familyObj)}
            className="text-left font-bold text-[#2B211B] hover:text-[#7A2525] hover:underline transition cursor-pointer group flex items-center gap-1.5"
            title="इस परिवार के सभी सदस्य देखें"
          >
            <span>{headName || `परिवार #${famId}`}</span>
            {famId && (
              <span className="font-mono text-[11px] text-[#7A2525] bg-[#FFF8EC] px-1.5 py-0.5 rounded border border-[#E8DCC8] group-hover:bg-[#7A2525] group-hover:text-white transition">
                #{famId}
              </span>
            )}
            <FiUsers className="w-3.5 h-3.5 text-[#C85A17] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        );
      },
    },
    {
      key: 'gender',
      label: 'लिंग (Gender)',
      sortable: true,
      render: (v, r) => {
        const g = v || r.gender;
        return (
          <Badge variant={g === 'female' ? 'warning' : 'info'}>
            {g === 'female' ? 'महिला' : g === 'male' ? 'पुरुष' : g || '—'}
          </Badge>
        );
      },
    },
    {
      key: 'bloodGroup',
      label: 'रक्त समूह',
      sortable: true,
      render: (_, r) => {
        const bg = r.blood_group || r.bloodGroup;
        return bg && bg !== 'Unknown' && bg !== 'unknown' ? (
          <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-md font-mono text-xs font-bold">
            {bg}
          </span>
        ) : '—';
      },
    },
    {
      key: 'education',
      label: 'शैक्षणिक योग्यता (Education)',
      sortable: true,
      render: (v, r) => {
        const edu = v || r.qualification || r.education;
        return edu ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-[#FFF8EC] text-[#7A2525] border border-[#E8DCC8]">
            <FiBookOpen className="w-3 h-3 text-[#C85A17]" />
            {edu}
          </span>
        ) : '—';
      },
    },
    {
      key: 'occupation',
      label: 'व्यवसाय (Occupation)',
      sortable: true,
      render: (v, r) => {
        const occ = v || r.occupation;
        return occ ? (
          <span className="inline-flex items-center gap-1 font-medium text-[#2B211B]">
            <FiBriefcase className="w-3 h-3 text-[#766A60]" />
            {occ}
          </span>
        ) : '—';
      },
    },
    {
      key: 'village',
      label: 'गाँव (Village)',
      render: (_, r) => r.village || r.families?.village || 'कोणदा',
    },
    {
      key: 'phone',
      label: 'फ़ोन / मोबाइल',
      render: (_, r) => {
        const num = r.mobile_number || r.phone;
        return num ? (
          <a href={`tel:${num}`} className="font-mono text-xs font-bold text-[#7A2525] hover:underline">
            {num}
          </a>
        ) : '—';
      },
    },
  ];

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
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3">सदस्य सूची (Member Directory)</h1>
            <p className="text-orange-100 text-lg font-medium">श्री सिर्वी समाज कोणदा के सभी पंजीकृत सदस्यों की सूची</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search, Blood Group Filter & View Mode Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-xl w-full">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#CDBBA4]" />
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="सदस्य का नाम, पिता का नाम, शिक्षा या व्यवसाय से खोजें..."
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E8DCC8] rounded-2xl text-[#2B211B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C85A17]/20 focus:border-[#C85A17] shadow-sm font-medium transition-all"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {!loading && (
                <p className="text-[#766A60] text-sm font-semibold shrink-0">
                  कुल {total} सदस्य
                </p>
              )}

              {/* View Mode Toggle: Table / Grid */}
              <div className="flex items-center bg-white border border-[#E8DCC8] rounded-2xl p-1 shadow-2xs">
                <button
                  onClick={() => setViewMode('table')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-[#7A2525] text-white shadow-xs'
                      : 'text-[#766A60] hover:text-[#2B211B]'
                  }`}
                  title="तालिका प्रारूप (Table View)"
                >
                  <FiList className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">तालिका (Table)</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-[#7A2525] text-white shadow-xs'
                      : 'text-[#766A60] hover:text-[#2B211B]'
                  }`}
                  title="कार्ड प्रारूप (Grid View)"
                >
                  <FiGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">कार्ड (Grid)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Blood Group Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-[#7A2525] uppercase tracking-wider mr-1">
              रक्त समूह:
            </span>
            <button
              onClick={() => { setBloodGroup(''); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !bloodGroup
                  ? 'bg-[#7A2525] text-white shadow-sm'
                  : 'bg-white text-[#766A60] border border-[#E8DCC8] hover:border-[#7A2525] hover:text-[#7A2525]'
              }`}
            >
              सभी (All)
            </button>
            {bloodGroups.map((bg) => (
              <button
                key={bg}
                onClick={() => handleBloodGroup(bg)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  bloodGroup === bg
                    ? 'bg-[#7A2525] text-white shadow-sm'
                    : 'bg-white text-[#766A60] border border-[#E8DCC8] hover:border-[#7A2525] hover:text-[#7A2525]'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Content View: Table (Default) or Grid */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-3xl border border-[#E8DCC8] shadow-sm overflow-hidden p-2 sm:p-6">
            <DataTable
              columns={columns}
              data={members}
              loading={loading}
              totalPages={totalPages}
              currentPage={page}
              onPageChange={setPage}
              searchable={false}
              serverSide
              title="पंजीकृत सदस्य सूची (Registered Members)"
              emptyIcon={FiUser}
              emptyText="कोई सदस्य नहीं मिला"
              emptyDescription={search ? `"${search}" के लिए कोई सदस्य नहीं मिला।` : 'अभी कोई सदस्य पंजीकृत नहीं है।'}
            />
          </div>
        ) : (
          <div>
            {loading ? (
              <SkeletonCardGrid count={8} cols="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
            ) : members.length === 0 ? (
              <EmptyState
                icon={FiUser}
                title="कोई सदस्य नहीं मिला"
                description={search ? `"${search}" के लिए कोई परिणाम नहीं मिले।` : 'अभी कोई सदस्य पंजीकृत नहीं है।'}
              />
            ) : (
              <>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {members.map((member, index) => (
                    <MemberCard
                      key={member.id || member._id || index}
                      member={member}
                      onSelectFamily={(f) => setSelectedFamilyForMembers(f)}
                    />
                  ))}
                </div>
                <div className="mt-12 flex justify-center">
                  <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Family Members Modal when clicking family in Table or Card */}
      <FamilyMembersModal
        isOpen={Boolean(selectedFamilyForMembers)}
        onClose={() => setSelectedFamilyForMembers(null)}
        family={selectedFamilyForMembers}
      />
    </div>
  );
};

export default MemberDirectoryPage;
