import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiClock } from 'react-icons/fi';
import { eventAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

const EventCard = ({ event }) => {
  const eventDate = new Date(event.startDate || event.date);
  const isPast = eventDate < new Date();

  const handleRegister = async () => {
    try {
      await eventAPI.register(event._id, { name: 'Guest', phone: '' });
      toast.success('Registered for event!');
    } catch {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-[#2A1010] rounded-2xl overflow-hidden border border-[#D4AF37]/15 hover:border-[#D4AF37]/45 hover:shadow-2xl transition-all duration-300 flex flex-col shadow-lg"
    >
      {event.image ? (
        <img src={event.image} alt={event.title} className="w-full h-48 object-cover border-b border-[#D4AF37]/10" />
      ) : (
        <div className={`w-full h-48 flex items-center justify-center text-5xl border-b border-[#D4AF37]/10 ${isPast ? 'bg-[#351313]' : 'bg-gradient-to-br from-[#C85A17] to-[#7A2525]'}`}>
          🎉
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="font-bold text-[#FFF3DD] text-base leading-tight flex-1">{event.title}</h3>
            <Badge variant={isPast ? 'default' : 'success'} size="xs">
              {isPast ? 'Past' : 'Upcoming'}
            </Badge>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-[#CDBBA4] text-xs font-semibold">
              <FiCalendar className="w-4 h-4 text-[#C85A17]" />
              {eventDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-[#CDBBA4] text-xs font-semibold">
                <FiMapPin className="w-4 h-4 text-[#C85A17]" />
                {event.location}
              </div>
            )}
            {event.startTime && (
              <div className="flex items-center gap-2 text-[#CDBBA4] text-xs font-semibold">
                <FiClock className="w-4 h-4 text-[#C85A17]" />
                {event.startTime}
              </div>
            )}
          </div>
          {event.description && (
            <p className="text-[#CDBBA4]/90 text-sm leading-relaxed mb-4 line-clamp-3">{event.description}</p>
          )}
        </div>
        {!isPast && event.registrationRequired && (
          <button
            onClick={handleRegister}
            className="w-full py-2.5 bg-[#C85A17] text-white rounded-xl text-xs font-bold hover:bg-[#E27620] cursor-pointer transition-colors shadow-lg"
          >
            Register Now
          </button>
        )}
      </div>
    </motion.div>
  );
};

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    setLoading(true);
    eventAPI.getAll({ limit: 20, status: 'published' })
      .then(res => setEvents(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.startDate || e.date) >= now);
  const past = events.filter(e => new Date(e.startDate || e.date) < now);
  const displayed = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="bg-[#160D08] min-h-screen text-[#FFF3DD]">
      {/* Header Banner */}
      <div className="relative py-20 text-white overflow-hidden border-b border-[#D4AF37]/20">
        {/* Background image overlay */}
        <div className="absolute inset-0">
          <img src="/hero_background.webp" alt="Header Background" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/10 border border-[#D4AF37]/35 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              आयोजन एवं उत्सव
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3">कार्यक्रम एवं उत्सव (Events)</h1>
            <p className="text-[#FFF3DD] text-lg font-medium opacity-90">सीरवी समाज कोणदा के धार्मिक, सांस्कृतिक और सामाजिक कार्यक्रम</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 justify-center border-b border-[#D4AF37]/10 pb-6">
          {['upcoming', 'past'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize transition-all cursor-pointer ${
                tab === t 
                  ? 'bg-[#7A2525] border-[#D4AF37]/40 text-[#D4AF37] shadow-lg' 
                  : 'bg-[#2A1010] border-[#D4AF37]/15 text-[#CDBBA4] hover:border-[#D4AF37]/45'
              }`}
            >
              {t === 'upcoming' ? `🗓 Upcoming (${upcoming.length})` : `✅ Past (${past.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : displayed.length === 0 ? (
          <EmptyState icon={FiCalendar} title={`No ${tab} events`} description="Check back soon for new events." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map(event => <EventCard key={event._id} event={event} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
