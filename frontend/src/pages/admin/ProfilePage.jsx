import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiShield, FiKey, FiSave } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: regPwd, handleSubmit: handlePwd, reset: resetPwd, watch, formState: { errors: pwdErrors } } = useForm();
  const newPassword = watch('newPassword');

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email, phone: user.phone });
  }, [user, reset]);

  const onProfileSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(data);
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
          <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input {...register('name', { required: true })} className="input-field" placeholder="Your name" />
              {errors.name && <p className="text-red-500 text-xs mt-1">Required</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input {...register('email')} type="email" className="input-field bg-gray-100 " readOnly />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input {...register('phone')} placeholder="+91..." className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input value={user?.role || ''} className="input-field bg-gray-100 " readOnly />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave className="w-4 h-4" />}
              Save Changes
            </button>
          </form>
        </motion.div>

        {/* Change Password */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ">
          <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <FiKey className="w-5 h-5 text-orange-500" /> Change Password
          </h2>
          <form onSubmit={handlePwd(onPasswordSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input {...regPwd('currentPassword', { required: true })} type="password" placeholder="••••••••" className="input-field" />
              {pwdErrors.currentPassword && <p className="text-red-500 text-xs mt-1">Required</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input {...regPwd('newPassword', { required: true, minLength: { value: 6, message: 'Min 6 chars' } })} type="password" placeholder="••••••••" className="input-field" />
              {pwdErrors.newPassword && <p className="text-red-500 text-xs mt-1">{pwdErrors.newPassword.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input {...regPwd('confirmPassword', { required: true, validate: (v) => v === newPassword || 'Passwords do not match' })} type="password" placeholder="••••••••" className="input-field" />
              {pwdErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{pwdErrors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={passwordLoading} className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {passwordLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiShield className="w-4 h-4" />}
              Update Password
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
