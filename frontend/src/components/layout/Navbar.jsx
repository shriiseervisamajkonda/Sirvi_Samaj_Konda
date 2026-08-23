import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiSun, FiMoon, FiUser, FiGlobe } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdown, setDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const { darkMode, toggleTheme } = useTheme();
  const { user, isAdmin } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t('nav_home'), path: '/' },
    { label: t('nav_about'), path: '/about' },
    {
      label: t('nav_directory'),
      children: [
        { label: t('nav_families'), path: '/families' },
        { label: t('nav_members'), path: '/members' },
        { label: t('nav_students'), path: '/students' },
      ],
    },
    {
      label: t('nav_committee_panch'),
      children: [
        { label: 'अखिल भारतीय सिर्वी महासभा (कोणदा इकाई)', path: '/konda-gram-unit' },
        { label: t('nav_committee_panch'), path: '/committee' },
        { label: 'श्री आई जी महिला समिती', path: '/women-committee' },
        { label: t('nav_panch_settlements'), path: '/panch-settlements' },
        { label: t('nav_social_info'), path: '/social-info' },
        { label: t('nav_lekha_jokha'), path: '/lekha-jokha' },
      ],
    },
    { label: t('nav_events'), path: '/events' },
    { label: t('nav_news'), path: '/news' },
    { label: t('nav_gallery'), path: '/gallery' },
    { label: t('nav_donate'), path: '/donations' },
    { label: t('nav_contact'), path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#7A2525]/95 border-b border-[#C9A44C]/30 shadow-lg backdrop-blur-md py-1.5' 
        : 'bg-[#7A2525] border-b border-[#C9A44C]/20 py-2.5'
    }`}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-md bg-white border border-[#C9A44C]/40">
              <img src="/Logo.webp" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-white text-sm leading-tight">{t('hero_title_1')} {t('hero_title_2')}</p>
              <p className="text-xs text-[#FDE68A] font-bold tracking-wider">{t('hero_title_3')}</p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative"
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
                <FiUser className="w-4 h-4" /> {t('nav_admin')}
              </Link>
            ) : user ? (
              <Link to="/admin" className="hidden sm:flex items-center gap-2 px-4 py-2.5 border border-white/40 text-white rounded-xl text-sm font-bold hover:bg-white/10 transition">
                {t('nav_dashboard')}
              </Link>
            ) : (
              <Link to="/login" className="hidden sm:flex px-4 py-2.5 bg-gradient-to-r from-[#C85A17] to-[#C9A44C] text-white rounded-xl text-sm font-bold hover:shadow-lg transition shadow-md">
                {t('nav_login')}
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
              {!user && (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-sm font-bold bg-gradient-to-r from-[#C85A17] to-[#C9A44C] text-white rounded-xl text-center shadow-lg mt-2"
                >
                  {t('nav_login')}
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
