import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiPrinter, FiShare2, FiDollarSign, FiSearch, FiCalendar, FiCheckCircle, FiInbox, FiUser, FiHome } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { donationAPI } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import PaymentReceiptModal from '../../components/common/PaymentReceiptModal';
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

const MyReceiptsPage = () => {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchMyReceipts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await donationAPI.getMyReceipts();
      setReceipts(res.data?.data || []);
    } catch {
      toast.error('रसीदें लोड करने में विफल');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyReceipts();
  }, [fetchMyReceipts]);

  // Financial summary
  const summary = useMemo(() => {
    const totalAmount = receipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const confirmedCount = receipts.filter(r => r.payment_status === 'confirmed').length;
    return {
      totalAmount,
      totalCount: receipts.length,
      confirmedCount,
    };
  }, [receipts]);

  // Filter receipts by search
  const filteredReceipts = useMemo(() => {
    if (!search.trim()) return receipts;
    const q = search.toLowerCase().trim();
    return receipts.filter((r) => {
      const rNo = (r.receipt_number || '').toLowerCase();
      const pName = (purposeMap[r.purpose] || r.purpose || '').toLowerCase();
      const dName = (r.donor_name || '').toLowerCase();
      const amt = String(r.amount || '');
      const yr = String(r.financial_year || '');
      return rNo.includes(q) || pName.includes(q) || dName.includes(q) || amt.includes(q) || yr.includes(q);
    });
  }, [receipts, search]);

  const handleWhatsAppShare = (receipt) => {
    const receiptNo = receipt.receipt_number || '—';
    const dateStr = receipt.payment_date 
      ? new Date(receipt.payment_date).toLocaleDateString('hi-IN')
      : new Date(receipt.created_at || Date.now()).toLocaleDateString('hi-IN');
    const purposeName = purposeMap[receipt.purpose] || receipt.purpose || 'वार्षिक सामाजिक चंदा';
    const mode = paymentModeMap[receipt.payment_mode] || receipt.payment_mode || 'नकद';
    const amt = Number(receipt.amount || 0).toLocaleString('en-IN');

    const text = `🚩 *श्री सिर्वी समाज कोणदा* 🚩
━━━━━━━━━━━━━━━━━━━━
📄 *आधिकारिक भुगतान रसीद*
━━━━━━━━━━━━━━━━━━━━
▪ *रसीद क्र.*: ${receiptNo}
▪ *दिनांक*: ${dateStr}
▪ *नाम*: ${receipt.donor_name || user?.name}
▪ *परिवार क्र.*: #${receipt.panchayat_family_id || user?.panchayat_family_id || '—'}
▪ *मद*: ${purposeName} (${receipt.financial_year || new Date().getFullYear()})
▪ *राशि*: ₹${amt}
▪ *माध्यम*: ${mode}
▪ *स्थिति*: सत्यापित (Confirmed)
━━━━━━━━━━━━━━━━━━━━
श्री सिर्वी समाज कोणदा द्वारा प्रमाणित डिजिटल रसीद।`;

    const mobile = receipt.mobile_number || user?.phone || '';
    const cleanMobile = mobile.replace(/\D/g, '');
    const url = cleanMobile.length === 10
      ? `https://wa.me/91${cleanMobile}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(url, '_blank');
  };

  const columns = [
    {
      key: 'receipt_number',
      label: 'रसीद क्रमांक (Receipt No.)',
      sortable: true,
      render: (v) => (
        <span className="font-mono font-bold text-xs text-[#7A2525] bg-[#FFF8EC] px-2.5 py-1 rounded-lg border border-[#E8DCC8]">
          {v || '—'}
        </span>
      ),
    },
    {
      key: 'payment_date',
      label: 'दिनांक (Date)',
      sortable: true,
      render: (v, r) => {
        const d = v || r.created_at;
        return <span className="text-xs font-semibold text-[#5A4D41]">{d ? new Date(d).toLocaleDateString('hi-IN') : '—'}</span>;
      },
    },
    {
      key: 'purpose',
      label: 'मद / उद्देश्य (Purpose)',
      sortable: true,
      render: (v, r) => (
        <div>
          <span className="font-bold text-[#2B211B] text-xs sm:text-sm block">
            {purposeMap[v] || v}
          </span>
          <span className="text-[11px] text-[#766A60]">वित्तीय वर्ष {r.financial_year || new Date().getFullYear()}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'राशि (Amount)',
      sortable: true,
      render: (v) => (
        <span className="font-black font-mono text-sm sm:text-base text-emerald-700">
          ₹{Number(v || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'payment_mode',
      label: 'माध्यम (Mode)',
      render: (v) => (
        <span className="text-xs font-semibold text-[#5A4D41] bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
          {paymentModeMap[v] || v}
        </span>
      ),
    },
    {
      key: 'payment_status',
      label: 'स्थिति (Status)',
      render: (v) => (
        <Badge variant={v === 'confirmed' ? 'success' : 'warning'}>
          {v === 'confirmed' ? 'सत्यापित (Confirmed)' : 'प्रतीक्षारत'}
        </Badge>
      ),
    },
    {
      key: '_actions',
      label: 'रसीद / पावती',
      render: (_, r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedReceipt(r)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#7A2525] to-[#C85A17] hover:shadow-md text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
            title="रसीद देखें व प्रिंट करें"
          >
            <FiPrinter className="w-3.5 h-3.5" />
            <span>रसीद देखें</span>
          </button>
          <button
            onClick={() => handleWhatsAppShare(r)}
            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl transition-all cursor-pointer"
            title="व्हाट्सएप पर रसीद साझा करें"
          >
            <FiShare2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-[#FFF8EC] min-h-screen text-[#2B211B] pb-16">
      {/* Header Banner */}
      <div className="relative py-16 text-white overflow-hidden border-b border-[#D4AF37]/20 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]">
        <div className="absolute inset-0">
          <img src="/hero_background.webp" alt="Header Background" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/10 border border-[#D4AF37]/35 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              व्यक्तिगत एवं पारिवारिक रसीदें • My Receipts
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-2 text-white">
              मेरी रसीदें एवं लेनदेन (My Receipts)
            </h1>
            <p className="text-orange-100 text-sm sm:text-base font-medium max-w-2xl mx-auto">
              श्री सिर्वी समाज कोणदा में जमा किए गए आपके चंदा, दान एवं धार्मिक सहयोग की प्रमाणित डिजिटल रसीदें
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 space-y-6">
        {/* Member Profile Quick Badge */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DCC8] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7A2525] to-[#C85A17] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <FiUser className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#2B211B] text-base sm:text-lg">{user?.name || 'सदस्य'}</h3>
              <p className="text-xs text-[#766A60] font-medium">
                मोबाइल: {user?.phone || '—'} {user?.panchayat_family_id ? `• पंचायत परिवार क्र. #${user.panchayat_family_id}` : ''}
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 w-full sm:w-auto">
            <Link
              to="/lekha-jokha"
              className="flex-1 sm:flex-none text-center px-4 py-2 bg-[#FFF8EC] border border-[#E8DCC8] hover:bg-[#FAF1E0] text-[#7A2525] font-bold text-xs rounded-xl transition-all"
            >
              सम्पूर्ण समाज लेखा-जोखा
            </Link>
          </div>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#E8DCC8] shadow-sm">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">कुल जमा राशि (Total Contributed)</p>
            <h3 className="text-2xl font-black text-emerald-700 font-mono mt-1">
              ₹{summary.totalAmount.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-[#766A60] mt-0.5">आपके परिवार द्वारा कुल जमा सहयोग राशि</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E8DCC8] shadow-sm">
            <p className="text-xs font-bold text-[#7A2525] uppercase tracking-wider">सत्यापित रसीदें (Verified Receipts)</p>
            <h3 className="text-2xl font-black text-[#7A2525] font-mono mt-1">
              {summary.confirmedCount}
            </h3>
            <p className="text-[11px] text-[#766A60] mt-0.5">समाज बहीखाते में दर्ज डिजिटल रसीदें</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E8DCC8] shadow-sm">
            <p className="text-xs font-bold text-[#C85A17] uppercase tracking-wider">पंचायत परिवार खाता (Family ID)</p>
            <h3 className="text-2xl font-black text-[#C85A17] font-mono mt-1">
              #{user?.panchayat_family_id || '—'}
            </h3>
            <p className="text-[11px] text-[#766A60] mt-0.5">ग्राम कोणदा जनगणना अभिलेख</p>
          </div>
        </div>

        {/* Search & Receipts Table */}
        <div className="bg-white rounded-3xl border border-[#E8DCC8] shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DCC8]">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#2B211B] flex items-center gap-2">
                <FiFileText className="w-5 h-5 text-[#C85A17]" />
                भुगतान एवं रसीद विवरण (Payment History)
              </h2>
              <p className="text-xs sm:text-sm text-[#766A60] mt-0.5">
                सभी रसीदें 1-क्लिक में देखें, प्रिंट करें अथवा व्हाट्सएप पर साझा करें
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#766A60] w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="रसीद क्रमांक या मद से खोजें..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#FFF8EC] border border-[#E8DCC8] rounded-2xl text-xs sm:text-sm text-[#2B211B] placeholder-[#766A60]/70 focus:outline-none focus:ring-2 focus:ring-[#C85A17]/30 focus:border-[#C85A17] font-medium transition-all"
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredReceipts}
            loading={loading}
            searchable={false}
            downloadable={false}
            emptyIcon={FiInbox}
            emptyText="कोई रसीद उपलब्ध नहीं है"
            emptyDescription={
              search
                ? `"${search}" के लिए कोई रसीद नहीं मिली।`
                : 'आपके मोबाइल नंबर अथवा परिवार खाते से जुड़ी कोई रसीद अभी दर्ज नहीं है। यदि आपने हाल ही में चंदा जमा किया है, तो कृपया कोषाध्यक्ष से संपर्क करें।'
            }
          />
        </div>
      </div>

      {/* Official Payment Receipt Modal */}
      <PaymentReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        donation={selectedReceipt}
      />
    </div>
  );
};

export default MyReceiptsPage;
