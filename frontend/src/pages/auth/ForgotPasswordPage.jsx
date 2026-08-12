import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiMail, FiArrowRight } from 'react-icons/fi';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authAPI.forgotPassword(data.email);
      setSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiMail className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {sent ? 'Check your email' : 'Forgot Password?'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {sent
              ? "We've sent a password reset link to your email address."
              : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } })}
                  type="email"
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Send Reset Link <FiArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium">
              Back to Login
            </Link>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-orange-500 hover:text-orange-600 font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
