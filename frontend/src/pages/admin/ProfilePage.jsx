import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiShield, FiKey, FiSave, FiEye, FiEyeOff } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: regPwd, handleSubmit: handlePwd, reset: resetPwd, watch, formState: { errors: pwdErrors } } = useForm();
  const newPassword = watch('newPassword');

  useEffect(() => {
    if (user) {
      const parts = (user.name || '').trim().split(' ');
      const fName = parts[0] || '';
      const lName = parts.slice(1).join(' ') || '';
      reset({ firstName: fName, lastName: lName, email: user.email, phone: user.phone });
    }
  }, [user, reset]);

  const onProfileSubmit = async (data) => {
    setLoading(true);
    const combinedName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.name || '';
    try {
      const res = await authAPI.updateProfile({
        ...data,
        name: combinedName,
      });
      if (updateUser) updateUser(res.data.data);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed.'); } finally { setLoading(false); }
  };

  const onPasswordSubmit = async (data) => {
    setPasswordLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed!');
      resetPwd();
    } catch { toast.error('Password change failed. Check current password.'); } finally { setPasswordLoading(false); }
  };

  const preventEnterSubmit = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 ">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account settings</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ">
          <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <FiUser className="w-5 h-5 text-orange-500" /> Profile Information
          </h2>
          <form onKeyDown={preventEnterSubmit} onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input {...register('firstName', { required: true })} className="input-field" placeholder="प्रथम नाम" />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">Required</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input {...register('lastName', { required: true })} className="input-field" placeholder="उपनाम / गोत्र" />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">Required</p>}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Google / Gmail ID (1-Click Google Sign-In)
                </label>
                {user?.email && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    ✓ Linked
                  </span>
                )}
              </div>
              <input
                {...register('email')}
                type="email"
                className="input-field"
                placeholder="your.name@gmail.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                अपना Google / Gmail ID लिंक करने के बाद आप 'Sign in with Google' से सीधे 1-क्लिक में लॉगिन कर सकेंगे।
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number (Phone)</label>
              <input {...register('phone')} placeholder="+91..." className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Role</label>
              <input value={user?.role || 'User'} className="input-field bg-gray-100 cursor-not-allowed text-gray-600 font-semibold" readOnly />
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
            <FiKey className="w-5 h-5 text-orange-500" /> Change Password
          </h2>
          <form onKeyDown={preventEnterSubmit} onSubmit={handlePwd(onPasswordSubmit)} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">वर्तमान पासवर्ड (Current Password)</label>
              <div className="relative">
                <input
                  {...regPwd('currentPassword', { required: 'वर्तमान पासवर्ड आवश्यक है' })}
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">नया पासवर्ड (New Password)</label>
              <div className="relative">
                <input
                  {...regPwd('newPassword', { required: 'नया पासवर्ड आवश्यक है', minLength: { value: 6, message: 'न्यूनतम 6 अक्षर आवश्यक हैं' } })}
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  title={showNewPassword ? 'पासवर्ड छुपाएं' : 'पासवर्ड देखें'}
                >
                  {showNewPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {pwdErrors.newPassword && <p className="text-red-500 text-xs mt-1">{pwdErrors.newPassword.message}</p>}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">पासवर्ड की पुष्टि (Confirm New Password)</label>
              <div className="relative">
                <input
                  {...regPwd('confirmPassword', { required: 'पासवर्ड पुष्टि आवश्यक है', validate: (v) => v === newPassword || 'पासवर्ड मेल नहीं खा रहे हैं' })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
        <h2 className="font-semibold text-gray-900 mb-4">Account Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'User ID', value: user?._id?.slice(-8)?.toUpperCase() },
            { label: 'Role', value: user?.role },
            { label: 'Status', value: user?.isVerified ? 'Verified ✓' : 'Pending' },
            { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
              <p className="font-semibold text-gray-900 text-sm">{value || '—'}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
