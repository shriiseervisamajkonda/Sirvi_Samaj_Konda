import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiShield, FiKey, FiSave, FiEye, FiEyeOff } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { supabase } from '../../config/supabase';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [googleActionLoading, setGoogleActionLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const {
    register: regPwd,
    handleSubmit: handlePwd,
    reset: resetPwd,
    watch: watchPwd,
    formState: { errors: pwdErrors },
  } = useForm();

  const currentPassword = watchPwd('currentPassword');
  const newPassword = watchPwd('newPassword');

  useEffect(() => {
    if (user) {
      const parts = (user.name || '').trim().split(' ');
      const fName = parts[0] || '';
      const lName = parts.slice(1).join(' ') || '';
      reset({ firstName: fName, lastName: lName, email: user.email || '', phone: user.phone || '' });
    }
  }, [user, reset]);

  const handleLinkGoogle = async () => {
    setGoogleActionLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?action=link`,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error('Google Link Error:', err);
      toast.error(err.message || 'Google खाता प्रमाणीकरण शुरू करने में त्रुटि हुई।');
      setGoogleActionLoading(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    setShowUnlinkConfirm(false);
    setGoogleActionLoading(true);
    try {
      const res = await authAPI.unlinkGoogle();
      if (updateUser) updateUser(res.data.data);
      setValue('email', '');
      toast.success('Google खाता सफलतापूर्वक हटा दिया गया है।');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google खाता हटाने में विफल।');
    } finally {
      setGoogleActionLoading(false);
    }
  };

  const onProfileSubmit = async (data) => {
    setLoading(true);
    const combinedName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.name || '';
    try {
      const res = await authAPI.updateProfile({
        ...data,
        name: combinedName,
      });
      if (updateUser) updateUser(res.data.data);
      toast.success('प्रोफ़ाइल विवरण सफलतापूर्वक अपडेट हो गया!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'प्रोफ़ाइल अपडेट करने में त्रुटि।');
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setPasswordLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('पासवर्ड सफलतापूर्वक बदल दिया गया है!');
      resetPwd();
    } catch (err) {
      toast.error(err.response?.data?.message || 'पासवर्ड बदलने में विफल। वर्तमान पासवर्ड जांचें।');
    } finally {
      setPasswordLoading(false);
    }
  };

  const preventEnterSubmit = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 ">मेरी प्रोफ़ाइल (My Profile)</h1>
        <p className="text-gray-500 text-sm mt-1">खाता विवरण एवं सुरक्षा प्रबंधन</p>
      </div>

      {/* Google Account Quick Connect Card */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-base">Google खाता एकीकरण (Google Sign-In)</h3>
              {user?.email ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                  ✓ Linked ({user.email})
                </span>
              ) : (
                <span className="inline-flex items-center text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Not Linked
                </span>
              )}
            </div>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5 font-medium">
              {user?.email
                ? 'आपका खाता लिंक है। आप लॉगिन स्क्रीन पर "Sign in with Google" से 1-क्लिक में लॉगिन कर सकते हैं।'
                : 'लॉगिन स्क्रीन पर 1-क्लिक Google साइन-इन सक्षम करने के लिए अपना Google खाता यहाँ कनेक्ट करें।'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {user?.email ? (
            <>
              <button
                type="button"
                onClick={handleLinkGoogle}
                disabled={googleActionLoading}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
              >
                Change Gmail
              </button>
              <button
                type="button"
                onClick={() => setShowUnlinkConfirm(true)}
                disabled={googleActionLoading}
                className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer border border-red-200"
                title="Disconnect Google"
              >
                {googleActionLoading ? 'हटा रहे हैं...' : 'Unlink'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLinkGoogle}
              disabled={googleActionLoading}
              className="px-5 py-2.5 bg-white border border-gray-300 hover:border-orange-500 text-gray-800 rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:shadow-md hover:bg-orange-50/40 transition flex items-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{googleActionLoading ? 'जोड़ रहे हैं...' : 'Google खाता लिंक करें (Connect Google)'}</span>
            </button>
          )}
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ">
          <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <FiUser className="w-5 h-5 text-orange-500" /> व्यक्तिगत जानकारी (Profile Information)
          </h2>
          <form onKeyDown={preventEnterSubmit} onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="profile-first-name" className="block text-sm font-medium text-gray-700 mb-1">प्रथम नाम (First Name) *</label>
                <input
                  id="profile-first-name"
                  {...register('firstName', { required: 'First name is required' })}
                  autoComplete="given-name"
                  className="input-field"
                  placeholder="प्रथम नाम"
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label htmlFor="profile-last-name" className="block text-sm font-medium text-gray-700 mb-1">उपनाम / गोत्र (Last Name) *</label>
                <input
                  id="profile-last-name"
                  {...register('lastName', { required: 'Last name is required' })}
                  autoComplete="family-name"
                  className="input-field"
                  placeholder="उपनाम / गोत्र"
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-1">
                संपर्क ईमेल (Contact Email - For receipts & notices)
              </label>
              <input
                id="profile-email"
                {...register('email')}
                type="email"
                autoComplete="email"
                inputMode="email"
                className="input-field"
                placeholder="your.name@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                रसीदें एवं सूचनाएं प्राप्त करने के लिए अपना संपर्क ईमेल दर्ज करें।
              </p>
            </div>
            <div>
              <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700 mb-1">मोबाइल नंबर (Mobile / Login ID) *</label>
              <input
                id="profile-phone"
                {...register('phone', {
                  required: 'Mobile number is required',
                  pattern: { value: /^[0-9]{10}$/, message: '10 digit mobile number required' },
                })}
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                maxLength={10}
                placeholder="10 अंकों का मोबाइल नंबर"
                className="input-field font-mono"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label htmlFor="profile-assigned-role" className="block text-sm font-medium text-gray-700 mb-1">Assigned Role</label>
              <input id="profile-assigned-role" value={user?.role || 'User'} className="input-field bg-gray-100 cursor-not-allowed text-gray-600 font-semibold" readOnly />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-orange-500/20">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave className="w-4 h-4" />}
              Save Profile Changes
            </button>
          </form>
        </motion.div>

        {/* Change Password */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ">
          <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <FiKey className="w-5 h-5 text-orange-500" /> पासवर्ड बदलें (Change Password)
          </h2>
          <form onKeyDown={preventEnterSubmit} onSubmit={handlePwd(onPasswordSubmit)} className="space-y-4">
            {/* Current Password */}
            <div>
              <label htmlFor="profile-current-password" className="block text-sm font-medium text-gray-700 mb-1">वर्तमान पासवर्ड (Current Password) *</label>
              <div className="relative">
                <input
                  id="profile-current-password"
                  {...regPwd('currentPassword', { required: 'वर्तमान पासवर्ड आवश्यक है' })}
                  type={showCurrentPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="वर्तमान पासवर्ड"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  aria-label={showCurrentPassword ? 'पासवर्ड छुपाएं' : 'पासवर्ड देखें'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  title={showCurrentPassword ? 'पासवर्ड छुपाएं' : 'पासवर्ड देखें'}
                >
                  {showCurrentPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {pwdErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{pwdErrors.currentPassword.message}</p>}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="profile-new-password" className="block text-sm font-medium text-gray-700 mb-1">नया पासवर्ड (New Password) *</label>
              <div className="relative">
                <input
                  id="profile-new-password"
                  {...regPwd('newPassword', {
                    required: 'नया पासवर्ड आवश्यक है',
                    minLength: { value: 8, message: 'न्यूनतम 8 अक्षर आवश्यक हैं' },
                    pattern: {
                      value: PASSWORD_PATTERN,
                      message: 'कम से कम 1 बड़ा अक्षर (A-Z), 1 छोटा अक्षर (a-z), 1 अंक (0-9) और 1 विशेष चिह्न (!@#$) आवश्यक है',
                    },
                    validate: {
                      notSameAsCurrent: (v) => v !== currentPassword || 'नया पासवर्ड वर्तमान पासवर्ड से अलग होना चाहिए',
                    },
                  })}
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="न्यूनतम 8 अक्षर (उदा. Konda@2026)"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'पासवर्ड छुपाएं' : 'पासवर्ड देखें'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  title={showNewPassword ? 'पासवर्ड छुपाएं' : 'पासवर्ड देखें'}
                >
                  {showNewPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                नियम: न्यूनतम 8 अक्षर, बड़ा व छोटा अक्षर, एक संख्या और विशेष चिह्न (!@#$)
              </p>
              {pwdErrors.newPassword && <p className="text-red-500 text-xs mt-1">{pwdErrors.newPassword.message}</p>}
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="profile-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">पासवर्ड की पुष्टि (Confirm New Password) *</label>
              <div className="relative">
                <input
                  id="profile-confirm-password"
                  {...regPwd('confirmPassword', {
                    required: 'पासवर्ड पुष्टि आवश्यक है',
                    validate: (v) => v === newPassword || 'पासवर्ड मेल नहीं खा रहे हैं',
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="नया पासवर्ड पुनः दर्ज करें"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'पासवर्ड छुपाएं' : 'पासवर्ड देखें'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  title={showConfirmPassword ? 'पासवर्ड छुपाएं' : 'पासवर्ड देखें'}
                >
                  {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {pwdErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{pwdErrors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={passwordLoading} className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-600/20">
              {passwordLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiShield className="w-4 h-4" />}
              पासवर्ड बदलें (Update Password)
            </button>
          </form>
        </motion.div>
      </div>

      {/* Account Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ">
        <h2 className="font-semibold text-gray-900 mb-4">खाता विवरण (Account Details)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'User ID', value: (user?.id || user?._id)?.slice(-8)?.toUpperCase() },
            { label: 'Role', value: user?.role },
            { label: 'Status', value: user?.is_active !== false ? 'Active ✓' : 'Inactive', isActive: user?.is_active !== false },
            { label: 'Member Since', value: (user?.created_at || user?.createdAt) ? new Date(user.created_at || user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A' },
          ].map(({ label, value, isActive }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
              <p className={`font-semibold text-sm ${label === 'Status' ? (isActive ? 'text-green-700' : 'text-red-600') : 'text-gray-900'}`}>{value || '—'}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Confirm Unlink Dialog */}
      <ConfirmDialog
        isOpen={showUnlinkConfirm}
        onClose={() => setShowUnlinkConfirm(false)}
        onConfirm={handleUnlinkGoogle}
        title="Google खाता हटाएं (Unlink Google)"
        message="क्या आप निश्चित रूप से Google खाता हटाना चाहते हैं? इसके बाद आप Google 1-क्लिक से लॉगिन नहीं कर सकेंगे।"
        isLoading={googleActionLoading}
      />
    </div>
  );
};

export default ProfilePage;
