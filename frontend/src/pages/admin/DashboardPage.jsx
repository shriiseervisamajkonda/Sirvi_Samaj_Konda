import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  FiUsers, FiBook, FiBriefcase, FiDroplet, FiCalendar, FiFileText,
  FiDollarSign, FiActivity, FiTrendingUp, FiArrowRight,
} from 'react-icons/fi';
import { dashboardAPI, activityLogAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const COLORS = ['#FF6B00', '#0D6EFD', '#198754', '#DC3545', '#6f42c1', '#fd7e14'];

const StatCard = ({ title, value, icon: Icon, color, link, change }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all duration-300"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value?.toLocaleString()}</p>
        {change !== undefined && (
          <p className={`text-xs font-medium mt-1 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% this month
          </p>
        )}
      </div>
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    {link && (
      <Link to={link} className="flex items-center gap-1 text-xs text-orange-500 mt-4 hover:gap-2 transition-all">
        View all <FiArrowRight className="w-3 h-3" />
      </Link>
    )}
  </motion.div>
);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      dashboardAPI.getStats(),
      activityLogAPI.getAll({ limit: 8 }),
    ]).then(([statsRes, logsRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
      if (logsRes.status === 'fulfilled') setLogs(logsRes.value.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { title: 'Total Families', value: stats?.families, icon: FiUsers, color: 'bg-orange-500', link: '/admin/families' },
    { title: 'Total Members', value: stats?.members, icon: FiUsers, color: 'bg-blue-500', link: '/admin/members' },
    { title: 'Students', value: stats?.students, icon: FiBook, color: 'bg-green-500', link: '/admin/students' },
    { title: 'Businesses', value: stats?.businesses, icon: FiBriefcase, color: 'bg-purple-500', link: '/admin/businesses' },
    { title: 'Blood Donors', value: stats?.bloodDonors, icon: FiDroplet, color: 'bg-red-500', link: '/admin/blood-donors' },
    { title: 'Events', value: stats?.events, icon: FiCalendar, color: 'bg-yellow-500', link: '/admin/events' },
    { title: 'News', value: stats?.news, icon: FiFileText, color: 'bg-indigo-500', link: '/admin/news' },
    { title: 'Donations', value: stats?.donations, icon: FiDollarSign, color: 'bg-emerald-500', link: '/admin/donations' },
  ];

  // Mock chart data
  const monthlyData = [
    { month: 'Jan', families: 8, members: 32 },
    { month: 'Feb', families: 12, members: 45 },
    { month: 'Mar', families: 6, members: 28 },
    { month: 'Apr', families: 15, members: 58 },
    { month: 'May', families: 10, members: 42 },
    { month: 'Jun', families: 18, members: 65 },
    { month: 'Jul', families: 14, members: 51 },
  ];

  const genderData = [
    { name: 'Male', value: stats?.male || 0 },
    { name: 'Female', value: stats?.female || 0 },
    { name: 'Children', value: stats?.children || 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Welcome to the Shri Seervi Samaj Konda Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <StatCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Growth */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FiTrendingUp className="w-5 h-5 text-orange-500" /> Monthly Registrations
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="families" fill="#FF6B00" radius={[4, 4, 0, 0]} name="Families" />
              <Bar dataKey="members" fill="#0D6EFD" radius={[4, 4, 0, 0]} name="Members" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Demographics */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FiUsers className="w-5 h-5 text-blue-500" /> Member Demographics
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {genderData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FiActivity className="w-5 h-5 text-purple-500" /> Recent Activity
          </h2>
          <Link to="/admin/activity-logs" className="text-xs text-orange-500 hover:text-orange-600 font-medium">View all →</Link>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <FiActivity className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={log._id || i} className="flex items-center gap-4 px-6 py-3">
                <div className="w-9 h-9 bg-orange-100 dark:bg-orange-500/20 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-orange-500 text-xs font-bold">{log.user?.name?.charAt(0) || '?'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white truncate">
                    <span className="font-medium">{log.user?.name || 'System'}</span>
                    {' '}{log.action} {log.module}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add Family', path: '/admin/families', icon: FiUsers, color: 'bg-orange-500' },
            { label: 'Add Member', path: '/admin/members', icon: FiUsers, color: 'bg-blue-500' },
            { label: 'Post News', path: '/admin/news', icon: FiFileText, color: 'bg-green-500' },
            { label: 'Add Event', path: '/admin/events', icon: FiCalendar, color: 'bg-purple-500' },
          ].map(({ label, path, icon: Icon, color }) => (
            <Link
              key={label}
              to={path}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-500/30 hover:bg-orange-50 dark:hover:bg-orange-500/5 transition-all group"
            >
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
