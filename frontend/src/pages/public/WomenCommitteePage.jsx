import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiGift,
  FiHeart,
  FiImage,
  FiMapPin,
  FiMessageSquare,
  FiPhone,
  FiShield,
  FiStar,
  FiTarget,
  FiUsers,
} from 'react-icons/fi';
import { committeeAPI, eventAPI, galleryAPI } from '../../services/api';
import { supabase } from '../../config/supabase';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCardGrid } from '../../components/common/Skeleton';

// TODO: This is mock/fallback data. Remove when actual data is filled in the database.
import fallbackData from '../../data/mock/womenCommitteeFallback.json';

const {
  objectiveCards: rawObjectives,
  workAreas,
  recordCategories,
  messageText,
  defaultMembers,
  defaultFeaturedActivities,
  defaultGallery,
} = fallbackData;

const objectiveIcons = [FiUsers, FiHeart, FiBookOpen, FiShield, FiTarget, FiGift, FiStar, FiCheckCircle];
const objectiveCards = rawObjectives.map((obj, i) => ({
  ...obj,
  icon: objectiveIcons[i % objectiveIcons.length],
}));

const WomenCommitteePage = () => {
  const [committeeMembers, setCommitteeMembers] = useState([]);
  const [featuredActivities, setFeaturedActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchAllData = async () => {
      try {
        const [committeeRes, eventRes, galleryRes] = await Promise.allSettled([
          committeeAPI.getAll({ committee_type: 'women_committee', limit: 50 }),
          eventAPI.getAll({ limit: 6 }),
          galleryAPI.getAll({ limit: 8 }),
        ]);

        if (!isMounted) return;

        if (committeeRes.status === 'fulfilled') {
          const raw = committeeRes.value?.data?.data;
          const liveMembers = Array.isArray(raw)
            ? raw.filter((m) => (m.committee_type === 'women_committee' || m.type === 'women_committee') && m.is_active !== false)
            : [];
          setCommitteeMembers(liveMembers.length > 0 ? liveMembers : defaultMembers);
        } else {
          setCommitteeMembers(defaultMembers);
        }

        if (eventRes.status === 'fulfilled') {
          const events = Array.isArray(eventRes.value?.data?.data) ? eventRes.value.data.data : [];
          if (events.length > 0) {
            setFeaturedActivities(
              events.slice(0, 3).map((item, idx) => ({
                id: item.id || `act-${idx}`,
                title: item.title,
                date: item.start_date || item.date || 'नवीनतम',
                location: item.location || 'ग्राम कोणदा',
                description: item.description,
                image: item.image_url || '/hero_background.webp',
                extraInfo: item.event_type || 'विशेष आयोजन',
              }))
            );
            setUpcomingEvents(events);
          } else {
            setFeaturedActivities(defaultFeaturedActivities);
            setUpcomingEvents([]);
          }
        } else {
          setFeaturedActivities(defaultFeaturedActivities);
        }

        if (galleryRes.status === 'fulfilled') {
          const items = Array.isArray(galleryRes.value?.data?.data) ? galleryRes.value.data.data : [];
          setGalleryItems(items.length > 0 ? items : defaultGallery);
        } else {
          setGalleryItems(defaultGallery);
        }
      } catch (err) {
        console.warn('Women committee data load warning:', err);
        if (isMounted) {
          setCommitteeMembers(defaultMembers);
          setFeaturedActivities(defaultFeaturedActivities);
          setGalleryItems(defaultGallery);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAllData();

    // Debounced realtime channel for live updates
    let syncTimer = null;
    const debouncedSync = () => {
      if (syncTimer) clearTimeout(syncTimer);
      syncTimer = setTimeout(async () => {
        try {
          const res = await committeeAPI.getAll({ committee_type: 'women_committee', limit: 50 });
          if (isMounted && res.data?.data) {
            const live = res.data.data.filter((m) => (m.committee_type === 'women_committee' || m.type === 'women_committee') && m.is_active !== false);
            setCommitteeMembers(live.length > 0 ? live : defaultMembers);
          }
        } catch (e) {
          console.warn('Realtime sync error on WomenCommitteePage:', e);
        }
      }, 300);
    };

    const channel = supabase
      .channel('women_committee_page_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'committees' }, () => {
        debouncedSync();
      })
      .subscribe();

    return () => {
      isMounted = false;
      if (syncTimer) clearTimeout(syncTimer);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="bg-[#FFF8EC] min-h-screen text-[#2B211B]">
      <div className="relative py-20 text-white overflow-hidden border-b border-[#E8DCC8] bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]">
        <div className="absolute inset-0">
          <img src="/hero_background.webp" alt="Header Background" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/20 border border-amber-400/30 rounded-full text-xs font-bold uppercase tracking-wider mb-4 text-white shadow-sm">
              महिला संगठन
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3 text-white">श्री आई जी महिला समिती</h1>
            <p className="text-orange-100 text-lg font-medium">महिला शक्ति • सेवा • संस्कार • सहयोग • समाज उत्थान</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[#C85A17] text-sm font-bold uppercase tracking-[0.2em] mb-4">परिचय</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#2B211B] mb-5">श्री आई जी महिला समिती</h2>
            <p className="text-[#766A60] leading-8 text-base sm:text-lg mb-5 font-medium">
              श्री आई जी महिला समिती समाज में महिलाओं की सहभागिता, सामाजिक जागरूकता और सामूहिक विकास को बढ़ावा देने के लिए सक्रिय रूप से कार्य करती है। यह समिति महिला सशक्तिकरण, शिक्षा, संस्कार, सेवा भाव और समर्पित सहयोग के माध्यम से समाज के हर वर्ग को एकजुट करने का प्रयास करती है।
            </p>
            <p className="text-[#766A60] leading-8 text-base sm:text-lg font-medium">
              समिति का उद्देश्य महिलाओं को आत्मनिर्भर, जागरूक और संगठित बनाना है, साथ ही समाज सेवा, धार्मिक एवं सांस्कृतिक गतिविधियों, सहायता कार्यों और सामुदायिक एकता को मजबूत करना है।
            </p>
          </div>

          <div className="bg-white border border-[#E8DCC8] rounded-3xl p-6 shadow-md">
            <div className="grid grid-cols-2 gap-4">
              {[
                ['महिला सशक्तिकरण', 'सामूहिक विकास'],
                ['समाज सेवा', 'सहायता एवं सहयोग'],
                ['शिक्षा एवं संस्कार', 'व्यक्तित्व विकास'],
                ['सामाजिक जागरूकता', 'सामुदायिक जिम्मेदारी'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-[#E8DCC8]/60 bg-[#FFF8EC] p-4">
                  <p className="font-bold text-[#C85A17] mb-2">{title}</p>
                  <p className="text-sm text-[#766A60] font-medium">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-center mb-8">
            <div className="h-px flex-1 bg-[#E8DCC8]" />
            <h2 className="px-6 text-3xl font-extrabold text-[#2B211B]">हमारे उद्देश्य</h2>
            <div className="h-px flex-1 bg-[#E8DCC8]" />
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
            {objectiveCards.map(({ icon: Icon, title, description }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white border border-[#E8DCC8] rounded-3xl p-6 shadow-md hover:border-[#C9A44C]/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7A2525] to-[#C85A17] flex items-center justify-center mb-4 text-white shadow-md">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-[#2B211B]">{title}</h3>
                <p className="text-sm leading-relaxed text-[#766A60] font-medium">{description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-center mb-8">
            <div className="h-px flex-1 bg-[#E8DCC8]" />
            <h2 className="px-6 text-3xl font-extrabold text-[#2B211B]">महिला संगठन के कार्य</h2>
            <div className="h-px flex-1 bg-[#E8DCC8]" />
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {workAreas.map((area) => (
              <div key={area.title} className="bg-white border border-[#E8DCC8] rounded-3xl p-6 shadow-md hover:border-[#C9A44C]/60 hover:shadow-lg transition-all duration-300">
                <p className="text-[#C85A17] font-bold text-lg mb-3">{area.title}</p>
                <p className="text-[#766A60] leading-relaxed text-sm font-medium">{area.content}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-center mb-8">
            <div className="h-px flex-1 bg-[#E8DCC8]" />
            <h2 className="px-6 text-3xl font-extrabold text-[#2B211B]">महिला संगठन का लेखा-जोखा</h2>
            <div className="h-px flex-1 bg-[#E8DCC8]" />
          </div>

          <div className="overflow-hidden rounded-3xl border border-[#E8DCC8] bg-white shadow-md">
            <div className="grid md:grid-cols-2 xl:grid-cols-4 border-b border-[#E8DCC8]">
              {recordCategories.map((item) => (
                <div key={item} className="px-5 py-4 text-sm font-bold text-[#C85A17] border-r border-[#E8DCC8] last:border-r-0 bg-[#FAF1E0]">
                  {item}
                </div>
              ))}
            </div>
            <div className="p-6">
              <div className="rounded-2xl border border-dashed border-[#E8DCC8] bg-[#FFF8EC] p-8 text-center">
                <p className="text-[#2B211B] text-base sm:text-lg leading-relaxed font-medium">
                  लेखा-जोखा में वर्षवार गतिविधियाँ, कार्यक्रम, सामाजिक सेवा, धार्मिक एवं सांस्कृतिक आयोजन तथा अन्य समर्पित गतिविधियों का विवरण यहाँ दर्ज किया जाएगा।
                </p>
                <p className="text-[#C85A17] mt-3 text-sm font-bold">अभी तक कोई डेटा उपलब्ध नहीं है; इसे एडमिन पैनल से अपडेट करें।</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-center mb-8">
            <div className="h-px flex-1 bg-[#E8DCC8]" />
            <h2 className="px-6 text-3xl font-extrabold text-[#2B211B]">प्रमुख गतिविधियाँ</h2>
            <div className="h-px flex-1 bg-[#E8DCC8]" />
          </div>

          {loading ? (
            <SkeletonCardGrid count={3} cols="grid-cols-1 md:grid-cols-2 xl:grid-cols-3" />
          ) : featuredActivities.length === 0 ? (
            <EmptyState icon={FiCalendar} title="कोई गतिविधि उपलब्ध नहीं" description="अभी तक प्रमुख गतिविधियों का विवरण दर्ज नहीं किया गया है।" />
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {featuredActivities.map((activity) => (
                <motion.div
                  key={activity._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="overflow-hidden rounded-3xl border border-[#E8DCC8] bg-white shadow-md hover:shadow-xl hover:border-[#C9A44C]/60 transition-all"
                >
                  <img src={activity.image} alt={activity.title} className="h-52 w-full object-cover" />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#2B211B] mb-3">{activity.title}</h3>
                    <div className="space-y-2 text-sm text-[#766A60] mb-4">
                      <p className="flex items-center gap-2"><FiCalendar className="text-[#C85A17]" /> {activity.date}</p>
                      <p className="flex items-center gap-2"><FiMapPin className="text-[#C85A17]" /> {activity.location}</p>
                    </div>
                    <p className="text-[#766A60] leading-relaxed mb-4 text-sm font-medium">{activity.description}</p>
                    <p className="text-[#C85A17] text-sm font-bold">{activity.extraInfo}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-center mb-8">
            <div className="h-px flex-1 bg-[#E8DCC8]" />
            <h2 className="px-6 text-3xl font-extrabold text-[#2B211B]">आगामी कार्यक्रम</h2>
            <div className="h-px flex-1 bg-[#E8DCC8]" />
          </div>

          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={FiCalendar}
              title="कोई आगामी कार्यक्रम नहीं" 
              description="अभी कोई नया कार्यक्रम निर्धारित नहीं है। विवरण आगामी कार्यक्रमों के रूप में यहाँ प्रदर्शित किया जाएगा।"
            />
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((eventItem) => (
                <div key={eventItem._id} className="bg-white border border-[#E8DCC8] rounded-3xl p-6 shadow-md">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
                    <h3 className="text-2xl font-extrabold text-[#2B211B]">{eventItem.title}</h3>
                    <span className="inline-flex items-center px-4 py-1 rounded-full bg-[#FFF8EC] border border-[#E8DCC8] text-[#C85A17] text-xs font-bold uppercase tracking-wider">
                      आगामी कार्यक्रम
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3 text-[#766A60] text-sm font-semibold">
                    <p className="flex items-center gap-2"><FiCalendar className="text-[#C85A17]" /> {eventItem.date}</p>
                    <p className="flex items-center gap-2"><FiClock className="text-[#C85A17]" /> {eventItem.time}</p>
                    <p className="flex items-center gap-2"><FiMapPin className="text-[#C85A17]" /> {eventItem.location}</p>
                    <p className="flex items-center gap-2"><FiCheckCircle className="text-green-600" /> विवरण उपलब्ध</p>
                  </div>
                  <p className="mt-4 text-[#766A60] leading-relaxed text-sm font-medium">{eventItem.description}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-center mb-8">
            <div className="h-px flex-1 bg-[#E8DCC8]" />
            <h2 className="px-6 text-3xl font-extrabold text-[#2B211B]">समिति की सदस्य जानकारी</h2>
            <div className="h-px flex-1 bg-[#E8DCC8]" />
          </div>

          {committeeMembers.length === 0 ? (
            <EmptyState
              icon={FiUsers}
              title="समिति सदस्य सूची शीघ्र उपलब्ध होगी"
              description="महिला समिति के पदाधिकारियों एवं सदस्यों का विवरण समिति द्वारा अद्यतन किया जा रहा है।"
            />
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {committeeMembers.map((member, index) => (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border border-[#E8DCC8] rounded-3xl p-6 shadow-md hover:border-[#C9A44C]/60 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7A2525] to-[#C85A17] p-0.5 overflow-hidden shrink-0 shadow-md">
                      {member.photo ? (
                        <img src={member.photo} alt={member.name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <div className="w-full h-full bg-[#FFF8EC] rounded-2xl flex items-center justify-center text-[#7A2525] font-black text-xl">
                          {member.name?.charAt(0) || 'न'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#2B211B]">{member.name}</h3>
                      <p className="text-[#C85A17] font-bold text-sm">{member.designation}</p>
                    </div>
                  </div>
                  <p className="text-[#766A60] leading-relaxed text-sm font-medium">{member.about}</p>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-center mb-8">
            <div className="h-px flex-1 bg-[#E8DCC8]" />
            <h2 className="px-6 text-3xl font-extrabold text-[#2B211B]">हमारी उपलब्धियाँ</h2>
            <div className="h-px flex-1 bg-[#E8DCC8]" />
          </div>

          <div className="rounded-3xl border border-dashed border-[#E8DCC8] bg-white p-8 text-center shadow-sm">
            <p className="text-[#766A60] text-base sm:text-lg leading-relaxed font-medium">
              उपलब्धियों का सत्यापन आवश्यक है। यदि कोई प्रमाणित उपलब्धि उपलब्ध नहीं है, तो यह खंड खाली रखा जाएगा और बाद में अपडेट किया जा सकता है।
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {['सामाजिक सेवा', 'महिला सहभागिता', 'शिक्षा', 'स्वास्थ्य जागरूकता', 'सांस्कृतिक कार्यक्रम', 'धार्मिक आयोजन', 'सहायता अभियान'].map((item) => (
                <span key={item} className="px-4 py-2 rounded-full border border-[#E8DCC8] bg-[#FFF8EC] text-[#C85A17] text-sm font-bold">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-center mb-8">
            <div className="h-px flex-1 bg-[#E8DCC8]" />
            <h2 className="px-6 text-3xl font-extrabold text-[#2B211B]">कार्यक्रम एवं गतिविधि गैलरी</h2>
            <div className="h-px flex-1 bg-[#E8DCC8]" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {galleryItems.map((item, index) => (
              <motion.div
                key={item._id || index}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="overflow-hidden rounded-3xl border border-[#E8DCC8] bg-white shadow-md hover:border-[#C9A44C]/60 hover:shadow-xl transition-all"
              >
                <img src={item.image} alt={item.title} className="h-56 w-full object-cover" />
                <div className="p-5">
                  <p className="text-[#C85A17] font-bold mb-1">{item.title}</p>
                  <p className="text-[#766A60] text-sm font-medium">{item.caption}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-[#E8DCC8] rounded-3xl p-7 lg:p-10 shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7A2525] to-[#C85A17] flex items-center justify-center text-white shadow-md">
              <FiMessageSquare className="w-5 h-5" />
            </div>
            <h2 className="text-3xl font-extrabold text-[#2B211B]">समिति का संदेश</h2>
          </div>
          <p className="text-[#766A60] leading-relaxed text-base sm:text-lg font-medium">“{messageText}”</p>
        </section>

        <section>
          <div className="flex items-center justify-center mb-8">
            <div className="h-px flex-1 bg-[#E8DCC8]" />
            <h2 className="px-6 text-3xl font-extrabold text-[#2B211B]">संपर्क एवं जानकारी</h2>
            <div className="h-px flex-1 bg-[#E8DCC8]" />
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              { icon: FiMapPin, label: 'पता', value: 'पता अभी उपलब्ध नहीं है।' },
              { icon: FiPhone, label: 'मोबाइल नंबर', value: 'मोबाइल नंबर उपलब्ध नहीं है।' },
              { icon: FiMessageSquare, label: 'ईमेल', value: 'ईमेल उपलब्ध नहीं है।' },
              { icon: FiStar, label: 'WhatsApp / सोशल मीडिया', value: 'संपर्क विवरण अपडेट होने पर यहाँ प्रदर्शित किया जाएगा।' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white border border-[#E8DCC8] rounded-3xl p-6 shadow-md">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7A2525] to-[#C85A17] flex items-center justify-center mb-4 text-white shadow-md">
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-[#C85A17] font-bold mb-2">{label}</p>
                <p className="text-[#766A60] leading-relaxed text-sm font-medium">{value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default WomenCommitteePage;

