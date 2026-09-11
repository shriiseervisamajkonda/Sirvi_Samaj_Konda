import { useState, useEffect, useCallback, useMemo } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiFileText } from 'react-icons/fi';
import { lekhaJokhaAPI, familyAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import SearchableSelect from '../../components/common/SearchableSelect';
import PaymentReceiptModal from '../../components/common/PaymentReceiptModal';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LekhaJokhaPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
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
  const [receiptDonation, setReceiptDonation] = useState(null);
  const [selectedFamilyHeadId, setSelectedFamilyHeadId] = useState('');

  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const entryType = watch('type');

  const categories = [
    { id: 'aaiji_kosh', label: 'आईजी सहायता कोष' },
    { id: 'annapurna_bhavan', label: 'अन्नपूर्णा भवन' },
    { id: 'mandir_nirman', label: 'मन्दिर निर्माण राशि' },
    { id: 'dharmik_karya', label: 'धार्मिक कार्य लेखा जोखा' },
    { id: 'pratibha_samman', label: 'प्रतिभा सम्मान लेखा जोखा' },
  ];

  useEffect(() => {
    familyAPI.getAll({ limit: 1000 })
      .then((res) => {
        setFamilies(res.data?.data || []);
      })
      .catch(() => {});
  }, []);

  const familyHeadOptions = useMemo(() => {
    return (families || [])
      .filter((f) => f.head_name)
      .sort((a, b) => Number(a.panchayat_family_id || 0) - Number(b.panchayat_family_id || 0))
      .map((f) => ({
        value: f.id,
        label: `[#${f.panchayat_family_id || '—'}] ${f.head_name} (${f.gotra || '—'})`,
        family: f,
      }));
  }, [families]);

  const handleSelectFamilyHead = (famId) => {
    setSelectedFamilyHeadId(famId);
    const selected = families.find((f) => f.id === famId);
    if (selected) {
      setValue('personName', `${selected.head_name} (${selected.gotra || ''})`.trim());
      setValue('panchayat_family_id', selected.panchayat_family_id || '');
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await lekhaJokhaAPI.getAll({ page, limit: 10, search });
      setItems(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      toast.error('लेखा-जोखा लोड करने में विफल');
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
    const selectedFam = families.find((f) => f.id === selectedFamilyHeadId);
    const payload = {
      ...data,
      family_id: selectedFamilyHeadId || data.family_id || null,
      panchayat_family_id: data.panchayat_family_id || selectedFam?.panchayat_family_id || null,
      entry_type: data.type || data.entry_type,
      entry_date: data.date || data.entry_date,
      receipt_or_bill_no: data.receiptNumber || data.receipt_or_bill_no || (data.type === 'income' ? `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` : undefined),
      person_name: data.personName || data.person_name,
      payment_method: data.paymentMethod || data.payment_method,
      amount: Number(data.amount) || 0,
    };
    try {
      if (editItem && targetId) {
        await lekhaJokhaAPI.update(targetId, payload);
        toast.success('प्रविष्टि सफलतापूर्वक अपडेट की गई!');
      } else {
        const res = await lekhaJokhaAPI.create(payload);
        toast.success('प्रविष्टि सफलतापूर्वक दर्ज की गई!');
        if (payload.entry_type === 'income') {
          handleOpenReceipt({ ...payload, id: res.data?.data?.id });
        }
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'प्रविष्टि दर्ज करने में विफलता');
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
      toast.success('प्रविष्टि सफलतापूर्वक हटाई गई!');
      setDeleteItem(null);
      if (items.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'हटाने में विफलता');
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenReceipt = (row) => {
    const pName = row.person_name || row.personName || row.title || '';
    const matchedFam = families.find((f) => 
      (row.family_id && f.id === row.family_id) || 
      (row.panchayat_family_id && String(f.panchayat_family_id) === String(row.panchayat_family_id)) ||
      (pName && f.head_name && pName.includes(f.head_name)) ||
      (pName && f.head_name && f.head_name.includes(pName))
    );
    const receiptObj = {
      id: row.id,
      receipt_number: row.receipt_or_bill_no || row.receiptNumber || `KONDA-${new Date().getFullYear()}-${row.id?.slice(0, 4) || '9983'}`,
      donor_name: row.person_name || row.personName || row.title,
      head_name: matchedFam?.head_name || row.person_name || row.title,
      panchayat_family_id: row.panchayat_family_id || matchedFam?.panchayat_family_id || '',
      family_id: row.family_id || matchedFam?.id,
      gotra: matchedFam?.gotra || '',
      village: matchedFam?.village || 'कोणदा',
      amount: Number(row.amount || 0),
      payment_date: row.entry_date || row.date,
      purpose: row.category || 'प्रतिभा सम्मान',
      payment_mode: row.payment_method || row.paymentMethod || 'UPI',
      payment_status: 'confirmed',
      notes: row.title,
      source: 'लेखा-जोखा (Lekha-Jokha)',
      created_by_name: user?.name || row.recorded_by_name || 'चिराग भायल',
      collected_by_name: user?.name || row.recorded_by_name || 'चिराग भायल',
    };
    setReceiptDonation(receiptObj);
  };

  const columns = [
    {
      key: 'entry_date',
      label: 'दिनांक (Date)',
      sortable: true,
      render: (v, r) => {
        const d = v || r.entry_date || r.date || r.created_at;
        return d ? (
          <span className="font-mono font-bold text-xs text-[#7A2525] bg-[#FFF8EC] px-2.5 py-1 rounded-lg border border-[#E8DCC8]">
            {new Date(d).toLocaleDateString('hi-IN')}
          </span>
        ) : '—';
      },
    },
    { key: 'title', label: 'विवरण / शीर्षक', sortable: true, render: (v) => <span className="font-bold text-[#2B211B]">{v || '—'}</span> },
    { key: 'category', label: 'कोष श्रेणी', sortable: true, render: (v) => <Badge variant="primary">{categories.find((c) => c.id === v)?.label || v || 'General'}</Badge> },
    {
      key: 'entry_type',
      label: 'प्रकार',
      sortable: true,
      render: (v, r) => {
        const type = v || r.entry_type || r.type;
        return <Badge variant={type === 'income' ? 'success' : 'danger'}>{type === 'income' ? 'आवक (+)' : 'जावक (-)'}</Badge>;
      },
    },
    { key: 'amount', label: 'राशि', sortable: true, render: (v, r) => {
      const type = r.entry_type || r.type;
      return <span className={`font-black font-mono text-sm ${type === 'income' ? 'text-emerald-700' : 'text-[#C85A17]'}`}>₹{Number(v || 0).toLocaleString('en-IN')}</span>;
    }},
    { key: 'person_name', label: 'सम्बन्धित व्यक्ति (मुखिया)', sortable: true, render: (v, r) => <span className="text-[#5A4D41] font-medium">{v || r.person_name || r.personName || '—'}</span> },
    {
      key: '_actions',
      label: 'कार्रवाई (Actions)',
      render: (_, r) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenReceipt(r)}
            className="p-1.5 text-[#7A2525] hover:bg-[#FFF8EC] border border-transparent hover:border-[#E8DCC8] rounded-lg transition-all"
            title="रसीद / इनवॉइस देखें"
          >
            <FiFileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEdit(r)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="संपादित करें"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteItem(r)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="हटाएं"
          >
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

  const openCreate = () => {
    setEditItem(null);
    setSelectedFamilyHeadId('');
    reset({
      title: '',
      amount: '',
      type: 'income',
      entry_type: 'income',
      category: 'aaiji_kosh',
      paymentMethod: 'cash',
      payment_method: 'cash',
      date: new Date().toISOString().split('T')[0],
      entry_date: new Date().toISOString().split('T')[0],
      personName: '',
      receiptNumber: `KONDA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: '',
    });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditItem(row);
    const famId = row.family_id || families.find(f => 
      (row.panchayat_family_id && String(f.panchayat_family_id) === String(row.panchayat_family_id)) ||
      (row.person_name && f.head_name && row.person_name.includes(f.head_name))
    )?.id || '';
    setSelectedFamilyHeadId(famId);

    const rawDate = row.entry_date || row.date || row.created_at || '';
    const formattedDate = rawDate ? new Date(rawDate).toISOString().split('T')[0] : '';

    reset({
      ...row,
      title: row.title || '',
      amount: row.amount ?? '',
      type: row.entry_type || row.type || 'income',
      category: row.category || 'aaiji_kosh',
      date: formattedDate,
      personName: row.person_name || row.personName || '',
      paymentMethod: row.payment_method || row.paymentMethod || 'cash',
      receiptNumber: row.receipt_or_bill_no || row.receiptNumber || '',
      notes: row.notes || '',
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B211B] tracking-tight">लेखा-जोखा (Income & Expenses)</h1>
          <p className="text-[#766A60] text-sm mt-1">समाज कोष, मंदिर, धर्मशाला और सामान्य निधि का सम्पूर्ण आय-व्यय विवरण</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#C85A17] to-[#7A2525] text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all text-sm cursor-pointer"
        >
          <FiPlus className="w-4 h-4" /> नया लेनदेन दर्ज करें (Add Record)
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
        emptyIcon={FiDollarSign}
        emptyText="कोई लेनदेन रिकॉर्ड उपलब्ध नहीं है"
        title="लेखा-जोखा प्रविष्टियां"
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'प्रविष्टि संपादित करें' : 'नया लेनदेन दर्ज करें (Record Transaction)'} size="lg">
        <form onKeyDown={preventEnterSubmit} onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Family Head Quick Selector */}
          <div className="bg-[#FFF8EC] p-4 rounded-2xl border border-[#E8DCC8]">
            <label className="block text-xs font-bold text-[#7A2525] uppercase tracking-wider mb-1.5">
              परिवार मुखिया चयन (Select Family Head Only)
            </label>
            <SearchableSelect
              options={familyHeadOptions}
              value={selectedFamilyHeadId}
              onChange={handleSelectFamilyHead}
              placeholder="-- केवल परिवार मुखिया चुनें (Family Head) --"
              searchPlaceholder="मुखिया का नाम या परिवार संख्या खोजें..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#766A60] uppercase tracking-wider mb-1">विवरण / शीर्षक (Description/Title) *</label>
              <input {...register('title', { required: true })} placeholder="विवरण (उदा. भवन निर्माण सामग्री, वार्षिक चंदा)" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#766A60] uppercase tracking-wider mb-1">राशि (Amount - ₹) *</label>
              <input {...register('amount', { required: true, min: 1 })} type="number" placeholder="राशि" className="input-field font-mono font-bold text-[#C85A17]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#766A60] uppercase tracking-wider mb-1">दिनांक (Date) *</label>
              <input {...register('date', { required: true })} type="date" className="input-field font-mono" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#766A60] uppercase tracking-wider mb-1">लेनदेन प्रकार (Transaction Type) *</label>
              <select {...register('type', { required: true })} className="input-field">
                <option value="income">आवक (Income / Credit)</option>
                <option value="expense">जावक (Expense / Debit)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#766A60] uppercase tracking-wider mb-1">कोष श्रेणी (Fund Category) *</label>
              <select {...register('category', { required: true })} className="input-field">
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#766A60] uppercase tracking-wider mb-1">व्यक्ति / मुखिया का नाम (Person / Family Head)</label>
              <input {...register('personName')} placeholder="सम्बन्धित व्यक्ति का नाम" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#766A60] uppercase tracking-wider mb-1">भुगतान विधि (Payment Method)</label>
              <select {...register('paymentMethod')} className="input-field">
                <option value="cash">नकद (Cash)</option>
                <option value="upi">UPI (PhonePe/GPay)</option>
                <option value="bank_transfer">बैंक ट्रांसफर (Bank Transfer)</option>
                <option value="cheque">चेक (Cheque)</option>
                <option value="other">अन्य (Other)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#766A60] uppercase tracking-wider mb-1">रसीद / बिल नंबर (Receipt / Bill No - Optional)</label>
              <input {...register('receiptNumber')} placeholder="रसीद क्रमांक" className="input-field font-mono font-bold" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#766A60] uppercase tracking-wider mb-1">टिप्पणी / विवरण (Notes)</label>
            <textarea {...register('notes')} rows={2} className="input-field resize-none" placeholder="कोई विशेष टिप्पणी या जानकारी..." />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm text-[#766A60] bg-[#FFF8EC] border border-[#E8DCC8] rounded-xl hover:bg-[#FAF1E0] transition-colors cursor-pointer font-semibold">रद्द करें</button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 text-sm text-white bg-gradient-to-r from-[#7A2525] to-[#C85A17] rounded-xl hover:shadow-md transition-all cursor-pointer font-bold disabled:opacity-50 flex items-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editItem ? 'बदलाव सहेजें' : 'प्रविष्टि दर्ज करें'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="प्रविष्टि हटाएं" message="क्या आप इस लेनदेन रिकॉर्ड को हटाना चाहते हैं?" isLoading={deleting} />

      {/* Payment Receipt / Invoice Modal */}
      <PaymentReceiptModal
        isOpen={!!receiptDonation}
        onClose={() => setReceiptDonation(null)}
        donation={receiptDonation}
      />
    </div>
  );
};

export default LekhaJokhaPage;
