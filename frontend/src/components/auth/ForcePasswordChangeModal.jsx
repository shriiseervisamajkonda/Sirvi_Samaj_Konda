import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FiLock, FiShield, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const ForcePasswordChangeModal = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const currentPassword = watch('currentPassword');
  const newPassword = watch('newPassword');

  if (!user || !user.must_change_password) {
    return null;
  }

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authAPI.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast.success('पासवर्ड सफलतापूर्वक अपडेट किया गया! अब आप पोर्टल का उपयोग कर सकते हैं।');
      updateUser({ must_change_password: false });
    } catch (err) {
      toast.error(err.response?.data?.message || 'पासवर्ड बदलने में त्रुटि। कृपया वर्तमान पासवर्ड जांचें।');
    } finally {
      setLoading(false);
    }
  };

  const preventEnterSubmit = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E8DCC8] overflow-hidden text-[#2B211B]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#7A2525] to-[#C85A17] p-6 text-white text-center relative">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner">
              <FiShield className="w-7 h-7 text-amber-300" />
            </div>
            <h2 className="text-xl font-extrabold mb-1">
              सुरक्षा चेतावनी: पासवर्ड बदलें
            </h2>
            <p className="text-orange-100 text-xs font-medium">
              प्रथम लॉगिन पर नया सुरक्षित पासवर्ड सेट करना अनिवार्य है
            </p>
          </div>

          {/* Form */}
          <form onKeyDown={preventEnterSubmit} onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div className="p-3 bg-[#FFF8EC] border border-[#E8DCC8] rounded-2xl text-xs text-[#766A60]">
              <p className="font-bold text-[#7A2525] mb-1 flex items-center gap-1">
                <FiCheckCircle className="w-3.5 h-3.5 text-[#C85A17]" /> नमस्ते, {user?.name || 'सदस्य'}
              </p>
              आपके खाते की सुरक्षा के लिए, कृपया अपना डिफ़ॉल्ट पासवर्ड बदलकर नया व्यक्तिगत पासवर्ड सेट करें।
            </div>

            {/* Current Password */}
            <div>
              <label htmlFor="force-current-password" className="block text-xs font-bold text-[#7A2525] mb-1 uppercase tracking-wider">
                वर्तमान पासवर्ड (Current Password) *
              </label>
              <div className="relative">
                <input
                  id="force-current-password"
                  {...register('currentPassword', { required: 'वर्तमान पासवर्ड आवश्यक है' })}
                  type={showCurrentPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="वर्तमान पासवर्ड दर्ज करें"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-[#FFF8EC] border border-[#E8DCC8] rounded-xl text-sm text-[#2B211B] focus:outline-none focus:border-[#C85A17] font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  aria-label={showCurrentPassword ? 'पासवर्ड छुपाएं' : 'पासवर्ड देखें'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  {showCurrentPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-red-600 text-xs mt-1 font-semibold">{errors.currentPassword.message}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="force-new-password" className="block text-xs font-bold text-[#7A2525] mb-1 uppercase tracking-wider">
                नया पासवर्ड (New Password) *
              </label>
              <div className="relative">
                <input
                  id="force-new-password"
                  {...register('newPassword', {
                    required: 'नया पासवर्ड आवश्यक है',
                    minLength: { value: 8, message: 'कम से कम 8 अक्षर आवश्यक हैं' },
                    pattern: {
                      value: PASSWORD_PATTERN,
                      message: 'कम से कम 1 बड़ा अक्षर (A-Z), 1 छोटा अक्षर (a-z), 1 अंक (0-9) और 1 विशेष चिह्न (!@#$) होना आवश्यक है',
                    },
                    validate: {
                      notSameAsCurrent: (v) =>
                        v !== currentPassword || 'नया पासवर्ड वर्तमान पासवर्ड से अलग होना चाहिए',
                    },
                  })}
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="कम से कम 8 अक्षर (उदा. Konda@2026)"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-[#FFF8EC] border border-[#E8DCC8] rounded-xl text-sm text-[#2B211B] focus:outline-none focus:border-[#C85A17] font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'पासवर्ड छुपाएं' : 'पासवर्ड देखें'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  {showNewPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                नियम: न्यूनतम 8 अक्षर, बड़ा व छोटा अक्षर, एक संख्या और विशेष चिह्न (!@#$)
              </p>
              {errors.newPassword && (
                <p className="text-red-600 text-xs mt-1 font-semibold">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="force-confirm-password" className="block text-xs font-bold text-[#7A2525] mb-1 uppercase tracking-wider">
                पासवर्ड की पुष्टि (Confirm New Password) *
              </label>
              <div className="relative">
                <input
                  id="force-confirm-password"
                  {...register('confirmPassword', {
                    required: 'पासवर्ड पुष्टि आवश्यक है',
                    validate: (v) => v === newPassword || 'पासवर्ड मेल नहीं खा रहे हैं',
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="नया पासवर्ड पुनः दर्ज करें"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-[#FFF8EC] border border-[#E8DCC8] rounded-xl text-sm text-[#2B211B] focus:outline-none focus:border-[#C85A17] font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'पासवर्ड छुपाएं' : 'पासवर्ड देखें'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1 font-semibold">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-[#7A2525] to-[#C85A17] text-white font-bold rounded-xl shadow-md hover:from-[#5C1A1A] hover:to-[#B04C10] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiLock className="w-4 h-4" />
              )}
              पासवर्ड सुरक्षित करें और आगे बढ़ें
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ForcePasswordChangeModal;
