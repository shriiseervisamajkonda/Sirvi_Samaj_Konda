import React, { useRef, useState } from 'react';
import { FiPrinter, FiX, FiShare2, FiCheckCircle, FiDownload } from 'react-icons/fi';
import { numberToHindiWords } from '../../utils/numberToHindiWords';
import { downloadReceiptAsPDF } from '../../utils/receiptDownloader';

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

const PaymentReceiptModal = ({ isOpen, onClose, donation }) => {
  const printRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !donation) return null;

  const receiptNo = donation.receipt_number || `KONDA-${donation.financial_year || new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
  const dateStr = donation.payment_date 
    ? new Date(donation.payment_date).toLocaleDateString('hi-IN')
    : donation.created_at 
      ? new Date(donation.created_at).toLocaleDateString('hi-IN')
      : new Date().toLocaleDateString('hi-IN');
  
  const donorName = donation.donor_name || donation.head_name || '—';
  const headName = donation.families?.head_name || donation.head_name || donorName;
  const familyId = donation.panchayat_family_id || donation.families?.panchayat_family_id || donation.family_id || '—';
  const gotra = donation.gotra || donation.families?.gotra || '—';
  const mobile = donation.mobile_number || donation.head_mobile || donation.families?.head_mobile || '';
  const amount = Number(donation.amount || 0);
  const hindiAmount = numberToHindiWords(amount);
  const purposeName = purposeMap[donation.purpose] || donation.purpose || 'वार्षिक सामाजिक चंदा';
  const paymentMode = paymentModeMap[donation.payment_mode] || donation.payment_mode || 'नकद (Cash)';
  const financialYear = donation.financial_year || new Date().getFullYear();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadReceiptAsPDF(printRef.current, donation);
    } finally {
      setDownloading(false);
    }
  };

  const handleWhatsAppShare = () => {
    const text = `🚩 *श्री सिर्वी समाज कोणदा* 🚩
