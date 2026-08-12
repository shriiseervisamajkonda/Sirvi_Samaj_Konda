import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const TermsPage = () => (
  <div className="bg-white dark:bg-slate-900 min-h-screen py-16">
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/" className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-8">
          <FiArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Terms & Conditions</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="space-y-8">
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
            <div key={title}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{content}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </div>
);

export default TermsPage;
