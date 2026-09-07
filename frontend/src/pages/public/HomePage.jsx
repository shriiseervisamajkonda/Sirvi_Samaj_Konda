import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  FiUsers, FiCalendar, FiBook, FiBriefcase, FiDroplet, FiHeart,
  FiArrowRight, FiMapPin, FiPhone, FiChevronRight,
  FiAward, FiShield, FiUserCheck, FiFlag, FiCheckCircle,
} from 'react-icons/fi';
import { dashboardAPI, newsAPI, eventAPI, committeeAPI, gramUnitAPI, villageAPI } from '../../services/api';
import { SkeletonHomePage } from '../../components/common/Skeleton';
import LazyImage from '../../components/common/LazyImage';
import { useLanguage } from '../../context/LanguageContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { supabase } from '../../config/supabase';
// TODO: This is mock/fallback data. Remove when actual data is filled in the database.
import committeeFallback from '../../data/mock/committeeDefaultFallback.json';
import fallbackUnitPayload from '../../data/mock/kondaGramUnitFallback.json';

const { defaultSakalPanch, defaultSahayataKosh, defaultAnnapurnaBhavan, defaultWomenMembers } = committeeFallback;
const { officialFallbackData } = fallbackUnitPayload;

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
    className="bg-white rounded-3xl p-6 border border-[#E8DCC8] shadow-md hover:shadow-xl hover:border-[#C9A44C]/50 hover:-translate-y-1 transition-all duration-300"
  >
    <div className="w-12 h-12 bg-gradient-to-br from-[#C85A17] to-[#C9A44C] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/15">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <p className="text-3xl font-extrabold text-[#C85A17] mb-1">
      <Counter target={value} suffix="+" />
    </p>
    <p className="text-[#2B211B] text-sm font-bold">{label}</p>
  </motion.div>
);

const defaultStats = {
  families: 0,
  members: 0,
  students: 0,
  businesses: 0,
  bloodDonors: 0,
  events: 0,
};

