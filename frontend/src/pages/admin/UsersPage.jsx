import { useState, useEffect, useCallback } from 'react';
import { FiUser, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { userAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

const roles = ['member', 'editor', 'admin', 'super_admin'];

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
  const { register, handleSubmit, reset } = useForm();

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

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editItem) {
        await userAPI.update(editItem._id, data);
        toast.success('User updated successfully!');
      } else {
        await userAPI.create(data);
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
    const targetId = deleteItem._id;
    setDeleting(true);
    try {
      await userAPI.delete(targetId);
      setUsers((prev) => prev.filter((item) => item._id !== targetId));
      toast.success('User deleted successfully!');
      setDeleteItem(null);
      if (users.length === 1 && page > 1) {
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
    { key: 'name', label: 'Name', sortable: true, render: (v) => <span className="font-medium">{v}</span> },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', render: (v) => <Badge variant={v === 'super_admin' ? 'danger' : v === 'admin' ? 'warning' : v === 'editor' ? 'info' : 'default'}>{v}</Badge> },
    { key: 'isVerified', label: 'Email Verified', render: (v) => <Badge variant={v ? 'success' : 'warning'}>{v ? 'Verified' : 'Pending'}</Badge> },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'active' ? 'success' : 'danger'}>{v || 'active'}</Badge> },
    {
      key: '_id', label: 'Actions', render: (_, r) => (
        <div className="flex gap-2">
          <button onClick={() => { setEditItem(r); reset(r); setModalOpen(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
          <button onClick={() => setDeleteItem(r)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage portal users, roles, and permissions</p>
        </div>
        <button onClick={() => { setEditItem(null); reset({ role: 'member', isVerified: true }); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 shadow-md shadow-orange-500/30">
          <FiPlus className="w-4 h-4" /> Add User
        </button>
      </div>
      <DataTable columns={columns} data={items} loading={loading} totalPages={totalPages} currentPage={page}
        onPageChange={setPage} onSearchChange={(v) => { setSearch(v); setPage(1); }} serverSide emptyIcon={FiUser} emptyText="No users found" />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit User' : 'Create User'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
              <input {...register('name', { required: true })} placeholder="Full name" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
              <input {...register('email', { required: true })} type="email" placeholder="email@..." className="input-field" />
            </div>
            {!editItem && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</label>
                <input {...register('password', { required: true })} type="password" placeholder="••••••••" className="input-field" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role *</label>
              <select {...register('role', { required: true })} className="input-field">
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select {...register('status')} className="input-field">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-4">
              <input {...register('isVerified')} type="checkbox" id="verified" className="w-4 h-4 text-orange-500 rounded" />
              <label htmlFor="verified" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Verified</label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-orange-500 rounded-xl hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editItem ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete User" message={`Delete user "${deleteItem?.name}"?`} isLoading={deleting} />
    </div>
  );
};

export default UsersPage;
