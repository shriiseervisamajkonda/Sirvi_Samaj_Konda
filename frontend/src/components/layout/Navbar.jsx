import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiSun, FiMoon, FiUser, FiGlobe } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdown, setDropdown] = useState(null);
  const { darkMode, toggleTheme } = useTheme();
  const { user, isAdmin } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();

  const navLinks = [
    { label: t('nav_home'), path: '/' },
    { label: t('nav_about'), path: '/about' },
    {
      label: t('nav_directory'),
      children: [
        { label: t('nav_families'), path: '/families' },
        { label: t('nav_members'), path: '/members' },
        { label: t('nav_students'), path: '/students' },
        { label: t('nav_businesses'), path: '/businesses' },
        { label: t('nav_donors'), path: '/blood-donors' },
      ],
    },
    {
      label: t('nav_committee_panch'),
      children: [
        { label: t('nav_committee_panch'), path: '/committee' },
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
    <nav className="sticky top-0 z-50 glass dark:bg-slate-900/80 border-b border-gray-200/50 dark:border-slate-700/50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-primary/20">
              SS
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{t('hero_title_1')} {t('hero_title_2')}</p>
              <p className="text-xs text-primary font-semibold tracking-wider">{t('hero_title_3')}</p>
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
                  <button className="px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-primary transition-colors flex items-center gap-1">
                    {link.label}
                  </button>
                  <AnimatePresence>
                    {dropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl py-2 mt-1 border border-gray-100 dark:border-slate-700 backdrop-blur-md"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary font-medium transition-colors"
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
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              title="Change Language / भाषा बदलें"
            >
              <FiGlobe className="w-3.5 h-3.5 text-primary" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-500 dark:text-gray-400">
              {darkMode ? <FiSun className="w-5 h-5 text-yellow-500" /> : <FiMoon className="w-5 h-5 text-gray-600" />}
            </button>
            
            {isAdmin ? (
              <Link to="/admin" className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition shadow-md shadow-primary/20">
                <FiUser className="w-4 h-4" /> {t('nav_admin')}
              </Link>
            ) : user ? (
              <Link to="/admin" className="hidden sm:flex items-center gap-2 px-4 py-2.5 border border-primary text-primary rounded-xl text-sm font-bold hover:bg-primary/10 transition">
                {t('nav_dashboard')}
              </Link>
            ) : (
              <Link to="/login" className="hidden sm:flex px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition shadow-md shadow-primary/20">
                {t('nav_login')}
              </Link>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400">
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
            className="lg:hidden border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label} className="space-y-1">
                    <p className="px-4 py-1 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{link.label}</p>
                    {link.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        onClick={() => setMobileOpen(false)}
                        className={`block px-6 py-2 text-sm font-medium rounded-lg ${isActive(child.path) ? 'text-primary bg-primary/5' : 'text-gray-600 dark:text-gray-400 hover:text-primary'}`}
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
                    className={`block px-4 py-2 text-sm font-semibold rounded-lg ${isActive(link.path) ? 'text-primary bg-primary/5' : 'text-gray-700 dark:text-gray-300 hover:text-primary'}`}
                  >
                    {link.label}
                  </Link>
                )
              )}
              {!user && (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-sm font-bold bg-primary text-white rounded-xl text-center shadow-lg shadow-primary/10 mt-2"
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
