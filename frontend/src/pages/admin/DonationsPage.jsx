import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiPlus, FiSearch, FiCheckCircle, FiFileText, FiPrinter, FiDownload, FiUser, FiCalendar, FiCreditCard, FiTrash2 } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { donationAPI, familyAPI } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import SearchableSelect from '../../components/common/SearchableSelect';
import PaymentReceiptModal from '../../components/common/PaymentReceiptModal';
import { FormSection, FormField, FormActions } from '../../components/common/FormComponents';
import toast from 'react-hot-toast';

const purposeMap = {
  annual_chanda: 'वार्षिक सामाजिक चंदा',
  aaiji_kosh: 'श्री आई जी सहायता कोष',
  annapurna_bhavan: 'माँ अन्नपूर्णा भवन निर्माण कोष',
  mandir_nirman: 'आई माताजी बडेर / मंदिर विकास',
  melava_utsav: 'वार्षिक मेला एवं सामाजिक उत्सव',
  education_fund: 'शिक्षा प्रोत्साहन एवं छात्रवृत्ति',
  other: 'अन्य सामाजिक कार्य',
};

const paymentModeMap = {
  cash: 'नकद (Cash)',
  upi_qr: 'UPI / QR कोड',
  bank_transfer: 'बैंक ट्रांसफर / NEFT',
  cheque: 'चेक (Cheque)',
  online_gateway: 'ऑनलाइन गेटवे',
};

