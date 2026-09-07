import { useState, useMemo } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiUsers,
  FiUser,
  FiBook,
  FiBriefcase,
  FiDroplet,
  FiHeart,
  FiCalendar,
  FiImage,
  FiFileText,
  FiDollarSign,
  FiMapPin,
  FiSettings,
  FiActivity,
  FiMenu,
  FiX,
  FiLogOut,
  FiChevronLeft,
  FiShield,
  FiAward,
  FiCompass,
  FiChevronDown,
  FiLayers,
  FiMessageSquare,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

const navigationGroups = [
  {
    groupTitle: 'मुख्य नियंत्रण',
    items: [
      { label: 'डैशबोर्ड (Dashboard)', path: '/admin', icon: FiHome },
    ],
  },
  {
    groupTitle: 'संगठन एवं समितियाँ',
    items: [
      { label: 'समितियाँ एवं सकल पंच', path: '/admin/committee', icon: FiShield },
      { label: 'श्री आई जी महिला समिती', path: '/admin/women-committee', icon: FiHeart },
      { label: 'ग्राम इकाई (महासभा)', path: '/admin/gram-units', icon: FiAward },
      { label: 'गाँव परिचय (Village)', path: '/admin/village', icon: FiMapPin },
    ],
  },
  {
    groupTitle: 'निर्देशिका एवं समाज सदस्य',
    items: [
      { label: 'परिवार निर्देशिका (Families)', path: '/admin/families', icon: FiUsers },
      { label: 'समाज सदस्य (Members)', path: '/admin/members', icon: FiUser },
      { label: 'विद्यार्थी (Students)', path: '/admin/students', icon: FiBook },
    ],
  },
  {
    groupTitle: 'आयोजन एवं डिजिटल सामग्री',
    items: [
      { label: 'कार्यक्रम (Events)', path: '/admin/events', icon: FiCalendar },
      { label: 'समाचार (News)', path: '/admin/news', icon: FiFileText },
      { label: 'फ़ोटो गैलरी (Gallery)', path: '/admin/gallery', icon: FiImage },
      { label: 'दस्तावेज़ (Documents)', path: '/admin/documents', icon: FiLayers },
      { label: 'संपर्क संदेश (Contacts)', path: '/admin/contacts', icon: FiMessageSquare },
    ],
  },
  {
    groupTitle: 'लेखा-जोखा एवं समाज कार्य',
    items: [
      { label: 'दान एवं चंदा रसीदें (Donations)', path: '/admin/donations', icon: FiDollarSign },
      { label: 'आय-व्यय लेखा-जोखा', path: '/admin/lekha-jokha', icon: FiDollarSign },
      { label: 'पंच निर्णय (Settlements)', path: '/admin/panch-settlements', icon: FiBook },
      { label: 'सामाजिक नियम (Social Info)', path: '/admin/social-info', icon: FiCompass },
    ],
  },
  {
    groupTitle: 'प्रशासन एवं सेटिंग्स',
    items: [
      { label: 'मेरी प्रोफ़ाइल (My Profile)', path: '/admin/profile', icon: FiUser },
      { label: 'उपयोगकर्ता व रोल्स (Users)', path: '/admin/users', icon: FiUsers },
      { label: 'ऑडिट लॉग्स (Activity)', path: '/admin/activity-logs', icon: FiActivity },
      { label: 'पोर्टल सेटिंग्स (Settings)', path: '/admin/settings', icon: FiSettings },
    ],
  },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { logoUrl } = useSiteSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const currentSection = useMemo(() => {
    for (const group of navigationGroups) {
      const match = group.items.find((item) => item.path === location.pathname);
      if (match) return match.label;
    }
    return 'प्रशासन नियंत्रण केंद्र';
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-[#FFF8EC] text-[#2B211B] selection:bg-[#C85A17]/20 selection:text-[#7A2525]">
      {/* Sidebar Desktop & Mobile Drawer */}
      <aside
        className={`fixed lg:sticky top-0 h-screen z-50 w-[300px] xl:w-[320px] shrink-0 bg-white border-r border-[#E8DCC8] shadow-xl lg:shadow-none flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header */}
          <div className="p-5 border-b border-[#E8DCC8] flex items-center justify-between bg-gradient-to-r from-[#FFF8EC] to-white">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl overflow-hidden bg-gradient-to-br from-[#7A2525] via-[#C85A17] to-[#C9A44C] p-0.5 shadow-md group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                  <img
                    src={logoUrl || '/Logo.webp'}
                    alt="Logo"
                    className="w-8 h-8 object-contain"
                    onError={(e) => { e.currentTarget.src = '/Logo.webp'; }}
                  />
                </div>
              </div>
              <div>
                <p className="font-extrabold text-sm text-[#7A2525] tracking-tight leading-none">
                  श्री सिर्वी समाज कोणदा
                </p>
                <p className="text-[11px] font-bold text-[#C85A17] tracking-wider uppercase mt-1">
                  प्रशासन पैनल
                </p>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl text-[#766A60] hover:bg-[#FFF8EC] cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Scrollable Area */}
          <nav className="flex-1 overflow-y-auto pl-4 pr-2 py-4 space-y-6 scrollbar-thin scrollbar-thumb-[#E8DCC8]">
            {navigationGroups.map((group) => (
              <div key={group.groupTitle} className="space-y-1.5">
                <p className="px-3 text-[10px] font-black uppercase tracking-wider text-[#7A2525]/70">
                  {group.groupTitle}
                </p>
                <div className="space-y-1">
                  {group.items.map(({ label, path, icon: Icon }) => {
                    const isActive = location.pathname === path;
                    return (
                      <Link
                        key={path}
                        to={path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-[#7A2525] to-[#C85A17] text-white shadow-md font-black translate-x-1'
                            : 'text-[#2B211B] hover:bg-[#FFF8EC] hover:text-[#7A2525]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#C85A17]'}`} />
                        <span className="truncate">{label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User Profile & Logout Bottom Bar */}
          <div className="p-4 border-t border-[#E8DCC8] bg-gradient-to-b from-white to-[#FFF8EC]">
            <Link
              to="/admin/profile"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 p-2 rounded-2xl bg-white border border-[#E8DCC8] shadow-sm mb-3 hover:border-[#C85A17]/40 hover:bg-[#FFF8EC] transition cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7A2525] to-[#C85A17] flex items-center justify-center text-white font-black text-sm shrink-0 shadow group-hover:scale-105 transition-transform">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-[#2B211B] truncate group-hover:text-[#C85A17]">{user?.name || 'Admin User'}</p>
                <p className="text-[10px] font-extrabold text-[#C85A17] uppercase tracking-wider truncate">
                  {user?.role?.replace('_', ' ') || 'Administrator'}
                </p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition cursor-pointer"
            >
              <FiLogOut className="w-4 h-4" /> लॉग आउट (Logout)
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E8DCC8] px-4 sm:px-8 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-2xl border border-[#E8DCC8] text-[#7A2525] hover:bg-[#FFF8EC] cursor-pointer"
            >
              <FiMenu className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-extrabold text-[#C85A17] uppercase tracking-wider block">
                प्रशासन पोर्टल • {new Date().toLocaleDateString('hi-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-[#2B211B] leading-none mt-0.5">
                {currentSection}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#FFF8EC] hover:bg-[#F5EADB] border border-[#E8DCC8] text-[#7A2525] text-xs font-extrabold rounded-2xl transition shadow-xs cursor-pointer"
            >
              <FiChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">वेबसाइट देखें</span>
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-extrabold rounded-2xl transition shadow-xs cursor-pointer"
              title="लॉगआउट करें (Logout)"
            >
              <FiLogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">लॉगआउट</span>
            </button>
          </div>
        </header>

        {/* Page Outlet */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

