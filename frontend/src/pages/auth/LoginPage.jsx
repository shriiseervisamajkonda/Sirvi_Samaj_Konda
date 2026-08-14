import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiShield, FiHome } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await login(data);
      toast.success(`स्वागत है, ${result.user?.name || 'उपयोगकर्ता'}!`);
      const role = result.user?.role;
      if (['super_admin', 'admin', 'editor'].includes(role)) {
        navigate('/admin');
      } else {
        navigate(from);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'लॉगिन विफल रहा। कृपया सही ईमेल और पासवर्ड दर्ज करें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FFF8EC] text-[#2B211B]">
      {/* Left Panel: Royal Brand Showcase (Desktop) */}
      <div className="hidden lg:flex flex-col justify-between flex-1 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/90 to-[#7A2525] p-12 text-white relative overflow-hidden border-r border-[#E8DCC8]">
        {/* Background texture */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/hero_background.webp"
            alt="Heritage background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A2525]/90 via-[#C85A17]/85 to-[#7A2525]/90" />
        </div>

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-semibold bg-white/15 backdrop-blur px-4 py-2 rounded-2xl border border-white/20 hover:bg-white/25 transition">
            <FiHome className="w-4 h-4" /> मुख्य पृष्ठ (Home)
          </Link>
          <span className="px-3.5 py-1 bg-white/20 backdrop-blur border border-amber-400/30 rounded-full text-xs font-bold text-white uppercase tracking-wider">
            सुरक्षित पोर्टल
          </span>
        </div>

        {/* Center Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 text-center max-w-md mx-auto"
        >
          <div className="w-24 h-24 bg-white rounded-3xl overflow-hidden flex items-center justify-center shadow-2xl border-2 border-amber-400/50 mx-auto mb-6 p-1">
            <img src="/Logo.webp" alt="Logo" className="w-full h-full object-cover rounded-2xl" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-2 text-white drop-shadow-sm">
            श्री सीरवी समाज
          </h1>
          <p className="text-lg font-bold text-amber-200 mb-2">
            ग्राम कोणदा, तहसील कुक्षी (धार, म.प्र.)
          </p>
          <p className="text-orange-100 text-sm max-w-xs mx-auto leading-relaxed font-medium">
            "आई पंथ के ११ नियम • समाज की एकता, सेवा एवं निरंतर प्रगति"
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3.5">
            {[
              { label: 'परिवार', value: '500+', icon: '👨‍👩‍👧‍👦' },
              { label: 'समाज सदस्य', value: '2000+', icon: '👥' },
              { label: 'प्रतिभावान छात्र', value: '300+', icon: '🎓' },
              { label: 'व्यवसाय व उद्योग', value: '100+', icon: '🏪' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 text-left shadow-sm">
                <div className="text-lg mb-1">{icon}</div>
                <p className="text-xl font-extrabold text-white">{value}</p>
                <p className="text-orange-200 text-xs font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer Note */}
        <div className="relative z-10 text-center text-xs text-orange-200/80 font-medium">
          © {new Date().getFullYear()} श्री सीरवी समाज कोणदा • सर्वाधिकार सुरक्षित
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Brand Header */}
          <div className="text-center mb-8 lg:hidden">
            <Link to="/" className="inline-block">
              <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-3 shadow-md border border-[#E8DCC8] p-0.5">
                <img src="/Logo.webp" alt="Logo" className="w-full h-full object-cover rounded-xl" />
              </div>
            </Link>
            <h1 className="text-xl font-extrabold text-[#7A2525]">श्री सीरवी समाज कोणदा</h1>
            <p className="text-xs text-[#766A60] font-medium">सदस्य एवं प्रशासक लॉगिन पोर्टल</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E8DCC8] shadow-xl text-[#2B211B]">
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF8EC] border border-[#E8DCC8] text-[#C85A17] text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                <FiShield className="w-3.5 h-3.5" /> सुरक्षित प्रवेश
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2B211B]">
                लॉगिन करें (Sign In)
              </h2>
              <p className="text-[#766A60] text-sm mt-1 font-medium">
                अपने पंजीकृत खाते में प्रवेश के लिए विवरण दर्ज करें
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-[#7A2525] mb-2">
                  ईमेल पता (Email Address)
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C85A17]" />
                  <input
                    id="login-email"
                    {...register('email', {
                      required: 'ईमेल पता आवश्यक है',
                      pattern: { value: /^\S+@\S+$/, message: 'अमान्य ईमेल पता' },
                    })}
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#FFF8EC] border border-[#E8DCC8] rounded-2xl text-[#2B211B] placeholder-[#766A60]/60 focus:outline-none focus:border-[#C85A17] focus:ring-2 focus:ring-[#C85A17]/20 transition-all text-sm font-medium"
                  />
                </div>
                {errors.email && <p className="text-red-600 text-xs mt-1.5 font-semibold">{errors.email.message}</p>}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-[#7A2525] mb-2">
                  पासवर्ड (Password)
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C85A17]" />
                  <input
                    id="login-password"
                    {...register('password', { required: 'पासवर्ड आवश्यक है' })}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-[#FFF8EC] border border-[#E8DCC8] rounded-2xl text-[#2B211B] placeholder-[#766A60]/60 focus:outline-none focus:border-[#C85A17] focus:ring-2 focus:ring-[#C85A17]/20 transition-all text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'पासवर्ड छुपाएं' : 'पासवर्ड देखें'}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#766A60] hover:text-[#C85A17] transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-600 text-xs mt-1.5 font-semibold">{errors.password.message}</p>}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[#C85A17] border-[#E8DCC8] rounded focus:ring-[#C85A17] accent-[#C85A17] cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm text-[#766A60] font-medium">मुझे याद रखें</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs sm:text-sm text-[#C85A17] hover:text-[#7A2525] font-bold transition-colors"
                >
                  पासवर्ड भूल गए?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#7A2525] to-[#C85A17] text-white font-extrabold rounded-2xl shadow-md hover:shadow-xl hover:from-[#5C1A1A] hover:to-[#B04C10] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>लॉगिन हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <span>लॉगिन करें (Sign In)</span>
                    <FiArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <p className="text-center text-[#766A60] text-sm mt-6 font-medium">
              खाता नहीं है?{' '}
              <Link to="/register" className="text-[#C85A17] hover:text-[#7A2525] font-bold transition-colors">
                नया खाता बनाएं
              </Link>
            </p>

            {/* Back to Home Link */}
            <div className="mt-6 pt-5 border-t border-[#E8DCC8]/60 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs text-[#766A60] hover:text-[#7A2525] font-bold transition-colors"
              >
                <FiHome className="w-3.5 h-3.5" /> मुख्य पृष्ठ पर वापस जाएं
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;

