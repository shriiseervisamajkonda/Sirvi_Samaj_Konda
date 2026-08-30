import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiDroplet } from 'react-icons/fi';
import { bloodDonorAPI, memberAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const BloodDonorsPage = () => {
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
      const res = await bloodDonorAPI.getAll({ page, limit: 10, search });
      setItems(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      toast.error('Failed to load blood donors');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    memberAPI.getAll({ limit: 200 }).then((res) => setMembers(res.data.data || [])).catch(() => {});
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    const targetId = editItem ? (editItem.id || editItem._id) : null;
    const payload = {
      ...data,
      blood_group: data.bloodGroup || data.blood_group,
      mobile_number: data.phone || data.mobile_number,
      last_donation_date: data.lastDonationDate || data.last_donation_date,
    };
    try {
      if (editItem && targetId) {
        await bloodDonorAPI.update(targetId, payload);
        toast.success('Donor updated!');
      } else {
        await bloodDonorAPI.create(payload);
        toast.success('Donor registered!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register donor');
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
      await bloodDonorAPI.delete(targetId);
      setItems((prev) => prev.filter((item) => (item.id || item._id) !== targetId));
      toast.success('Donor deleted successfully!');
      setDeleteItem(null);
      if (items.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete donor');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (_, r) => <span className="font-medium">{r.name || r.full_name || (r.member?.firstName ? `${r.member.firstName} ${r.member.lastName || ''}` : '—')}</span>,
    },
    { key: 'bloodGroup', label: 'Blood Group', sortable: true, render: (_, r) => <Badge variant="danger">{r.blood_group || r.bloodGroup || '—'}</Badge> },
    { key: 'phone', label: 'Phone', sortable: true, render: (_, r) => r.mobile_number || r.phone || '—' },
    { key: 'village', label: 'Village', sortable: true, render: (v) => v || 'Konda' },
    {
      key: 'lastDonationDate',
      label: 'Last Donation',
      sortable: true,
      render: (_, r) => {
        const d = r.last_donation_date || r.lastDonationDate;
        return d ? new Date(d).toLocaleDateString('en-IN') : 'Never';
      },
    },
    { key: 'status', label: 'Status', sortable: true, render: (v) => <Badge variant={v === 'available' ? 'success' : 'warning'}>{v || 'available'}</Badge> },
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
          <h1 className="text-2xl font-bold text-gray-900 ">Blood Donor Registry</h1>
          <p className="text-gray-500 text-sm mt-1">Manage blood donors</p>
        </div>
        <button onClick={() => { setEditItem(null); reset({ status: 'available' }); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 shadow-md shadow-red-500/30">
          <FiPlus className="w-4 h-4" /> Register Donor
        </button>
      </div>
      <DataTable columns={columns} data={items} loading={loading} totalPages={totalPages} currentPage={page}
        onPageChange={setPage} onSearchChange={(v) => { setSearch(v); setPage(1); }} serverSide emptyIcon={FiDroplet} emptyText="No donors registered" />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Donor' : 'Register Blood Donor'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Member</label>
              <select {...register('member')} className="input-field">
                <option value="">Select from members (or enter manually)</option>
                {members.map(m => <option key={m._id} value={m._id}>{m.firstName} {m.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input {...register('name')} placeholder="Donor name" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group *</label>
              <select {...register('bloodGroup', { required: true })} className="input-field">
                <option value="">Select</option>
                {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input {...register('phone')} placeholder="+91..." className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
              <input {...register('village')} defaultValue="Konda" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Donation Date</label>
              <input {...register('lastDonationDate')} type="date" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select {...register('status')} className="input-field">
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                <option value="cooldown">Cooldown Period</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 flex items-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editItem ? 'Save Changes' : 'Register Donor'}
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Remove Donor" message="Remove this donor from the registry?" isLoading={deleting} />
    </div>
  );
};

export default BloodDonorsPage;
