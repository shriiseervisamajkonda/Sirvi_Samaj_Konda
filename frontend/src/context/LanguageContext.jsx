import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

const translations = {
  en: {
    nav_home: 'Home',
    nav_about: 'About',
    nav_directory: 'Directory',
    nav_families: 'Families',
    nav_members: 'Members',
    nav_students: 'Students',
    nav_businesses: 'Businesses',
    nav_donors: 'Blood Donors',
    nav_marriage: 'Marriage',
    nav_events: 'Events',
    nav_news: 'News',
    nav_gallery: 'Gallery',
    nav_donate: 'Donate',
    nav_contact: 'Contact',
    nav_login: 'Login',
    nav_lekha_jokha: 'Accounts Ledger',
    nav_social_info: 'Social Info',
    nav_panch_settlements: 'Panch Agreements',
    nav_committee_panch: 'Committee & Panchs',
    nav_admin: 'Admin',
    nav_dashboard: 'Dashboard',
    nav_logout: 'Sign Out',
    nav_profile: 'My Profile',
    nav_quick_links: 'Quick Links',
    nav_resources: 'Resources',
    nav_contact_us: 'Contact Us',
    about_footer_desc: 'Unity • Heritage • Progress. Serving the Seervi community of Konda village, Dhar, Madhya Pradesh.',

    hero_address: 'Konda, Kukshi, Dhar, MP 454335',
    hero_title_1: 'Shri Seervi',
    hero_title_2: 'Samaj',
    hero_title_3: 'Konda',
    hero_subtitle: 'Our community portal — connecting families, celebrating traditions, and building a stronger community together.',
    btn_explore: 'Explore Families',
    btn_upcoming: 'Upcoming Events',
    hero_center_title: 'Community Center',
    hero_center_desc: 'Sirvi Samaj Dharmshala, Konda — For meetings, weddings & cultural events',
    hero_spiritual_title: 'Followers of',
    hero_spiritual_name: 'Shri Aai Mataji',
    hero_seat_title: 'Bilara, Jodhpur',
    hero_seat_desc: 'Main Spiritual Seat',

    stats_badge: 'Community Stats',
    stats_title: 'Growing Together',
    stats_desc: 'Our community continues to grow, united by shared values and heritage.',
    stats_families: 'Families',
    stats_members: 'Members',
    stats_students: 'Students',
    stats_businesses: 'Businesses',
    stats_donors: 'Blood Donors',
    stats_events: 'Events',

    quick_badge: 'Quick Access',
    quick_title: 'Explore Our Portal',

    news_badge: 'Latest Updates',
    news_title: 'News & Notices',
    news_view_all: 'View all',
    news_empty: 'No news available',

    events_badge: 'Upcoming',
    events_title: 'Events',
    events_view_all: 'View all',
    events_empty: 'No upcoming events',

    committee_badge: 'Leadership',
    committee_title: 'Committee Members',
    committee_view_full: 'View Full Committee',

    cta_title: 'Be Part of Our Community',
    cta_desc: 'Join thousands of Seervi Samaj members and stay connected with your roots, heritage, and community.',
    cta_btn_join: 'Join Now',
    cta_btn_support: 'Support the Community',

    emergency_title: 'Emergency Contacts',
    emergency_desc: 'Available 24/7 for community emergencies',
    emergency_president: 'President',
    emergency_secretary: 'Secretary',
    emergency_blood: 'Blood Bank',

    about_title: 'About Us',
    about_subtitle: 'Heritage, Values, and the Seervi Community of Konda',
    about_heritage_title: 'Our Heritage',
    about_heritage_desc: 'The Seervi community traces its lineage back to the Rajput clans of Rajasthan, primarily from the Bilara region of Jodhpur. Devoted followers of Shri Aai Mataji, the community is known for its agrarian heritage, honesty, and deep-rooted spiritual values.',
    about_mission_title: 'Our Mission',
    about_mission_desc: 'To foster unity, education, and progress among Samaj members, ensuring support for all families while preserving our rich cultural traditions.',
    about_vision_title: 'Our Vision',
    about_vision_desc: 'A progressive, self-reliant, and closely connected community that excels in education, business, and social welfare while keeping spiritual roots active.',
    about_history_title: 'Konda Village & Samaj',
    about_history_desc: 'Established decades ago, the Seervi Samaj in Konda Village has grown into a vibrant pillar of local society. The central Samaj Dharmshala serves as the hub for cultural events, weddings, education awards, and general discussions.',

    contact_title: 'Contact Us',
    contact_subtitle: 'Get in touch with the Shri Seervi Samaj Konda committee',
    contact_header: 'Get In Touch',
    contact_address: 'Sirvi Samaj Dharmshala, Konda, Tehsil Kukshi, Dhar, MP 454335',
    contact_form_title: 'Send a Message',
    contact_name: 'Full Name',
    contact_phone: 'Phone',
    contact_email: 'Email',
    contact_subject: 'Subject',
    contact_message: 'Message',
    contact_placeholder_name: 'Your name',
    contact_placeholder_phone: 'Your phone number',
    contact_placeholder_email: 'your@email.com',
    contact_placeholder_subject: 'What is this about?',
    contact_placeholder_message: 'Write your message here...',
    contact_btn_send: 'Send Message',

    donate_title: 'Support Our Community',
    donate_subtitle: 'Your generosity builds a stronger Seervi Samaj',
    donate_collected: 'Total Collected',
    donate_donors: 'Total Donors',
    donate_form_title: 'Make a Donation',
    donate_quick_select: 'Quick Select Amount (₹)',
    donate_amount: 'Amount (₹)',
    donate_anonymous: 'Donate anonymously',
    donate_donor_name: 'Your Name',
    donate_placeholder_name: 'Your full name',
    donate_purpose: 'Purpose',
    donate_purpose_select: 'Select purpose...',
    donate_msg: 'Message (optional)',
    donate_placeholder_msg: 'Any message for the community...',
    donate_btn: 'Donate Now',
    donate_recent: 'Recent Donors',
    donate_empty_donors: 'Be the first to donate!',
    donate_bank_title: 'Bank Transfer Details',
    donate_bank_name: 'Account Name',
    donate_bank_bank: 'Bank',
    donate_bank_acc: 'Account No.',
    donate_bank_ifsc: 'IFSC Code',
    donate_bank_branch: 'Branch',

    gallery_title: 'Gallery',
    gallery_subtitle: 'Cherished moments from our community',
    gallery_all: 'All Photos',
    gallery_empty: 'Gallery photos will be added soon.',
  },
  hi: {
    nav_home: 'मुख्य पृष्ठ',
    nav_about: 'हमारे बारे में',
    nav_directory: 'निर्देशिका',
    nav_families: 'परिवार',
    nav_members: 'सदस्य',
    nav_students: 'छात्र',
    nav_businesses: 'व्यवसाय',
    nav_donors: 'रक्तदाता',
    nav_marriage: 'वैवाहिक',
    nav_events: 'कार्यक्रम',
    nav_news: 'समाचार',
    nav_gallery: 'गैलरी',
    nav_donate: 'दान करें',
    nav_contact: 'संपर्क',
    nav_login: 'लॉगिन',
    nav_lekha_jokha: 'लेखा-जोखा',
    nav_social_info: 'सामाजिक जानकारी',
    nav_panch_settlements: 'न्यायिक समझौते',
    nav_committee_panch: 'समिती एवं संकल पंच',
    nav_admin: 'एडमिन',
    nav_dashboard: 'डैशबोर्ड',
    nav_logout: 'लॉग आउट',
    nav_profile: 'मेरी प्रोफाइल',
    nav_quick_links: 'त्वरित लिंक',
    nav_resources: 'महत्वपूर्ण लिंक',
    nav_contact_us: 'संपर्क सूत्र',
    about_footer_desc: 'एकता • विरासत • प्रगति। धार, मध्य प्रदेश के कोंडा गाँव के सीरवी समाज की सेवा में समर्पित।',

    hero_address: 'कोंडा, कुक्षी, धार, मध्य प्रदेश 454335',
    hero_title_1: 'श्री सीरवी',
    hero_title_2: 'समाज',
    hero_title_3: 'कोंडा',
    hero_subtitle: 'हमारा सामुदायिक पोर्टल — परिवारों को जोड़ना, परंपराओं का जश्न मनाना, और मिलकर एक मजबूत समाज का निर्माण करना।',
    btn_explore: 'परिवार देखें',
    btn_upcoming: 'आगामी कार्यक्रम',
    hero_center_title: 'सामुदायिक केंद्र',
    hero_center_desc: 'सीरवी समाज धर्मशाला, कोंडा — सभाओं, विवाह और सांस्कृतिक कार्यक्रमों के लिए',
    hero_spiritual_title: 'परम भक्त',
    hero_spiritual_name: 'श्री आई माताजी',
    hero_seat_title: 'बिलाड़ा, जोधपुर',
    hero_seat_desc: 'मुख्य धर्मगादी / आध्यात्मिक केंद्र',

    stats_badge: 'सामुदायिक आँकड़े',
    stats_title: 'साथ मिलकर प्रगति',
    stats_desc: 'साझा मूल्यों और समृद्ध विरासत के साथ हमारा समाज लगातार बढ़ रहा है।',
    stats_families: 'परिवार',
    stats_members: 'कुल सदस्य',
    stats_students: 'छात्र',
    stats_businesses: 'व्यवसाय',
    stats_donors: 'रक्तदाता',
    stats_events: 'कार्यक्रम',

    quick_badge: 'त्वरित पहुँच',
    quick_title: 'पोर्टल का अन्वेषण करें',

    news_badge: 'नवीनतम अपडेट',
    news_title: 'समाचार और सूचनाएं',
    news_view_all: 'सभी देखें',
    news_empty: 'कोई समाचार उपलब्ध नहीं है',

    events_badge: 'आगामी',
    events_title: 'कार्यक्रम',
    events_view_all: 'सभी देखें',
    events_empty: 'कोई आगामी कार्यक्रम नहीं है',

    committee_badge: 'नेतृत्व',
    committee_title: 'कार्यकारिणी समिति के सदस्य',
    committee_view_full: 'पूरी समिति देखें',

    cta_title: 'हमारे समाज का हिस्सा बनें',
    cta_desc: 'सीरवी समाज कोंडा के हजारों सदस्यों से जुड़ें और अपनी जड़ों, विरासत और समाज से जुड़े रहें।',
    cta_btn_join: 'अभी जुड़ें',
    cta_btn_support: 'समाज का समर्थन करें',

    emergency_title: 'आपातकालीन संपर्क',
    emergency_desc: 'सामुदायिक आपात स्थिति के लिए 24/7 उपलब्ध',
    emergency_president: 'अध्यक्ष',
    emergency_secretary: 'सचिव',
    emergency_blood: 'ब्लड बैंक',

    about_title: 'हमारे बारे में',
    about_subtitle: 'कोंडा के सीरवी समाज की विरासत, मूल्य और इतिहास',
    about_heritage_title: 'हमारी विरासत',
    about_heritage_desc: 'सीरवी समाज की उत्पत्ति राजस्थान के जोधपुर क्षेत्र के बिलाड़ा से जुड़ी हुई है। श्री आई माताजी के परम भक्त, सीरवी समाज को अपनी कृषि विरासत, ईमानदारी और गहरी आध्यात्मिक आस्था के लिए जाना जाता है।',
    about_mission_title: 'हमारा उद्देश्य',
    about_mission_desc: 'समाज के सभी सदस्यों में एकता, शिक्षा और प्रगति को बढ़ावा देना, हमारी समृद्ध सांस्कृतिक परंपराओं को संरक्षित करते हुए हर परिवार को सहायता सुनिश्चित करना।',
    about_vision_title: 'हमारा संकल्प',
    about_vision_desc: 'एक प्रगतिशील, आत्मनिर्भर और आपस में जुड़ा हुआ समाज जो अपनी आध्यात्मिक जड़ों को जीवित रखते हुए शिक्षा, व्यवसाय और समाज कल्याण में उत्कृष्ट प्रदर्शन करे।',
    about_history_title: 'कोंडा गाँव और समाज',
    about_history_desc: 'दशकों पहले स्थापित, कोंडा गाँव का सीरवी समाज स्थानीय समुदाय का एक मजबूत स्तंभ बन गया है। नवनिर्मित धर्मशाला सांस्कृतिक कार्यक्रमों, शादियों, मेधावी छात्र सम्मान समारोहों और बैठकों का मुख्य केंद्र है।',

    contact_title: 'संपर्क करें',
    contact_subtitle: 'श्री सीरवी समाज कोंडा कार्यकारिणी समिति से संपर्क करें',
    contact_header: 'संपर्क विवरण',
    contact_address: 'सीरवी समाज धर्मशाला, कोंडा, तहसील कुक्षी, जिला धार, मध्य प्रदेश 454335',
    contact_form_title: 'संदेश भेजें',
    contact_name: 'पूरा नाम',
    contact_phone: 'फ़ोन नंबर',
    contact_email: 'ईमेल',
    contact_subject: 'विषय',
    contact_message: 'संदेश',
    contact_placeholder_name: 'आपका नाम लिखें',
    contact_placeholder_phone: 'आपका फ़ोन नंबर लिखें',
    contact_placeholder_email: 'email@example.com',
    contact_placeholder_subject: 'यह संदेश किस बारे में है?',
    contact_placeholder_message: 'अपना संदेश यहाँ लिखें...',
    contact_btn_send: 'संदेश भेजें',

    donate_title: 'हमारे समाज का समर्थन करें',
    donate_subtitle: 'आपकी उदारता एक मजबूत सीरवी समाज का निर्माण करती है',
    donate_collected: 'कुल प्राप्त दान राशि',
    donate_donors: 'कुल दानदाता',
    donate_form_title: 'दान राशि भेजें',
    donate_quick_select: 'त्वरित दान राशि चुनें (₹)',
    donate_amount: 'दान राशि (₹)',
    donate_anonymous: 'गुप्त दान (नाम गुप्त रखें)',
    donate_donor_name: 'आपका नाम',
    donate_placeholder_name: 'अपना पूरा नाम लिखें',
    donate_purpose: 'दान का उद्देश्य',
    donate_purpose_select: 'उद्देश्य चुनें...',
    donate_msg: 'सन्देश (वैकल्पिक)',
    donate_placeholder_msg: 'समाज के लिए कोई संदेश या सुझाव...',
    donate_btn: 'अभी दान करें',
    donate_recent: 'हाल के दानदाता',
    donate_empty_donors: 'पहला दानदाता बनें!',
    donate_bank_title: 'बैंक खाता विवरण',
    donate_bank_name: 'खाता धारक का नाम',
    donate_bank_bank: 'बैंक का नाम',
    donate_bank_acc: 'खाता संख्या',
    donate_bank_ifsc: 'आईएफएससी कोड',
    donate_bank_branch: 'शाखा',

    gallery_title: 'गैलरी',
    gallery_subtitle: 'हमारे समाज की कुछ सुंदर और ऐतिहासिक यादें',
    gallery_all: 'सभी तस्वीरें',
    gallery_empty: 'गैलरी में तस्वीरें जल्द ही जोड़ी जाएंगी।',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('language') || 'hi';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: setLanguageState, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
