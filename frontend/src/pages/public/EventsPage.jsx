import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiClock, FiUsers, FiCheckCircle, FiArrowRight, FiTag } from 'react-icons/fi';
import { eventAPI } from '../../services/api';
import { SkeletonCardGrid } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import toast from 'react-hot-toast';

// TODO: This is mock/fallback data. Remove when actual data is filled in the database.
import fallbackEvents from '../../data/mock/eventsFallback.json';

const getEventImage = (event) => {
  if (!event) return '/aai_mata_temple.webp';
  if (typeof event.image === 'string' && event.image.trim()) return event.image;
  if (typeof event.image_url === 'string' && event.image_url.trim()) return event.image_url;
  if (typeof event.photo_url === 'string' && event.photo_url.trim()) return event.photo_url;
  if (typeof event.banner_url === 'string' && event.banner_url.trim()) return event.banner_url;
  if (Array.isArray(event.images) && event.images.length > 0) {
    const first = event.images[0];
    if (typeof first === 'string' && first.trim()) return first;
    if (first && typeof first.url === 'string' && first.url.trim()) return first.url;
  }
  return '/aai_mata_temple.webp';
};

const EventCard = ({ event, onRegister }) => {
  const eventDate = new Date(event.start_date || event.startDate || event.event_date || event.date || Date.now());
  const isPast = event.event_type === 'past' || eventDate < new Date();
  const imgSrc = getEventImage(event);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-3xl overflow-hidden border border-[#E8DCC8] hover:border-[#C9A44C]/70 hover:shadow-2xl transition-all duration-300 flex flex-col shadow-md group"
    >
      {/* Event Image Container */}
      <div className="relative w-full h-56 overflow-hidden bg-[#FAF1E0]">
        <img
          src={imgSrc}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/aai_mata_temple.webp';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Date badge on top of image */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-[#E8DCC8] shadow-md flex items-center gap-1.5 text-xs font-extrabold text-[#7A2525]">
          <FiCalendar className="w-3.5 h-3.5 text-[#C85A17]" />
          <span>
            {eventDate.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {/* Status badge on top right */}
        <div className="absolute top-4 right-4">
          <Badge variant={isPast ? 'default' : 'success'} size="sm">
            {isPast ? 'सम्पन्न (Past)' : 'आगामी (Upcoming)'}
          </Badge>
        </div>
      </div>

      {/* Event Details */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-extrabold text-[#2B211B] text-lg sm:text-xl leading-snug group-hover:text-[#C85A17] transition-colors mb-3">
            {event.title}
          </h3>

          <div className="space-y-2 mb-4 text-xs font-semibold text-[#766A60]">
            <div className="flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-[#C85A17] shrink-0" />
              <span>
                {eventDate.toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>

            {event.location && (
              <div className="flex items-center gap-2">
                <FiMapPin className="w-4 h-4 text-[#C85A17] shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}

            {event.startTime && (
              <div className="flex items-center gap-2">
                <FiClock className="w-4 h-4 text-[#C85A17] shrink-0" />
                <span>{event.startTime}</span>
              </div>
            )}
          </div>

          {event.description && (
            <p className="text-[#554A42] text-sm leading-relaxed line-clamp-3 font-medium">
              {event.description}
            </p>
          )}
        </div>

        {!isPast && (
          <div className="pt-3 border-t border-[#E8DCC8]/60">
            <button
              onClick={() => onRegister(event)}
              className="w-full py-3 bg-gradient-to-r from-[#C85A17] to-[#C9A44C] text-white rounded-2xl text-xs sm:text-sm font-extrabold hover:shadow-lg hover:brightness-105 cursor-pointer transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <span>सहभागिता दर्ज करें (Participate)</span>
              <FiArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const EventsPage = () => {
  const [events, setEvents] = useState(fallbackEvents);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const { heroBgUrl } = useSiteSettings();

  useEffect(() => {
    setLoading(true);
    eventAPI
      .getAll({ limit: 40, status: 'published' })
      .then((res) => {
        const fetched = res.data?.data || [];
        setEvents(fetched.length > 0 ? fetched : fallbackEvents);
      })
      .catch((err) => {
        console.warn('Failed to load events from server, using fallback:', err);
        setEvents(fallbackEvents);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRegister = (event) => {
    toast.success(`"${event.title}" में आपकी सहभागिता की सूचना दर्ज कर ली गई है!`);
  };

  const now = new Date();
  const upcoming = events.filter((e) => {
    if (e.event_type === 'upcoming') return true;
    if (e.event_type === 'past') return false;
    const d = new Date(e.start_date || e.startDate || e.date);
    return !isNaN(d) ? d >= now : true;
  });

  const past = events.filter((e) => {
    if (e.event_type === 'past') return true;
    if (e.event_type === 'upcoming') return false;
    const d = new Date(e.start_date || e.startDate || e.date);
    return !isNaN(d) ? d < now : false;
  });

  const displayed = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="bg-[#FFF8EC] min-h-screen text-[#2B211B]">
      {/* Header Banner */}
      <div className="relative py-20 text-white overflow-hidden border-b border-[#E8DCC8] bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]">
        {/* Background image overlay */}
        <div className="absolute inset-0">
          <img
            src={heroBgUrl || '/hero_background.webp'}
            alt="Header Background"
            className="w-full h-full object-cover opacity-20"
            onError={(e) => { e.currentTarget.src = '/hero_background.webp'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/20 border border-amber-400/30 rounded-full text-xs font-bold uppercase tracking-wider mb-4 text-white shadow-sm">
              सामाजिक एवं धार्मिक उत्सव
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3 text-white">
              कार्यक्रम एवं आयोजन
            </h1>
            <p className="text-orange-100 text-base sm:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              श्री सिर्वी समाज कोणदा के आगामी धार्मिक अनुष्ठान, मेला, सम्मेलन एवं सामाजिक मिलन कार्यक्रम
            </p>
          </motion.div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tab Switcher */}
        <div className="flex justify-center mb-10">
          <div className="flex bg-[#FAF1E0] p-1.5 rounded-2xl border border-[#E8DCC8] shadow-sm">
            <button
              onClick={() => setTab('upcoming')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                tab === 'upcoming'
                  ? 'bg-gradient-to-r from-[#C85A17] to-[#C9A44C] text-white shadow-md font-black'
                  : 'text-[#2B211B] hover:text-[#C85A17]'
              }`}
            >
              आगामी कार्यक्रम ({upcoming.length})
            </button>
            <button
              onClick={() => setTab('past')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                tab === 'past'
                  ? 'bg-gradient-to-r from-[#C85A17] to-[#C9A44C] text-white shadow-md font-black'
                  : 'text-[#2B211B] hover:text-[#C85A17]'
              }`}
            >
              सम्पन्न कार्यक्रम ({past.length})
            </button>
          </div>
        </div>

        {/* Event Cards Grid */}
        {loading ? (
          <SkeletonCardGrid count={6} />
        ) : displayed.length === 0 ? (
          <EmptyState
            icon={FiCalendar}
            title={tab === 'upcoming' ? 'कोई आगामी कार्यक्रम नहीं' : 'कोई पूर्व कार्यक्रम उपलब्ध नहीं'}
            description="वर्तमान में इस श्रेणी में कोई कार्यक्रम सूचीबद्ध नहीं है।"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayed.map((event) => (
              <EventCard
                key={event.id || event._id || event.title}
                event={event}
                onRegister={handleRegister}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
