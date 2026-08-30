import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiPhone, FiArrowLeft, FiClock, FiShield } from 'react-icons/fi';

const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 p-8"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <FiClock className="w-8 h-8 text-[#C85A17]" />
          </div>
          <span className="inline-block px-3 py-1 bg-amber-50 text-[#C85A17] text-xs font-bold rounded-full border border-amber-200 mb-2">
            सुविधा जल्द उपलब्ध होगी (Coming Soon)
          </span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            पासवर्ड रीसेट (Password Reset)
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            स्वचालित एसएमएस/ईमेल ओटीपी सुविधा वर्तमान में विकास के अधीन है।
          </p>
        </div>

        <div className="bg-[#FFF8EC] dark:bg-slate-700/50 border border-[#E8DCC8] dark:border-slate-600 rounded-2xl p-5 mb-6 text-sm text-[#2B211B] dark:text-slate-200 space-y-3">
          <div className="flex items-start gap-2.5">
            <FiShield className="w-5 h-5 text-[#C85A17] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#7A2525] dark:text-amber-400">पासवर्ड कैसे बदलें?</p>
              <p className="text-xs text-[#766A60] dark:text-slate-300 mt-1">
                यदि आप अपना पासवर्ड भूल गए हैं, तो कृपया अपने समाज प्रशासक (Admin) अथवा सचिव से संपर्क कर अपना पासवर्ड रीसेट करवाएं।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-[#E8DCC8] dark:border-slate-600 text-xs text-[#766A60] dark:text-slate-300">
            <FiPhone className="w-4 h-4 text-[#C85A17]" />
            <span>समिति संपर्क: श्री सीरवी समाज कोणदा कार्यालय</span>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            to="/login"
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
          >
            <FiArrowLeft className="w-4 h-4" /> लॉगिन पृष्ठ पर वापस जाएं (Back to Login)
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          श्री सीरवी समाज कोणदा • आधिकारिक पोर्टल
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
