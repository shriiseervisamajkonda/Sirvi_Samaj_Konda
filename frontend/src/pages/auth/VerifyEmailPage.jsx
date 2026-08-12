import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { authAPI } from '../../services/api';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    authAPI.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 p-12 text-center"
      >
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Verifying your email...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Email Verified!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Your email has been successfully verified. You can now sign in to your account.</p>
            <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium">
              Sign In Now
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <FiXCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Verification Failed</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">The verification link is invalid or has expired. Please request a new one.</p>
            <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium">
              Back to Login
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
