import { motion } from 'framer-motion';
import { FiTarget, FiEye, FiStar } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

const Section = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6 }}
    className={className}
  >
    {children}
  </motion.div>
);

const AboutPage = () => {
  const { t } = useLanguage();

  const facts = [
    { label: 'गाँव', value: 'कोणदा' },
    { label: 'तहसील', value: 'कुक्षी' },
    { label: 'जिला', value: 'धार' },
    { label: 'राज्य', value: 'मध्य प्रदेश' },
    { label: 'पिन कोड', value: '454335' },
    { label: 'सामुदायिक केंद्र', value: t('contact_address') },
  ];

  const celebrations = [
    'श्री आई माता प्रकटोत्सव',
    'नवरात्रि महोत्सव',
    'बडेर स्थापना दिवस',
    'सामुदायिक कल्याण और विकास कार्यक्रम',
  ];

  const surnames = ['बर्फा', 'काग', 'भायल', 'पवार', 'सोलंकी', 'चोयल', 'पड़ियार', 'गेहलोत', 'अगल्चा', 'लछेटा', 'राठौर', 'चौहान', 'शिनदडा', 'सेणचा'];

  return (
    <div className="bg-[#FFF8EC] min-h-screen text-[#2B211B]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525] py-20 text-white relative overflow-hidden border-b border-[#E8DCC8]">
        <div className="absolute inset-0">
          <img src="/hero_background.webp" alt="Header Background" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/20 border border-amber-400/30 rounded-full text-xs font-bold mb-6 text-white shadow-sm uppercase tracking-wider">
              सीरवी समाज कोणदा
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 text-white">{t('nav_about')}</h1>
            <p className="text-lg text-orange-100 max-w-2xl mx-auto leading-relaxed font-medium">
              {t('about_subtitle')}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-20">
        {/* Community Info Grid */}
        <Section>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-white border border-[#E8DCC8] text-[#C85A17] text-xs font-bold rounded-full mb-4 uppercase tracking-wider shadow-sm">
                सामुदायिक जानकारी
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#2B211B] mb-6">
                {t('hero_title_1')} {t('hero_title_2')} {t('hero_title_3')}
              </h2>
              <p className="text-[#766A60] leading-relaxed mb-6 font-medium text-base">
                {t('about_heritage_desc')}
              </p>
              <p className="text-[#766A60] leading-relaxed font-medium text-base">
                {t('about_history_desc')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {facts.map(({ label, value }) => (
                <div key={label} className="bg-white rounded-3xl p-5 border border-[#E8DCC8] shadow-md hover:border-[#C9A44C]/60 hover:shadow-lg transition-all">
                  <p className="text-xs font-bold text-[#C85A17] uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-[#2B211B] font-bold text-sm leading-snug">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Mission & Vision */}
        <Section delay={0.1}>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-[#E8DCC8] shadow-md hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-[#7A2525] to-[#C85A17] rounded-2xl flex items-center justify-center mb-6 text-white shadow-md">
                <FiTarget className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-[#2B211B] mb-4">{t('about_mission_title')}</h3>
              <p className="text-[#766A60] leading-relaxed font-medium text-sm">
                {t('about_mission_desc')}
              </p>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-[#E8DCC8] shadow-md hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-[#C85A17] to-[#C9A44C] rounded-2xl flex items-center justify-center mb-6 text-white shadow-md">
                <FiEye className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-[#2B211B] mb-4">{t('about_vision_title')}</h3>
              <p className="text-[#766A60] leading-relaxed font-medium text-sm">
                {t('about_vision_desc')}
              </p>
            </div>
          </div>
        </Section>

        {/* Heritage */}
        <Section delay={0.15}>
          <div className="bg-white rounded-3xl p-8 lg:p-12 border border-[#E8DCC8] shadow-md">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <span className="inline-block px-4 py-1.5 bg-[#FFF8EC] border border-[#E8DCC8] text-[#C85A17] text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
                  धार्मिक धरोहर और परंपरा
                </span>
                <h3 className="text-3xl font-extrabold text-[#2B211B] mb-6">
                  आस्था और संस्कृति में विश्वास
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4 p-4 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#7A2525] to-[#C85A17] rounded-xl flex items-center justify-center shrink-0 text-white">
                      🙏
                    </div>
                    <div>
                      <p className="font-bold text-[#2B211B] mb-1">धार्मिक परंपरा</p>
                      <p className="text-[#766A60] text-sm font-medium">श्री आई माताजी और आई पंथ के अनुयायी</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#C85A17] to-[#C9A44C] rounded-xl flex items-center justify-center shrink-0 text-white">
                      🏛️
                    </div>
                    <div>
                      <p className="font-bold text-[#2B211B] mb-1">मुख्य धर्मगादी (आध्यात्मिक केंद्र)</p>
                      <p className="text-[#766A60] text-sm font-medium">बिलाड़ा, जोधपुर, राजस्थान</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8]/60">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#7A2525] to-[#C85A17] rounded-xl flex items-center justify-center shrink-0 text-white">
                      🗺️
                    </div>
                    <div>
                      <p className="font-bold text-[#2B211B] mb-1">उत्पत्ति और इतिहास</p>
                      <p className="text-[#766A60] text-sm font-medium">मूल रूप से मारवाड़ (जोधपुर क्षेत्र) से जुड़े हुए</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Family Surnames */}
                <div>
                  <h4 className="font-extrabold text-[#7A2525] mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <FiStar className="w-4 h-4 text-[#C85A17]" /> प्रमुख कुलनाम / गोत्र
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {surnames.map((s) => (
                      <span key={s} className="px-4 py-2 bg-[#FFF8EC] border border-[#E8DCC8] text-[#C85A17] rounded-2xl font-bold text-sm shadow-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Major Celebrations */}
                <div>
                  <h4 className="font-extrabold text-[#7A2525] mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                    🎉 प्रमुख त्योहार और धार्मिक उत्सव
                  </h4>
                  <div className="space-y-2">
                    {celebrations.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 p-3.5 bg-[#FFF8EC] rounded-2xl border border-[#E8DCC8]/60">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#7A2525] to-[#C85A17] rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                          {i + 1}
                        </div>
                        <span className="text-[#2B211B] text-sm font-bold">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* History */}
        <Section delay={0.2}>
          <div className="text-center max-w-3xl mx-auto bg-white p-8 rounded-3xl border border-[#E8DCC8] shadow-md">
            <span className="inline-block px-4 py-1.5 bg-[#FFF8EC] border border-[#E8DCC8] text-[#C85A17] text-xs font-bold rounded-full mb-4 uppercase tracking-wider shadow-sm">
              हमारा इतिहास
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#2B211B] mb-6">
              एकता और विकास की अटूट विरासत
            </h2>
            <p className="text-[#766A60] leading-relaxed font-medium text-sm">
              {t('about_heritage_desc')}
            </p>
            <p className="text-[#766A60] leading-relaxed font-medium text-sm mt-4">
              {t('about_history_desc')}
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default AboutPage;

