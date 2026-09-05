import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdown, setDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { label: 'मुख्य पृष्ठ', path: '/' },
    {
      label: 'समाज परिचय',
      children: [
        { label: 'समाज परिचय व इतिहास', path: '/about' },
        { label: 'ग्राम कोणदा परिचय', path: '/village' },
        { label: 'सकल पंच एवं केन्द्रीय समिति', path: '/committee' },
        { label: 'श्री आई जी महिला मंडल', path: '/women-committee' },
        { label: 'कोणदा ग्राम इकाई', path: '/konda-gram-unit' },
        { label: 'सामाजिक सामान्य जानकारी', path: '/social-info' },
      ],
    },
    {
      label: 'निर्देशिका',
      children: [
        { label: 'परिवार निर्देशिका', path: '/families' },
        { label: 'सदस्य निर्देशिका', path: '/members' },
        { label: 'विद्यार्थी प्रतिभा', path: '/students' },
        { label: 'व्यापार निर्देशिका', path: '/businesses' },
        { label: 'रक्तदाता सूची', path: '/blood-donors' },
        { label: 'वैवाहिक बायोडाटा', path: '/marriage' },
      ],
    },
    { label: 'लेखा-जोखा', path: '/lekha-jokha' },
    { label: 'पंच फैसले', path: '/panch-settlements' },
    { label: 'दान व्यवस्था', path: '/donations' },
    { label: 'आयोजन', path: '/events' },
    { label: 'समाचार', path: '/news' },
    { label: 'गैलरी', path: '/gallery' },
    { label: 'दस्तावेज़', path: '/documents' },
    { label: 'संपर्क', path: '/contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#7A2525]/95 backdrop-blur-md shadow-lg py-2'
          : 'bg-[#7A2525] py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group-hover:border-amber-400/50 transition">
              <img src="/Logo.webp" alt="Logo" className="w-8 h-8 rounded-full object-cover" />
            </div>
            <div>
              <p className="font-extrabold text-sm sm:text-base text-white leading-tight tracking-wide">
                श्री सिर्वी समाज
              </p>
              <p className="text-[10px] text-amber-200 font-semibold tracking-wider uppercase">
                ग्राम कोणदा (कुक्षी)
              </p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative group"
                  onMouseEnter={() => setDropdown(link.label)}
                  onMouseLeave={() => setDropdown(null)}
                >
                  <button className="px-3 py-2 text-sm font-semibold text-orange-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer">
                    {link.label}
                  </button>
                  <AnimatePresence>
                    {dropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-2xl py-2 mt-1 border border-[#E8DCC8] backdrop-blur-md"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            className="block px-4 py-2.5 text-sm text-[#2B211B] hover:bg-[#FFF8EC] hover:text-[#C85A17] font-semibold transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                    isActive(link.path)
                      ? 'text-[#2B211B] bg-[#FFF8EC] font-bold shadow-sm'
                      : 'text-orange-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <Link to="/admin" className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#C85A17] to-[#C9A44C] text-white rounded-xl text-sm font-bold hover:shadow-lg transition shadow-md">
                <FiUser className="w-4 h-4" /> एडमिन पैनल
              </Link>
            ) : user ? (
              <Link to="/profile" className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white/15 border border-white/30 text-white rounded-xl text-sm font-bold hover:bg-white/25 transition">
                <FiUser className="w-4 h-4 text-amber-300" /> मेरी प्रोफ़ाइल
              </Link>
            ) : (
              <Link to="/login" className="hidden sm:flex px-4 py-2.5 bg-gradient-to-r from-[#C85A17] to-[#C9A44C] text-white rounded-xl text-sm font-bold hover:shadow-lg transition shadow-md">
                लॉगिन
              </Link>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-xl hover:bg-white/10 text-white cursor-pointer">
              {mobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-[#C9A44C]/20 bg-[#7A2525] overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label} className="space-y-1">
                    <p className="px-4 py-1 text-xs font-bold text-[#FDE68A] uppercase tracking-wider">{link.label}</p>
                    {link.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        onClick={() => setMobileOpen(false)}
                        className={`block px-6 py-2 text-sm font-semibold rounded-lg ${isActive(child.path) ? 'text-[#C85A17] bg-[#FFF8EC]' : 'text-orange-100 hover:text-white'}`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-2 text-sm font-semibold rounded-lg ${isActive(link.path) ? 'text-[#C85A17] bg-[#FFF8EC]' : 'text-orange-100 hover:text-white'}`}
                  >
                    {link.label}
                  </Link>
                )
              )}
              {user ? (
                <div className="pt-2 border-t border-white/20 space-y-2">
                  <Link
                    to={isAdmin ? '/admin' : '/profile'}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 text-sm font-bold bg-white/20 text-white rounded-xl text-center"
                  >
                    {isAdmin ? 'एडमिन पैनल (Admin Panel)' : 'मेरी प्रोफ़ाइल (My Profile)'}
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-2.5 text-sm font-bold bg-red-600/80 text-white rounded-xl text-center"
                  >
                    लॉगआउट (Logout)
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-sm font-bold bg-gradient-to-r from-[#C85A17] to-[#C9A44C] text-white rounded-xl text-center shadow-lg mt-2"
                >
                  लॉगिन
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
