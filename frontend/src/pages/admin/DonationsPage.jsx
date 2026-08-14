import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiCheck } from 'react-icons/fi';
import { donationAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

const DonationsPage = () => {
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
      const res = await donationAPI.getAll({ page, limit: 10, search });
      setItems(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      toast.error('Failed to load donations');
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
        await donationAPI.update(editItem._id, data);
        toast.success('Donation updated!');
      } else {
        await donationAPI.create(data);
        toast.success('Donation recorded!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save donation');
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async (item) => {
    try {
      await donationAPI.update(item._id, { status: 'verified' });
      toast.success('Donation verified!');
      fetchData();
    } catch {
      toast.error('Verification failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    const targetId = deleteItem._id;
    setDeleting(true);
    try {
      await donationAPI.delete(targetId);
      setDonations((prev) => prev.filter((item) => item._id !== targetId));
      toast.success('Donation record deleted successfully!');
      setDeleteItem(null);
      if (donations.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete donation');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'donorName', label: 'Donor', render: (v, r) => <span className="font-medium">{r.isAnonymous ? 'Anonymous 🎭' : v}</span> },
    { key: 'amount', label: 'Amount', sortable: true, render: (v) => <span className="font-bold text-green-600">₹{v?.toLocaleString('en-IN')}</span> },
    { key: 'purpose', label: 'Purpose' },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'verified' ? 'success' : v === 'pending' ? 'warning' : 'danger'}>{v}</Badge> },
    { key: 'createdAt', label: 'Date', sortable: true, render: (v) => new Date(v).toLocaleDateString('en-IN') },
    {
      key: '_id', label: 'Actions', render: (_, r) => (
        <div className="flex gap-2">
          {r.status === 'pending' && (
            <button onClick={() => handleVerify(r)} title="Verify" className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg"><FiCheck className="w-4 h-4" /></button>
          )}
          <button onClick={() => { setEditItem(r); reset(r); setModalOpen(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
          <button onClick={() => setDeleteItem(r)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  const purposes = ['General Fund', 'Community Center', 'Education Fund', 'Health Camp', 'Festival Celebration', 'Emergency Relief', 'Other'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Donation Management</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage community donations</p>
        </div>
        <button onClick={() => { setEditItem(null); reset({ status: 'verified' }); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 shadow-md shadow-green-600/30">
          <FiPlus className="w-4 h-4" /> Record Donation
        </button>
      </div>
      <DataTable columns={columns} data={items} loading={loading} totalPages={totalPages} currentPage={page}
        onPageChange={setPage} onSearchChange={(v) => { setSearch(v); setPage(1); }} serverSide emptyIcon={FiDollarSign} emptyText="No donations recorded" />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Donation' : 'Record Donation'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Donor Name</label>
              <input {...register('donorName')} placeholder="Donor full name" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹) *</label>
              <input {...register('amount', { required: true, min: 1 })} type="number" placeholder="Amount" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input {...register('phone')} placeholder="+91..." className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose</label>
              <select {...register('purpose')} className="input-field">
                {purposes.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
              <select {...register('paymentMethod')} className="input-field">
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select {...register('status')} className="input-field">
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note</label>
            <textarea {...register('message')} rows={2} className="input-field resize-none" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editItem ? 'Save Changes' : 'Record'}
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete Donation" message="Remove this donation record?" isLoading={deleting} />
    </div>
  );
};

export default DonationsPage;
