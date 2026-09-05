import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-[#3B0A0A] text-[#FDE68A]/90 border-t border-[#F59E0B]/20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-md bg-white border border-[#D4AF37]/30">
                <img src="/Logo.webp" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-[#FFF3DD] leading-tight">{t('hero_title_1')} {t('hero_title_2')}</p>
                <p className="text-primary text-xs font-bold">{t('hero_title_3')}</p>
              </div>
            </div>
            <p className="text-sm text-[#CDBBA4]/90 leading-relaxed">
              {t('about_footer_desc')}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[#FFF3DD] mb-4 tracking-wider uppercase text-xs">{t('nav_quick_links')}</h4>
            <ul className="space-y-2 text-sm">
              {[
                [t('nav_about'), '/about'], [t('nav_families'), '/families'], [t('nav_events'), '/events'],
                [t('nav_gallery'), '/gallery'], [t('nav_contact'), '/contact'],
              ].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="hover:text-primary transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#FFF3DD] mb-4 tracking-wider uppercase text-xs">{t('nav_resources')}</h4>
            <ul className="space-y-2 text-sm">
              {[
                [t('nav_students'), '/students'],
                ['गोपनीयता नीति', '/privacy-policy'],
                ['नियम एवं शर्तें', '/terms'],
              ].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="hover:text-primary transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#FFF3DD] mb-4 tracking-wider uppercase text-xs">{t('nav_contact_us')}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <FiMapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span className="text-[#CDBBA4]">{t('contact_address')}</span>
              </li>
              <li className="flex items-center gap-2">
                <FiPhone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:+919981644585" className="text-[#CDBBA4] hover:text-primary transition-colors">+91-9981644585</a>
              </li>
              <li className="flex items-center gap-2">
                <FiMail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:shriseervisamajkonda@gmail.com" className="text-[#CDBBA4] hover:text-primary transition-colors">shriseervisamajkonda@gmail.com</a>
              </li>
            </ul>
            <div className="flex gap-2.5 mt-5">
              {[
                { Icon: FiFacebook, href: '#' },
                { Icon: FiInstagram, href: '#' },
                { Icon: FiYoutube, href: '#' },
                { Icon: FaWhatsapp, href: 'https://wa.me/919981644585' },
              ].map(({ Icon, href }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-[#351313] border border-[#D4AF37]/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-[#CDBBA4]">
                  <Icon className="w-4.5 h-4.5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#D4AF37]/15 mt-10 pt-6 text-center text-xs text-[#766A60] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; {currentYear} {t('hero_title_1')} {t('hero_title_2')} {t('hero_title_3')}। सर्वाधिकार सुरक्षित।</p>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">गोपनीयता नीति</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">नियम एवं शर्तें</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
