import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const TermsPage = () => (
  <div className="bg-[#160D08] min-h-screen py-16 text-[#FFF3DD]">
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/" className="inline-flex items-center gap-2 text-[#C85A17] hover:text-[#D4AF37] mb-8 font-bold transition-colors">
          <FiArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-4xl font-extrabold text-[#FFF3DD] mb-2">Terms & Conditions (नियम व शर्तें)</h1>
        <p className="text-[#CDBBA4] mb-8 font-medium">Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="space-y-8 bg-[#2A1010] rounded-2xl p-8 border border-[#D4AF37]/15 shadow-xl">
          {[
            {
              title: '1. Acceptance of Terms',
              content: 'By accessing and using the Shri Seervi Samaj Konda community portal, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use this portal.',
            },
            {
              title: '2. Membership',
              content: 'This portal is primarily for members of the Seervi Samaj community. Registration requires providing accurate personal information. You are responsible for maintaining the confidentiality of your account credentials.',
            },
            {
              title: '3. User Conduct',
              content: 'Users agree to: provide accurate and truthful information, not share others\' private information without consent, use the portal only for legitimate community purposes, not upload offensive or inappropriate content, and not attempt to gain unauthorized access.',
            },
            {
              title: '4. Content',
              content: 'Users may submit content such as family photos, member information, and business details. By submitting content, you grant the portal a non-exclusive license to display this content to community members. You retain ownership of your content.',
            },
            {
              title: '5. Privacy',
              content: 'Your use of this portal is also governed by our Privacy Policy, which is incorporated into these Terms by reference.',
            },
            {
              title: '6. Limitation of Liability',
              content: 'The Shri Seervi Samaj Konda organization and portal administrators shall not be liable for any damages arising from your use of the portal or any content posted by users.',
            },
            {
              title: '7. Changes to Terms',
              content: 'We reserve the right to modify these terms at any time. Continued use of the portal after changes constitutes acceptance of the new terms.',
            },
            {
              title: '8. Contact',
              content: 'For questions about these Terms, contact us at contact@seervisamajkonda.org',
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

export default TermsPage;
