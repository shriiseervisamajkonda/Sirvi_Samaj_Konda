import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiUsers, FiUser, FiBook, FiBriefcase, FiDroplet, FiHeart,
  FiCalendar, FiImage, FiFileText, FiDollarSign, FiMapPin, FiSettings,
  FiActivity, FiMenu, FiX, FiLogOut, FiSun, FiMoon, FiChevronLeft,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const sidebarLinks = [
  { label: 'Dashboard', path: '/admin', icon: FiHome },
  { label: 'Families', path: '/admin/families', icon: FiUsers },
  { label: 'Members', path: '/admin/members', icon: FiUser },
  { label: 'Students', path: '/admin/students', icon: FiBook },
  { label: 'Businesses', path: '/admin/businesses', icon: FiBriefcase },
  { label: 'Blood Donors', path: '/admin/blood-donors', icon: FiDroplet },
  { label: 'Marriage Biodata', path: '/admin/marriage', icon: FiHeart },
  { label: 'Events', path: '/admin/events', icon: FiCalendar },
  { label: 'Gallery', path: '/admin/gallery', icon: FiImage },
  { label: 'News', path: '/admin/news', icon: FiFileText },
  { label: 'Documents', path: '/admin/documents', icon: FiFileText },
  { label: 'Donations', path: '/admin/donations', icon: FiDollarSign },
  { label: 'Committee', path: '/admin/committee', icon: FiUsers },
  { label: 'Lekha Jokha', path: '/admin/lekha-jokha', icon: FiDollarSign },
  { label: 'Panch Settlements', path: '/admin/panch-settlements', icon: FiBook },
  { label: 'Social Info', path: '/admin/social-info', icon: FiFileText },
  { label: 'Village Info', path: '/admin/village', icon: FiMapPin },
  { label: 'Users', path: '/admin/users', icon: FiUser },
  { label: 'Activity Logs', path: '/admin/activity-logs', icon: FiActivity },
  { label: 'Settings', path: '/admin/settings', icon: FiSettings },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-slate-900">
      <aside className={`fixed lg:sticky top-0 h-screen z-50 w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">SS</div>
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">Admin Panel</p>
                <p className="text-xs text-primary">Seervi Samaj Konda</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {sidebarLinks.map(({ label, path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  location.pathname === path
                    ? 'bg-primary text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                {user?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
              <FiLogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
              <FiMenu className="w-5 h-5" />
            </button>
            <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition">
              <FiChevronLeft className="w-4 h-4" /> Back to Website
            </Link>
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
            {darkMode ? <FiSun className="w-5 h-5 text-yellow-400" /> : <FiMoon className="w-5 h-5" />}
          </button>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
