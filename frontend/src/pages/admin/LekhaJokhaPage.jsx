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
    const targetId = editItem ? (editItem.id || editItem._id) : null;
    const payload = {
      ...data,
      entry_type: data.type || data.entry_type,
      entry_date: data.date || data.entry_date,
      receipt_or_bill_no: data.receiptNumber || data.receipt_or_bill_no,
      person_name: data.personName || data.person_name,
      payment_method: data.paymentMethod || data.payment_method,
      amount: Number(data.amount) || 0,
    };
    try {
      if (editItem && targetId) {
        await lekhaJokhaAPI.update(targetId, payload);
        toast.success('Record updated successfully!');
      } else {
        await lekhaJokhaAPI.create(payload);
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
    const targetId = deleteItem.id || deleteItem._id;
    if (!targetId) return;
    setDeleting(true);
    try {
      await lekhaJokhaAPI.delete(targetId);
      setItems((prev) => prev.filter((item) => (item.id || item._id) !== targetId));
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
    {
      key: 'entry_date',
      label: 'Date',
      sortable: true,
      render: (v, r) => {
        const d = v || r.entry_date || r.date || r.created_at;
        return d ? new Date(d).toLocaleDateString('en-IN') : '—';
      },
    },
    { key: 'title', label: 'Title / Description', sortable: true, render: (v) => <span className="font-semibold">{v || '—'}</span> },
    { key: 'category', label: 'Fund Category', sortable: true, render: (v) => <Badge variant="primary">{categories.find((c) => c.id === v)?.label || v || 'General'}</Badge> },
    {
      key: 'entry_type',
      label: 'Type',
      sortable: true,
      render: (v, r) => {
        const type = v || r.entry_type || r.type;
        return <Badge variant={type === 'income' ? 'success' : 'danger'}>{type === 'income' ? 'Income (+)' : 'Expense (-)'}</Badge>;
      },
    },
    { key: 'amount', label: 'Amount', sortable: true, render: (v) => <span className="font-bold">₹{Number(v || 0).toLocaleString('en-IN')}</span> },
    { key: 'person_name', label: 'Person', sortable: true, render: (v, r) => v || r.person_name || r.personName || '—' },
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

  const preventEnterSubmit = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  const openCreate = () => {
    setEditItem(null);
    reset({
      type: 'income',
      entry_type: 'income',
      category: 'aaiji_kosh',
      paymentMethod: 'cash',
      payment_method: 'cash',
      date: new Date().toISOString().split('T')[0],
      entry_date: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 ">लेखा-जोखा (Income & Expenses)</h1>
          <p className="text-gray-500 text-sm mt-1">समाज कोष, मंदिर, धर्मशाला और सामान्य निधि का सम्पूर्ण आय-व्यय विवरण</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 shadow-md shadow-orange-500/20 transition cursor-pointer">
          <FiPlus className="w-4 h-4" /> Add Transaction Record
        </button>
      </div>

      <DataTable columns={columns} data={items} loading={loading} totalPages={totalPages} currentPage={page}
        onPageChange={setPage} onSearchChange={(v) => { setSearch(v); setPage(1); }} serverSide emptyIcon={FiDollarSign} emptyText="No transaction records found" />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Transaction Record' : 'Add Transaction Record'} size="lg">
        <form onKeyDown={preventEnterSubmit} onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">विवरण / शीर्षक (Description/Title) *</label>
              <input {...register('title', { required: true })} placeholder="विवरण (e.g. भवन निर्माण सामग्री, वार्षिक उत्सव गुप्तदान)" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">राशि (Amount - ₹) *</label>
              <input {...register('amount', { required: true, min: 1 })} type="number" placeholder="राशि" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">दिनांक (Date) *</label>
              <input {...register('date', { required: true })} type="date" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">लेनदेन प्रकार (Transaction Type) *</label>
              <select {...register('type', { required: true })} className="input-field">
                <option value="income">आवक (Income / Credit)</option>
                <option value="expense">जावक (Expense / Debit)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">कोष श्रेणी (Fund Category) *</label>
              <select {...register('category', { required: true })} className="input-field">
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">नाम (Person Name - Optional)</label>
              <input {...register('personName')} placeholder="सम्बन्धित व्यक्ति का नाम" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">भुगतान विधि (Payment Method)</label>
              <select {...register('paymentMethod')} className="input-field">
                <option value="cash">नकद (Cash)</option>
                <option value="upi">UPI (PhonePe/GPay)</option>
                <option value="bank_transfer">बैंक ट्रांसफर (Bank Transfer)</option>
                <option value="cheque">चेक (Cheque)</option>
                <option value="other">अन्य (Other)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">रसीद नंबर (Receipt No - Optional)</label>
              <input {...register('receiptNumber')} placeholder="रसीद क्रमांक" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">टिप्पणी / विवरण (Notes)</label>
            <textarea {...register('notes')} rows={2} className="input-field resize-none" placeholder="कोई विशेष टिप्पणी या जानकारी..." />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
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
