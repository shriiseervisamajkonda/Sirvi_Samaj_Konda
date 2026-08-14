import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import { memberAPI, familyAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const MembersPage = () => {
  const [members, setMembers] = useState([]);
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [membersRes, famRes] = await Promise.all([
        memberAPI.getAll({ page, limit: 10, search }),
        familyAPI.getAll({ limit: 100 }),
      ]);
      setMembers(membersRes.data.data || []);
      setTotalPages(membersRes.data.pagination?.pages || 1);
      setFamilies(famRes.data.data || []);
    } catch { toast.error('Failed to load members'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditItem(null); reset({}); setModalOpen(true); };
  const openEdit = (item) => { setEditItem(item); reset(item); setModalOpen(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editItem) {
        await memberAPI.update(editItem._id, data);
        toast.success('Member updated!');
      } else {
        await memberAPI.create(data);
        toast.success('Member added!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    const targetId = deleteItem._id;
    setDeleting(true);
    try {
      await memberAPI.delete(targetId);
      setMembers((prev) => prev.filter((item) => item._id !== targetId));
      toast.success('Member deleted successfully!');
      setDeleteItem(null);
      if (members.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'firstName', label: 'Name', render: (_, r) => <span className="font-medium">{r.firstName} {r.lastName}</span> },
    { key: 'gender', label: 'Gender', render: (v) => <Badge variant={v === 'Male' ? 'info' : 'purple'}>{v}</Badge> },
    { key: 'bloodGroup', label: 'Blood Group', render: (v) => v ? <Badge variant="danger">{v}</Badge> : '—' },
    { key: 'occupation', label: 'Occupation', sortable: true },
    { key: 'education', label: 'Education' },
    { key: 'village', label: 'Village', sortable: true },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'active' ? 'success' : 'warning'}>{v}</Badge> },
    {
      key: '_id', label: 'Actions', render: (_, r) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(r)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
          <button onClick={() => setDeleteItem(r)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Member Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all community members</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 shadow-md shadow-orange-500/30">
          <FiPlus className="w-4 h-4" /> Add Member
        </button>
      </div>

      <DataTable columns={columns} data={members} loading={loading} totalPages={totalPages} currentPage={page}
        onPageChange={setPage} onSearchChange={(v) => { setSearch(v); setPage(1); }} serverSide
        emptyIcon={FiUser} emptyText="No members found" />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Member' : 'Add Member'} size="xl">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
              <input {...register('firstName', { required: true })} placeholder="First name" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
              <input {...register('lastName')} placeholder="Last name" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender *</label>
              <select {...register('gender', { required: true })} className="input-field">
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
              <select {...register('bloodGroup')} className="input-field">
                <option value="">Select blood group</option>
                {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
              <input {...register('dateOfBirth')} type="date" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Education</label>
              <input {...register('education')} placeholder="Highest qualification" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Occupation</label>
              <input {...register('occupation')} placeholder="Job/Profession" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input {...register('phone')} placeholder="+91..." className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input {...register('email')} type="email" placeholder="email@..." className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marital Status</label>
              <select {...register('maritalStatus')} className="input-field">
                <option value="">Select</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Family</label>
              <select {...register('family')} className="input-field">
                <option value="">Select family</option>
                {families.map(f => <option key={f._id} value={f._id}>{f.headOfFamily} ({f.familyId})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Village</label>
              <input {...register('village')} defaultValue="Konda" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select {...register('status')} className="input-field">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {editItem ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete}
        title="Delete Member" message={`Delete "${deleteItem?.firstName} ${deleteItem?.lastName}"?`} isLoading={deleting} />
    </div>
  );
};

export default MembersPage;
