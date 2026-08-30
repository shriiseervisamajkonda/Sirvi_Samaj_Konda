import { useState, useEffect, useCallback } from 'react';
import { FiUser, FiEdit2, FiTrash2, FiPlus, FiPhone, FiMail, FiLock, FiShield, FiHome, FiEye, FiEyeOff } from 'react-icons/fi';
import { userAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

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
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

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
    { key: 'email', label: 'Gmail / Email ID', sortable: true, render: (v) => v ? <span className="text-xs text-gray-600 font-medium">{v}</span> : <span className="text-gray-400 text-xs">Not linked</span> },
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
      render: (v) => v ? <span className="text-xs font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-amber-900">{v}</span> : '—',
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
      key: '_actions',
      label: 'Actions',
      render: (_, r) => (
        <div className="flex gap-2">
          <button onClick={() => openEditModal(r)} title="Edit User" className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors">
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteItem(r)} title="Delete User" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors">
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ),
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'यूजर विवरण संपादित करें (Edit User)' : 'नया यूजर बनाएं (Create User)'} size="lg">
        <form onKeyDown={preventEnterSubmit} onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <FiUser className="w-4 h-4 text-[#C85A17]" /> प्रथम नाम (First Name) *
              </label>
              <input
                {...register('firstName', { required: 'First name is required' })}
                placeholder="उदा. रमेश"
                className="input-field"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>

            {/* Last Name / Gotra */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <FiUser className="w-4 h-4 text-[#C85A17]" /> उपनाम / गोत्र (Last Name / Gotra) *
              </label>
              <input
                {...register('lastName', { required: 'Last name / Gotra is required' })}
                placeholder="उदा. सीरवी / भायल / पंवार"
                className="input-field"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <FiPhone className="w-4 h-4 text-[#C85A17]" /> मोबाइल नंबर (Mobile / Login ID) *
              </label>
              <input
                {...register('phone', {
                  required: 'Mobile number is required for login',
                  pattern: { value: /^[0-9]{10}$/, message: '10 digit Indian mobile number' },
                })}
                placeholder="10 अंकों का मोबाइल नंबर (उदा. 9826012345)"
                className="input-field font-mono"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            {/* Email / Gmail ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <FiMail className="w-4 h-4 text-[#C85A17]" /> Google / Gmail ID (वैकल्पिक / Optional)
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="name@gmail.com"
                className="input-field"
              />
              <p className="text-xs text-gray-400 mt-1">Google खाता जोड़ने पर ईमेल से भी लॉगिन संभव होगा</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <FiLock className="w-4 h-4 text-[#C85A17]" /> पासवर्ड (Password) {editItem ? '(बदलने के लिए दर्ज करें)' : '*'}
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: editItem ? false : 'Password is required for new users',
                    minLength: { value: 6, message: 'Minimum 6 characters' },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={editItem ? 'खाली छोड़ें यदि पासवर्ड नहीं बदलना है' : 'न्यूनतम 6 अक्षर'}
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  title={showPassword ? 'पासवर्ड छुपाएं' : 'पासवर्ड देखें'}
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
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

            {/* Panchayat Family ID Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <FiHome className="w-4 h-4 text-[#C85A17]" /> परिवार आईडी (Panchayat Family ID)
              </label>
              <input
                {...register('panchayat_family_id')}
                placeholder="उदा. KONDA-FAM-001 (वैकल्पिक)"
                className="input-field font-mono uppercase"
              />
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

      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="यूजर हटाएं (Delete User)"
        message={`क्या आप उपयोगकर्ता "${deleteItem?.name}" को निश्चित रूप से हटाना चाहते हैं?`}
        isLoading={deleting}
      />
    </div>
  );
};

export default UsersPage;
