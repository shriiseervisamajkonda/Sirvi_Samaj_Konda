import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiBookOpen } from 'react-icons/fi';
import { socialInfoAPI } from '../../services/api';
import { useForm, useFieldArray } from 'react-hook-form';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

const SocialInfoPage = () => {
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

  const categories = [
    { id: 'rules', label: 'समाज नियमावली (Rules)' },
    { id: 'customs', label: 'रीति-रिवाज (Customs)' },
    { id: 'reforms', label: 'सामाजिक सुधार (Reforms)' },
    { id: 'history', label: 'इतिहास (History)' },
    { id: 'general', label: 'सामान्य जानकारी (General)' },
  ];

  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: {
      attachments: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'attachments'
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await socialInfoAPI.getAll({ page, limit: 10, search });
      setItems(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      toast.error('Failed to load social information');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSubmit = async (data) => {
    setSaving(true);
    const targetId = editItem ? (editItem.id || editItem._id) : null;
    const payload = {
      ...data,
      is_active: data.isActive !== undefined ? data.isActive : true,
      display_order: Number(data.order) || 0,
      order: Number(data.order) || 0,
    };
    try {
      if (editItem && targetId) {
        await socialInfoAPI.update(targetId, payload);
        toast.success('Social info updated successfully!');
      } else {
        await socialInfoAPI.create(payload);
        toast.success('Social info created successfully!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save record');
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
      await socialInfoAPI.delete(targetId);
      setItems((prev) => prev.filter((item) => (item.id || item._id) !== targetId));
      toast.success('Social info entry deleted successfully!');
      setDeleteItem(null);
      if (items.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete social info');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'order', label: 'Order', sortable: true, render: (v, r) => <span className="font-semibold">{v || r.display_order || 0}</span> },
    { key: 'title', label: 'Title / Subject', sortable: true, render: (v) => <span className="font-medium">{v || '—'}</span> },
    { key: 'category', label: 'Category', sortable: true, render: (v) => <Badge variant="primary">{categories.find((c) => c.id === v)?.label || v || 'General'}</Badge> },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (_, r) => {
        const active = r.is_active !== undefined ? r.is_active : r.isActive !== false;
        return <Badge variant={active ? 'success' : 'warning'}>{active ? 'Active' : 'Inactive'}</Badge>;
      },
    },
    {
      key: '_actions',
      label: 'Actions',
      render: (_, r) => (
        <div className="flex gap-2">
          <button onClick={() => { setEditItem(r); reset(r); setModalOpen(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
          <button onClick={() => setDeleteItem(r)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 ">सामाजिक जानकारी प्रबंधन (Social Info Management)</h1>
          <p className="text-gray-500 text-sm mt-1">Manage rules, history, customs, and reform resolutions for the public website</p>
        </div>
        <button onClick={() => { setEditItem(null); reset({ isActive: true, category: 'general', order: 1, attachments: [] }); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 shadow-md shadow-purple-600/30">
          <FiPlus className="w-4 h-4" /> Add Social Info Entry
        </button>
      </div>

      <DataTable columns={columns} data={items} loading={loading} totalPages={totalPages} currentPage={page}
        onPageChange={setPage} onSearchChange={(v) => { setSearch(v); setPage(1); }} serverSide emptyIcon={FiBookOpen} emptyText="No social info records found" />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Social Info' : 'Add Social Info'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">शीर्षक / विषय (Title) *</label>
              <input {...register('title', { required: true })} placeholder="शीर्षक (e.g. विवाह समारोह संबंधी नियम 2026)" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">श्रेणी (Category) *</label>
              <select {...register('category', { required: true })} className="input-field">
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">क्रम संख्या (Sort Order)</label>
              <input {...register('order', { valueAsNumber: true })} type="number" placeholder="1, 2, 3..." className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">स्थिति (Status)</label>
              <select {...register('isActive')} className="input-field">
                <option value={true}>सक्रिय (Active / Publicly Visible)</option>
                <option value={false}>निष्क्रिय (Inactive / Hidden)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">जानकारी / विषयवस्तु (Content) *</label>
            <textarea {...register('content', { required: true })} rows={6} className="input-field resize-none" placeholder="पूरी जानकारी या प्रस्ताव विस्तार से लिखें..." />
          </div>

          <div className="space-y-2 border-t border-gray-100 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700 ">दस्तावेज़ / पीडीएफ लिंक (Attachments)</span>
              <button type="button" onClick={() => append({ name: '', url: '' })} className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-semibold">
                <FiPlus className="w-3 h-3" /> Add File Link
              </button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-center">
                <input {...register(`attachments.${index}.name`)} placeholder="फाइल का नाम (e.g. समाज नियम पीडीएफ)" className="input-field" />
                <input {...register(`attachments.${index}.url`)} placeholder="https://drives.google.com/..." className="input-field flex-1" />
                <button type="button" onClick={() => remove(index)} className="p-2 text-red-500 hover:bg-red-50 :bg-red-900/20 rounded-lg">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editItem ? 'Save Changes' : 'Record'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete Record" message="Remove this social info entry?" isLoading={deleting} />
    </div>
  );
};

export default SocialInfoPage;
