import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiLock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { marriageAPI } from '../../services/api';
import { SkeletonCardGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';

const MarriageBiodataPage = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const params = { page, limit: 12, status: 'approved' };
    if (filter !== 'all') params.gender = filter;
    marriageAPI.getAll(params)
      .then(res => {
        setProfiles(res.data.data || []);
        setTotalPages(res.data.pagination?.pages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, page, filter]);

  if (!user) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-white rounded-3xl p-12 shadow-xl border border-[#E8DCC8] ">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiLock className="w-10 h-10 text-pink-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#2B211B] mb-3">Login Required</h2>
          <p className="text-[#766A60] mb-8">
            Marriage biodata is only accessible to registered community members. Please login or create an account.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/login" className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors">Login</Link>
            <Link to="/register" className="px-6 py-3 border border-[#E8DCC8] text-[#2B211B] rounded-xl font-medium hover:bg-transparent :bg-slate-700 transition-colors">Register</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent min-h-screen">
      <div className="bg-gradient-to-br from-pink-500 to-rose-700 py-16 text-white relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiHeart className="w-8 h-8" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3">Marriage Biodata</h1>
            <p className="text-pink-100 text-lg">Find your life partner within our community</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex gap-3">
          {['all', 'Male', 'Female'].map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                filter === f ? 'bg-pink-500 border-pink-500 text-white' : 'bg-white border-[#E8DCC8] text-[#766A60] hover:border-pink-300'
              }`}
            >
              {f === 'all' ? 'All Profiles' : f === 'Male' ? '👨 Groom' : '👩 Bride'}
            </button>
          ))}
        </div>

        {loading ? <SkeletonCardGrid count={6} cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" /> : profiles.length === 0 ? (
          <EmptyState icon={FiHeart} title="No profiles yet" description="Marriage biodata profiles will appear here once approved." />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile, i) => {
                const candidateName = profile.candidate_name || profile.name || profile.fullName || (profile.member?.firstName ? `${profile.member.firstName} ${profile.member.lastName || ''}`.trim() : 'प्रत्याशी');
                return (
                <motion.div
                  key={profile.id || profile._id || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden border border-[#E8DCC8] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="bg-gradient-to-br from-pink-400 to-rose-600 h-32 flex items-center justify-center">
                    {profile.photo ? (
                      <img src={profile.photo} alt={candidateName} className="w-20 h-20 rounded-full object-cover border-4 border-white" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center text-white text-3xl font-bold">
                        {candidateName.charAt(0) || '👤'}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="text-center mb-4">
                      <h3 className="font-bold text-[#2B211B] ">
                        {profile.candidate_name || profile.name || profile.fullName || (profile.member?.firstName ? `${profile.member.firstName} ${profile.member.lastName || ''}`.trim() : 'प्रत्याशी')}
                      </h3>
                      <Badge variant={profile.gender === 'Male' || profile.gender === 'male' ? 'info' : 'purple'} size="xs">
                        {profile.gender === 'Male' || profile.gender === 'male' ? 'वर (Groom)' : 'वधू (Bride)'}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm text-[#766A60] ">
                      {profile.dob && <p>📅 Age: {new Date().getFullYear() - new Date(profile.dob).getFullYear()} years</p>}
                      {profile.education && <p>📚 {profile.education}</p>}
                      {profile.occupation && <p>💼 {profile.occupation}</p>}
                      {profile.height && <p>📏 {profile.height}</p>}
                    </div>
                    <button className="mt-4 w-full py-2 bg-pink-50 text-pink-600 rounded-xl text-sm font-medium hover:bg-pink-100 :bg-pink-500/20 transition-colors">
                      View Full Profile
                    </button>
                  </div>
                </motion.div>
                );
              })}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default MarriageBiodataPage;
