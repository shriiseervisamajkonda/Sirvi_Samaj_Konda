import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign } from 'react-icons/fi';
import { lekhaJokhaAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

const LekhaJokhaPage = () => {
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

  const categories = [
    { id: 'aaiji_kosh', label: 'आईजी सहायता कोष' },
    { id: 'annapurna_bhavan', label: 'अन्नपूर्णा भवन' },
    { id: 'mandir_nirman', label: 'मन्दिर निर्माण राशि' },
    { id: 'dharmik_karya', label: 'धार्मिक कार्य लेखा जोखा' },
    { id: 'pratibha_samman', label: 'प्रतिभा सम्मान लेखा जोखा' },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await lekhaJokhaAPI.getAll({ page, limit: 10, search });
      setItems(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      toast.error('Failed to load accounts ledger');
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
        await lekhaJokhaAPI.update(editItem._id, data);
        toast.success('Record updated successfully!');
      } else {
        await lekhaJokhaAPI.create(data);
        toast.success('Record saved successfully!');
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
    const targetId = deleteItem._id;
    setDeleting(true);
    try {
      await lekhaJokhaAPI.delete(targetId);
      setItems((prev) => prev.filter((item) => item._id !== targetId));
      toast.success('Record deleted successfully!');
      setDeleteItem(null);
      if (items.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete record');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'date', label: 'Date', render: (v) => new Date(v).toLocaleDateString('en-IN') },
    { key: 'title', label: 'Title / Description', render: (v) => <span className="font-semibold">{v}</span> },
    { key: 'category', label: 'Fund Category', render: (v) => <Badge variant="primary">{categories.find(c => c.id === v)?.label || v}</Badge> },
    {
      key: 'type',
      label: 'Type',
      render: (v) => <Badge variant={v === 'income' ? 'success' : 'danger'}>{v === 'income' ? 'Income (+)' : 'Expense (-)'}</Badge>
    },
    { key: 'amount', label: 'Amount', render: (v) => <span className="font-bold">₹{v?.toLocaleString('en-IN')}</span> },
    { key: 'personName', label: 'Person', render: (v) => v || '-' },
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">लेखा-जोखा प्रबंधन (Ledger Management)</h1>
          <p className="text-gray-500 text-sm mt-1">Manage financial records and fund transactions for Sirvi Samaj Konda</p>
        </div>
        <button onClick={() => { setEditItem(null); reset({ type: 'income', category: 'aaiji_kosh', paymentMethod: 'cash', date: new Date().toISOString().split('T')[0] }); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 shadow-md shadow-green-600/30">
          <FiPlus className="w-4 h-4" /> Add Transaction Record
        </button>
      </div>

      <DataTable columns={columns} data={items} loading={loading} totalPages={totalPages} currentPage={page}
        onPageChange={setPage} onSearchChange={(v) => { setSearch(v); setPage(1); }} serverSide emptyIcon={FiDollarSign} emptyText="No transaction records found" />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Transaction Record' : 'Add Transaction Record'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">विवरण / शीर्षक (Description/Title) *</label>
              <input {...register('title', { required: true })} placeholder="विवरण (e.g. भवन निर्माण सामग्री, वार्षिक उत्सव गुप्तदान)" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">राशि (Amount - ₹) *</label>
              <input {...register('amount', { required: true, min: 1 })} type="number" placeholder="राशि" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">दिनांक (Date) *</label>
              <input {...register('date', { required: true })} type="date" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">लेनदेन प्रकार (Transaction Type) *</label>
              <select {...register('type', { required: true })} className="input-field">
                <option value="income">आवक (Income / Credit)</option>
                <option value="expense">जावक (Expense / Debit)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">कोष श्रेणी (Fund Category) *</label>
              <select {...register('category', { required: true })} className="input-field">
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">नाम (Person Name - Optional)</label>
              <input {...register('personName')} placeholder="सम्बन्धित व्यक्ति का नाम" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">भुगतान विधि (Payment Method)</label>
              <select {...register('paymentMethod')} className="input-field">
                <option value="cash">नकद (Cash)</option>
                <option value="upi">UPI (PhonePe/GPay)</option>
                <option value="bank_transfer">बैंक ट्रांसफर (Bank Transfer)</option>
                <option value="cheque">चेक (Cheque)</option>
                <option value="other">अन्य (Other)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">रसीद नंबर (Receipt No - Optional)</label>
              <input {...register('receiptNumber')} placeholder="रसीद क्रमांक" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">टिप्पणी / विवरण (Notes)</label>
            <textarea {...register('notes')} rows={2} className="input-field resize-none" placeholder="कोई विशेष टिप्पणी या जानकारी..." />
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

      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete Record" message="Remove this transaction record from the ledger?" isLoading={deleting} />
    </div>
  );
};

export default LekhaJokhaPage;
