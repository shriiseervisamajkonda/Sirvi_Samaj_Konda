import { useState, useEffect, useCallback } from 'react';
import { FiUser, FiEdit2, FiTrash2, FiPlus, FiPhone, FiLock, FiShield, FiHome, FiEye, FiEyeOff, FiKey } from 'react-icons/fi';
import { userAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const roleOptions = [
  { value: 'developer', label: 'Developer (पूर्ण तकनीकी नियंत्रण / Full Access)' },
  { value: 'super_admin', label: 'Super Admin (मुख्य प्रशासक / Master Admin)' },
  { value: 'admin', label: 'Admin (समिति एवं सामान्य प्रबंधन)' },
  { value: 'editor', label: 'Editor (समाचार, कार्यक्रम एवं गैलरी)' },
  { value: 'treasurer', label: 'Treasurer (कोषाध्यक्ष / वित्तीय लेखा-जोखा)' },
  { value: 'member', label: 'Member (सामान्य समाज सदस्य)' },
];

const UsersPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [resetUser, setResetUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [togglingExportId, setTogglingExportId] = useState(null);
  const { isSuperAdmin } = useAuth();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const watchPhone = watch('phone');
  const watchFamilyId = watch('panchayat_family_id');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll({ page, limit: 10, search });
      setItems(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateModal = () => {
    setEditItem(null);
    reset({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      password: '',
      role: 'member',
      status: 'active',
      is_active: true,
      panchayat_family_id: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    const parts = (item.name || '').trim().split(' ');
    const fName = parts[0] || '';
    const lName = parts.slice(1).join(' ') || '';

    reset({
      firstName: fName,
      lastName: lName,
      phone: item.phone || '',
      email: item.email || '',
      password: '', // Blank by default on edit
      role: item.role || 'member',
      status: item.is_active !== false ? 'active' : 'inactive',
      is_active: item.is_active !== false,
      panchayat_family_id: item.panchayat_family_id || '',
    });
    setModalOpen(true);
  };

  const calculateDefaultPassword = () => {
    const currentPhone = (watchPhone || editItem?.phone || '').replace(/\D/g, '');
    const last4 = currentPhone.length >= 4 ? currentPhone.slice(-4) : '0000';
    const familyId = watchFamilyId || editItem?.panchayat_family_id || '1';
    return `${last4}@${familyId}`;
  };

  const handleFillDefaultPassword = () => {
    const defaultPwd = calculateDefaultPassword();
    setValue('password', defaultPwd, { shouldValidate: true });
    setShowPassword(true);
    toast.success(`डिफ़ॉल्ट पासवर्ड सेट किया गया: ${defaultPwd}`);
  };

  const handleToggleExport = async (userRecord) => {
    if (!isSuperAdmin) {
      toast.error('डेटा एक्सपोर्ट अधिकार बदलने के लिए Super Admin अनुमति आवश्यक है');
      return;
    }
    setTogglingExportId(userRecord.id);
    try {
      const res = await userAPI.toggleExportPermission(userRecord.id);
      toast.success(res.data?.message || 'डेटा एक्सपोर्ट अनुमति अपडेट की गई');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'अनुमति बदलने में त्रुटि हुई');
    } finally {
      setTogglingExportId(null);
    }
  };

  const handleResetToDefault = async () => {
    if (!resetUser) return;
    setResettingPassword(true);
    try {
      const res = await userAPI.resetDefaultPassword(resetUser.id);
      const defaultPwd = res.data?.defaultPassword || `${(resetUser.phone || '').replace(/\D/g, '').slice(-4)}@${resetUser.panchayat_family_id || '1'}`;
      toast.success(`पासवर्ड रीसेट सफल! डिफ़ॉल्ट पासवर्ड: ${defaultPwd}`);
      setResetUser(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'पासवर्ड रीसेट करने में त्रुटि');
    } finally {
      setResettingPassword(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    const targetId = editItem ? (editItem.id || editItem._id) : null;
    const combinedName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.name || '';

    const payload = {
      ...data,
      name: combinedName,
      is_active: data.status === 'active',
    };
    try {
      if (editItem && targetId) {
        await userAPI.update(targetId, payload);
        toast.success('User updated successfully!');
      } else {
        await userAPI.create(payload);
        toast.success('User created successfully!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    const targetId = deleteItem.id || deleteItem._id;
    if (!targetId) return;
    setDeleting(true);
    try {
      await userAPI.delete(targetId);
      setItems((prev) => prev.filter((item) => (item.id || item._id) !== targetId));
      toast.success('User deleted successfully!');
      setDeleteItem(null);
      if (items.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Full Name', sortable: true, render: (v) => <span className="font-semibold text-gray-900">{v}</span> },
    { key: 'phone', label: 'Mobile (Login ID)', sortable: true, render: (v) => v ? <span className="font-mono text-xs font-bold text-[#C85A17]">{v}</span> : '—' },
    {
      key: 'email',
      label: 'Google Account',
      sortable: true,
      render: (v) => v ? (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span className="truncate max-w-[150px] font-mono text-[11px]">{v}</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 font-medium px-2 py-0.5 bg-gray-50 rounded-md border border-gray-200">
          Not Linked
        </span>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (v) => {
        const variant = v === 'developer' || v === 'super_admin' ? 'danger' : v === 'admin' ? 'warning' : v === 'treasurer' ? 'info' : 'default';
        return <Badge variant={variant}>{v}</Badge>;
      },
    },
    {
      key: 'panchayat_family_id',
      label: 'Family ID',
      sortable: true,
      render: (v) => v ? <span className="text-xs font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-amber-900 font-bold">{v}</span> : '—',
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (_, r) => {
        const active = r.is_active !== undefined ? r.is_active : r.status !== 'inactive';
        return <Badge variant={active ? 'success' : 'danger'}>{active ? 'Active' : 'Inactive'}</Badge>;
      },
    },
    {
      key: 'permissions',
      label: 'डेटा एक्सपोर्ट (Export Access)',
      render: (_, r) => {
        const isMaster = r.role === 'developer' || r.role === 'super_admin';
        const hasExport = isMaster || (Array.isArray(r.permissions) && r.permissions.includes('can_export_data'));

        if (isMaster) {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200" title="Super Admin / Developer को स्थायी पूर्ण अधिकार है">
              <FiShield className="w-3 h-3 text-emerald-600" /> पूर्ण अधिकार
            </span>
          );
        }

        return (
          <button
            type="button"
            disabled={!isSuperAdmin || togglingExportId === r.id}
            onClick={() => handleToggleExport(r)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border shadow-2xs ${
              hasExport
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
            } ${!isSuperAdmin ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            title={isSuperAdmin ? (hasExport ? 'एक्सपोर्ट अधिकार हटाने के लिए क्लिक करें' : 'डेटा एक्सपोर्ट अधिकार देने के लिए क्लिक करें') : 'केवल Super Admin बदल सकते हैं'}
          >
            <span className={`w-2 h-2 rounded-full ${hasExport ? 'bg-emerald-500' : 'bg-gray-300'}`} />
            {togglingExportId === r.id ? 'अपडेटिंग...' : hasExport ? 'अनुमत (Allowed)' : 'प्रतिबंधित (Blocked)'}
          </button>
        );
      },
    },
    {
      key: '_actions',
      label: 'Actions',
      render: (_, r) => {
        const defaultPwd = `${(r.phone || '').replace(/\D/g, '').slice(-4) || '0000'}@${r.panchayat_family_id || '1'}`;
        return (
          <div className="flex gap-1.5 items-center">
            <button
              onClick={() => setResetUser(r)}
              title={`डिफ़ॉल्ट पासवर्ड रीसेट करें (${defaultPwd})`}
              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors border border-amber-200 shadow-2xs"
            >
              <FiKey className="w-4 h-4" />
            </button>
            <button onClick={() => openEditModal(r)} title="Edit User" className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors border border-blue-200 shadow-2xs">
              <FiEdit2 className="w-4 h-4" />
            </button>
            <button onClick={() => setDeleteItem(r)} title="Delete User" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors border border-red-200 shadow-2xs">
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  const preventEnterSubmit = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">उपयोगकर्ता प्रबंधन (User Management)</h1>
          <p className="text-gray-500 text-sm mt-1">प्रशासक, समिति सदस्य, संपादक एवं पंजीकृत उपयोगकर्ताओं का प्रबंधन</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 shadow-md shadow-orange-500/30 cursor-pointer transition-all shrink-0"
        >
          <FiPlus className="w-4 h-4" /> नया यूजर जोड़ें (Add User)
        </button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        totalPages={totalPages}
        currentPage={page}
        onPageChange={setPage}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        serverSide
        emptyIcon={FiUser}
        emptyText="No users found"
      />

      {/* Create / Edit User Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'यूजर विवरण संपादित करें (Edit User)' : 'नया यूजर बनाएं (Create User)'} size="lg">
        <form onKeyDown={preventEnterSubmit} onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label htmlFor="user-first-name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <FiUser className="w-4 h-4 text-[#C85A17]" /> प्रथम नाम (First Name) *
              </label>
              <input
                id="user-first-name"
                {...register('firstName', { required: 'First name is required' })}
                autoComplete="given-name"
                placeholder="उदा. रमेश"
                className="input-field"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>

            {/* Last Name / Gotra */}
            <div>
              <label htmlFor="user-last-name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <FiUser className="w-4 h-4 text-[#C85A17]" /> उपनाम / गोत्र (Last Name / Gotra) *
              </label>
              <input
                id="user-last-name"
                {...register('lastName', { required: 'Last name / Gotra is required' })}
                autoComplete="family-name"
                placeholder="उदा. सीरवी / भायल / पंवार"
                className="input-field"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="user-phone" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <FiPhone className="w-4 h-4 text-[#C85A17]" /> मोबाइल नंबर (Mobile / Login ID) *
              </label>
              <input
                id="user-phone"
                {...register('phone', {
                  required: 'Mobile number is required for login',
                  pattern: { value: /^[0-9]{10}$/, message: '10 digit Indian mobile number' },
                })}
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                maxLength={10}
                placeholder="10 अंकों का मोबाइल नंबर (उदा. 9826012345)"
                className="input-field font-mono"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            {/* Panchayat Family ID Link */}
            <div>
              <label htmlFor="user-panchayat-family-id" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <FiHome className="w-4 h-4 text-[#C85A17]" /> परिवार आईडी (Panchayat Family ID)
              </label>
              <input
                id="user-panchayat-family-id"
                {...register('panchayat_family_id')}
                placeholder="उदा. 1"
                className="input-field font-mono uppercase"
              />
            </div>

            {/* Google / Gmail ID Field */}
            <div className="md:col-span-2">
              <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Google / Gmail ID (1-Click Google Sign-In)
                </span>
                {editItem?.email && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ Google Linked
                  </span>
                )}
              </label>
              <input
                id="user-email"
                {...register('email')}
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="name@gmail.com (Google 1-क्लिक लॉगिन हेतु)"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Google खाता लिंक होने पर उपयोगकर्ता मोबाइल अथवा Google 1-Click दोनों माध्यमों से लॉगिन कर सकेंगे।
              </p>
            </div>

            {/* Password Field with Switch to Default Password button */}
            <div className="md:col-span-2 bg-[#FFF8EC] border border-[#E8DCC8] p-3.5 rounded-2xl">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="user-password" className="block text-xs font-bold uppercase tracking-wider text-[#7A2525] flex items-center gap-1.5">
                  <FiLock className="w-4 h-4 text-[#C85A17]" /> पासवर्ड (Password) {editItem ? '(बदलने हेतु दर्ज करें)' : '*'}
                </label>
                <button
                  type="button"
                  onClick={handleFillDefaultPassword}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 text-[#C85A17] text-xs font-bold rounded-lg border border-[#E8DCC8] flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  title="डिफ़ॉल्ट पासवर्ड फॉर्मूला अनुसार भरें"
                >
                  <FiKey className="w-3.5 h-3.5" /> डिफ़ॉल्ट पासवर्ड भरें ({calculateDefaultPassword()})
                </button>
              </div>

              <div className="relative">
                <input
                  id="user-password"
                  {...register('password', {
                    required: editItem ? false : 'Password is required for new users',
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder={editItem ? 'खाली छोड़ें यदि पासवर्ड नहीं बदलना है (अथवा ऊपर डिफ़ॉल्ट पर क्लिक करें)' : `उदा. ${calculateDefaultPassword()}`}
                  className="input-field pr-10 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'पासवर्ड छुपाएं' : 'पासवर्ड देखें'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  title={showPassword ? 'पासवर्ड छुपाएं' : 'पासवर्ड देखें'}
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[11px] text-[#766A60]">
                <span>
                  💡 डिफ़ॉल्ट पासवर्ड फॉर्मूला: <strong className="font-mono text-[#7A2525]">&lt;मोबाइल के अंतिम 4 अंक&gt;@&lt;परिवार आईडी&gt;</strong>
                </span>
                <span className="font-mono font-bold text-[#C85A17]">
                  वर्तमान गणना: {calculateDefaultPassword()}
                </span>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <FiShield className="w-4 h-4 text-[#C85A17]" /> अधिकार / भूमिका (Assigned Role) *
              </label>
              <select {...register('role', { required: true })} className="input-field">
                {roleOptions.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">खाता स्थिति (Account Status)</label>
              <select {...register('status')} className="input-field">
                <option value="active">सक्रिय (Active)</option>
                <option value="inactive">निष्क्रिय / ब्लॉक (Inactive)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-sm font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-md shadow-orange-500/20"
            >
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editItem ? 'परिवर्तन सहेजें (Save Changes)' : 'यूजर बनाएं (Create User)'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="यूजर हटाएं (Delete User)"
        message={`क्या आप उपयोगकर्ता "${deleteItem?.name}" को निश्चित रूप से हटाना चाहते हैं?`}
        isLoading={deleting}
      />

      {/* Confirm 1-Click Reset to Default Password Dialog */}
      <ConfirmDialog
        isOpen={!!resetUser}
        onClose={() => setResetUser(null)}
        onConfirm={handleResetToDefault}
        title="डिफ़ॉल्ट पासवर्ड पर रीसेट करें (Reset to Default Password)"
        message={`क्या आप "${resetUser?.name}" का पासवर्ड डिफ़ॉल्ट (${(resetUser?.phone || '').replace(/\D/g, '').slice(-4) || '0000'}@${resetUser?.panchayat_family_id || '1'}) पर रीसेट करना चाहते हैं? अगली बार लॉगिन करने पर उन्हें नया पासवर्ड सेट करने के लिए कहा जाएगा।`}
        confirmText="हाँ, डिफ़ॉल्ट पासवर्ड सेट करें"
        isLoading={resettingPassword}
      />
    </div>
  );
};

export default UsersPage;
