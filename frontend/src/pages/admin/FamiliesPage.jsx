import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';
import { familyAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

const FamiliesPage = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchFamilies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await familyAPI.getAll({ page, limit: 10, search });
      setFamilies(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch { toast.error('Failed to load families'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchFamilies(); }, [fetchFamilies]);

  const openCreate = () => { setEditItem(null); reset({}); setModalOpen(true); };
  const openEdit = (family) => { setEditItem(family); reset(family); setModalOpen(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editItem) {
        await familyAPI.update(editItem._id, data);
        toast.success('Family updated!');
      } else {
        await familyAPI.create(data);
        toast.success('Family added!');
      }
      setModalOpen(false);
      fetchFamilies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await familyAPI.delete(deleteItem._id);
      toast.success('Family deleted!');
      setDeleteItem(null);
      fetchFamilies();
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  const columns = [
    { key: 'familyId', label: 'Family ID', sortable: true },
    { key: 'headOfFamily', label: 'Head of Family', sortable: true },
    { key: 'surname', label: 'Surname', sortable: true },
    { key: 'village', label: 'Village', sortable: true },
    { key: 'numberOfMembers', label: 'Members', sortable: true, render: (v) => <Badge variant="info">{v || 0}</Badge> },
    { key: 'mobileNumber', label: 'Mobile' },
    {
      key: 'status', label: 'Status', render: (v) => (
        <Badge variant={v === 'active' ? 'success' : 'warning'}>{v}</Badge>
      ),
    },
    {
      key: '_id', label: 'Actions', render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"><FiEdit2 className="w-4 h-4" /></button>
          <button onClick={() => setDeleteItem(row)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"><FiTrash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Family Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage all registered families</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 shadow-md shadow-orange-500/30 transition-all"
        >
          <FiPlus className="w-4 h-4" /> Add Family
        </button>
      </div>

      <DataTable
        columns={columns}
        data={families}
        loading={loading}
        totalPages={totalPages}
        currentPage={page}
        onPageChange={setPage}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        serverSide
        emptyIcon={FiUsers}
        emptyText="No families found"
        emptyDescription="Add the first family to get started."
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Family' : 'Add New Family'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Family ID *</label>
              <input {...register('familyId', { required: true })} placeholder="e.g. KND-001" className="input-field" />
              {errors.familyId && <p className="text-red-500 text-xs mt-1">Required</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Head of Family *</label>
              <input {...register('headOfFamily', { required: true })} placeholder="Full name" className="input-field" />
              {errors.headOfFamily && <p className="text-red-500 text-xs mt-1">Required</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Surname *</label>
              <input {...register('surname', { required: true })} placeholder="Family surname" className="input-field" />
              {errors.surname && <p className="text-red-500 text-xs mt-1">Required</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
              <input {...register('mobileNumber')} placeholder="+91 XXXXX XXXXX" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp Number</label>
              <input {...register('whatsappNumber')} placeholder="+91 XXXXX XXXXX" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Village</label>
              <input {...register('village')} defaultValue="Konda" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District</label>
              <input {...register('district')} defaultValue="Dhar" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
              <input {...register('state')} defaultValue="Madhya Pradesh" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PIN Code</label>
              <input {...register('pinCode')} defaultValue="454335" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select {...register('status')} className="input-field">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <textarea {...register('address')} rows={2} placeholder="Full address" className="input-field resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {editItem ? 'Save Changes' : 'Add Family'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Family"
        message={`Are you sure you want to delete the family of "${deleteItem?.headOfFamily}"? This will also remove all related data.`}
        isLoading={deleting}
      />
    </div>
  );
};

export default FamiliesPage;
