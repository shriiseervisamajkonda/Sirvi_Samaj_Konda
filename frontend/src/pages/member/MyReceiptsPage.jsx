import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiPrinter, FiShare2, FiDollarSign, FiSearch, FiCalendar, FiCheckCircle, FiInbox, FiUser, FiHome, FiLogOut, FiDownload, FiShield } from 'react-icons/fi';
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
  const { user, logout, isAdmin } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [familyInfo, setFamilyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchMyReceipts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await donationAPI.getMyReceipts();
      setReceipts(res.data?.data || []);
      if (res.data?.family) {
        setFamilyInfo(res.data.family);
      }
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
      const dName = (r.donor_name || r.head_name || '').toLowerCase();
      const gotra = (r.gotra || '').toLowerCase();
      const famId = String(r.panchayat_family_id || '');
      const mobile = String(r.mobile_number || '');
      const amt = String(r.amount || '');
      const yr = String(r.financial_year || '');
      return rNo.includes(q) || pName.includes(q) || dName.includes(q) || gotra.includes(q) || famId.includes(q) || mobile.includes(q) || amt.includes(q) || yr.includes(q);
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
    const famId = receipt.panchayat_family_id || familyInfo?.panchayat_family_id || user?.panchayat_family_id || '—';
    const headName = receipt.head_name || familyInfo?.head_name || receipt.donor_name || user?.name;

    const text = `🚩 *श्री सिर्वी समाज कोणदा* 🚩
━━━━━━━━━━━━━━━━━━━━
📄 *आधिकारिक परिवार भुगतान रसीद*
━━━━━━━━━━━━━━━━━━━━
▪ *रसीद क्र.*: ${receiptNo}
▪ *दिनांक*: ${dateStr}
▪ *परिवार क्र.*: #${famId}
▪ *परिवार मुखिया*: ${headName}
▪ *भुगतानकर्ता*: ${receipt.donor_name || user?.name}
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
      key: 'donor_name',
      label: 'सदस्य / परिवार मुखिया (Paid By)',
      sortable: true,
      render: (v, r) => (
        <div>
          <span className="font-extrabold text-[#2B211B] text-xs sm:text-sm block">
            {v || r.head_name || '—'}
          </span>
          <span className="text-[11px] text-[#766A60] block font-medium">
            {r.panchayat_family_id ? `परिवार क्र. #${r.panchayat_family_id}` : ''} {r.gotra ? `• गोत्र: ${r.gotra}` : ''}
          </span>
        </div>
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
      label: 'मद / विवरण (Purpose)',
      sortable: true,
      render: (v, r) => (
        <div>
          <span className="font-bold text-[#2B211B] text-xs sm:text-sm block">
            {purposeMap[v] || v}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-[#766A60]">वित्तीय वर्ष {r.financial_year || new Date().getFullYear()}</span>
            {r.source && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                {r.source.includes('Lekha') ? 'लेखा-जोखा' : 'दान व्यवस्था'}
              </span>
            )}
          </div>
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
        <Badge variant={v === 'confirmed' ? 'success' : v === 'failed' ? 'danger' : 'warning'}>
          {v === 'confirmed' ? 'सत्यापित (Paid)' : v === 'failed' ? 'असफल (Failed)' : 'प्रतीक्षारत'}
        </Badge>
      ),
    },
    {
      key: '_actions',
      label: 'रसीद / पावती',
      render: (_, r) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedReceipt(r)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-[#7A2525] to-[#C85A17] hover:shadow-md text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
            title="रसीद देखें व प्रिंट करें"
          >
            <FiPrinter className="w-3.5 h-3.5" />
            <span>देखें / प्रिंट</span>
          </button>
          <button
            onClick={() => setSelectedReceipt(r)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
            title="PDF डाउनलोड करें"
          >
            <FiDownload className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">PDF</span>
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

  const resolvedFamilyDisplayId = familyInfo?.panchayat_family_id || user?.panchayat_family_id;

  return (
    <div className="bg-[#FFF8EC] min-h-screen text-[#2B211B] pb-16">
      {/* Header Banner */}
      <div className="relative pt-28 pb-16 text-white overflow-hidden border-b border-[#D4AF37]/20 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]">
        <div className="absolute inset-0">
          <img src="/hero_background.webp" alt="Header Background" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/10 border border-[#D4AF37]/35 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              पारिवारिक भुगतान रसीदें • Family Receipts
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-2 text-white">
              मेरी पारिवारिक रसीदें (Family Receipts)
            </h1>
            <p className="text-orange-100 text-sm sm:text-base font-medium max-w-2xl mx-auto">
              आपके पूरे परिवार द्वारा श्री सिर्वी समाज कोणदा में जमा किए गए चंदा, दान एवं धार्मिक सहयोग की प्रमाणित डिजिटल रसीदें
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 space-y-6">
        {/* Member & Family Info Quick Badge */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8DCC8] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7A2525] to-[#C85A17] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <FiUser className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-[#2B211B] text-base sm:text-lg">{user?.name || 'सदस्य'}</h3>
                {resolvedFamilyDisplayId && (
                  <span className="text-[11px] font-black font-mono bg-[#7A2525] text-white px-2 py-0.5 rounded-full">
                    परिवार #{resolvedFamilyDisplayId}
                  </span>
                )}
                {isAdmin && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                    व्यवस्थापक दृश्य
                  </span>
                )}
              </div>
              <p className="text-xs text-[#766A60] font-medium mt-0.5">
                मोबाइल: {user?.phone || '—'} {familyInfo?.head_name ? `• परिवार मुखिया: ${familyInfo.head_name}` : ''} {familyInfo?.gotra ? `• गोत्र: ${familyInfo.gotra}` : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <Link
              to="/profile"
              className="flex-1 sm:flex-none text-center px-4 py-2 bg-[#FFF8EC] border border-[#E8DCC8] hover:bg-[#FAF1E0] text-[#7A2525] font-bold text-xs rounded-xl transition-all"
            >
              मेरी प्रोफ़ाइल
            </Link>
            <Link
              to="/lekha-jokha"
              className="flex-1 sm:flex-none text-center px-4 py-2 bg-[#FFF8EC] border border-[#E8DCC8] hover:bg-[#FAF1E0] text-[#7A2525] font-bold text-xs rounded-xl transition-all"
            >
              सम्पूर्ण लेखा-जोखा
            </Link>
            <button
              onClick={logout}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
              title="खाते से लॉगआउट करें"
            >
              <FiLogOut className="w-3.5 h-3.5" />
              <span>लॉगआउट</span>
            </button>
          </div>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-[#E8DCC8] shadow-sm">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">कुल पारिवारिक जमा राशि (Total Contributed)</p>
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
            <p className="text-[11px] text-[#766A60] mt-0.5">समाज बहीखाते में दर्ज आधिकारिक रसीदें</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#E8DCC8] shadow-sm">
            <p className="text-xs font-bold text-[#C85A17] uppercase tracking-wider">परिवार पहुँच (Family Access)</p>
            <h3 className="text-lg font-black text-[#7A2525] mt-1 flex items-center gap-1.5">
              <FiCheckCircle className="w-5 h-5 text-emerald-600" />
              <span>सभी सदस्य अधिकृत</span>
            </h3>
            <p className="text-[11px] text-[#766A60] mt-0.5">परिवार का कोई भी सदस्य रसीद देख व PDF डाउनलोड कर सकता है</p>
          </div>
        </div>

        {/* Receipts Table Card */}
        <div className="bg-white rounded-3xl border border-[#E8DCC8] shadow-sm overflow-hidden p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#7A2525]">
                पारिवारिक रसीदें सूची ({filteredReceipts.length})
              </h2>
              <p className="text-xs text-[#766A60] mt-0.5">
                प्रत्येक भुगतान की एक ही प्रमाणित रसीद उत्पन्न होती है जो पूरे परिवार के सभी सदस्यों के लिए उपलब्ध है।
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="रसीद क्र., सदस्य नाम, मद, राशि..."
                className="w-full pl-10 pr-4 py-2 bg-[#FFF8EC] border border-[#E8DCC8] rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#7A2525]/30 focus:border-[#7A2525]"
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredReceipts}
            loading={loading}
            emptyMessage="आपके परिवार से संबंधित कोई रसीद रिकॉर्ड में दर्ज नहीं है।"
            pageSize={10}
          />
        </div>
      </div>

      {/* Official Receipt Modal with PDF export */}
      {selectedReceipt && (
        <PaymentReceiptModal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          donation={selectedReceipt}
        />
      )}
    </div>
  );
};

export default MyReceiptsPage;
