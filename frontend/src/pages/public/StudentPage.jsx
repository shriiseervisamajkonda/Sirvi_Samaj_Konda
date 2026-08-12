import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBook, FiSearch } from 'react-icons/fi';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';

const StudentPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    studentAPI.getAll({ page, limit: 12, search, status: 'active' })
      .then(res => {
        setStudents(res.data.data || []);
        setTotalPages(res.data.pagination?.pages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search]);

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen">
      <div className="bg-gradient-to-br from-green-600 to-green-800 py-16 text-white relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3">Student Corner</h1>
            <p className="text-green-100 text-lg">Celebrating our bright students and achievers</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search students..."
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 shadow-sm"
            />
          </div>
        </div>

        {loading ? <LoadingSpinner /> : students.length === 0 ? (
          <EmptyState icon={FiBook} title="No students found" description="Student records will be updated soon." />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {students.map((student, i) => (
                <motion.div
                  key={student._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xl font-bold mb-3 overflow-hidden">
                      {student.photo ? <img src={student.photo} alt="Student" className="w-full h-full object-cover" /> : student.member?.firstName?.charAt(0) || '🎓'}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                      {student.member?.firstName} {student.member?.lastName}
                    </h3>
                    <p className="text-green-600 dark:text-green-400 text-xs font-medium mb-2">{student.course}</p>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {student.collegeName && <Badge variant="success" size="xs">{student.collegeName}</Badge>}
                      {student.currentYear && <Badge variant="info" size="xs">Year {student.currentYear}</Badge>}
                      {student.cgpa && <Badge variant="default" size="xs">CGPA: {student.cgpa}</Badge>}
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

export default StudentPage;
