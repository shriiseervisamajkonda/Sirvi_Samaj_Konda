import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const formatWhatsAppUrl = (val) => {
  if (!val) return 'https://wa.me/919981644585';
  if (val.startsWith('http://') || val.startsWith('https://')) return val;
  const digits = val.replace(/\D/g, '');
  return `https://wa.me/${digits || '919981644585'}`;
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();
  const {
    logoUrl,
    contactPhone,
    contactEmail,
    facebookUrl,
    instagramUrl,
    youtubeUrl,
    whatsappNumber,
    twitterUrl,
  } = useSiteSettings();

  const socialLinks = [
    { Icon: FaFacebook, href: facebookUrl || 'https://facebook.com/', label: 'Facebook' },
    { Icon: FaInstagram, href: instagramUrl || 'https://instagram.com/', label: 'Instagram' },
    { Icon: FaYoutube, href: youtubeUrl || 'https://youtube.com/', label: 'YouTube' },
    { Icon: FaWhatsapp, href: formatWhatsAppUrl(whatsappNumber), label: 'WhatsApp' },
    ...(twitterUrl ? [{ Icon: FaTwitter, href: twitterUrl, label: 'Twitter / X' }] : []),
  ];

  return (
    <footer className="bg-[#3B0A0A] text-[#FDE68A]/90 border-t border-[#F59E0B]/20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-md bg-white border border-[#D4AF37]/30">
                <img
                  src={logoUrl || '/Logo.webp'}
                  alt="श्री सिर्वी समाज कोणदा लोगो"
                  width="40"
                  height="40"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = '/Logo.webp'; }}
                />
              </div>
              <div>
                <p className="font-bold text-[#FFF3DD] leading-tight">{t('hero_title_1')} {t('hero_title_2')}</p>
                <p className="text-amber-400 text-xs font-bold">{t('hero_title_3')}</p>
              </div>
            </div>
            <p className="text-sm text-[#E2D9CF] leading-relaxed">
              {t('about_footer_desc')}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-[#FFF3DD] mb-4 tracking-wider uppercase text-xs">{t('nav_quick_links')}</h3>
            <ul className="space-y-2 text-sm">
              {[
                [t('nav_about'), '/about'], [t('nav_families'), '/families'], [t('nav_events'), '/events'],
                [t('nav_gallery'), '/gallery'], [t('nav_contact'), '/contact'],
              ].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="text-[#D1C7BC] hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[#FFF3DD] mb-4 tracking-wider uppercase text-xs">{t('nav_resources')}</h3>
            <ul className="space-y-2 text-sm">
              {[
                [t('nav_students'), '/students'],
                ['आय-व्यय लेखा-जोखा', '/lekha-jokha'],
                ['गोपनीयता नीति', '/privacy-policy'],
                ['नियम एवं शर्तें', '/terms'],
              ].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="text-[#D1C7BC] hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[#FFF3DD] mb-4 tracking-wider uppercase text-xs">{t('nav_contact_us')}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <FiMapPin className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" />
                <span className="text-[#E2D9CF]">{t('contact_address')}</span>
              </li>
              <li className="flex items-center gap-2">
                <FiPhone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${(contactPhone || '+919981644585').replace(/\s+/g, '')}`} className="text-[#E2D9CF] hover:text-white transition-colors">
                  {contactPhone || '+91-9981644585'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FiMail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${contactEmail || 'shriseervisamajkonda@gmail.com'}`} className="text-[#E2D9CF] hover:text-white transition-colors">
                  {contactEmail || 'shriseervisamajkonda@gmail.com'}
                </a>
              </li>
            </ul>
            <div className="flex flex-wrap gap-2.5 mt-5">
              {socialLinks.map(({ Icon, href, label }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="w-9 h-9 rounded-xl bg-[#351313] border border-[#D4AF37]/10 flex items-center justify-center hover:bg-[#7A2525] hover:text-white transition-all text-[#D1C7BC]"
                >
                  <Icon className="w-4.5 h-4.5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#D4AF37]/15 mt-10 pt-6 text-center text-xs text-[#D1C7BC] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; {currentYear} {t('hero_title_1')} {t('hero_title_2')} {t('hero_title_3')}। सर्वाधिकार सुरक्षित।</p>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="text-[#D1C7BC] hover:text-white transition-colors">गोपनीयता नीति</Link>
            <Link to="/terms" className="text-[#D1C7BC] hover:text-white transition-colors">नियम एवं शर्तें</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
