import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUsers, FiCalendar, FiBriefcase, FiArrowRight, FiHeart,
  FiDroplet, FiBook, FiImage, FiFileText, FiPhone,
} from 'react-icons/fi';
import { dashboardAPI, newsAPI, eventAPI, committeeAPI, galleryAPI } from '../services/api';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const quickLinks = [
  { label: 'Family Directory', path: '/families', icon: FiUsers, color: 'primary' },
  { label: 'Blood Donors', path: '/blood-donors', icon: FiDroplet, color: 'secondary' },
  { label: 'Student Corner', path: '/students', icon: FiBook, color: 'accent' },
  { label: 'Business Directory', path: '/businesses', icon: FiBriefcase, color: 'orange' },
  { label: 'Marriage Biodata', path: '/marriage-biodata', icon: FiHeart, color: 'primary' },
  { label: 'Downloads', path: '/downloads', icon: FiFileText, color: 'secondary' },
];

const Home = () => {
  const [stats, setStats] = useState(null);
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [committee, setCommittee] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, newsRes, eventsRes, committeeRes, galleryRes] = await Promise.allSettled([
          dashboardAPI.getPublicStats(),
          newsAPI.getAll({ limit: 3 }),
          eventAPI.getAll({ limit: 3, eventType: 'upcoming' }),
          committeeAPI.getAll({ limit: 4 }),
          galleryAPI.getAll({ limit: 6 }),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
        if (newsRes.status === 'fulfilled') setNews(newsRes.value.data.data || []);
        if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.data.data || []);
        if (committeeRes.status === 'fulfilled') setCommittee(committeeRes.value.data.data || []);
        if (galleryRes.status === 'fulfilled') setGallery(galleryRes.value.data.data || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur rounded-full text-sm font-medium mb-6">
              🙏 Jai Shri Aai Mataji
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Shri Seervi Samaj<br />
              <span className="text-yellow-300">Konda</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-8 leading-relaxed">
              Unity • Heritage • Progress — A digital platform connecting the Seervi community of Konda village, Dhar, Madhya Pradesh.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/about" className="px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-gray-100 transition flex items-center gap-2">
                About Samaj <FiArrowRight />
              </Link>
              <Link to="/families" className="px-6 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition">
                Explore Directory
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={FiUsers} label="Families" value={stats?.families ?? '—'} delay={0.1} />
          <StatCard icon={FiUsers} label="Members" value={stats?.members ?? '—'} color="secondary" delay={0.2} />
          <StatCard icon={FiCalendar} label="Upcoming Events" value={stats?.events ?? '—'} color="accent" delay={0.3} />
          <StatCard icon={FiBriefcase} label="Businesses" value={stats?.businesses ?? '—'} color="orange" delay={0.4} />
        </div>
      </section>

      {/* Quick Links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickLinks.map(({ label, path, icon: Icon, color }, i) => (
            <motion.div key={path} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={path} className="glass rounded-2xl p-5 flex flex-col items-center text-center card-hover dark:bg-slate-800/50 group">
                <div className={`p-3 rounded-xl bg-${color}/10 text-${color} mb-3 group-hover:scale-110 transition`}>
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* News & Events */}
      <section className="bg-white dark:bg-slate-800/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest News</h2>
                <Link to="/news" className="text-primary text-sm font-medium hover:underline">View All</Link>
              </div>
              <div className="space-y-4">
                {news.length ? news.map((item) => (
                  <Link key={item._id} to={`/news/${item._id}`} className="glass rounded-xl p-4 block card-hover dark:bg-slate-800/50">
                    <span className="text-xs font-medium text-primary uppercase">{item.category}</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white mt-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.excerpt || item.content}</p>
                  </Link>
                )) : (
                  <p className="text-gray-500">No news available yet.</p>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upcoming Events</h2>
                <Link to="/events" className="text-primary text-sm font-medium hover:underline">View All</Link>
              </div>
              <div className="space-y-4">
                {events.length ? events.map((event) => (
                  <Link key={event._id} to={`/events/${event._id}`} className="glass rounded-xl p-4 flex gap-4 card-hover dark:bg-slate-800/50">
                    <div className="w-14 h-14 gradient-primary rounded-xl flex flex-col items-center justify-center text-white shrink-0">
                      <span className="text-xs font-medium">{new Date(event.startDate).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-lg font-bold leading-none">{new Date(event.startDate).getDate()}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                      <p className="text-sm text-gray-500">{event.location}</p>
                    </div>
                  </Link>
                )) : (
                  <p className="text-gray-500">No upcoming events.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Committee */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Committee Members</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {committee.map((member, i) => (
            <motion.div key={member._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 text-center card-hover dark:bg-slate-800/50">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold mb-4">
                {member.name?.charAt(0)}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
              <p className="text-sm text-primary font-medium">{member.designation}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="gradient-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Emergency Contacts</h2>
              <p className="text-white/80">Need help? Reach out to our committee members.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <a href="tel:+919876543210" className="flex items-center gap-2 px-5 py-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition">
                <FiPhone /> +91-9876543210
              </a>
              <Link to="/contact" className="flex items-center gap-2 px-5 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-gray-100 transition">
                Contact Us <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
