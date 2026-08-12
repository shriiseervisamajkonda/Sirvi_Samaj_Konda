import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const PrivacyPolicyPage = () => (
  <div className="bg-[#160D08] min-h-screen py-16 text-[#FFF3DD]">
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/" className="inline-flex items-center gap-2 text-[#C85A17] hover:text-[#D4AF37] mb-8 font-bold transition-colors">
          <FiArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-4xl font-extrabold text-[#FFF3DD] mb-2">Privacy Policy (गोपनीयता नीति)</h1>
        <p className="text-[#CDBBA4] mb-8 font-medium">Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="space-y-8 bg-[#2A1010] rounded-2xl p-8 border border-[#D4AF37]/15 shadow-xl">
          {[
            {
              title: '1. Information We Collect',
              content: 'We collect information you provide directly to us, such as when you create an account, add family/member information, or contact us. This may include name, email, phone number, address, photos, and community-related information.',
            },
            {
              title: '2. How We Use Your Information',
              content: 'We use the information we collect to maintain the community directory, send notifications about events and news, facilitate community communication, improve our services, and comply with legal obligations.',
            },
            {
              title: '3. Data Sharing',
              content: 'Your information is only shared within the Seervi Samaj community as per your privacy settings. We do not sell or rent your personal information to third parties. Some information such as family directory, member list, and business directory may be visible to other registered members.',
            },
            {
              title: '4. Data Security',
              content: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your password is encrypted and never stored in plain text.',
            },
            {
              title: '5. Cookies',
              content: 'We use cookies and similar tracking technologies to maintain your session and remember your preferences.',
            },
            {
              title: '6. Your Rights',
              content: 'You have the right to access, correct, or delete your personal information. You can update your profile information from your account settings or contact the admin for assistance.',
            },
            {
              title: '7. Contact Us',
              content: 'If you have any questions about this Privacy Policy, please contact us at contact@seervisamajkonda.org or through our contact page.',
            },
          ].map(({ title, content }) => (
            <div key={title} className="border-b border-[#D4AF37]/10 pb-6 last:border-none last:pb-0">
              <h2 className="text-xl font-bold text-[#D4AF37] mb-3">{title}</h2>
              <p className="text-[#CDBBA4] leading-relaxed font-medium text-sm">{content}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </div>
);

export default PrivacyPolicyPage;
