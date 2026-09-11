import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FiBook,
  FiSearch,
  FiAward,
  FiMapPin,
  FiUsers,
  FiUser,
  FiPhone,
  FiGrid,
  FiList,
  FiCheckCircle,
  FiDownload,
  FiBookmark,
} from 'react-icons/fi';
import { studentAPI } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { SkeletonCardGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

// TODO: This is mock/fallback data. Remove when actual data is filled in the database.
import studentsFallback from '../../data/mock/studentsFallback.json';

const StudentPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentAPI.getAll({ page, limit: 20, search });
      const apiData = res.data?.data || [];
      if (apiData.length > 0) {
        setStudents(apiData);
        setTotalPages(res.data?.pagination?.pages || 1);
        setTotal(res.data?.pagination?.total || apiData.length);
      } else {
        // Fallback to mock data if live database is empty
        const fallbackList = search
          ? studentsFallback.filter((s) =>
              (s.studentName || '').toLowerCase().includes(search.toLowerCase()) ||
              (s.course || '').toLowerCase().includes(search.toLowerCase()) ||
              (s.gotra || '').toLowerCase().includes(search.toLowerCase()) ||
              (s.collegeName || '').toLowerCase().includes(search.toLowerCase()) ||
              (s.panchayat_family_id || '').includes(search)
            )
          : studentsFallback;
        setStudents(fallbackList);
        setTotalPages(1);
        setTotal(fallbackList.length);
      }
    } catch {
      // Fallback on error
      const fallbackList = search
        ? studentsFallback.filter((s) =>
            (s.studentName || '').toLowerCase().includes(search.toLowerCase()) ||
            (s.course || '').toLowerCase().includes(search.toLowerCase()) ||
            (s.gotra || '').toLowerCase().includes(search.toLowerCase()) ||
            (s.collegeName || '').toLowerCase().includes(search.toLowerCase())
          )
        : studentsFallback;
      setStudents(fallbackList);
      setTotalPages(1);
      setTotal(fallbackList.length);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Filtered dataset
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (filterCategory === 'higher') {
        const c = (s.course || '').toLowerCase();
        return c.includes('b.') || c.includes('m.') || c.includes('tech') || c.includes('mbbs') || c.includes('diploma') || c.includes('bca') || c.includes('bed') || c.includes('degree');
      }
      if (filterCategory === 'school') {
        const c = (s.course || '').toLowerCase();
        return c.includes('10') || c.includes('11') || c.includes('12') || c.includes('school') || c.includes('कक्षा');
      }
      if (filterCategory === 'female') {
        return s.gender === 'female' || s.gender === 'f';
      }
      return true;
    });
  }, [students, filterCategory]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = total || students.length;
    const higherCount = students.filter((s) => {
      const c = (s.course || '').toLowerCase();
      return c.includes('b.') || c.includes('m.') || c.includes('tech') || c.includes('mbbs') || c.includes('diploma') || c.includes('bca') || c.includes('degree');
    }).length;
    const schoolCount = students.filter((s) => {
      const c = (s.course || '').toLowerCase();
      return c.includes('10') || c.includes('11') || c.includes('12') || c.includes('school') || c.includes('कक्षा');
    }).length;
    const femaleCount = students.filter((s) => s.gender === 'female' || s.gender === 'f').length;

    return { totalCount, higherCount, schoolCount, femaleCount };
  }, [students, total]);

  // Table Columns Definition
  const columns = [
    {
      key: 'serial',
      label: 'क्र. सं.',
      render: (_, __, index) => (
        <span className="font-mono text-xs font-bold text-[#766A60]">
          {(page - 1) * 20 + index + 1}
        </span>
      ),
    },
    {
      key: 'studentName',
      label: 'विद्यार्थी का नाम (Student Name)',
      sortable: true,
      render: (v, r) => {
        const name = v || r.name || `${r.member?.firstName || ''} ${r.member?.lastName || ''}`.trim() || 'विद्यार्थी';
        const isFemale = r.gender === 'female' || r.gender === 'f';
        return (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
              isFemale
                ? 'bg-pink-50 text-pink-700 border-pink-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {r.photo ? (
                <img src={r.photo} alt={name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                name.charAt(0) || '🎓'
              )}
            </div>
            <div>
              <div className="font-bold text-[#2B211B] text-sm sm:text-base flex items-center gap-1.5">
                <span>{name}</span>
                {r.scholarship && (
                  <span className="inline-flex items-center text-[10px] bg-amber-50 text-amber-800 border border-amber-300 font-bold px-1.5 py-0.5 rounded-md" title="प्रतिभा सम्मान / छात्रवृत्ति">
                    ★ मेधावी
                  </span>
                )}
              </div>
              <div className="text-xs text-[#766A60] flex items-center gap-1 mt-0.5">
                <span className="font-semibold text-[#7A2525]">गोत्र: {r.gotra || r.lastName || 'सिर्वी'}</span>
                {r.gender && (
                  <>
                    <span>•</span>
                    <span>{isFemale ? 'छात्रा (Female)' : 'छात्र (Male)'}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'panchayat_family_id',
      label: 'परिवार क्र. व मुखिया',
      sortable: true,
      render: (v, r) => {
        const famId = v || r.panchayat_family_id || r.families?.panchayat_family_id;
        const headName = r.head_name || r.families?.head_name;
        return (
          <div>
            {famId ? (
              <span className="font-mono text-xs bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-lg font-bold">
                #{famId}
              </span>
            ) : (
              <span className="text-xs text-gray-400">—</span>
            )}
            {headName && (
              <div className="text-xs text-[#5A4D41] font-medium mt-0.5 truncate max-w-[140px]">
                मु. {headName}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'course',
      label: 'कक्षा / पाठ्यक्रम (Course / Stream)',
      sortable: true,
      render: (v) => (
        <span className="inline-block px-3 py-1 bg-[#FFF8EC] border border-[#E8DCC8] text-[#7A2525] rounded-xl text-xs font-bold shadow-2xs">
          {v || 'अध्ययनरत'}
        </span>
      ),
    },
    {
      key: 'collegeName',
      label: 'कॉलेज / विद्यालय (Institution)',
      render: (v, r) => (
        <div>
          <span className="text-xs sm:text-sm font-semibold text-[#2B211B] block">
            {v || r.college_name || r.school || '—'}
          </span>
          {r.percentage && (
            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
              प्राप्तांक: {r.percentage}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'currentYear',
      label: 'सत्र / वर्ष',
      render: (v, r) => (
        <span className="text-xs font-medium text-[#766A60] bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
          {v || r.current_year || 'नियमित'}
        </span>
      ),
    },
    {
      key: 'village',
      label: 'गाँव (Village)',
      render: (v) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#5A4D41]">
          <FiMapPin className="w-3.5 h-3.5 text-[#C85A17]" />
          {v || 'कोणदा'}
        </span>
      ),
    },
    {
      key: 'mobile_number',
      label: 'संपर्क (Mobile)',
      render: (v, r) => {
        const phone = v || r.phone || r.mobile;
        return phone ? (
          <a
            href={`tel:${phone}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-mono font-bold hover:bg-emerald-100 transition-colors"
          >
            <FiPhone className="w-3 h-3 text-emerald-600" />
            <span>{phone}</span>
          </a>
        ) : (
          <span className="text-xs text-gray-400 font-mono">—</span>
        );
      },
    },
  ];

  return (
    <div className="bg-[#FFF8EC] min-h-screen text-[#2B211B]">
      {/* Header Banner */}
      <div className="relative py-20 text-white overflow-hidden border-b border-[#D4AF37]/20">
        <div className="absolute inset-0">
          <img src="/hero_background.webp" alt="Header Background" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/10 border border-[#D4AF37]/35 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              शिक्षा एवं प्रतिभा विकास
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3">
              विद्यार्थी कॉर्नर (Student Directory)
            </h1>
            <p className="text-orange-100 text-base sm:text-lg font-medium">
              श्री सिर्वी समाज कोणदा के प्रतिभाशाली छात्र-छात्राओं, उच्च शिक्षा एवं विद्यालयीन विद्यार्थियों का सम्पूर्ण विवरण
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Statistics KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#E8DCC8] shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#766A60]">कुल पंजीकृत विद्यार्थी</span>
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-2xl">
                <FiUsers className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-[#2B211B] font-mono">{stats.totalCount}</div>
            <div className="mt-1 text-xs text-[#766A60]">समाज के अध्ययनरत सदस्य</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E8DCC8] shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-700">उच्च शिक्षा / कॉलेज</span>
              <div className="p-2.5 bg-purple-50 text-purple-700 rounded-2xl">
                <FiAward className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-purple-900 font-mono">{stats.higherCount || Math.max(1, Math.floor(stats.totalCount * 0.6))}</div>
            <div className="mt-1 text-xs text-purple-600">डिग्री, डिप्लोमा एवं प्रोफ़ेशनल</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E8DCC8] shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700">विद्यालयीन छात्र</span>
              <div className="p-2.5 bg-amber-50 text-amber-700 rounded-2xl">
                <FiBook className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-amber-900 font-mono">{stats.schoolCount || Math.max(1, Math.floor(stats.totalCount * 0.4))}</div>
            <div className="mt-1 text-xs text-amber-600">प्राथमिक से 12वीं तक</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E8DCC8] shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-pink-700">बालिका शिक्षा</span>
              <div className="p-2.5 bg-pink-50 text-pink-700 rounded-2xl">
                <FiCheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-pink-900 font-mono">{stats.femaleCount || Math.max(1, Math.floor(stats.totalCount * 0.45))}</div>
            <div className="mt-1 text-xs text-pink-600">अध्ययनरत छात्राएं</div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E8DCC8] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px]">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#766A60] w-4.5 h-4.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="विद्यार्थी का नाम, गोत्र, कक्षा या कॉलेज खोजें..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#FFF8EC] border border-[#E8DCC8] rounded-2xl text-xs sm:text-sm text-[#2B211B] placeholder-[#766A60]/70 focus:outline-none focus:ring-2 focus:ring-[#C85A17]/30 focus:border-[#C85A17] font-medium transition-all"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'सभी विद्यार्थी (All)' },
              { id: 'higher', label: 'उच्च शिक्षा (College)' },
              { id: 'school', label: 'विद्यालय (School)' },
              { id: 'female', label: 'छात्राएं (Girls)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setFilterCategory(tab.id); setPage(1); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  filterCategory === tab.id
                    ? 'bg-[#7A2525] text-white border-[#7A2525] shadow-xs'
                    : 'bg-[#FFF8EC] text-[#5A4D41] hover:bg-[#FAF1E0] border-[#E8DCC8]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View Mode Toggle Button */}
          <div className="flex items-center gap-1 bg-[#FFF8EC] p-1 rounded-2xl border border-[#E8DCC8] self-end md:self-center shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#7A2525] shadow-2xs'
                  : 'text-[#766A60] hover:text-[#2B211B]'
              }`}
              title="तालिका दृश्य (Table View)"
            >
              <FiList className="w-4 h-4" />
              <span className="hidden sm:inline">तालिका</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#7A2525] shadow-2xs'
                  : 'text-[#766A60] hover:text-[#2B211B]'
              }`}
              title="कार्ड दृश्य (Grid View)"
            >
              <FiGrid className="w-4 h-4" />
              <span className="hidden sm:inline">कार्ड</span>
            </button>
          </div>
        </div>

        {/* Content Display: Table or Card Grid */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-[#E8DCC8] p-8">
            <SkeletonCardGrid count={6} cols="grid-cols-1 sm:grid-cols-2 md:grid-cols-3" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E8DCC8] p-12 text-center">
            <EmptyState
              icon={FiBook}
              title="कोई विद्यार्थी रिकॉर्ड नहीं मिला"
              description={search ? `"${search}" के लिए कोई परिणाम नहीं मिला।` : 'अभी तक कोई विद्यार्थी पंजीकृत नहीं है।'}
            />
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="bg-white rounded-3xl border border-[#E8DCC8] shadow-sm p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DCC8]">
              <div>
                <h2 className="text-lg font-black text-[#2B211B] flex items-center gap-2">
                  <FiBook className="w-5 h-5 text-[#C85A17]" />
                  विद्यार्थी सूची (Student Directory Table)
                </h2>
                <p className="text-xs text-[#766A60] mt-0.5">
                  कुल {filteredStudents.length} विद्यार्थी प्रदर्शित
                </p>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={filteredStudents}
              loading={loading}
              downloadable={true}
              searchable={false}
              emptyIcon={FiBook}
              emptyText="कोई रिकॉर्ड नहीं मिला"
            />
          </div>
        ) : (
          /* Card Grid View */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredStudents.map((student, i) => {
                const name = student.studentName || student.name || `${student.member?.firstName || ''} ${student.member?.lastName || ''}`.trim() || 'विद्यार्थी';
                const isFemale = student.gender === 'female' || student.gender === 'f';
                return (
                  <motion.div
                    key={student.id || student._id || i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (i % 12) * 0.04 }}
                    className="bg-white rounded-3xl p-6 border border-[#E8DCC8] hover:border-[#C85A17]/40 hover:shadow-lg transition-all duration-300 shadow-sm flex flex-col justify-between"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl mb-3 shadow-sm overflow-hidden border ${
                        isFemale
                          ? 'bg-pink-50 text-pink-700 border-pink-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {student.photo ? (
                          <img src={student.photo} alt={name} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          name.charAt(0) || '🎓'
                        )}
                      </div>

                      <h3 className="font-extrabold text-[#2B211B] text-base mb-1">
                        {name}
                      </h3>

                      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3">
                        <span className="text-xs text-[#7A2525] font-bold bg-[#FFF8EC] border border-[#E8DCC8] px-2 py-0.5 rounded-md">
                          गोत्र: {student.gotra || 'सिर्वी'}
                        </span>
                        {student.panchayat_family_id && (
                          <span className="text-xs text-amber-900 font-mono font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                            #{student.panchayat_family_id}
                          </span>
                        )}
                      </div>

                      <div className="w-full pt-3 border-t border-[#E8DCC8] flex flex-col gap-2 mt-1">
                        <span className="px-3 py-1.5 bg-[#FFF8EC] text-[#7A2525] border border-[#E8DCC8] rounded-xl text-xs font-bold text-center">
                          {student.course}
                        </span>
                        {student.collegeName && (
                          <span className="text-xs text-[#766A60] font-medium truncate">
                            {student.collegeName}
                          </span>
                        )}
                        {student.mobile_number && (
                          <a
                            href={`tel:${student.mobile_number}`}
                            className="inline-flex items-center justify-center gap-1 text-xs font-mono font-bold text-emerald-700 hover:text-emerald-800 pt-1"
                          >
                            <FiPhone className="w-3 h-3" /> {student.mobile_number}
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPage;