const HomePage = () => {
  const [stats, setStats] = useState(defaultStats);
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [committee, setCommittee] = useState([]);
  const [gramUnitData, setGramUnitData] = useState(officialFallbackData);
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: 'कुक्षी पुलिस थाना', phone: '07297-234220' },
    { name: 'सामुदायिक स्वास्थ्य केंद्र कुक्षी', phone: '07297-234233' },
    { name: 'ग्राम पंचायत कोणदा', phone: '+91-9981644585' },
  ]);
  const [activeCommitteeTab, setActiveCommitteeTab] = useState('all');
  const [dataLoaded, setDataLoaded] = useState(false);
  const { t } = useLanguage();
  const { heroBgUrl, aaiMatajiUrl, templeBaderUrl } = useSiteSettings();

  useEffect(() => {
    let isMounted = true;

    const fetchAllData = async () => {
      try {
        const [statsRes, newsRes, eventsRes, committeeRes, gramUnitRes, villageRes] = await Promise.allSettled([
          dashboardAPI.getPublicStats(),
          newsAPI.getAll({ limit: 3, status: 'published' }),
          eventAPI.getAll({ limit: 4, status: 'published' }),
          committeeAPI.getAll({ limit: 100 }),
          gramUnitAPI.getPublicDetails(),
          villageAPI.getDetails(),
        ]);
        if (!isMounted) return;
        if (statsRes.status === 'fulfilled' && statsRes.value?.data?.data) {
          const d = statsRes.value.data.data;
          setStats(prev => ({
            ...prev,
            ...d,
            families: d.families ?? d.totalFamilies ?? prev.families,
            members: d.members ?? d.totalMembers ?? prev.members,
            students: d.students ?? d.studentCount ?? prev.students,
            events: d.events ?? d.eventCount ?? prev.events,
            bloodDonors: d.bloodDonors ?? d.bloodDonorCount ?? prev.bloodDonors,
          }));
        }
        if (newsRes.status === 'fulfilled') setNews(newsRes.value?.data?.data || []);
        if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value?.data?.data || []);
        if (committeeRes.status === 'fulfilled') setCommittee(committeeRes.value?.data?.data || []);
        if (gramUnitRes.status === 'fulfilled' && gramUnitRes.value?.data?.data) {
          setGramUnitData(gramUnitRes.value.data.data);
        }
        if (villageRes.status === 'fulfilled' && villageRes.value?.data?.data) {
          const vData = villageRes.value.data.data;
          if (Array.isArray(vData.emergency_contacts) && vData.emergency_contacts.length > 0) {
            setEmergencyContacts(vData.emergency_contacts);
          }
        }
      } catch (err) {
        console.warn('Home background data fetch warning:', err);
      } finally {
        if (isMounted) setDataLoaded(true);
      }
    };

    fetchAllData();

    // Debounce timer for realtime sync to prevent rapid duplicate DB calls
    let committeeSyncTimer = null;
    const debouncedSyncCommittees = () => {
      if (committeeSyncTimer) clearTimeout(committeeSyncTimer);
      committeeSyncTimer = setTimeout(async () => {
        try {
          const res = await committeeAPI.getAll({ limit: 100 });
          if (isMounted && res.data?.data) {
            setCommittee(res.data.data);
          }
        } catch (e) {
          console.warn('Realtime committee sync error:', e);
        }
      }, 300);
    };

    // Live real-time Supabase subscription
    const channel = supabase
      .channel('homepage_live_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'committees' }, () => {
        debouncedSyncCommittees();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, async () => {
        try {
          const res = await newsAPI.getAll({ limit: 3, status: 'published' });
          if (isMounted && res.data?.data) setNews(res.data.data);
        } catch (e) {
          console.warn('Realtime news sync error:', e);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, async () => {
        try {
          const res = await eventAPI.getAll({ limit: 4, status: 'published' });
          if (isMounted && res.data?.data) setEvents(res.data.data);
        } catch (e) {
          console.warn('Realtime event sync error:', e);
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      if (committeeSyncTimer) clearTimeout(committeeSyncTimer);
      supabase.removeChannel(channel);
    };
  }, []);

  const statCards = [
    { icon: FiUsers, key: 'families', label: t('stats_families'), color: 'bg-orange-500', delay: 0 },
    { icon: FiUsers, key: 'members', label: t('stats_members'), color: 'bg-blue-500', delay: 0.1 },
    { icon: FiBook, key: 'students', label: t('stats_students'), color: 'bg-green-500', delay: 0.2 },
    { icon: FiCalendar, key: 'events', label: t('stats_events'), color: 'bg-yellow-500', delay: 0.5 },
  ];

  const quickLinks = [
    { label: t('nav_families'), path: '/families', icon: FiUsers, color: 'from-orange-400 to-orange-600' },
    { label: t('nav_members'), path: '/members', icon: FiUsers, color: 'from-blue-400 to-blue-600' },
    { label: 'श्री आई जी महिला समिती', path: '/women-committee', icon: FiHeart, color: 'from-rose-400 to-red-600' },
    { label: t('nav_events'), path: '/events', icon: FiCalendar, color: 'from-green-400 to-green-600' },
    { label: t('nav_gallery'), path: '/gallery', icon: FiHeart, color: 'from-purple-400 to-purple-600' },
  ];

  return (
    <div className="overflow-hidden bg-[#FFF8EC] text-[#2B211B]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525] text-white">
        {/* Full-width background image with gradient overlay */}
        <div className="absolute inset-0">
          <img
            src={heroBgUrl || '/hero_background.webp'}
            alt="Shri Seervi Samaj Konda Hero Background"
            fetchpriority="high"
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover opacity-20"
            onError={(e) => { e.currentTarget.src = '/hero_background.webp'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]" />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur border border-amber-400/30 rounded-full px-4 py-1.5 text-xs font-bold text-white mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {t('hero_address')}
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
                <span className="block text-white">{t('hero_title_1')}</span>
                <span className="block text-[#FDE68A] leading-tight">{t('hero_title_2')}</span>
                <span className="block text-3xl lg:text-4xl text-orange-200 font-semibold mt-2">{t('hero_title_3')}</span>
              </h1>
              <p className="text-lg text-orange-100 leading-relaxed mb-8 max-w-lg font-medium">
                {t('hero_subtitle')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/families"
                  className="flex items-center gap-2 px-6 py-3 bg-white text-[#7A2525] font-extrabold rounded-2xl shadow-lg hover:bg-orange-50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  {t('btn_explore')} <FiArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/events"
                  className="flex items-center gap-2 px-6 py-3 bg-white/15 backdrop-blur border border-white/30 text-white font-bold rounded-2xl hover:bg-white/25 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  {t('btn_upcoming')}
                </Link>
              </div>

              {/* Key info */}
              <div className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-white/20">
                {[
                  { icon: FiMapPin, text: t('hero_center_title') },
                  { icon: FiPhone, text: `${t('emergency_president')}: +91-9981644585` },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-orange-100 text-sm font-semibold">
                    <Icon className="w-4 h-4 text-[#FDE68A]" />
                    {text}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right side — floating cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="relative pl-10">
                {/* Main card */}
                <div className="bg-white/15 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: t('stats_families'), value: stats?.families || 500, icon: '👨‍👩‍👧‍👦' },
                      { label: t('stats_members'), value: stats?.members || 2000, icon: '👥' },
                      { label: t('stats_students'), value: stats?.students || 300, icon: '🎓' },
                      { label: t('stats_events'), value: stats?.events || 12, icon: '📅' },
                    ].map(({ label, value, icon }) => (
                      <div key={label} className="bg-white/20 rounded-2xl p-4 border border-white/10">
                        <div className="text-2xl mb-2">{icon}</div>
                        <p className="text-2xl font-extrabold text-white">{value}+</p>
                        <p className="text-orange-100 text-xs font-semibold">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-white/20 rounded-2xl border border-white/10">
                    <p className="text-sm font-bold mb-2 flex items-center gap-1.5 text-white">🏛️ {t('hero_center_title')}</p>
                    <p className="text-orange-100 text-xs leading-relaxed font-medium">
                      {t('hero_center_desc')}
                    </p>
                  </div>
                </div>

                {/* Floating badges */}
                <motion.div
                  animate={{ y: [-6, 6, -6] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="absolute -top-6 -right-6 bg-white rounded-2xl px-5 py-2.5 shadow-xl border border-[#E8DCC8] text-[#2B211B]"
                >
                  <p className="text-[#C85A17] font-bold text-xs tracking-wider uppercase">{t('hero_spiritual_title')}</p>
                  <p className="font-extrabold text-sm text-[#2B211B]">{t('hero_spiritual_name')}</p>
                </motion.div>

                <motion.div
                  animate={{ y: [6, -6, 6] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  className="absolute -bottom-6 -left-2 bg-white rounded-2xl px-5 py-2.5 shadow-xl border border-[#E8DCC8] text-[#2B211B]"
                >
                  <p className="text-[#7A2525] font-bold text-xs tracking-wider uppercase">{t('hero_seat_title')}</p>
                  <p className="text-[#766A60] text-xs font-semibold">{t('hero_seat_desc')}</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Welcome / Samaj Introduction & Aai Mataji Section */}
      <section className="py-20 bg-[#FAF1E0] border-b border-[#E8DCC8]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden shadow-xl border border-[#E8DCC8] bg-white p-2"
            >
              <LazyImage
                src={aaiMatajiUrl || '/aai_mataji_portrait.jpg'}
                alt="श्री आई माताजी पावन चित्र"
                priority={true}
                className="w-full max-h-[480px] rounded-2xl"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <span className="inline-block px-4 py-1.5 bg-[#FFF8EC] border border-[#E8DCC8] text-[#C85A17] text-xs font-bold rounded-full uppercase tracking-wider">
                श्री आई माताजी की असीम कृपा
              </span>
              <h2 className="text-4xl font-extrabold text-[#2B211B] leading-tight">
                श्री आई माताजी एवं सिर्वी समाज धरोहर
              </h2>
              <p className="text-[#766A60] leading-relaxed text-lg font-medium">
                सिर्वी समाज संगठन कोणदा, धार (मध्य प्रदेश) का यह डिजिटल मंच समाज के परिवारों, गौरवशाली इतिहास, संस्कारों और विकास कार्यों को एक सूत्र में पिरोने का विनम्र प्रयास है। 
              </p>
              <div className="border-l-4 border-[#C85A17] pl-4 py-2 italic text-[#766A60] bg-white rounded-r-2xl border border-l-0 border-[#E8DCC8]">
                "आई पंथ के ११ नियम हमारे जीवन का मार्गदर्शन करते हैं और समाज की एकता ही हमारी सबसे बड़ी शक्ति है।"
              </div>
              <div className="flex gap-4">
                <Link
                  to="/about"
                  className="px-6 py-3 bg-[#7A2525] text-white font-bold rounded-2xl shadow-md hover:bg-[#5C1A1A] transition-all text-sm cursor-pointer"
                >
                  समाज के बारे में जानें
                </Link>
                <Link
                  to="/members"
                  className="px-6 py-3 bg-white border border-[#E8DCC8] text-[#2B211B] hover:border-[#C85A17] hover:bg-[#FFF8EC] font-bold rounded-2xl shadow-sm transition-all text-sm cursor-pointer"
                >
                  सदस्य देखें
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Temple Feature Section */}
      <section className="relative py-24 overflow-hidden border-b border-[#E8DCC8] bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]">
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <img
            src="/hero_background.webp"
            alt="Texture"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side: Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 border border-amber-400/30 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                <span>🚩</span> हमारी आस्था, हमारी पहचान
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight text-white drop-shadow-sm">
                श्री आई जी मंदिर (बडेर) कोणदा
              </h2>
              <p className="text-orange-100 leading-relaxed text-base sm:text-lg font-medium">
                कोणदा ग्राम में स्थित माँ भगवती स्वरूप श्री आई माताजी का पावन मंदिर समाज की भक्ति, सेवा और अटूट आस्था का मुख्य केंद्र है। यहाँ प्रतिदिन अखंड ज्योति दर्शन, नियमित आरती एवं सामाजिक-धार्मिक उत्सव संपन्न होते हैं।
              </p>

              {/* Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {[
                  { icon: '✨', title: 'अखंड ज्योति', desc: 'अनवरत प्रज्ज्वलित' },
                  { icon: '🙏', title: 'दैनिक आरती', desc: 'प्रातः एवं सांध्य वंदन' },
                  { icon: '🏛️', title: 'भव्य बडेर', desc: 'पवित्र आस्था केंद्र' },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-sm"
                  >
                    <div className="text-xl mb-1">{item.icon}</div>
                    <p className="font-bold text-sm text-white">{item.title}</p>
                    <p className="text-[11px] text-orange-200">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/gallery"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#7A2525] font-extrabold rounded-2xl shadow-xl hover:bg-orange-50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-sm"
                >
                  मंदिर दर्शन गैलरी <FiArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/20 backdrop-blur border border-white/30 text-white font-bold rounded-2xl hover:bg-white/30 transition-all text-sm cursor-pointer"
                >
                  मंदिर का इतिहास
                </Link>
              </div>
            </motion.div>

            {/* Right side: Prominent Temple Image Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-3xl p-3 bg-white/20 backdrop-blur-md border-2 border-amber-400/40 shadow-2xl overflow-hidden group">
                <div className="rounded-2xl overflow-hidden shadow-inner bg-[#351313] aspect-[4/3] sm:aspect-[16/11]">
                  <img
                    src={templeBaderUrl || '/aai_mata_temple.webp'}
                    alt="श्री आई जी मंदिर (बडेर) कोणदा"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.src = '/aai_mata_temple.webp'; }}
                  />
                </div>

                {/* Floating Badge on Image */}
                <div className="absolute bottom-6 left-6 right-6 bg-[#2B211B]/85 backdrop-blur-md p-3.5 rounded-2xl border border-amber-400/30 text-white shadow-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C85A17] to-[#C9A44C] flex items-center justify-center text-white text-sm font-bold shrink-0">
                      🚩
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-white">श्री आई जी मंदिर (बडेर)</p>
                      <p className="text-[11px] text-orange-200">ग्राम कोणदा, तहसील कुक्षी (धार)</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-lg">
                    पावन धाम
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* SECTION: SAKAL PANCH (सकल पंच) — Placed BEFORE Akhil Bharatiya Sirvi Mahasabha & Konda Gram Unit */}
      <section className="py-20 bg-gradient-to-b from-[#FFF8EC] to-white border-b border-[#E8DCC8] relative overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-[#E8DCC8] rounded-full text-xs sm:text-sm font-bold text-[#7A2525] uppercase tracking-wider mb-4 shadow-sm">
              <FiShield className="w-4 h-4 text-[#C85A17]" />
              सिर्वी समाज कोणदा • सर्वोच्च सामाजिक व्यवस्था
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2B211B] tracking-tight leading-tight mb-3">
              सकल पंच
            </h2>

            <p className="text-[#C85A17] font-bold text-base sm:text-lg spiritual-title mb-2">
              समाज की स्थानीय सामाजिक एवं संगठनात्मक व्यवस्था में सकल पंचों की महत्वपूर्ण भूमिका होती है।
            </p>
            <p className="text-[#766A60] text-sm max-w-2xl mx-auto font-medium">
              पारंपरिक सामाजिक मार्गदर्शन, समन्वय एवं निर्णय प्रक्रिया के स्तंभ
            </p>
          </motion.div>

          {/* Sakal Panch Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
            {(
              committee.filter((m) => (m.committee_type === 'sankal_panch' || m.type === 'sankal_panch') && m.is_active !== false).length > 0
                ? committee.filter((m) => (m.committee_type === 'sankal_panch' || m.type === 'sankal_panch') && m.is_active !== false)
                : defaultSakalPanch
            ).map((panch, idx) => (
              <motion.div
                key={panch.id || panch._id || panch.name || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white rounded-3xl p-6 text-center border border-[#E8DCC8] hover:border-[#C9A44C]/60 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 relative group flex flex-col justify-between"
              >
                <div>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7A2525] via-[#C85A17] to-[#C9A44C] p-1 mx-auto mb-4 shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
                    {panch.photo_url || panch.photo ? (
                      <img src={panch.photo_url || panch.photo} alt={panch.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full bg-[#FFF8EC] rounded-full flex items-center justify-center text-[#7A2525] text-2xl font-black">
                        {panch.name?.charAt(0) || '👑'}
                      </div>
                    )}
                  </div>
                  <div className="inline-block px-3 py-1 bg-[#FFF8EC] border border-[#E8DCC8] rounded-full text-xs font-extrabold text-[#7A2525] mb-3">
                    {panch.designation || panch.पद || 'सकल पंच / वरिष्ठ मार्गदर्शक'}
                  </div>
                  <h3 className="font-bold text-[#2B211B] text-base leading-snug mb-1.5">
                    {panch.name}
                  </h3>
                  {panch.phone ? (
                    <a href={`tel:${panch.phone}`} className="text-xs text-[#766A60] font-semibold flex items-center justify-center gap-1 hover:text-[#C85A17]">
                      <FiPhone className="w-3 h-3 text-[#C85A17]" /> {panch.phone}
                    </a>
                  ) : (
                    <p className="text-xs text-[#766A60] font-semibold flex items-center justify-center gap-1">
                      <FiMapPin className="w-3 h-3 text-[#C85A17]" /> ग्राम {panch.village || 'कोणदा'} (कुक्षी)
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8DCC8] text-xs text-[#C85A17] font-bold">
                  सिर्वी समाज सकल पंच
                </div>
              </motion.div>
            ))}
          </div>

          {/* Action Button to Sakal Panch & Organization Page */}
          <div className="text-center">
            <Link
              to="/konda-gram-unit"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#7A2525] to-[#C85A17] hover:from-[#5C1A1A] hover:to-[#B04C10] text-white font-extrabold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm cursor-pointer"
            >
              <span>सकल पंच एवं ग्राम इकाई की अधिक जानकारी</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Akhil Bharatiya Sirvi Mahasabha — Konda Gram Unit Feature Section */}
      <section className="py-20 bg-[#FFF8EC] border-b border-[#E8DCC8] relative overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-[#E8DCC8] rounded-full text-xs sm:text-sm font-bold text-[#C85A17] uppercase tracking-wider mb-4 shadow-sm">
              <FiFlag className="w-4 h-4 text-[#C85A17]" />
              अखिल भारतीय सिर्वी महासभा मध्यप्रदेश • नवीन मनोनयन
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2B211B] tracking-tight leading-tight mb-3">
              अखिल भारतीय सिर्वी महासभा मध्यप्रदेश — कोणदा ग्राम इकाई
            </h2>

            <p className="text-[#C85A17] font-bold text-base sm:text-lg spiritual-title">
              *कोणदा / कुक्षी / मध्यप्रदेश* • सर्वसम्मति से ग्राम इकाई का गठन
            </p>
          </motion.div>

          {/* Official Announcement Statement Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DCC8] shadow-md mb-12 relative overflow-hidden text-[#2B211B]"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C85A17] to-[#C9A44C] flex items-center justify-center text-white text-2xl shrink-0 shadow-md">
                📜
              </div>
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-[#7A2525] flex items-center gap-2">
                  <FiAward className="text-[#C85A17]" /> आधिकारिक गठन उद्घोषणा
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-[#766A60] font-medium">
                  <strong className="text-[#2B211B]">*कोणदा/कुक्षी/मध्यप्रदेश*</strong>। अखिल भारतीय सिर्वी महासभा मध्यप्रदेश के नवीन मनोनयन की प्रक्रिया के तहत कुक्षी तहसील के <strong className="text-[#2B211B]">*ग्राम कोणदा में ग्राम इकाई का गठन नियुक्त पर्यवेक्षक हिरालालजी हम्मड कापसी एवं स्थानीय पंचों की उपस्थिति में किया गया*</strong> जिसमें सर्वसम्मति से पदाधिकारियों एवं समाज प्रतिनिधियों का चयन किया गया।
                </p>
                <div className="pt-3 border-t border-[#E8DCC8]/60 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-[#766A60] font-semibold">
                  <span className="flex items-center gap-1.5 text-[#C85A17]">
                    <FiUserCheck className="w-4 h-4" /> नियुक्त पर्यवेक्षक: <strong className="text-[#2B211B]">हिरालालजी हम्मड कापसी</strong>
                  </span>
                  <span className="italic text-[#766A60]">*इस अवसर पर सिर्वी समाज सकल पंच सहित समाज के नवयुवक एवं वरिष्ठजन उपस्थित थे।*</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Structured Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Card 1: Key Office Bearers (पदाधिकारी) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 border border-[#E8DCC8] hover:border-[#C9A44C]/60 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-[#E8DCC8]">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C85A17] to-[#C9A44C] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    🏛️
                  </div>
                  <h4 className="font-bold text-base text-[#2B211B]">मुख्य पदाधिकारी</h4>
                </div>

                <ul className="space-y-2.5 text-xs sm:text-sm">
                  {(gramUnitData?.officeBearers?.length ? gramUnitData.officeBearers : officialFallbackData.officeBearers).map((ob, idx) => (
                    <li key={ob.id || ob.name || idx} className="p-2.5 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                      <span className="text-[#C85A17] font-extrabold block text-xs">{ob.designation || 'पदाधिकारी'}</span>
                      <span className="font-bold text-[#2B211B]">{ob.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Card 2: Gram Unit Members (सदस्य) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 border border-[#E8DCC8] hover:border-[#C9A44C]/60 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-[#E8DCC8]">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7A2525] to-[#C85A17] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    👥
                  </div>
                  <h4 className="font-bold text-base text-[#2B211B]">
                    ग्राम इकाई सदस्य ({ (gramUnitData?.members?.length ? gramUnitData.members : officialFallbackData.members).length })
                  </h4>
                </div>

                <ul className="space-y-2 text-xs sm:text-sm">
                  {(gramUnitData?.members?.length ? gramUnitData.members : officialFallbackData.members).map((m, i) => (
                    <li key={m.id || m.name || i} className="flex items-center gap-2 p-2 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                      <span className="w-5 h-5 rounded-full bg-[#C85A17] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-[#2B211B] truncate">{m.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Card 3: Tehsil Representatives (तहसील प्रतिनिधि) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 border border-[#E8DCC8] hover:border-[#C9A44C]/60 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-[#E8DCC8]">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C85A17] to-[#C9A44C] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    🌾
                  </div>
                  <h4 className="font-bold text-base text-[#2B211B]">तहसील प्रतिनिधि (कुक्षी)</h4>
                </div>

                <ul className="space-y-2 text-xs sm:text-sm">
                  {(gramUnitData?.representatives?.tehsil?.length
                    ? gramUnitData.representatives.tehsil
                    : officialFallbackData.representatives.tehsil
                  ).map((rep, i) => (
                    <li key={rep.id || rep.name || i} className="flex items-center gap-2 p-2 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                      <span className="w-5 h-5 rounded-full bg-[#C9A44C] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-[#2B211B] truncate">{rep.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Card 4: District & State Representatives (जिला एवं प्रदेश प्रतिनिधि) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-6 border border-[#E8DCC8] hover:border-[#C9A44C]/60 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-[#E8DCC8]">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7A2525] to-[#C85A17] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    🌟
                  </div>
                  <h4 className="font-bold text-base text-[#2B211B]">जिला एवं प्रदेश प्रतिनिधि</h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#C85A17] block mb-1.5">
                      जिला प्रतिनिधि (धार)
                    </span>
                    <ul className="space-y-1.5 text-xs">
                      {(gramUnitData?.representatives?.district?.length
                        ? gramUnitData.representatives.district
                        : officialFallbackData.representatives.district
                      ).map((rep, i) => (
                        <li key={rep.id || rep.name || i} className="flex items-center gap-2 p-1.5 rounded-xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                          <span className="text-[10px] text-[#C85A17] font-bold">{i + 1}.</span>
                          <span className="font-semibold text-[#2B211B] truncate">{rep.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-[#E8DCC8]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A2525] block mb-1.5">
                      प्रदेश प्रतिनिधि (मध्यप्रदेश)
                    </span>
                    <div className="p-2.5 rounded-2xl bg-gradient-to-r from-[#FFF8EC] to-[#FAF1E0] border border-[#E8DCC8]">
                      <span className="text-xs font-black text-[#7A2525] block">
                        1. { (gramUnitData?.representatives?.state?.[0]?.name || officialFallbackData.representatives.state[0].name) }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Call to action for full gram unit page */}
          <div className="text-center">
            <Link
              to="/konda-gram-unit"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#C85A17] to-[#C9A44C] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm cursor-pointer"
            >
              अखिल भारतीय सिर्वी महासभा — कोणदा ग्राम इकाई का पूर्ण विवरण देखें <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Akhil Bharatiya Sirvi Samaj Yuva Sangathan — Konda Unit Feature Section */}
      <section className="py-20 bg-[#FAF1E0] border-b border-[#E8DCC8] relative overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FFF8EC] border border-[#E8DCC8] rounded-full text-xs sm:text-sm font-bold text-[#C85A17] uppercase tracking-wider mb-4 shadow-sm">
              <span>⚡</span> अखिल भारतीय सिर्वी समाज युवा संगठन • नवीन कार्यकारिणी
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2B211B] tracking-tight leading-tight mb-3">
              अखिल भारतीय सिर्वी समाज युवा संगठन — कोणदा
            </h2>

            <p className="text-[#C85A17] font-bold text-base sm:text-lg spiritual-title">
              *कोणदा / कुक्षी / मध्यप्रदेश* • युवा शक्ति, सामाजिक एकता एवं सेवा संकल्प
            </p>
          </motion.div>

          {/* Official Announcement Statement Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DCC8] shadow-md mb-12 relative overflow-hidden text-[#2B211B]"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C85A17] to-[#7A2525] flex items-center justify-center text-white text-2xl shrink-0 shadow-md">
                🚩
              </div>
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-[#7A2525] flex items-center gap-2">
                  <FiAward className="text-[#C85A17]" /> युवा संगठन नवीन कार्यकारिणी गठन उद्घोषणा
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-[#766A60] font-medium">
                  <strong className="text-[#2B211B]">*कोणदा/कुक्षी/मध्यप्रदेश*</strong>। अखिल भारतीय सिर्वी समाज युवा संगठन की नवीन कार्यकारिणी का गठन किया गया है। यह गठन <strong className="text-[#2B211B]">*सिर्वी समाज इकाई संगठन की अनुशंसा एवं तहसील प्रतिनिधि, जिला प्रतिनिधि, प्रदेश प्रतिनिधि की उपस्थिति में सर्वसम्मति से किया गया।*</strong>
                </p>
                <div className="pt-3 border-t border-[#E8DCC8]/60 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-bold">
                  <span className="flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1 rounded-xl border border-green-200">
                    <FiCheckCircle className="w-4 h-4" /> सर्वसम्मति से चयनित कार्यकारिणी
                  </span>
                  <span className="text-[#C85A17] text-sm font-extrabold italic">
                    🎉 *नवीन कार्यकारिणी को बहुत बहुत बधाई एवं शुभकामनाएं*
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Structured Roles Grid for Yuva Sangathan */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
            {/* Card 1: Key Leadership */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 border border-[#E8DCC8] hover:border-[#C9A44C]/60 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-[#E8DCC8]">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C85A17] to-[#C9A44C] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    👑
                  </div>
                  <h4 className="font-bold text-base text-[#2B211B]">मुख्य नेतृत्व</h4>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm">
                  <li className="p-2.5 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                    <span className="text-[#C85A17] font-extrabold block text-xs">अध्यक्ष</span>
                    <span className="font-bold text-[#2B211B] text-sm">विजय कानाजी पडियार</span>
                  </li>
                  <li className="p-2.5 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                    <span className="text-[#C85A17] font-extrabold block text-xs">महासचिव</span>
                    <span className="font-bold text-[#2B211B] text-sm">गोविंद गोपाल जी बर्फा</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Card 2: Vice Presidents & Secretaries */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="bg-white rounded-3xl p-6 border border-[#E8DCC8] hover:border-[#C9A44C]/60 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-[#E8DCC8]">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7A2525] to-[#C85A17] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    🤝
                  </div>
                  <h4 className="font-bold text-base text-[#2B211B]">उपाध्यक्ष एवं सचिव मण्डल</h4>
                </div>

                <ul className="space-y-2 text-xs sm:text-sm">
                  <li className="p-2.5 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                    <span className="text-[#C85A17] font-extrabold block text-[11px]">उपाध्यक्ष (2)</span>
                    <span className="font-bold text-[#2B211B] block">1. विजय रतनजी भायल</span>
                    <span className="font-bold text-[#2B211B] block">2. किशोर प्रभुजी गेहलोत</span>
                  </li>
                  <li className="p-2.5 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                    <span className="text-[#C85A17] font-extrabold block text-[11px]">सचिव</span>
                    <span className="font-bold text-[#2B211B]">विशाल अर्जुन जी सोलंकी</span>
                  </li>
                  <li className="p-2.5 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                    <span className="text-[#C85A17] font-extrabold block text-[11px]">सह सचिव</span>
                    <span className="font-bold text-[#2B211B]">सुरज भानाजी चौहान</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Card 3: Finance, Media & Education Cell */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.16 }}
              className="bg-white rounded-3xl p-6 border border-[#E8DCC8] hover:border-[#C9A44C]/60 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-[#E8DCC8]">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C85A17] to-[#C9A44C] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    💼
                  </div>
                  <h4 className="font-bold text-base text-[#2B211B]">कोषाध्यक्ष, मीडिया एवं शिक्षा</h4>
                </div>

                <ul className="space-y-2 text-xs sm:text-sm">
                  <li className="p-2 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                    <span className="text-[#C85A17] font-extrabold block text-[11px]">कोषाध्यक्ष (2)</span>
                    <span className="font-bold text-[#2B211B] block">1. दिलीप कन्हैयालाल जी अगल्चा</span>
                    <span className="font-bold text-[#2B211B] block">2. विकास मुलचदंजी काग</span>
                  </li>
                  <li className="p-2 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                    <span className="text-[#C85A17] font-extrabold block text-[11px]">मिडिया प्रभारी (2)</span>
                    <span className="font-bold text-[#2B211B] block">1. आकाश रमेशजी चोयल</span>
                    <span className="font-bold text-[#2B211B] block">2. जयंती लाल लक्ष्मण जी राठौर</span>
                  </li>
                  <li className="p-2 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                    <span className="text-[#C85A17] font-extrabold block text-[11px]">शिक्षा प्रकोष्ठ</span>
                    <span className="font-bold text-[#2B211B]">अनिल महेश जी सिदंड़ा</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Card 4: Executive Members (सदस्य) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.24 }}
              className="bg-white rounded-3xl p-6 border border-[#E8DCC8] hover:border-[#C9A44C]/60 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-[#E8DCC8]">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7A2525] to-[#C85A17] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    👥
                  </div>
                  <h4 className="font-bold text-base text-[#2B211B]">कार्यकारिणी सदस्य (4)</h4>
                </div>

                <ul className="space-y-2 text-xs sm:text-sm">
                  {[
                    'सजय मुन्नालाल जी पवार',
                    'सजय हरि जी लछेटा',
                    'लोकेश प्रकाशजी सेणचा',
                    'महेश मोहन जी भायल',
                  ].map((name, i) => (
                    <li key={name} className="flex items-center gap-2 p-2 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                      <span className="w-5 h-5 rounded-full bg-[#C85A17] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-[#2B211B] truncate">{name}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 pt-2.5 border-t border-[#E8DCC8] text-[11px] text-[#766A60] font-medium">
                  अनुशंसा: सिर्वी समाज इकाई संगठन कोणदा
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-[#FFF8EC] border-b border-[#E8DCC8]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-white border border-[#E8DCC8] text-[#C85A17] text-xs font-bold rounded-full mb-4 uppercase tracking-wider shadow-sm">
              {t('stats_badge')}
            </span>
            <h2 className="text-4xl font-extrabold text-[#2B211B] mb-3">
              {t('stats_title')}
            </h2>
            <p className="text-[#766A60] max-w-xl mx-auto text-sm font-medium">
              {t('stats_desc')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto gap-4">
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
      <section className="py-20 bg-[#FAF1E0] border-b border-[#E8DCC8]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-[#FFF8EC] border border-[#E8DCC8] text-[#7A2525] text-xs font-bold rounded-full mb-4 uppercase tracking-wider shadow-sm">
              {t('quick_badge')}
            </span>
            <h2 className="text-4xl font-extrabold text-[#2B211B] mb-3">
              {t('quick_title')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                  className="group flex flex-col items-center gap-3 p-6 bg-white rounded-3xl border border-[#E8DCC8] hover:border-[#C9A44C]/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center shadow-md"
                >
                  <div className="w-13 h-13 bg-gradient-to-br from-[#C85A17] to-[#C9A44C] rounded-2xl flex items-center justify-center shadow-md shadow-orange-500/10 group-hover:scale-110 transition-transform duration-200">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-bold text-[#2B211B] group-hover:text-[#C85A17] transition-colors">{label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News & Upcoming Events */}
      <section className="py-20 bg-[#FFF8EC] border-b border-[#E8DCC8]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* News */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="inline-block px-3 py-1 bg-white border border-[#E8DCC8] text-[#C85A17] text-xs font-bold rounded-full mb-2 uppercase tracking-wider shadow-sm">
                    {t('news_badge')}
                  </span>
                  <h2 className="text-3xl font-extrabold text-[#2B211B]">{t('news_title')}</h2>
                </div>
                <Link to="/news" className="flex items-center gap-1 text-[#C85A17] text-sm font-bold hover:gap-2 transition-all">
                  {t('news_view_all')} <FiChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {news.length > 0 ? news.map((item, i) => (
                  <motion.div
                    key={item.id || item._id || i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 p-5 bg-white rounded-3xl border border-[#E8DCC8] hover:border-[#C9A44C]/50 hover:shadow-lg transition-all group"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-[#FFF8EC] to-[#FAF1E0] border border-[#E8DCC8] rounded-2xl flex items-center justify-center shrink-0 text-2xl shadow-sm">
                      📰
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#2B211B] text-base mb-1 truncate group-hover:text-[#C85A17] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-[#766A60] text-xs line-clamp-2 leading-relaxed font-medium">
                        {item.content?.replace(/<[^>]*>/g, '') || item.excerpt}
                      </p>
                      <p className="text-[#C85A17] text-xs mt-2 font-bold">
                        {new Date(item.created_at || item.createdAt || Date.now()).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-12 text-[#766A60] bg-white border border-dashed border-[#E8DCC8] rounded-3xl">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-sm font-semibold">{t('news_empty')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Events */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="inline-block px-3 py-1 bg-white border border-[#E8DCC8] text-green-700 text-xs font-bold rounded-full mb-2 uppercase tracking-wider shadow-sm">
                    {t('events_badge')}
                  </span>
                  <h2 className="text-3xl font-extrabold text-[#2B211B]">{t('events_title')}</h2>
                </div>
                <Link to="/events" className="flex items-center gap-1 text-[#C85A17] text-sm font-bold hover:gap-2 transition-all">
                  {t('events_view_all')} <FiChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {events.length > 0 ? events.map((event, i) => (
                  <motion.div
                    key={event.id || event._id || i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 p-5 bg-white border border-[#E8DCC8] rounded-3xl hover:border-[#C9A44C]/50 hover:shadow-lg transition-all"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-[#7A2525] to-[#C85A17] rounded-2xl flex items-center justify-center shrink-0 shadow-md">
                      <div className="text-center text-white">
                        <p className="text-lg font-black leading-none">
                          {new Date(event.start_date || event.startDate || event.date || Date.now()).getDate()}
                        </p>
                        <p className="text-[10px] text-orange-200 font-bold uppercase mt-0.5">
                          {new Date(event.start_date || event.startDate || event.date || Date.now()).toLocaleString('hi-IN', { month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#2B211B] text-base mb-1 truncate">{event.title}</h3>
                      <p className="text-[#766A60] text-xs flex items-center gap-1 font-semibold mt-1">
                        <FiMapPin className="w-3.5 h-3.5 text-[#C85A17] shrink-0" /> {event.location || 'कोणदा'}
                      </p>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-12 text-[#766A60] bg-white border border-dashed border-[#E8DCC8] rounded-3xl">
                    <div className="text-4xl mb-3">📅</div>
                    <p className="text-sm font-semibold">{t('events_empty')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Committees & Members Section */}
      {committee.length > 0 && (
        <section className="py-20 bg-[#FAF1E0] border-b border-[#E8DCC8]">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <span className="inline-block px-4 py-1.5 bg-white border border-[#E8DCC8] text-[#C85A17] text-xs font-bold rounded-full mb-3 uppercase tracking-wider shadow-sm">
                {t('committee_badge')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2B211B] mb-3">
                समिति एवं संगठन पदाधिकारी
              </h2>
              <p className="text-[#766A60] text-sm sm:text-base max-w-2xl mx-auto font-medium">
                सिर्वी समाज कोणदा की सभी कार्यकारिणी समितियों, संगठन एवं संकल पंच के समर्पित पदाधिकारी एवं सदस्य
              </p>
            </motion.div>

            {/* Committee Category Selector Tabs */}
            <div className="flex flex-wrap justify-center border-b border-[#E8DCC8] mb-10 gap-2">
              {[
                { id: 'all', label: 'सभी समितियां' },
                { id: 'sahayata_kosh', label: 'श्री आईं जी सहायता कोष समिति' },
                { id: 'bhavan_samiti', label: 'प्रमुख समिति एवं माँ अन्नपूर्णा भवन समिति' },
                { id: 'committee', label: 'कार्यकारिणी समिति' },
                { id: 'women_committee', label: 'श्री आई जी महिला समिती' },
                { id: 'sangathan', label: 'संगठन' },
                { id: 'sankal_panch', label: 'संकल पंच' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCommitteeTab(tab.id)}
                  className={`px-5 py-2.5 text-xs sm:text-sm font-bold transition-all border-b-2 rounded-t-2xl -mb-[2px] cursor-pointer ${
                    activeCommitteeTab === tab.id
                      ? 'border-[#C85A17] text-[#C85A17] bg-white shadow-sm font-black'
                      : 'border-transparent text-[#766A60] hover:text-[#2B211B] hover:bg-white/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Members Display grouped by Committee */}
            <div className="space-y-10">
              {/* Shri Aai Ji Sahayata Kosh Samiti */}
              {(activeCommitteeTab === 'all' || activeCommitteeTab === 'sahayata_kosh') && (() => {
                const liveSahayataMembers = committee.filter(
                  (m) => (m.committee_type === 'sahayata_kosh' || m.type === 'sahayata_kosh') && m.is_active !== false
                );
                const hasLiveSahayata = liveSahayataMembers.length > 0;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DCC8] shadow-md relative overflow-hidden text-[#2B211B]"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8DCC8] pb-5 mb-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C85A17] to-[#C9A44C] flex items-center justify-center text-2xl shadow-md shrink-0 text-white font-black">
                          🤝
                        </div>
                        <div>
                          <div className="inline-block px-3 py-0.5 bg-[#FFF8EC] border border-[#E8DCC8] rounded-full text-[11px] font-bold text-[#C85A17] uppercase tracking-wider mb-1">
                            आपातकालीन सहायता • समाज सेवा • परस्पर सहयोग कोष
                          </div>
                          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#2B211B]">
                            श्री आईं जी सहायता कोष समिति
                          </h3>
                        </div>
                      </div>

                      <span className="self-start md:self-auto px-4 py-1.5 bg-[#FFF8EC] border border-[#E8DCC8] text-[#C85A17] text-xs font-bold rounded-xl">
                        पदाधिकारी एवं कार्यकारिणी सदस्य
                      </span>
                    </div>

                    <p className="text-[#766A60] text-sm sm:text-base leading-relaxed mb-6 font-medium">
                      समाज बंधुओं के आकस्मिक सहयोग, चिकित्सा व आपातकालीन सहायता तथा कल्याणकारी कार्यों हेतु स्थापित श्री आईं जी सहायता कोष समिति।
                    </p>

                    {/* Main Office Bearers */}
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-[#7A2525] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span>👑</span> मुख्य पदाधिकारी
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
                        {(hasLiveSahayata
                          ? liveSahayataMembers.map((m) => ({ name: m.name, role: m.designation || 'पदाधिकारी' }))
                          : defaultSahayataKosh.officers
                        ).map((item, idx) => (
                          <motion.div
                            key={item.name + idx}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.04 }}
                            className="p-4 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8] hover:border-[#C9A44C]/60 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-xs font-extrabold text-[#C85A17] px-2 py-0.5 bg-white rounded-lg border border-[#E8DCC8]">
                                {item.role}
                              </span>
                              <span className="text-[10px] text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-200">सक्रिय</span>
                            </div>
                            <p className="font-bold text-[#2B211B] text-sm leading-snug">
                              {item.name}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Fallback Executive Members when not in DB */}
                    {!hasLiveSahayata && defaultSahayataKosh.members && (
                      <div className="pt-4 border-t border-[#E8DCC8]">
                        <h4 className="text-sm font-bold text-[#7A2525] uppercase tracking-wider mb-3 flex items-center gap-2">
                          <span>👥</span> कार्यकारिणी सदस्य ({defaultSahayataKosh.members.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                          {defaultSahayataKosh.members.map((name, i) => (
                            <div
                              key={name}
                              className="flex items-center gap-2 p-3 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60"
                            >
                              <span className="w-5 h-5 rounded-full bg-[#C85A17] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                {i + 1}
                              </span>
                              <span className="font-semibold text-xs text-[#2B211B] truncate">{name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })()}

              {/* Pramukh Samiti Evam Maa Annapurna Bhavan Samiti */}
              {(activeCommitteeTab === 'all' || activeCommitteeTab === 'bhavan_samiti') && (() => {
                const liveBhavanMembers = committee.filter(
                  (m) => (m.committee_type === 'bhavan_samiti' || m.type === 'bhavan_samiti') && m.is_active !== false
                );
                const bhavanList = liveBhavanMembers.length > 0 ? liveBhavanMembers : defaultAnnapurnaBhavan;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DCC8] shadow-md relative overflow-hidden text-[#2B211B]"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8DCC8] pb-5 mb-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7A2525] to-[#C85A17] flex items-center justify-center text-2xl shadow-md shrink-0 text-white font-black">
                          🏛️
                        </div>
                        <div>
                          <div className="inline-block px-3 py-0.5 bg-[#FFF8EC] border border-[#E8DCC8] rounded-full text-[11px] font-bold text-[#C85A17] uppercase tracking-wider mb-1">
                            भवन प्रबंधन • समाज सेवा • व्यवस्था संचालन
                          </div>
                          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#2B211B]">
                            प्रमुख समिति एवं माँ अन्नपूर्णा भवन समिति
                          </h3>
                        </div>
                      </div>

                      <span className="self-start md:self-auto px-4 py-1.5 bg-[#FFF8EC] border border-[#E8DCC8] text-[#C85A17] text-xs font-bold rounded-xl">
                        {bhavanList.length} प्रमुख पदाधिकारी एवं सदस्य
                      </span>
                    </div>

                    <p className="text-[#766A60] text-sm sm:text-base leading-relaxed mb-6 font-medium">
                      माँ अन्नपूर्णा भवन कोणदा के सुव्यवस्थित संचालन, सामाजिक एवं मांगलिक आयोजनों की व्यवस्था तथा समाज हितैषी गतिविधियों हेतु समर्पित प्रमुख समिति।
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                      {bhavanList.map((member, i) => (
                        <motion.div
                          key={member.id || member._id || member.name || i}
                          initial={{ opacity: 0, y: 15 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05 }}
                          className="flex flex-col justify-between p-5 bg-[#FFF8EC] rounded-3xl border border-[#E8DCC8] hover:border-[#C9A44C]/60 hover:shadow-lg transition-all duration-300 group"
                        >
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C85A17] to-[#C9A44C] flex items-center justify-center text-white text-base font-extrabold shadow-md shrink-0 overflow-hidden">
                                {member.photo_url || member.photo ? (
                                  <img src={member.photo_url || member.photo} alt={member.name} className="w-full h-full object-cover rounded-2xl" />
                                ) : (
                                  member.name?.charAt(0) || '🏛️'
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full font-bold">
                                  सक्रिय
                                </span>
                              </div>
                            </div>

                            <h4 className="font-bold text-[#2B211B] text-sm group-hover:text-[#C85A17] transition-colors leading-snug mb-1">
                              {member.name}
                            </h4>
                            <p className="text-xs text-[#766A60] font-medium mb-3">
                              {member.designation || member.role || 'प्रमुख सदस्य / संरक्षक'}
                            </p>
                          </div>

                          {member.phone && (
                            <a
                              href={`tel:${member.phone}`}
                              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-3 bg-white hover:bg-[#C85A17] hover:text-white text-[#C85A17] text-xs font-bold rounded-2xl border border-[#E8DCC8] shadow-sm transition-all duration-200"
                            >
                              <FiPhone className="w-3.5 h-3.5" />
                              <span>{member.phone}</span>
                            </a>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })()}

              {/* Shri Aai Ji Women Committee Feature Card */}
              {(activeCommitteeTab === 'all' || activeCommitteeTab === 'women_committee') && (() => {
                const apiWomenMembers = committee.filter(
                  (m) => (m.committee_type === 'women_committee' || m.type === 'women_committee') && m.is_active !== false
                );
                const activeMembers = apiWomenMembers.length > 0 ? apiWomenMembers : defaultWomenMembers;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DCC8] shadow-md relative overflow-hidden text-[#2B211B]"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8DCC8] pb-5 mb-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7A2525] to-[#C85A17] flex items-center justify-center text-2xl shadow-md shrink-0 text-white font-black">
                          🌸
                        </div>
                        <div>
                          <div className="inline-block px-3 py-0.5 bg-[#FFF8EC] border border-[#E8DCC8] rounded-full text-[11px] font-bold text-[#C85A17] uppercase tracking-wider mb-1">
                            महिला शक्ति • सेवा • संस्कार • सहयोग
                          </div>
                          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#2B211B]">
                            श्री आई जी महिला समिती
                          </h3>
                        </div>
                      </div>

                      <Link
                        to="/women-committee"
                        className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C85A17] to-[#C9A44C] text-white font-bold text-xs sm:text-sm rounded-2xl hover:shadow-lg transition-all shrink-0 cursor-pointer shadow-md"
                      >
                        महिला समिती पूर्ण विवरण देखें <FiArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    <p className="text-[#766A60] text-sm sm:text-base leading-relaxed mb-6 font-medium">
                      श्री आई जी महिला समिती का उद्देश्य समाज की महिलाओं को सशक्त, जागरूक, संगठित और आत्मनिर्भर बनाना है। शिक्षा, संस्कार, स्वास्थ्य एवं सामाजिक सेवा कार्यों के माध्यम से समाज उत्थान में सक्रिय सहयोग।
                    </p>

                    {/* Active Members of Shri Aai Ji Women Committee */}
                    <div className="mt-8 pt-6 border-t border-[#E8DCC8]">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-[#2B211B] flex items-center gap-2">
                            <span>👥</span> श्री आई जी महिला समिती — सक्रिय पदाधिकारी एवं सदस्य
                          </h4>
                          <p className="text-xs text-[#766A60]">
                            समिति की सक्रिय कार्यकारिणी एवं मातृशक्ति प्रतिनिधि
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-[#FFF8EC] border border-[#E8DCC8] rounded-full text-xs font-bold text-[#C85A17]">
                          सक्रिय सदस्य सूची
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {activeMembers.map((member, idx) => (
                          <motion.div
                            key={member.id || member._id || idx}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.04 }}
                            className="flex items-center gap-4 p-4 bg-[#FFF8EC] rounded-3xl border border-[#E8DCC8] hover:border-[#C9A44C]/60 hover:shadow-md transition-all duration-300 group"
                          >
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7A2525] to-[#C85A17] flex items-center justify-center text-white text-base font-bold shadow-md shrink-0 overflow-hidden">
                              {member.photo_url || member.photo ? (
                                <img src={member.photo_url || member.photo} alt={member.name} className="w-full h-full object-cover rounded-2xl" />
                              ) : (
                                member.name?.charAt(0) || 'म'
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-[#2B211B] text-sm group-hover:text-[#C85A17] transition-colors truncate">
                                {member.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[#C85A17] text-xs font-semibold truncate">
                                  {member.designation || member.position || 'सदस्य'}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 bg-green-50 text-green-700 rounded-md font-bold border border-green-200">
                                  सक्रिय
                                </span>
                              </div>
                              {member.phone && (
                                <a
                                  href={`tel:${member.phone}`}
                                  className="inline-flex items-center gap-1 text-[11px] text-[#766A60] hover:text-[#C85A17] transition-colors mt-1"
                                >
                                  <FiPhone className="w-3 h-3 text-[#C85A17]" /> {member.phone}
                                </a>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })()}

              {[
                { id: 'sankal_panch', title: 'सकल पंच (Sakal Panch)', icon: '👑' },
                { id: 'executive_body', title: 'कार्यकारिणी समिति', icon: '🏛️' },
                { id: 'women_committee', title: 'श्री आई जी महिला समिती', icon: '🌸' },
                { id: 'konda_gram_unit', title: 'कोणदा ग्राम इकाई', icon: '🌾' },
                { id: 'yuva_sangathan', title: 'सिर्वी समाज युवा संगठन', icon: '⚡' },
                { id: 'sahayata_kosh', title: 'श्री आईं जी सहायता कोष समिति', icon: '🤝' },
                { id: 'bhavan_samiti', title: 'माँ अन्नपूर्णा भवन समिति', icon: '🏛️' },
              ]
                .filter((cat) => activeCommitteeTab === 'all' || activeCommitteeTab === cat.id)
                .map((cat) => {
                  const categoryMembers = committee.filter(
                    (m) => (m.committee_type === cat.id || m.type === cat.id) && m.is_active !== false
                  );
                  if (categoryMembers.length === 0) return null;

                  return (
                    <div key={cat.id} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DCC8] shadow-md">
                      <div className="flex items-center gap-3 border-b border-[#E8DCC8] pb-4 mb-6">
                        <span className="text-2xl">{cat.icon}</span>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-[#2B211B]">{cat.title}</h3>
                          <p className="text-xs text-[#766A60]">{categoryMembers.length} सदस्य नामांकित</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {categoryMembers.map((member, i) => (
                          <motion.div
                            key={member.id || member._id || i}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-center gap-4 p-4 bg-[#FFF8EC] rounded-3xl border border-[#E8DCC8] hover:border-[#C9A44C]/60 hover:shadow-md transition-all duration-300 group"
                          >
                            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#C85A17] to-[#C9A44C] flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0 overflow-hidden">
                              {member.photo_url || member.photo ? (
                                <img src={member.photo_url || member.photo} alt={member.name} className="w-full h-full object-cover rounded-2xl" />
                              ) : (
                                member.name?.charAt(0) || 'M'
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-[#2B211B] text-sm group-hover:text-[#C85A17] transition-colors truncate">
                                {member.name}
                              </p>
                              <p className="text-[#C85A17] text-xs font-semibold truncate">{member.designation}</p>
                              {member.phone && (
                                <a
                                  href={`tel:${member.phone}`}
                                  className="inline-flex items-center gap-1 text-[11px] text-[#766A60] hover:text-[#C85A17] transition-colors mt-1"
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

            <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
              <Link
                to="/committee"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#C85A17] to-[#7A2525] text-white rounded-2xl hover:shadow-lg transition-all font-bold shadow-md cursor-pointer text-sm"
              >
                {t('committee_view_full')} <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/women-committee"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white border border-[#E8DCC8] text-[#7A2525] rounded-2xl hover:border-[#C85A17] hover:bg-[#FFF8EC] transition-all font-bold shadow-sm cursor-pointer text-sm"
              >
                🌸 श्री आई जी महिला समिती <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/90 to-[#7A2525] text-white">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-4 text-white">
              {t('cta_title')}
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
              {t('cta_desc')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/register"
                className="flex items-center gap-2 px-8 py-4 bg-white text-[#7A2525] font-extrabold rounded-2xl shadow-xl hover:bg-orange-50 hover:-translate-y-1 transition-all duration-200"
              >
                {t('cta_btn_join')} <FiArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/donations"
                className="flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur border border-white/40 text-white font-bold rounded-2xl hover:bg-white/30 transition-all duration-200"
              >
                <FiHeart className="w-5 h-5 text-[#FDE68A]" /> {t('cta_btn_support')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="py-12 bg-[#FFF8EC]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-[#E8DCC8] rounded-3xl p-6 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#7A2525] to-[#A64A13] rounded-2xl flex items-center justify-center shadow-md">
                  <FiPhone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-extrabold text-[#2B211B] text-base">आपातकालीन संपर्क (Emergency Contacts)</p>
                  <p className="text-xs text-[#5C4F45] font-medium">समाज एवं ग्राम सुरक्षा व सहायता हेतु 24x7 उपलब्ध</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-6 sm:ml-auto">
                {emergencyContacts.map(({ name, phone, label }) => (
                  <a key={name || label} href={`tel:${(phone || '').replace(/[\s-]/g, '')}`} className="flex flex-col group">
                    <span className="text-xs text-[#5C4F45] font-semibold">{name || label}</span>
                    <span className="font-bold text-[#A64A13] group-hover:text-[#7A2525] group-hover:underline text-sm">{phone}</span>
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
