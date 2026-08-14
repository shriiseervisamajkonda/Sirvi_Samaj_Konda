import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  FiUsers,
  FiBook,
  FiBriefcase,
  FiDroplet,
  FiCalendar,
  FiFileText,
  FiDollarSign,
  FiActivity,
  FiTrendingUp,
  FiArrowRight,
  FiShield,
  FiHeart,
  FiPlus,
  FiLayers,
} from 'react-icons/fi';
import { dashboardAPI, activityLogAPI } from '../../services/api';
import { SkeletonDashboard } from '../../components/common/Skeleton';

const CHART_COLORS = ['#7A2525', '#C85A17', '#C9A44C', '#2B211B', '#8C3D2B', '#E5A93C'];

const StatCard = ({ title, value, icon: Icon, link, badge }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-3xl p-6 border border-[#E8DCC8] shadow-sm hover:shadow-xl hover:border-[#C9A44C]/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <span className="text-xs font-bold text-[#766A60] uppercase tracking-wider block mb-1">
          {title}
        </span>
        <p className="text-3xl sm:text-4xl font-black text-[#2B211B] tracking-tight">
          {(value ?? 0).toLocaleString('hi-IN')}
        </p>
        {badge && (
          <span className="inline-block px-2.5 py-0.5 mt-2 bg-[#FFF8EC] border border-[#E8DCC8] rounded-full text-[11px] font-extrabold text-[#7A2525]">
            {badge}
          </span>
        )}
      </div>

      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7A2525] via-[#C85A17] to-[#C9A44C] p-0.5 shadow-md shrink-0">
        <div className="w-full h-full bg-[#FFF8EC] rounded-2xl flex items-center justify-center text-[#7A2525]">
          <Icon className="w-6 h-6 text-[#7A2525]" />
        </div>
      </div>
    </div>

    {link && (
      <div className="mt-5 pt-3 border-t border-[#E8DCC8]/60 flex items-center justify-between">
        <Link
          to={link}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C85A17] hover:text-[#7A2525] hover:gap-2 transition-all cursor-pointer"
        >
          <span>विवरण देखें</span>
          <FiArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    )}
  </motion.div>
);

const DashboardPage = () => {
  const [statsData, setStatsData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      dashboardAPI.getStats(),
      activityLogAPI.getAll({ limit: 8 }),
    ])
      .then(([statsRes, logsRes]) => {
        if (statsRes.status === 'fulfilled') {
          setStatsData(statsRes.value.data?.data);
        }
        if (logsRes.status === 'fulfilled') {
          setLogs(logsRes.value.data?.data || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    if (!statsData) return {};
    return statsData.stats || statsData;
  }, [statsData]);

  if (loading) return <SkeletonDashboard />;

  const statCards = [
    { title: 'कुल परिवार (Families)', value: stats?.totalFamilies ?? stats?.families, icon: FiUsers, link: '/admin/families', badge: 'पंजीकृत परिवार' },
    { title: 'समाज सदस्य (Members)', value: stats?.totalMembers ?? stats?.members, icon: FiUsers, link: '/admin/members', badge: 'कुल जनसंख्या' },
    { title: 'विद्यार्थी (Students)', value: stats?.students ?? stats?.studentCount, icon: FiBook, link: '/admin/students', badge: 'शिक्षा प्रतिभा' },
    { title: 'प्रतिष्ठान (Businesses)', value: stats?.businesses ?? stats?.businessCount, icon: FiBriefcase, link: '/admin/businesses', badge: 'व्यापार निर्देशिका' },
    { title: 'रक्तदाता (Blood Donors)', value: stats?.bloodDonors ?? stats?.bloodDonorCount, icon: FiDroplet, link: '/admin/blood-donors', badge: 'जीवनदाता' },
    { title: 'सक्रिय कार्यक्रम (Events)', value: stats?.events ?? stats?.eventCount, icon: FiCalendar, link: '/admin/events', badge: 'सामाजिक आयोजन' },
    { title: 'समाचार (News)', value: stats?.news ?? stats?.newsCount, icon: FiFileText, link: '/admin/news', badge: 'उद्घोषणाएं' },
    { title: 'कुल दान सहयोग (₹)', value: stats?.donations, icon: FiDollarSign, link: '/admin/donations', badge: 'सहयोग राशि' },
  ];

  const genderData = [
    { name: 'पुरुष (Male)', value: stats?.male || 1 },
    { name: 'महिला (Female)', value: stats?.female || 1 },
    { name: 'बच्चे (Children)', value: stats?.children || 1 },
  ];

  const monthlyGrowth = statsData?.monthlyGrowth?.length
    ? statsData.monthlyGrowth.map((g) => ({ month: g._id, members: g.count }))
    : [
        { month: 'जनवरी', members: 45 },
        { month: 'फरवरी', members: 60 },
        { month: 'मार्च', members: 78 },
        { month: 'अप्रैल', members: 92 },
        { month: 'मई', members: 110 },
        { month: 'जून', members: 135 },
      ];

  return (
    <div className="space-y-8 text-[#2B211B]">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#7A2525] via-[#8C2C1D] to-[#C85A17] rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-3 text-amber-200">
            <FiShield className="w-3.5 h-3.5" /> श्री सीरवी समाज कोणदा • केंद्रीय प्रशासन
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-2">
            प्रशासन नियंत्रण डैशबोर्ड
          </h1>
          <p className="text-sm sm:text-base text-white/80 font-medium leading-relaxed">
            गाँव, समितियाँ, सकल पंच, ग्राम इकाई, परिवार निर्देशिका, वित्तीय लेखा-जोखा एवं संपूर्ण सामाजिक गतिविधियों का एकीकृत प्रबंधन।
          </p>
        </div>

        {/* Decorative Watermark */}
        <div className="absolute right-6 bottom-[-20px] text-white/5 text-9xl font-black select-none pointer-events-none">
          श्री
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8DCC8] shadow-sm">
        <h2 className="text-xs font-extrabold text-[#7A2525] uppercase tracking-wider mb-4 flex items-center gap-2">
          <FiLayers className="w-4 h-4 text-[#C85A17]" /> त्वरित कार्यवाई (Quick Actions)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'समिति / पंच जोड़ें', path: '/admin/committee', icon: FiShield },
            { label: 'नया परिवार जोड़ें', path: '/admin/families', icon: FiUsers },
            { label: 'नया कार्यक्रम जोड़ें', path: '/admin/events', icon: FiCalendar },
            { label: 'समाचार प्रकाशित करें', path: '/admin/news', icon: FiFileText },
          ].map(({ label, path, icon: Icon }) => (
            <Link
              key={label}
              to={path}
              className="flex items-center gap-3 p-4 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8] hover:border-[#C9A44C] hover:bg-white transition-all group cursor-pointer shadow-xs hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7A2525] to-[#C85A17] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#2B211B] group-hover:text-[#7A2525]">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Charts Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Registration Growth */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCC8] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-extrabold text-[#7A2525] uppercase tracking-wider block">
                सांख्यिकी रुझान
              </span>
              <h3 className="text-lg font-black text-[#2B211B] flex items-center gap-2 mt-0.5">
                <FiTrendingUp className="w-5 h-5 text-[#C85A17]" /> मासिक समाज वृद्धि
              </h3>
            </div>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8DCC8" />
                <XAxis dataKey="month" tick={{ fill: '#766A60', fontSize: 12 }} />
                <YAxis tick={{ fill: '#766A60', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF8EC',
                    borderColor: '#E8DCC8',
                    borderRadius: '1rem',
                    fontWeight: 'bold',
                  }}
                />
                <Bar dataKey="members" fill="#7A2525" radius={[8, 8, 0, 0]} name="सदस्य संख्या" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member Demographics Pie Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCC8] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-extrabold text-[#7A2525] uppercase tracking-wider block">
                जनसांख्यिकी
              </span>
              <h3 className="text-lg font-black text-[#2B211B] flex items-center gap-2 mt-0.5">
                <FiUsers className="w-5 h-5 text-[#C85A17]" /> सदस्य जनसांख्यिकी विभाजन
              </h3>
            </div>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF8EC',
                    borderColor: '#E8DCC8',
                    borderRadius: '1rem',
                    fontWeight: 'bold',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Audit Logs */}
      <div className="bg-white rounded-3xl border border-[#E8DCC8] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#E8DCC8] bg-gradient-to-r from-[#FFF8EC] to-white">
          <div>
            <span className="text-xs font-extrabold text-[#7A2525] uppercase tracking-wider block">
              सुरक्षा एवं लॉग्स
            </span>
            <h3 className="text-lg font-black text-[#2B211B] flex items-center gap-2 mt-0.5">
              <FiActivity className="w-5 h-5 text-[#C85A17]" /> हालिया प्रशासनिक गतिविधियाँ
            </h3>
          </div>
          <Link
            to="/admin/activity-logs"
            className="text-xs font-bold text-[#C85A17] hover:text-[#7A2525] transition"
          >
            सभी लॉग्स देखें →
          </Link>
        </div>

        <div className="divide-y divide-[#E8DCC8]">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-[#766A60]">
              <FiActivity className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#C85A17]" />
              <p className="text-sm font-bold">अभी कोई हालिया गतिविधि दर्ज नहीं है।</p>
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={log._id || i} className="flex items-center justify-between p-5 hover:bg-[#FFF8EC]/60 transition">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7A2525] to-[#C85A17] flex items-center justify-center text-white text-xs font-black shrink-0 shadow-xs">
                    {log.user?.name?.charAt(0) || 'A'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#2B211B] truncate">
                      <span className="text-[#7A2525]">{log.user?.name || 'Administrator'}</span> ने{' '}
                      <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-[#C85A17] rounded-md text-xs">
                        {log.module}
                      </span>{' '}
                      में {log.action} किया।
                    </p>
                    <p className="text-xs text-[#766A60] font-medium mt-0.5">
                      {new Date(log.createdAt).toLocaleString('hi-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
