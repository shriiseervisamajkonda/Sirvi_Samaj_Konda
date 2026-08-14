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
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCardGrid } from '../../components/common/Skeleton';

const objectiveCards = [
  {
    icon: FiUsers,
    title: 'महिला सशक्तिकरण',
    description: 'महिलाओं को आत्मनिर्भर, जागरूक और संगठित बनाने के लिए सामूहिक प्रयास किए जाते हैं।',
  },
  {
    icon: FiHeart,
    title: 'समाज सेवा',
    description: 'जरूरतमंद परिवारों, महिलाओं और बच्चों की सहायता के लिए सामाजिक कार्यों का आयोजन किया जाता है।',
  },
  {
    icon: FiBookOpen,
    title: 'शिक्षा एवं संस्कार',
    description: 'शिक्षा, संस्कार और सामाजिक मूल्यों के प्रति जागरूकता को बढ़ावा दिया जाता है।',
  },
  {
    icon: FiShield,
    title: 'स्वास्थ्य एवं जागरूकता',
    description: 'स्वच्छता, पोषण और स्वास्थ्य के प्रति जागरूकता फैलाने पर ध्यान दिया जाता है।',
  },
  {
    icon: FiTarget,
    title: 'सामाजिक सहभागिता',
    description: 'सामूहिक प्रयासों के माध्यम से समाज में सकारात्मक सहयोग और सहभागिता को प्रोत्साहित किया जाता है।',
  },
  {
    icon: FiGift,
    title: 'जरूरतमंदों की सहायता',
    description: 'आर्थिक, भावनात्मक और आवश्यक सहयोग के माध्यम से सहायता पहुंचाने का प्रयास किया जाता है।',
  },
  {
    icon: FiStar,
    title: 'महिला एकता',
    description: 'महिलाओं के बीच विश्वास, सहयोग और एकता को बढ़ाने के लिए गतिविधियाँ आयोजित की जाती हैं।',
  },
  {
    icon: FiCheckCircle,
    title: 'संस्कृति एवं परंपरा',
    description: 'संस्कृति, परंपरा और सामाजिक मूल्यों के संरक्षण को प्रोत्साहित किया जाता है।',
  },
];

const workAreas = [
  {
    title: 'महिला सशक्तिकरण',
    content: 'महिलाओं को आत्मनिर्भर, जागरूक और संगठित बनाने के लिए विभिन्न गतिविधियों का आयोजन।',
  },
  {
    title: 'समाज सेवा',
    content: 'जरूरतमंद परिवारों, महिलाओं और बच्चों की सहायता के लिए सामाजिक सेवा कार्य।',
  },
  {
    title: 'शिक्षा एवं संस्कार',
    content: 'शिक्षा, संस्कार और सामाजिक मूल्यों के प्रति जागरूकता बढ़ाना।',
  },
  {
    title: 'स्वास्थ्य जागरूकता',
    content: 'स्वास्थ्य, स्वच्छता और पोषण के प्रति जागरूकता फैलाना।',
  },
  {
    title: 'धार्मिक एवं सांस्कृतिक कार्यक्रम',
    content: 'धार्मिक, सांस्कृतिक एवं सामाजिक कार्यक्रमों में सक्रिय सहभागिता।',
  },
  {
    title: 'सामाजिक जागरूकता',
    content: 'समाज में सकारात्मक सोच, सहयोग और सामाजिक जिम्मेदारी को बढ़ावा देना।',
  },
];

const recordCategories = [
  'वर्षवार गतिविधियाँ',
  'आयोजित कार्यक्रम',
  'सामाजिक सेवा कार्य',
  'धार्मिक कार्यक्रम',
  'सांस्कृतिक कार्यक्रम',
  'जागरूकता अभियान',
  'सहायता कार्य',
  'विशेष आयोजन',
];

const defaultMembers = [
  {
    _id: 'member-1',
    name: 'नाम यहाँ दर्ज किया जाएगा',
    designation: 'अध्यक्ष',
    about: 'सदस्य का संक्षिप्त परिचय यहाँ दर्ज किया जाएगा।',
    photo: ''
  },
  {
    _id: 'member-2',
    name: 'नाम यहाँ दर्ज किया जाएगा',
    designation: 'उपाध्यक्ष',
    about: 'सदस्य का संक्षिप्त परिचय यहाँ दर्ज किया जाएगा।',
    photo: ''
  },
  {
    _id: 'member-3',
    name: 'नाम यहाँ दर्ज किया जाएगा',
    designation: 'सचिव',
    about: 'सदस्य का संक्षिप्त परिचय यहाँ दर्ज किया जाएगा।',
    photo: ''
  },
  {
    _id: 'member-4',
    name: 'नाम यहाँ दर्ज किया जाएगा',
    designation: 'सह-सचिव',
    about: 'सदस्य का संक्षिप्त परिचय यहाँ दर्ज किया जाएगा।',
    photo: ''
  },
  {
    _id: 'member-5',
    name: 'नाम यहाँ दर्ज किया जाएगा',
    designation: 'कोषाध्यक्ष',
    about: 'सदस्य का संक्षिप्त परिचय यहाँ दर्ज किया जाएगा।',
    photo: ''
  },
  {
    _id: 'member-6',
    name: 'नाम यहाँ दर्ज किया जाएगा',
    designation: 'सदस्य',
    about: 'सदस्य का संक्षिप्त परिचय यहाँ दर्ज किया जाएगा।',
    photo: ''
  },
];

