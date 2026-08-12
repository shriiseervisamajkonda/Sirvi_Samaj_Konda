import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiClock, FiUsers } from 'react-icons/fi';
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
      className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {event.image && (
        <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
      )}
      {!event.image && (
        <div className={`w-full h-32 flex items-center justify-center text-5xl ${isPast ? 'bg-gray-100 dark:bg-slate-700' : 'bg-gradient-to-br from-orange-400 to-orange-600'}`}>
          🎉
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-bold text-gray-900 dark:text-white flex-1">{event.title}</h3>
          <Badge variant={isPast ? 'default' : 'success'} size="xs">
            {isPast ? 'Past' : 'Upcoming'}
          </Badge>
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
            <FiCalendar className="w-4 h-4 text-orange-400" />
            {eventDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
              <FiMapPin className="w-4 h-4 text-orange-400" />
              {event.location}
            </div>
          )}
          {event.startTime && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
              <FiClock className="w-4 h-4 text-orange-400" />
              {event.startTime}
            </div>
          )}
        </div>
        {event.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
        )}
        {!isPast && event.registrationRequired && (
          <button
            onClick={handleRegister}
            className="w-full py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
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
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen">
      <div className="bg-gradient-to-br from-orange-500 to-orange-700 py-16 text-white relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3">Events</h1>
            <p className="text-orange-100 text-lg">Community events, celebrations & gatherings</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {['upcoming', 'past'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
                tab === t ? 'bg-orange-500 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:border-orange-300'
              }`}
            >
              {t === 'upcoming' ? `🗓 Upcoming (${upcoming.length})` : `✅ Past (${past.length})`}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : displayed.length === 0 ? (
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
