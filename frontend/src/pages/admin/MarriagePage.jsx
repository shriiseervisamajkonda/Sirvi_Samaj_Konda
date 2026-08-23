import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiHeart, FiCheck, FiX } from 'react-icons/fi';
import { marriageAPI, memberAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

const MarriagePage = () => {
  const [items, setItems] = useState([]);
  const [members, setMembers] = useState([]);
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
      const [res, membersRes] = await Promise.all([
        marriageAPI.getAll({ page, limit: 10, search }),
        memberAPI.getAll({ limit: 200 }),
      ]);
      setItems(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
      setMembers(membersRes.data.data || []);
    } catch {
      toast.error('Failed to load marriage profiles');
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
        await marriageAPI.update(editItem._id, data);
        toast.success('Profile updated!');
      } else {
        await marriageAPI.create(data);
        toast.success('Profile created!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await marriageAPI.update(id, { status });
      toast.success(`Profile status set to ${status}`);
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    const targetId = deleteItem._id;
    setDeleting(true);
    try {
      await marriageAPI.delete(targetId);
      setProfiles((prev) => prev.filter((item) => item._id !== targetId));
      toast.success('Profile deleted successfully!');
      setDeleteItem(null);
      if (profiles.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete profile');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'member', label: 'Name', render: (_, r) => <span className="font-medium">{r.member?.firstName} {r.member?.lastName}</span> },
    { key: 'gender', label: 'Gender', render: (v) => <Badge variant={v === 'Male' ? 'info' : 'purple'}>{v}</Badge> },
    { key: 'dob', label: 'Age', render: (v) => v ? `${new Date().getFullYear() - new Date(v).getFullYear()} yrs` : '—' },
    { key: 'education', label: 'Education' },
    { key: 'occupation', label: 'Occupation' },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'approved' ? 'success' : v === 'pending' ? 'warning' : 'danger'}>{v}</Badge> },
    {
      key: '_id', label: 'Actions', render: (_, r) => (
        <div className="flex gap-2">
          {r.status === 'pending' && (
            <>
              <button onClick={() => handleStatusChange(r._id, 'approved')} title="Approve" className="p-1.5 text-green-500 hover:bg-green-50 :bg-green-500/10 rounded-lg"><FiCheck className="w-4 h-4" /></button>
              <button onClick={() => handleStatusChange(r._id, 'rejected')} title="Reject" className="p-1.5 text-red-500 hover:bg-red-50 :bg-red-500/10 rounded-lg"><FiX className="w-4 h-4" /></button>
            </>
          )}
          <button onClick={() => { setEditItem(r); reset(r); setModalOpen(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 :bg-blue-500/10 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
          <button onClick={() => setDeleteItem(r)} className="p-1.5 text-red-500 hover:bg-red-50 :bg-red-500/10 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 ">Marriage Biodata Management</h1>
          <p className="text-gray-500 text-sm mt-1">Review and manage matrimonial profiles</p>
        </div>
        <button onClick={() => { setEditItem(null); reset({ status: 'approved' }); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 shadow-md shadow-pink-500/30">
          <FiPlus className="w-4 h-4" /> Add Profile
        </button>
      </div>
      <DataTable columns={columns} data={items} loading={loading} totalPages={totalPages} currentPage={page}
        onPageChange={setPage} onSearchChange={(v) => { setSearch(v); setPage(1); }} serverSide emptyIcon={FiHeart} emptyText="No matrimonial profiles found" />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Profile' : 'Add Matrimonial Profile'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Member *</label>
              <select {...register('member', { required: true })} className="input-field">
                <option value="">Select member</option>
                {members.map(m => <option key={m._id} value={m._id}>{m.firstName} {m.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
              <select {...register('gender', { required: true })} className="input-field">
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
              <input {...register('dob', { required: true })} type="date" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
              <input {...register('height')} placeholder="e.g. 5ft 6in" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
              <input {...register('education')} placeholder="e.g. B.Tech" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
              <input {...register('occupation')} placeholder="e.g. Software Engineer" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select {...register('status')} className="input-field">
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Family Details / About</label>
            <textarea {...register('about')} rows={3} placeholder="About family, expectations..." className="input-field resize-none" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-pink-500 rounded-xl hover:bg-pink-600 disabled:opacity-50 flex items-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editItem ? 'Save Changes' : 'Create Profile'}
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete Profile" message="Delete this matrimonial profile permanently?" isLoading={deleting} />
    </div>
  );
};

export default MarriagePage;