const defaultFeaturedActivities = [
  {
    _id: 'activity-1',
    title: 'कार्यक्रम का नाम',
    date: 'तारीख दर्ज की जाएगी',
    location: 'स्थान दर्ज किया जाएगा',
    description: 'कार्यक्रम का विवरण यहाँ दर्ज किया जाएगा।',
    image: '/hero_background.webp',
    extraInfo: 'संबंधित जानकारी यहाँ उपलब्ध होगी।',
  },
  {
    _id: 'activity-2',
    title: 'कार्यक्रम का नाम',
    date: 'तारीख दर्ज की जाएगी',
    location: 'स्थान दर्ज किया जाएगा',
    description: 'कार्यक्रम का विवरण यहाँ दर्ज किया जाएगा।',
    image: '/hero_background.webp',
    extraInfo: 'संबंधित जानकारी यहाँ उपलब्ध होगी।',
  },
  {
    _id: 'activity-3',
    title: 'कार्यक्रम का नाम',
    date: 'तारीख दर्ज की जाएगी',
    location: 'स्थान दर्ज किया जाएगा',
    description: 'कार्यक्रम का विवरण यहाँ दर्ज किया जाएगा।',
    image: '/hero_background.webp',
    extraInfo: 'संबंधित जानकारी यहाँ उपलब्ध होगी।',
  },
];

const defaultGallery = [
  { _id: 'gallery-1', title: 'कार्यक्रम', image: '/hero_background.webp', caption: 'कार्यक्रम एवं गतिविधि गैलरी' },
  { _id: 'gallery-2', title: 'सामाजिक सेवा', image: '/hero_background.webp', caption: 'सामाजिक सेवा कार्य' },
  { _id: 'gallery-3', title: 'सांस्कृतिक कार्यक्रम', image: '/hero_background.webp', caption: 'सांस्कृतिक आयोजन' },
  { _id: 'gallery-4', title: 'धार्मिक कार्यक्रम', image: '/hero_background.webp', caption: 'धार्मिक एवं आध्यात्मिक आयोजन' },
  { _id: 'gallery-5', title: 'महिला गतिविधियाँ', image: '/hero_background.webp', caption: 'महिला सहभागिता' },
  { _id: 'gallery-6', title: 'विशेष आयोजन', image: '/hero_background.webp', caption: 'विशेष अवसर' },
];

const messageText = 'यहाँ श्री आई जी महिला समिती का आधिकारिक संदेश प्रदर्शित किया जाएगा। इस संदेश को सही सूचना के अनुसार एडमिन पैनल से अपडेट किया जा सकता है।';

const WomenCommitteePage = () => {
  const [committeeMembers, setCommitteeMembers] = useState(defaultMembers);
  const [featuredActivities, setFeaturedActivities] = useState(defaultFeaturedActivities);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [galleryItems, setGalleryItems] = useState(defaultGallery);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      committeeAPI.getAll({ limit: 50 }),
      eventAPI.getAll({ limit: 6 }),
      galleryAPI.getAll({ limit: 8 }),
    ])
      .then(([committeeRes, eventRes, galleryRes]) => {
        const committeeData = Array.isArray(committeeRes?.data?.data) ? committeeRes.data.data : [];
        const eventData = Array.isArray(eventRes?.data?.data) ? eventRes.data.data : [];
        const galleryData = Array.isArray(galleryRes?.data?.data) ? galleryRes.data.data : [];

        if (committeeData.length > 0) {
          setCommitteeMembers(
            committeeData.slice(0, 6).map((member, index) => ({
              _id: member._id || `committee-${index}`,
              name: member.name || 'नाम यहाँ दर्ज किया जाएगा',
              designation: member.designation || member.role || 'सदस्य',
              about: member.about || member.bio || 'सदस्य का संक्षिप्त परिचय यहाँ दर्ज किया जाएगा।',
              photo: member.photo || '',
            }))
          );
        }

        if (eventData.length > 0) {
          setFeaturedActivities(
            eventData.slice(0, 3).map((eventItem, index) => ({
              _id: eventItem._id || `activity-${index}`,
              title: eventItem.title || 'कार्यक्रम का नाम',
              date: eventItem.date || eventItem.startDate || 'तारीख दर्ज की जाएगी',
              location: eventItem.location || eventItem.venue || 'स्थान दर्ज किया जाएगा',
              description: eventItem.description || 'कार्यक्रम का विवरण यहाँ दर्ज किया जाएगा।',
              image: eventItem.image || eventItem.photo || '/hero_background.webp',
              extraInfo: eventItem.extraInfo || 'संबंधित जानकारी यहाँ उपलब्ध होगी।',
            }))
          );

          setUpcomingEvents(
            eventData.map((eventItem, index) => ({
              _id: eventItem._id || `upcoming-${index}`,
              title: eventItem.title || 'आगामी कार्यक्रम',
              date: eventItem.date || eventItem.startDate || 'तारीख दर्ज की जाएगी',
              time: eventItem.time || 'समय दर्ज किया जाएगा',
              location: eventItem.location || eventItem.venue || 'स्थान दर्ज किया जाएगा',
              description: eventItem.description || 'विवरण यहाँ दर्ज किया जाएगा।',
            }))
          );
        }

        if (galleryData.length > 0) {
          setGalleryItems(
            galleryData.slice(0, 6).map((item, index) => ({
              _id: item._id || `gallery-${index}`,
              title: item.title || 'कार्यक्रम',
              caption: item.caption || item.description || 'कार्यक्रम एवं गतिविधि गैलरी',
              image: item.image || item.url || '/hero_background.webp',
            }))
          );
        }
      })
      .catch((error) => {
        console.error('Women committee page data load failed:', error);
        setCommitteeMembers(defaultMembers);
        setFeaturedActivities(defaultFeaturedActivities);
        setUpcomingEvents([]);
        setGalleryItems(defaultGallery);
      })
      .finally(() => setLoading(false));
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

