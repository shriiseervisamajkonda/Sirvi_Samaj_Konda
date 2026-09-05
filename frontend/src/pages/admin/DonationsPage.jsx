import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiPlus, FiSearch, FiCheckCircle, FiFileText, FiDownload, FiUser, FiCalendar, FiCreditCard } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { donationAPI } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const preventEnterSubmit = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
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
    reset({
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

      await donationAPI.create(payload);
      toast.success('दान प्रविष्टि सफलतापूर्वक दर्ज की गई!');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'प्रविष्टि दर्ज करने में विफलता');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'receipt_number',
      label: 'रसीद क्रमांक',
      render: (v) => <span className="font-mono font-bold text-xs text-[#7A2525]">{v || '—'}</span>,
    },
    {
      key: 'donor_name',
      label: 'दानदाता का नाम',
      sortable: true,
      render: (v, r) => (
        <div>
          <span className="font-bold text-[#2B211B] text-sm block">{v}</span>
          {r.mobile_number && <span className="text-xs text-[#766A60]">{r.mobile_number}</span>}
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
      render: (v) => <span className="font-extrabold text-[#C85A17] text-sm">₹{Number(v || 0).toLocaleString('en-IN')}</span>,
    },
    {
      key: 'payment_mode',
      label: 'भुगतान माध्यम',
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
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B211B] tracking-tight">
            दान एवं वार्षिक चंदा व्यवस्था (Donations)
          </h1>
          <p className="text-sm text-[#766A60] mt-1 font-medium">
            समाज के वार्षिक चंदा, सहायता कोष एवं निर्माण दान की प्रविष्टियों का प्रबंधन
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#C85A17] to-[#7A2525] text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all text-sm cursor-pointer"
        >
          <FiPlus className="w-4 h-4" /> नई दान प्रविष्टि (Record Donation)
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
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onSearch={setSearch}
        searchPlaceholder="दानदाता नाम या रसीद क्रमांक से खोजें..."
        emptyMessage="कोई दान रिकॉर्ड उपलब्ध नहीं है।"
      />

      {/* Add Donation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="नई दान प्रविष्टि दर्ज करें (Record Donation)"
        size="lg"
      >
        <form onKeyDown={preventEnterSubmit} onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <FormSection title="1. दानदाता विवरण (Donor Details)" icon={FiUser}>
            <FormField label="दानदाता का नाम (Donor Full Name)" htmlFor="donor_name" required>
              <input
                id="donor_name"
                {...register('donor_name', { required: true })}
                placeholder="उदा. शांतिलाल मोहनजी चौहान"
                autoComplete="name"
                className="input-field"
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="पंचायत परिवार संख्या (Family ID)" htmlFor="panchayat_family_id">
                <input
                  id="panchayat_family_id"
                  {...register('panchayat_family_id')}
                  placeholder="उदा. 1, 2"
                  autoComplete="off"
                  className="input-field"
                />
              </FormField>

              <FormField label="गोत्र (Gotra)" htmlFor="gotra">
                <input
                  id="gotra"
                  {...register('gotra')}
                  placeholder="उदा. भायल, पंवार, चौहान"
                  autoComplete="off"
                  className="input-field"
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

          <FormSection title="2. राशि एवं मद (Amount & Purpose)" icon={FiCreditCard}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="दान राशि (Amount in ₹)" htmlFor="amount" required>
                <input
                  id="amount"
                  type="number"
                  {...register('amount', { required: true, min: 1 })}
                  placeholder="उदा. 1100"
                  inputMode="numeric"
                  autoComplete="off"
                  className="input-field font-mono text-base font-bold text-[#C85A17]"
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

              <FormField label="दान मद (Purpose)" htmlFor="purpose">
                <select id="purpose" {...register('purpose')} className="input-field">
                  {Object.entries(purposeMap).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="भुगतान माध्यम (Mode)" htmlFor="payment_mode">
                <select id="payment_mode" {...register('payment_mode')} className="input-field">
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
                  className="input-field font-mono font-bold"
                />
              </FormField>

              <FormField label="भुगतान स्थिति (Status)" htmlFor="payment_status">
                <select id="payment_status" {...register('payment_status')} className="input-field">
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
                placeholder="अतिरिक्त विवरण या चेक संख्या..."
                className="input-field"
              />
            </FormField>
          </FormSection>

          <FormActions
            onCancel={() => setModalOpen(false)}
            submitText="प्रविष्टि सहेजें (Save Donation)"
            loading={saving}
          />
        </form>
      </Modal>
    </div>
  );
};

export default AdminDonationsPage;
