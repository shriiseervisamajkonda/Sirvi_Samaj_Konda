import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiArrowLeft, FiMail } from 'react-icons/fi';

const VerifyEmailPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 p-8 text-center"
      >
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <FiMail className="w-8 h-8 text-[#C85A17]" />
        </div>
        <span className="inline-block px-3 py-1 bg-amber-50 text-[#C85A17] text-xs font-bold rounded-full border border-amber-200 mb-2">
          सुविधा जल्द उपलब्ध होगी (Coming Soon)
        </span>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          ईमेल सत्यापन (Email Verification)
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          स्वचालित ईमेल सत्यापन सेवा शीघ्र ही उपलब्ध होगी। आप अपने पंजीकृत मोबाइल नंबर से लॉगिन कर सकते हैं।
        </p>

        <Link
          to="/login"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium text-sm w-full shadow-lg shadow-orange-500/30"
        >
          <FiArrowLeft className="w-4 h-4" /> लॉगिन पृष्ठ पर जाएं (Back to Login)
        </Link>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
