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
  const { t, language } = useLanguage();

  const facts = [
    { label: language === 'en' ? 'Village' : 'गाँव', value: language === 'en' ? 'Konda' : 'कोंडा' },
    { label: language === 'en' ? 'Tehsil' : 'तहसील', value: language === 'en' ? 'Kukshi' : 'कुक्षी' },
    { label: language === 'en' ? 'District' : 'जिला', value: language === 'en' ? 'Dhar' : 'धार' },
    { label: language === 'en' ? 'State' : 'राज्य', value: language === 'en' ? 'Madhya Pradesh' : 'मध्य प्रदेश' },
    { label: language === 'en' ? 'PIN Code' : 'पिन कोड', value: '454335' },
    { label: language === 'en' ? 'Community Center' : 'सामुदायिक केंद्र', value: t('contact_address') },
  ];

  const celebrations = [
    language === 'en' ? 'Shri Aai Mata Pragatya Diwas' : 'श्री आई माता प्रकटोत्सव',
    language === 'en' ? 'Navratri Mahotsav' : 'नवरात्रि महोत्सव',
    language === 'en' ? 'Bader Establishment Anniversary' : 'बडेर स्थापना दिवस',
    language === 'en' ? 'Community Welfare Programs' : 'सामुदायिक कल्याण और विकास कार्यक्रम',
  ];

  const surnames = ['बर्फा (Barfa)', 'काग (Kag)'];

  return (
    <div className="bg-white dark:bg-slate-900">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-700 py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur border border-white/30 rounded-full text-xs font-semibold mb-6">
              {language === 'en' ? 'Estd. Konda Village' : 'सीरवी समाज कोंडा'}
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">{t('nav_about')}</h1>
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
              <span className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold rounded-full mb-4 uppercase tracking-wider">
                {language === 'en' ? 'Community Information' : 'सामुदायिक जानकारी'}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {t('hero_title_1')} {t('hero_title_2')} {t('hero_title_3')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 font-medium text-sm">
                {t('about_heritage_desc')}
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium text-sm">
                {t('about_history_desc')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {facts.map(({ label, value }) => (
                <div key={label} className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
                  <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-gray-900 dark:text-white font-bold text-sm leading-snug">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Mission & Vision */}
        <Section delay={0.1}>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-500/10 dark:to-orange-500/5 rounded-3xl p-8 border border-orange-200 dark:border-orange-500/20">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <FiTarget className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('about_mission_title')}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium text-sm">
                {t('about_mission_desc')}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-500/5 rounded-3xl p-8 border border-blue-200 dark:border-blue-500/20">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <FiEye className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('about_vision_title')}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium text-sm">
                {t('about_vision_desc')}
              </p>
            </div>
          </div>
        </Section>

        {/* Heritage */}
        <Section delay={0.15}>
          <div className="bg-gray-50 dark:bg-slate-800 rounded-3xl p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <span className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold rounded-full mb-4 uppercase tracking-wider">
                  {language === 'en' ? 'Heritage & Tradition' : 'धार्मिक धरोहर और परंपरा'}
                </span>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  {language === 'en' ? 'Rooted in Faith & Culture' : 'आस्था और संस्कृति में विश्वास'}
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/20 rounded-xl flex items-center justify-center shrink-0">
                      🙏
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">{language === 'en' ? 'Religious Tradition' : 'धार्मिक परंपरा'}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{language === 'en' ? 'Followers of Shri Aai Mataji and the Aai Panth' : 'श्री आई माताजी और आई पंथ के अनुयायी'}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                      🏛️
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">{language === 'en' ? 'Main Spiritual Seat' : 'मुख्य धर्मगादी (आध्यात्मिक केंद्र)'}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{language === 'en' ? 'Bilara, Jodhpur, Rajasthan' : 'बिलाड़ा, जोधपुर, राजस्थान'}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
                      🗺️
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">{language === 'en' ? 'Community Origin' : 'उत्पत्ति और इतिहास'}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{language === 'en' ? 'Associated with Jodhpur, Rajasthan' : 'मूल रूप से मारवाड़ (जोधपुर क्षेत्र) से जुड़े हुए'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Family Surnames */}
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-orange-500">
                    <FiStar className="w-4 h-4 text-orange-500" /> {language === 'en' ? 'Known Family Surnames' : 'प्रमुख कुलनाम / गोत्र'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {surnames.map((s) => (
                      <span key={s} className="px-4 py-2 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-xl font-bold text-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Major Celebrations */}
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-orange-500">
                    🎉 {language === 'en' ? 'Major Celebrations' : 'प्रमुख त्योहार और धार्मिक उत्सव'}
                  </h4>
                  <div className="space-y-2">
                    {celebrations.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700/50 rounded-xl border border-gray-100 dark:border-slate-600">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {i + 1}
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm font-semibold">{c}</span>
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
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold rounded-full mb-4 uppercase tracking-wider">
              {language === 'en' ? 'Our History' : 'हमारा इतिहास'}
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {language === 'en' ? 'A Legacy of Unity' : 'एकता और विकास की अटूट विरासत'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium text-sm">
              {t('about_heritage_desc')}
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium text-sm mt-4">
              {t('about_history_desc')}
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default AboutPage;