const AdminDonationsPage = () => {
  const [items, setItems] = useState([]);
  const [families, setFamilies] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [receiptDonation, setReceiptDonation] = useState(null);
  const [selectedFamilyHeadId, setSelectedFamilyHeadId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm();

  const preventEnterSubmit = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  // Fetch Family Heads list
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
        label: `[#${f.panchayat_family_id || '—'}] ${f.head_name} (${f.gotra || '—'})${f.head_mobile || f.mobile_number ? ` - ${f.head_mobile || f.mobile_number}` : ''}`,
        family: f,
      }));
  }, [families]);

  const handleSelectFamilyHead = (famId) => {
    setSelectedFamilyHeadId(famId);
    const selected = families.find((f) => f.id === famId);
    if (selected) {
      setValue('family_id', selected.id);
      setValue('panchayat_family_id', selected.panchayat_family_id || '');
      setValue('donor_name', selected.head_name || '');
      setValue('gotra', selected.gotra || '');
      setValue('mobile_number', selected.head_mobile || selected.mobile_number || '');
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, search };
      if (selectedPurpose !== 'all') {
        params.purpose = selectedPurpose;
      }
      const [listRes, statsRes] = await Promise.allSettled([
        donationAPI.getAll(params),
        donationAPI.getStats(),
      ]);

      if (listRes.status === 'fulfilled') {
        setItems(listRes.value.data?.data || []);
        setTotalPages(listRes.value.data?.pagination?.pages || 1);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data?.data || null);
      }
    } catch {
      toast.error('दान रिकॉर्ड लोड करने में त्रुटि');
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedPurpose]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCreate = () => {
    setSelectedFamilyHeadId('');
    reset({
      family_id: '',
      donor_name: '',
      panchayat_family_id: '',
      gotra: '',
      mobile_number: '',
      amount: '',
      financial_year: new Date().getFullYear(),
      purpose: 'annual_chanda',
      payment_mode: 'cash',
      payment_status: 'confirmed',
      receipt_number: `KONDA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: '',
    });
    setModalOpen(true);
  };

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      const payload = {
        family_id: (formData.family_id || '').trim() || null,
        donor_name: (formData.donor_name || '').trim(),
        panchayat_family_id: (formData.panchayat_family_id || '').trim() || null,
        gotra: (formData.gotra || '').trim() || null,
        mobile_number: (formData.mobile_number || '').trim() || null,
        amount: Number(formData.amount) || 0,
        financial_year: Number(formData.financial_year) || new Date().getFullYear(),
        purpose: formData.purpose || 'annual_chanda',
        payment_mode: formData.payment_mode || 'cash',
        payment_status: formData.payment_status || 'confirmed',
        receipt_number: (formData.receipt_number || '').trim() || undefined,
        notes: (formData.notes || '').trim() || null,
      };

      const res = await donationAPI.create(payload);
      toast.success('दान प्रविष्टि सफलतापूर्वक दर्ज की गई!');
      setModalOpen(false);
      fetchData();

      // Automatically open payment receipt invoice modal
      const createdRecord = res.data?.data || payload;
      setReceiptDonation(createdRecord);
    } catch (err) {
      toast.error(err.response?.data?.message || 'प्रविष्टि दर्ज करने में विफलता');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await donationAPI.delete(deleteTarget.id);
      toast.success('दान प्रविष्टि सफलतापूर्वक हटाई गई!');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'प्रविष्टि हटाने में विफलता');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'receipt_number',
      label: 'रसीद क्रमांक',
      render: (v) => <span className="font-mono font-bold text-xs text-[#7A2525]">{v || '—'}</span>,
    },
    {
      key: 'panchayat_family_id',
      label: 'परिवार क्र.',
      sortable: true,
      render: (v) => <span className="font-mono font-bold text-xs text-[#7A2525]">#{v || '—'}</span>,
    },
    {
      key: 'donor_name',
      label: 'परिवार मुखिया (Donor)',
      sortable: true,
      render: (v, r) => (
        <div>
          <span className="font-bold text-[#2B211B] text-sm block">{v}</span>
          <span className="text-xs text-[#766A60]">
            {r.gotra ? `${r.gotra} • ` : ''}{r.mobile_number || ''}
          </span>
        </div>
      ),
    },
    {
      key: 'purpose',
      label: 'मद / उद्देश्य',
      render: (v) => (
        <span className="inline-block px-2.5 py-1 bg-[#FFF8EC] border border-[#E8DCC8] rounded-full text-xs font-semibold text-[#7A2525]">
          {purposeMap[v] || v}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'राशि',
      sortable: true,
      render: (v) => <span className="font-black text-[#C85A17] text-sm">₹{Number(v || 0).toLocaleString('en-IN')}</span>,
    },
    {
      key: 'payment_mode',
      label: 'माध्यम',
      render: (v) => <span className="text-xs font-medium text-[#2B211B]">{paymentModeMap[v] || v}</span>,
    },
    {
      key: 'payment_date',
      label: 'दिनांक',
      render: (v, r) => <span className="text-xs text-[#766A60]">{v || r.created_at?.slice(0, 10)}</span>,
    },
    {
      key: 'payment_status',
      label: 'स्थिति',
      render: (v) => (
        <Badge variant={v === 'confirmed' ? 'success' : v === 'pending' ? 'warning' : 'danger'}>
          {v === 'confirmed' ? 'सत्यापित' : v === 'pending' ? 'प्रतीक्षारत' : v}
        </Badge>
      ),
    },
    {
      key: '_actions',
      label: 'कार्रवाई (Actions)',
      render: (_, r) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setReceiptDonation(r)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#FFF8EC] border border-[#E8DCC8] hover:border-[#C85A17] hover:bg-[#FAF1E0] text-[#7A2525] hover:text-[#C85A17] text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
            title="रसीद / इनवॉइस देखें व प्रिंट करें"
          >
            <FiFileText className="w-3.5 h-3.5 text-[#C85A17]" />
            <span>रसीद</span>
          </button>
          <button
            onClick={() => setDeleteTarget(r)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
            title="दान प्रविष्टि हटाएं (Delete)"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
            <span>हटाएं</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B211B] tracking-tight">
            दान एवं वार्षिक चंदा व्यवस्था (Donations & Chanda)
          </h1>
          <p className="text-sm text-[#766A60] mt-1 font-medium">
            परिवार मुखिया अनुसार चंदा, दान रसीदें एवं डिजिटल इनवॉइस निर्माण
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#C85A17] to-[#7A2525] text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all text-sm cursor-pointer"
        >
          <FiPlus className="w-4 h-4" /> नई भुगतान रसीद बनाएं (Record Payment)
        </button>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-[#E8DCC8] shadow-sm">
            <p className="text-xs text-[#766A60] font-bold">कुल प्राप्त राशि (Total Donations)</p>
            <p className="text-2xl font-black text-[#C85A17] mt-1">₹{Number(stats.totalAmount || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-[#E8DCC8] shadow-sm">
            <p className="text-xs text-[#766A60] font-bold">सत्यापित रसीदें (Total Receipts)</p>
            <p className="text-2xl font-black text-[#7A2525] mt-1">{stats.totalCount || 0}</p>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-[#E8DCC8] shadow-sm">
            <p className="text-xs text-[#766A60] font-bold">चालू वित्तीय वर्ष (Current FY)</p>
            <p className="text-2xl font-black text-[#2B211B] mt-1">{new Date().getFullYear()}</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => { setSelectedPurpose('all'); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            selectedPurpose === 'all'
              ? 'bg-[#7A2525] text-white shadow-md'
              : 'bg-white text-[#2B211B] border border-[#E8DCC8] hover:bg-[#FFF8EC]'
          }`}
        >
          सभी मद (All)
        </button>
        {Object.entries(purposeMap).map(([k, v]) => (
          <button
            key={k}
            onClick={() => { setSelectedPurpose(k); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedPurpose === k
                ? 'bg-[#7A2525] text-white shadow-md'
                : 'bg-white text-[#2B211B] border border-[#E8DCC8] hover:bg-[#FFF8EC]'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        serverSide
        searchable
        downloadable={true}
        title="पंजीकृत भुगतान व दान रसीदें"
        emptyText="कोई दान रिकॉर्ड उपलब्ध नहीं है।"
      />

      {/* Add Donation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="नई भुगतान रसीद दर्ज करें (Record Payment / Invoice)"
        size="lg"
      >
        <form onKeyDown={preventEnterSubmit} onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <FormSection title="1. परिवार मुखिया चयन (Select Family Head Only)" icon={FiUser}>
            {/* Family Head Searchable Dropdown */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#7A2525] uppercase tracking-wider mb-1.5">
                परिवार मुखिया का चयन करें (Select Family Head) *
              </label>
              <SearchableSelect
                options={familyHeadOptions}
                value={selectedFamilyHeadId}
                onChange={handleSelectFamilyHead}
                placeholder="-- परिवार मुखिया चुनें (Family Head) --"
                searchPlaceholder="मुखिया का नाम, गोत्र या परिवार संख्या खोजें..."
              />
              <p className="text-[11px] text-[#766A60] mt-1">
                यहाँ केवल पंजीकृत परिवारों के मुखिया (Family Heads) प्रदर्शित होते हैं।
              </p>
            </div>

            <FormField label="दानदाता / परिवार मुखिया का नाम (Family Head Name)" htmlFor="donor_name" required>
              <input
                id="donor_name"
                {...register('donor_name', { required: true })}
                placeholder="उदा. शांतिलाल मोहनजी चौहान"
                autoComplete="name"
                className="input-field font-semibold text-[#2B211B]"
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="पंचायत परिवार संख्या (Family ID)" htmlFor="panchayat_family_id">
                <input
                  id="panchayat_family_id"
                  {...register('panchayat_family_id')}
                  placeholder="उदा. 1, 2"
                  autoComplete="off"
                  className="input-field font-mono font-bold text-[#7A2525]"
                />
              </FormField>

              <FormField label="गोत्र (Gotra)" htmlFor="gotra">
                <input
                  id="gotra"
                  {...register('gotra')}
                  placeholder="उदा. भायल, पंवार, चौहान"
                  autoComplete="off"
                  className="input-field font-medium"
                />
              </FormField>

              <FormField label="मोबाइल नंबर (Mobile)" htmlFor="mobile_number">
                <input
                  id="mobile_number"
                  {...register('mobile_number')}
                  placeholder="10 अंकों का नंबर"
                  maxLength={10}
                  autoComplete="tel"
                  inputMode="tel"
                  className="input-field font-mono"
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="2. राशि एवं मद विवरण (Amount & Purpose)" icon={FiCreditCard}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="दान / चंदा राशि (Amount in ₹)" htmlFor="amount" required>
                <input
                  id="amount"
                  type="number"
                  {...register('amount', { required: true, min: 1 })}
                  placeholder="उदा. 1100"
                  inputMode="numeric"
                  autoComplete="off"
                  className="input-field font-mono text-lg font-black text-[#C85A17]"
                />
              </FormField>

              <FormField label="वित्तीय वर्ष (Financial Year)" htmlFor="financial_year">
                <input
                  id="financial_year"
                  type="number"
                  {...register('financial_year')}
                  defaultValue={new Date().getFullYear()}
                  inputMode="numeric"
                  autoComplete="off"
                  className="input-field font-mono"
                />
              </FormField>

              <FormField label="मद / कोष (Purpose)" htmlFor="purpose">
                <select id="purpose" {...register('purpose')} className="input-field font-medium">
                  {Object.entries(purposeMap).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="भुगतान माध्यम (Mode)" htmlFor="payment_mode">
                <select id="payment_mode" {...register('payment_mode')} className="input-field font-medium">
                  {Object.entries(paymentModeMap).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="रसीद क्रमांक (Receipt No.)" htmlFor="receipt_number">
                <input
                  id="receipt_number"
                  {...register('receipt_number')}
                  autoComplete="off"
                  className="input-field font-mono font-bold text-[#7A2525]"
                />
              </FormField>

              <FormField label="भुगतान स्थिति (Status)" htmlFor="payment_status">
                <select id="payment_status" {...register('payment_status')} className="input-field font-medium">
                  <option value="confirmed">सत्यापित (Confirmed)</option>
                  <option value="pending">प्रतीक्षारत (Pending)</option>
                </select>
              </FormField>
            </div>

            <FormField label="टिप्पणी / विवरण (Notes)" htmlFor="notes">
              <textarea
                id="notes"
                {...register('notes')}
                rows={2}
                placeholder="अतिरिक्त विवरण या चेक/UPI संदर्भ संख्या..."
                className="input-field"
              />
            </FormField>
          </FormSection>

          <FormActions
            onCancel={() => setModalOpen(false)}
            submitText="प्रविष्टि सहेजें एवं रसीद बनाएं (Save & Generate Invoice)"
            loading={saving}
          />
        </form>
      </Modal>

      {/* Payment Receipt / Invoice Modal */}
      <PaymentReceiptModal
        isOpen={!!receiptDonation}
        onClose={() => setReceiptDonation(null)}
        donation={receiptDonation}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="दान प्रविष्टि हटाएं (Delete Donation)"
        message={`क्या आप रसीद क्र. "${deleteTarget?.receipt_number || '—'}" (राशि: ₹${Number(deleteTarget?.amount || 0).toLocaleString('en-IN')}, नाम: ${deleteTarget?.donor_name || '—'}) को स्थायी रूप से हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।`}
        confirmText="हाँ, हटाएं"
        cancelText="रद्द करें"
        variant="danger"
      />
    </div>
  );
};

export default AdminDonationsPage;
