import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBook, FiSearch, FiAward, FiMapPin } from 'react-icons/fi';
import { studentAPI } from '../../services/api';
import { SkeletonCardGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';

const StudentPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    studentAPI.getAll({ page, limit: 12, search })
      .then(res => {
        setStudents(res.data.data || []);
        setTotalPages(res.data.pagination?.pages || 1);
        setTotal(res.data.pagination?.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search]);

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
              शिक्षा एवं प्रतिभा
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3">विद्यार्थी कॉर्नर (Student Corner)</h1>
            <p className="text-[#FFF3DD] text-lg font-medium opacity-90">
              श्री सिर्वी समाज कोणदा के प्रतिभाशाली छात्र-छात्राएं एवं शिक्षा विवरण
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-[#D4AF37]/10 pb-6">
          <div className="relative max-w-md w-full">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#CDBBA4]/55" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="नाम या कक्षा से खोजें..."
              className="w-full pl-12 pr-4 py-3 bg-[#2A1010] border border-[#D4AF37]/15 rounded-2xl text-[#FFF3DD] placeholder-[#CDBBA4]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] font-medium"
            />
          </div>
          {!loading && <p className="text-[#CDBBA4] text-sm font-semibold">{total} कुल पंजीकृत विद्यार्थी</p>}
        </div>

        {loading ? (
          <SkeletonCardGrid count={8} cols="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
        ) : students.length === 0 ? (
          <EmptyState icon={FiBook} title="कोई विद्यार्थी रिकॉर्ड नहीं मिला" description={search ? `"${search}" के लिए कोई परिणाम नहीं मिला` : "विद्यार्थी सूची जल्द ही अद्यतन की जाएगी।"} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {students.map((student, i) => {
                const name = student.studentName || student.name || `${student.member?.firstName || ''} ${student.member?.lastName || ''}`.trim() || 'विद्यार्थी';
                return (
                  <motion.div
                    key={student.id || student._id || i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 12) * 0.04 }}
                    className="bg-[#2A1010] rounded-2xl p-5 border border-[#D4AF37]/15 hover:border-[#D4AF37]/45 hover:shadow-2xl transition-all duration-300 shadow-lg flex flex-col justify-between"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C85A17] to-[#D4AF37] p-0.5 flex items-center justify-center text-white text-xl font-bold mb-3 shadow-md overflow-hidden">
                        {student.photo ? (
                          <img src={student.photo} alt={name} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          <div className="w-full h-full bg-[#160D08] rounded-2xl flex items-center justify-center text-[#FFF3DD]">
                            {name.charAt(0) || '🎓'}
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-[#FFF3DD] text-base mb-1">
                        {name}
                      </h3>
                      {student.gotra && (
                        <span className="text-xs text-[#D4AF37] font-semibold mb-2">
                          गोत्र: {student.gotra}
                        </span>
                      )}
                      <div className="w-full pt-3 border-t border-[#D4AF37]/10 flex flex-col gap-2 mt-2">
                        <span className="px-3 py-1 bg-[#160D08] text-amber-300 border border-[#D4AF37]/20 rounded-xl text-xs font-bold">
                          {student.course}
                        </span>
                        {student.collegeName && (
                          <span className="text-[11px] text-[#CDBBA4] font-medium">
                            {student.collegeName}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
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

export default StudentPage;