━━━━━━━━━━━━━━━━━━━━
📄 *आधिकारिक परिवार भुगतान रसीद*
━━━━━━━━━━━━━━━━━━━━
▪ *रसीद क्र.*: ${receiptNo}
▪ *दिनांक*: ${dateStr}
▪ *परिवार क्र.*: #${familyId}
▪ *परिवार मुखिया*: ${headName}
▪ *भुगतानकर्ता / सदस्य*: ${donorName}
▪ *गोत्र*: ${gotra}
▪ *मद / विवरण*: ${purposeName} (${financialYear})
▪ *प्राप्त राशि*: ₹${amount.toLocaleString('en-IN')} (${hindiAmount})
▪ *भुगतान माध्यम*: ${paymentMode}
▪ *स्थिति*: सत्यापित (Confirmed)
━━━━━━━━━━━━━━━━━━━━
धन्यवाद! आपकी सहायता एवं सहयोग समाज विकास हेतु अमूल्य है।
- *कोषाध्यक्ष, श्री सिर्वी समाज कोणदा*`;

    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    const targetUrl = cleanMobile.length === 10
      ? `https://wa.me/91${cleanMobile}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(targetUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt-card, #printable-receipt-card * {
            visibility: visible;
          }
          #printable-receipt-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            box-shadow: none !important;
            border: 2px solid #7A2525 !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E8DCC8] overflow-hidden my-8 animate-fadeIn">
        {/* Modal Top Bar */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-[#FFF8EC] border-b border-[#E8DCC8]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-extrabold text-[#7A2525] text-base sm:text-lg">
              परिवार भुगतान रसीद (Family Payment Receipt)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="PDF डाउनलोड करें"
            >
              <FiDownload className="w-4 h-4" /> {downloading ? 'डाउनलोड हो रहा...' : 'PDF डाउनलोड'}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#7A2525] hover:bg-[#5E1B1B] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              title="प्रिंट करें"
            >
              <FiPrinter className="w-4 h-4" /> प्रिंट
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              title="व्हाट्सएप पर भेजें"
            >
              <FiShare2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#766A60] hover:text-[#2B211B] hover:bg-[#FAF1E0] rounded-xl transition-all cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Card */}
        <div id="printable-receipt-card" ref={printRef} className="p-6 sm:p-8 bg-white text-[#2B211B]">
          {/* Ornate Border Box */}
          <div className="border-4 border-double border-[#7A2525]/80 rounded-2xl p-6 sm:p-7 relative bg-gradient-to-b from-[#FFFDF8] to-white">
            
            {/* Blessings Header */}
            <div className="text-center pb-2 border-b border-[#E8DCC8]">
              <div className="flex justify-between items-center text-[11px] sm:text-xs font-black text-[#7A2525] tracking-widest px-2">
                <span>॥ श्री आईजी कृपा ॥</span>
                <span>॥ ॐ श्री कुलदेवी मात नमः ॥</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#7A2525] tracking-tight mt-1">
                श्री सिर्वी समाज कोणदा
              </h1>
              <p className="text-xs font-semibold text-[#766A60] mt-0.5">
                ग्राम कोणदा, तहसील बदनावर, जिला धार (मध्य प्रदेश)
              </p>
              <div className="inline-block px-4 py-1 mt-2 bg-[#7A2525] text-white text-xs sm:text-sm font-bold rounded-full uppercase tracking-wider">
                दान एवं सहयोग राशि रसीद (Family Payment Receipt)
              </div>
            </div>

            {/* Receipt Meta Section */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-[#E8DCC8] text-xs sm:text-sm">
              <div>
                <p className="text-[#766A60] font-medium">रसीद क्रमांक (Receipt No.):</p>
                <p className="font-mono font-black text-[#7A2525] text-sm sm:text-base">{receiptNo}</p>
              </div>
              <div className="text-right">
                <p className="text-[#766A60] font-medium">दिनांक (Date):</p>
                <p className="font-mono font-bold text-[#2B211B] text-sm">{dateStr}</p>
              </div>
            </div>

            {/* Family & Member Box (Prominent display) */}
            <div className="my-4 p-4 rounded-xl bg-[#FFF8EC] border border-[#E8DCC8]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#7A2525] mb-2 flex justify-between items-center">
                <span>परिवार एवं सदस्य विवरण (Family & Member Details)</span>
                <span className="font-mono font-bold text-xs bg-[#7A2525] text-white px-2 py-0.5 rounded">
                  परिवार क्र. #{familyId}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div>
                  <span className="text-[#766A60]">परिवार मुखिया का नाम (Head of Family):</span>
                  <span className="block font-black text-base text-[#2B211B]">{headName}</span>
                </div>
                <div>
                  <span className="text-[#766A60]">भुगतानकर्ता / सदस्य (Paid By Member):</span>
                  <span className="block font-black text-base text-[#7A2525]">{donorName}</span>
                </div>
                <div>
                  <span className="text-[#766A60]">गोत्र (Gotra):</span>
                  <span className="block font-bold text-[#2B211B]">{gotra}</span>
                </div>
                <div>
                  <span className="text-[#766A60]">संपर्क मोबाइल (Mobile):</span>
                  <span className="block font-mono font-bold text-[#2B211B]">{mobile || '—'}</span>
                </div>
              </div>
            </div>

            {/* Payment Details Table */}
            <div className="space-y-3 py-2 text-xs sm:text-sm">
              <div className="flex justify-between py-2 border-b border-[#E8DCC8]/60">
                <span className="text-[#766A60] font-semibold">मद / विवरण (Purpose / Ledger):</span>
                <span className="font-bold text-[#7A2525]">{purposeName} ({financialYear})</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E8DCC8]/60">
                <span className="text-[#766A60] font-semibold">भुगतान माध्यम (Payment Mode):</span>
                <span className="font-bold text-[#2B211B]">{paymentMode}</span>
              </div>
              {donation.notes && (
                <div className="flex justify-between py-2 border-b border-[#E8DCC8]/60">
                  <span className="text-[#766A60] font-semibold">टिप्पणी / विवरण (Remarks):</span>
                  <span className="font-medium text-[#2B211B]">{donation.notes}</span>
                </div>
              )}
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-emerald-900 font-extrabold text-sm sm:text-base">प्राप्त कुल राशि (Amount Received):</span>
                <span className="font-mono font-black text-xl sm:text-2xl text-emerald-800">
                  ₹{amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-2.5 bg-[#FFF8EC] rounded-lg border border-[#E8DCC8] text-xs">
                <span className="text-[#766A60] font-medium">राशि शब्दों में: </span>
                <span className="font-bold text-[#7A2525]">{hindiAmount}</span>
              </div>
            </div>

            {/* Signature & Seal Footer */}
            <div className="mt-8 pt-4 border-t border-[#E8DCC8] flex justify-between items-end text-xs">
              <div className="text-center">
                <div className="h-10 border-b border-dashed border-gray-400 w-32 mb-1" />
                <span className="text-[#766A60] font-medium">जमाकर्ता हस्ताक्षर</span>
              </div>

              {/* Seal Stamp */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#7A2525] flex flex-col items-center justify-center p-1 text-center bg-[#FFF8EC]/60">
                  <FiCheckCircle className="w-4 h-4 text-[#7A2525]" />
                  <span className="text-[8px] font-black text-[#7A2525] uppercase leading-tight">सत्यापित</span>
                  <span className="text-[7px] text-[#766A60] font-bold">कोणदा</span>
                </div>
              </div>

              <div className="text-center">
                <div className="h-10 flex items-end justify-center mb-1">
                  <span className="font-mono font-bold text-[#7A2525] text-xs">अधिकृत व्यवस्थापक</span>
                </div>
                <div className="border-b border-gray-400 w-40 mb-1" />
                <span className="font-bold text-[#2B211B] block">कोषाध्यक्ष / अध्यक्ष</span>
                <span className="text-[10px] text-[#766A60]">श्री सिर्वी समाज कोणदा</span>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="no-print px-6 py-4 bg-[#FFF8EC] border-t border-[#E8DCC8] flex flex-wrap justify-between items-center gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-[#E8DCC8] hover:bg-[#FAF1E0] text-[#2B211B] font-bold text-xs sm:text-sm rounded-2xl transition-all cursor-pointer"
          >
            बंद करें (Close)
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <FiDownload className="w-4 h-4" /> {downloading ? 'डाउनलोड हो रहा...' : 'रसीद PDF डाउनलोड करें'}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7A2525] to-[#C85A17] hover:shadow-lg text-white font-bold text-xs sm:text-sm rounded-2xl transition-all cursor-pointer"
            >
              <FiPrinter className="w-4 h-4" /> प्रिंट करें (Print)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceiptModal;
