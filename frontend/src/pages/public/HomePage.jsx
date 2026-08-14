import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  FiUsers, FiCalendar, FiBook, FiBriefcase, FiDroplet, FiHeart,
  FiArrowRight, FiMapPin, FiPhone, FiChevronRight,
} from 'react-icons/fi';
import { dashboardAPI, newsAPI, eventAPI, committeeAPI } from '../../services/api';
import { SkeletonHomePage } from '../../components/common/Skeleton';
import { useLanguage } from '../../context/LanguageContext';

// Animated counter component
const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const StatCard = ({ icon: Icon, value, label, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="card-glow rounded-2xl p-6 shadow-md transition-all duration-300"
  >
    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-4 shadow-md shadow-primary/20">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <p className="text-3xl font-bold text-accent mb-1">
      <Counter target={value} suffix="+" />
    </p>
    <p className="text-[#CDBBA4] text-sm font-semibold">{label}</p>
  </motion.div>
);

const HomePage = () => {
  const [stats, setStats] = useState(null);
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [committee, setCommittee] = useState([]);
  const [activeCommitteeTab, setActiveCommitteeTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, newsRes, eventsRes, committeeRes] = await Promise.allSettled([
          dashboardAPI.getPublicStats(),
          newsAPI.getAll({ limit: 3, status: 'published' }),
          eventAPI.getAll({ limit: 4, status: 'published' }),
          committeeAPI.getAll({ limit: 100 }),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
        if (newsRes.status === 'fulfilled') setNews(newsRes.value.data.data || []);
        if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.data.data || []);
        if (committeeRes.status === 'fulfilled') setCommittee(committeeRes.value.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { icon: FiUsers, key: 'families', label: t('stats_families'), color: 'bg-orange-500', delay: 0 },
    { icon: FiUsers, key: 'members', label: t('stats_members'), color: 'bg-blue-500', delay: 0.1 },
    { icon: FiBook, key: 'students', label: t('stats_students'), color: 'bg-green-500', delay: 0.2 },
    { icon: FiBriefcase, key: 'businesses', label: t('stats_businesses'), color: 'bg-purple-500', delay: 0.3 },
    { icon: FiDroplet, key: 'bloodDonors', label: t('stats_donors'), color: 'bg-red-500', delay: 0.4 },
    { icon: FiCalendar, key: 'events', label: t('stats_events'), color: 'bg-yellow-500', delay: 0.5 },
  ];

  const quickLinks = [
    { label: t('nav_families'), path: '/families', icon: FiUsers, color: 'from-orange-400 to-orange-600' },
    { label: t('nav_members'), path: '/members', icon: FiUsers, color: 'from-blue-400 to-blue-600' },
    { label: t('nav_donors'), path: '/blood-donors', icon: FiDroplet, color: 'from-red-400 to-red-600' },
    { label: t('nav_events'), path: '/events', icon: FiCalendar, color: 'from-green-400 to-green-600' },
    { label: t('nav_gallery'), path: '/gallery', icon: FiHeart, color: 'from-purple-400 to-purple-600' },
    { label: t('nav_donate'), path: '/donations', icon: FiHeart, color: 'from-pink-400 to-pink-600' },
  ];

  if (loading) return <SkeletonHomePage />;

  return (
    <div className="overflow-hidden bg-slate-950 text-gray-100">
      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center">
        {/* Full-width background image with dark gradient overlay */}
        <div className="absolute inset-0">
          <img src="/hero_background.webp" alt="Hero Background" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-white">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 bg-[#2A1010]/60 backdrop-blur border border-[#D4AF37]/30 rounded-full px-4 py-1.5 text-xs font-bold text-[#FFF3DD] mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {t('hero_address')}
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
                <span className="block text-[#FFF3DD]">{t('hero_title_1')}</span>
                <span className="block text-primary leading-tight">{t('hero_title_2')}</span>
                <span className="block text-3xl lg:text-4xl text-accent font-semibold mt-2">{t('hero_title_3')}</span>
              </h1>
              <p className="text-lg text-[#CDBBA4] leading-relaxed mb-8 max-w-lg">
                {t('hero_subtitle')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/families"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  {t('btn_explore')} <FiArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/events"
                  className="flex items-center gap-2 px-6 py-3 bg-[#2A1010]/80 backdrop-blur border border-[#4E2A1E] hover:border-[#D4AF37]/30 text-white font-bold rounded-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  {t('btn_upcoming')}
                </Link>
              </div>

              {/* Key info */}
              <div className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-[#4E2A1E]">
                {[
                  { icon: FiMapPin, text: t('hero_center_title') },
                  { icon: FiPhone, text: t('emergency_president') + ': +91 98765 43210' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-[#CDBBA4] text-sm font-semibold">
                    <Icon className="w-4 h-4 text-primary" />
                    {text}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right side — floating cards */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="relative pl-10">
                {/* Main card */}
                <div className="bg-white/15 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: t('stats_families'), value: stats?.families || 500, icon: '👨‍👩‍👧‍👦' },
                      { label: t('stats_members'), value: stats?.members || 2000, icon: '👥' },
                      { label: t('stats_students'), value: stats?.students || 300, icon: '🎓' },
                      { label: t('stats_businesses'), value: stats?.businesses || 100, icon: '🏪' },
                    ].map(({ label, value, icon }) => (
                      <div key={label} className="bg-white/20 rounded-2xl p-4 border border-white/10">
                        <div className="text-2xl mb-2">{icon}</div>
                        <p className="text-2xl font-extrabold">{value}+</p>
                        <p className="text-orange-100 text-xs font-semibold">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-white/20 rounded-2xl border border-white/10">
                    <p className="text-sm font-bold mb-2 flex items-center gap-1.5">🏛️ {t('hero_center_title')}</p>
                    <p className="text-orange-100 text-xs leading-relaxed font-medium">
                      {t('hero_center_desc')}
                    </p>
                  </div>
                </div>

                {/* Floating badges */}
                <motion.div
                  animate={{ y: [-6, 6, -6] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="absolute -top-6 -right-6 bg-white dark:bg-slate-800 rounded-2xl px-5 py-2.5 shadow-xl border border-gray-100 dark:border-slate-700"
                >
                  <p className="text-orange-500 font-bold text-xs tracking-wider uppercase">{t('hero_spiritual_title')}</p>
                  <p className="text-gray-800 dark:text-white font-extrabold text-sm">{t('hero_spiritual_name')}</p>
                </motion.div>

                <motion.div
                  animate={{ y: [6, -6, 6] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  className="absolute -bottom-6 -left-2 bg-white dark:bg-slate-800 rounded-2xl px-5 py-2.5 shadow-xl border border-gray-100 dark:border-slate-700"
                >
                  <p className="text-blue-600 font-bold text-xs tracking-wider uppercase">{t('hero_seat_title')}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-xs font-semibold">{t('hero_seat_desc')}</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60L1440 60L1440 20C1200 60 900 0 720 20C540 40 240 0 0 20L0 60Z" fill="currentColor" className="text-gray-50 dark:text-slate-900" />
          </svg>
        </div>
      </section>

      {/* Welcome / Samaj Introduction & Aai Mataji Section */}
      <section className="py-20 bg-slate-800/10 border-b border-slate-700/50">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-amber-500/20 bg-slate-900"
            >
              <img src="/aai_mataji_portrait.jpg" alt="Shri Aai Mataji" className="w-full max-h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <span className="inline-block px-4 py-1.5 bg-primary/20 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                श्री आई माताजी की असीम कृपा
              </span>
              <h2 className="text-4xl font-extrabold text-[#FFF3DD] leading-tight">
                श्री आई माताजी एवं सिर्वी समाज धरोहर
              </h2>
              <p className="text-[#CDBBA4] leading-relaxed text-lg">
                सिर्वी समाज संगठन कोणदा, धार (मध्य प्रदेश) का यह डिजिटल मंच समाज के परिवारों, गौरवशाली इतिहास, संस्कारों और विकास कार्यों को एक सूत्र में पिरोने का विनम्र प्रयास है। 
              </p>
              <div className="border-l-4 border-accent pl-4 py-2 italic text-[#766A60]">
                "आई पंथ के ११ नियम हमारे जीवन का मार्गदर्शन करते हैं और समाज की एकता ही हमारी सबसे बड़ी शक्ति है।"
              </div>
              <div className="flex gap-4">
                <Link
                  to="/about"
                  className="px-6 py-2.5 bg-secondary text-white font-bold rounded-xl shadow-md hover:bg-secondary/80 transition-all text-sm cursor-pointer"
                >
                  समाज के बारे में जानें
                </Link>
                <Link
                  to="/members"
                  className="px-6 py-2.5 border border-amber-500/30 text-amber-400 hover:border-amber-500 hover:bg-amber-500/10 font-bold rounded-xl transition-all text-sm cursor-pointer"
                >
                  सदस्य देखें
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Temple Feature Section */}
      <section className="relative py-32 overflow-hidden border-b border-slate-700/50">
        {/* Full-width background image with dark gradient overlay */}
        <div className="absolute inset-0">
          <img src="/aai_mata_temple.webp" alt="Aai Mata Temple" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl space-y-6"
          >
            <span className="text-accent font-bold text-sm tracking-wider uppercase">हमारी आस्था, हमारी पहचान</span>
            <h2 className="text-5xl font-extrabold leading-tight text-[#FFF3DD]">श्री आई जी मंदिर (बडेर) कोणदा</h2>
            <p className="text-[#CDBBA4] leading-relaxed text-lg">
              कोणदा ग्राम में स्थित माँ भगवती स्वरूप श्री आई माताजी का मंदिर समाज की भक्ति, सेवा और अटूट आस्था का मुख्य केंद्र है। यहाँ प्रतिदिन ज्योति ज्योत दर्शन, सामाजिक चर्चाएँ और धार्मिक उत्सव आयोजित किए जाते हैं।
            </p>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              और जानें <FiArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold rounded-full mb-4 uppercase tracking-wider">
              {t('stats_badge')}
            </span>
            <h2 className="text-4xl font-bold text-[#FFF3DD] mb-4">
              {t('stats_title')}
            </h2>
            <p className="text-[#CDBBA4] max-w-xl mx-auto text-sm font-medium">
              {t('stats_desc')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards.map((card) => (
              <StatCard
                key={card.key}
                icon={card.icon}
                value={stats?.[card.key] || 0}
                label={card.label}
                color={card.color}
                delay={card.delay}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 bg-gray-50 dark:bg-slate-800/50">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full mb-4 uppercase tracking-wider">
              {t('quick_badge')}
            </span>
            <h2 className="text-4xl font-bold text-[#FFF3DD] mb-4">
              {t('quick_title')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickLinks.map(({ label, path, icon: Icon, color }, i) => (
              <motion.div
                key={path}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={path}
                  className="group flex flex-col items-center gap-3 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-500/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News & Upcoming Events */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* News */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold rounded-full mb-2 uppercase tracking-wider">
                    {t('news_badge')}
                  </span>
                  <h2 className="text-3xl font-bold text-[#FFF3DD]">{t('news_title')}</h2>
                </div>
                <Link to="/news" className="flex items-center gap-1 text-orange-500 text-sm font-bold hover:gap-2 transition-all">
                  {t('news_view_all')} <FiChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {news.length > 0 ? news.map((item, i) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl hover:bg-orange-50 dark:hover:bg-orange-500/5 transition-colors group"
                  >
                    <div className="w-14 h-14 bg-orange-100 dark:bg-orange-500/20 rounded-xl flex items-center justify-center shrink-0 text-2xl">
                      📰
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#FFF3DD] text-sm mb-1 truncate group-hover:text-orange-500 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-[#CDBBA4] text-xs line-clamp-2 leading-relaxed">
                        {item.content?.replace(/<[^>]*>/g, '') || item.excerpt}
                      </p>
                      <p className="text-orange-500 text-xs mt-2 font-semibold">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-sm font-medium">{t('news_empty')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Events */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full mb-2 uppercase tracking-wider">
                    {t('events_badge')}
                  </span>
                  <h2 className="text-3xl font-bold text-[#FFF3DD]">{t('events_title')}</h2>
                </div>
                <Link to="/events" className="flex items-center gap-1 text-orange-500 text-sm font-bold hover:gap-2 transition-all">
                  {t('events_view_all')} <FiChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {events.length > 0 ? events.map((event, i) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 p-4 bg-[#2A1010] border border-[#D4AF37]/10 rounded-2xl hover:bg-[#351313] transition-colors"
                  >
                    <div className="w-14 h-14 bg-[#7A2525]/20 rounded-xl flex items-center justify-center shrink-0">
                      <div className="text-center">
                        <p className="text-lg font-bold text-[#C85A17] leading-none">
                          {new Date(event.date || event.startDate).getDate()}
                        </p>
                        <p className="text-xs text-[#C85A17] font-semibold uppercase mt-0.5">
                          {new Date(event.date || event.startDate).toLocaleString('en-IN', { month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#FFF3DD] text-sm mb-1 truncate">{event.title}</h3>
                      <p className="text-[#CDBBA4] text-xs flex items-center gap-1 font-medium">
                        <FiMapPin className="w-3.5 h-3.5 text-primary shrink-0" /> {event.location || 'Konda'}
                      </p>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-12 text-[#766A60] border border-dashed border-[#D4AF37]/10 rounded-2xl">
                    <div className="text-4xl mb-3">📅</div>
                    <p className="text-sm font-medium">{t('events_empty')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Committees & Members Section */}
      {committee.length > 0 && (
        <section className="py-20 bg-[#160D08] border-b border-[#D4AF37]/10">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <span className="inline-block px-4 py-1.5 bg-[#7A2525]/20 text-[#C85A17] text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                {t('committee_badge')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#FFF3DD] mb-3">
                समिति एवं संगठन पदाधिकारी
              </h2>
              <p className="text-[#CDBBA4] text-sm sm:text-base max-w-2xl mx-auto">
                सिर्वी समाज कोणदा की सभी कार्यकारिणी समितियों, संगठन एवं संकल पंच के समर्पित पदाधिकारी एवं सदस्य
              </p>
            </motion.div>

            {/* Committee Category Selector Tabs */}
            <div className="flex flex-wrap justify-center border-b border-[#D4AF37]/20 mb-10 gap-2">
              {[
                { id: 'all', label: 'सभी समितियां (All Committees)' },
                { id: 'committee', label: 'कार्यकारिणी समिति' },
                { id: 'sangathan', label: 'संगठन' },
                { id: 'sankal_panch', label: 'संकल पंच' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCommitteeTab(tab.id)}
                  className={`px-5 py-2.5 text-xs sm:text-sm font-bold transition-all border-b-2 rounded-t-xl -mb-[2px] cursor-pointer ${
                    activeCommitteeTab === tab.id
                      ? 'border-[#D4AF37] text-[#D4AF37] bg-[#7A2525]/30'
                      : 'border-transparent text-[#CDBBA4] hover:text-[#FFF3DD] hover:bg-[#7A2525]/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Members Display grouped by Committee */}
            <div className="space-y-10">
              {[
                { id: 'committee', title: 'कार्यकारिणी समिति (Executive Committee)', icon: '🏛️' },
                { id: 'sangathan', title: 'संगठन (Organization)', icon: '📜' },
                { id: 'sankal_panch', title: 'संकल पंच (Sankal Panch Council)', icon: '⚖️' },
              ]
                .filter((cat) => activeCommitteeTab === 'all' || activeCommitteeTab === cat.id)
                .map((cat) => {
                  const categoryMembers = committee.filter(
                    (m) => m.type === cat.id || (!m.type && cat.id === 'committee')
                  );
                  if (categoryMembers.length === 0) return null;

                  return (
                    <div key={cat.id} className="bg-[#220D08]/60 p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/15">
                      <div className="flex items-center gap-3 border-b border-[#D4AF37]/15 pb-4 mb-6">
                        <span className="text-2xl">{cat.icon}</span>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-[#FFF3DD]">{cat.title}</h3>
                          <p className="text-xs text-[#CDBBA4]">{categoryMembers.length} सदस्य नामांकित</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {categoryMembers.map((member, i) => (
                          <motion.div
                            key={member._id || i}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-center gap-4 p-4 bg-[#2A1010] rounded-2xl border border-[#D4AF37]/10 hover:border-[#D4AF37]/40 hover:shadow-lg transition-all duration-300 group"
                          >
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C85A17] to-[#D4AF37] p-0.5 shrink-0 overflow-hidden shadow-md">
                              {member.photo ? (
                                <img src={member.photo} alt={member.name} className="w-full h-full object-cover rounded-full" />
                              ) : (
                                <div className="w-full h-full bg-[#160D08] rounded-full flex items-center justify-center text-[#FFF3DD] text-lg font-bold">
                                  {member.name?.charAt(0) || 'M'}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-[#FFF3DD] text-sm group-hover:text-[#D4AF37] transition-colors truncate">
                                {member.name}
                              </p>
                              <p className="text-[#C85A17] text-xs font-semibold truncate">{member.designation}</p>
                              {member.phone && (
                                <a
                                  href={`tel:${member.phone}`}
                                  className="inline-flex items-center gap-1 text-[11px] text-[#CDBBA4] hover:text-[#D4AF37] transition-colors mt-1"
                                >
                                  <FiPhone className="w-3 h-3 text-[#C85A17]" /> {member.phone}
                                </a>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/committee"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#C85A17] to-[#7A2525] text-white rounded-xl hover:from-[#7A2525] hover:to-[#C85A17] transition-all font-bold shadow-lg hover:shadow-xl cursor-pointer text-sm"
              >
                {t('committee_view_full')} <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-orange-700 text-white">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-4">
              {t('cta_title')}
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              {t('cta_desc')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/register"
                className="flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-bold rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200"
              >
                {t('cta_btn_join')} <FiArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/donations"
                className="flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur border border-white/40 text-white font-bold rounded-xl hover:bg-white/30 transition-all duration-200"
              >
                <FiHeart className="w-5 h-5" /> {t('cta_btn_support')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="py-12 bg-white dark:bg-slate-900">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                  <FiPhone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-extrabold text-red-700 dark:text-red-400">{t('emergency_title')}</p>
                  <p className="text-xs text-red-500 font-medium">{t('emergency_desc')}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 sm:ml-auto">
                {[
                  { label: t('emergency_president'), phone: '+91 98765 43210' },
                  { label: t('emergency_secretary'), phone: '+91 87654 32109' },
                  { label: t('emergency_blood'), phone: '+91 76543 21098' },
                ].map(({ label, phone }) => (
                  <a key={label} href={`tel:${phone.replace(/\s/g, '')}`} className="flex flex-col">
                    <span className="text-xs text-gray-500 font-semibold">{label}</span>
                    <span className="font-bold text-red-600 dark:text-red-400 hover:underline">{phone}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
