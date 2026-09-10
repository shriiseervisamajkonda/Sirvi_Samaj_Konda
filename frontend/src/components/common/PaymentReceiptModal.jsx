import React, { useRef, useState } from 'react';
import {
  FiPrinter, FiX, FiShare2, FiDownload,
  FiFileText, FiCalendar, FiTag, FiUser, FiUsers,
  FiHome, FiBookmark, FiCreditCard, FiLink, FiMessageSquare
} from 'react-icons/fi';
import { numberToHindiWords, numberToEnglishWords } from '../../utils/numberToHindiWords';
import { downloadReceiptAsPDF } from '../../utils/receiptDownloader';

const purposeMap = {
  annual_chanda: 'वार्षिक सामाजिक चंदा',
  aaiji_kosh: 'श्री आई जी सहायता कोष',
  annapurna_bhavan: 'माँ अन्नपूर्णा भवन निर्माण कोष',
  mandir_nirman: 'आई माताजी बडेर / मंदिर विकास',
  melava_utsav: 'वार्षिक मेला एवं सामाजिक उत्सव',
  education_fund: 'शिक्षा प्रोत्साहन एवं छात्रवृत्ति',
  pratibha_samman: 'प्रतिभा सम्मान',
  other: 'अन्य सामाजिक कार्य',
};

const paymentModeMap = {
  cash: 'नकद (Cash)',
  upi_qr: 'UPI',
  upi: 'UPI',
  bank_transfer: 'बैंक ट्रांसफर / NEFT',
  cheque: 'चेक (Cheque)',
  online_gateway: 'ऑनलाइन गेटवे',
};

const PaymentReceiptModal = ({ isOpen, onClose, donation }) => {
  const printRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !donation) return null;

  const currentYear = new Date().getFullYear();
  const financialYear = donation.financial_year || currentYear;
  const receiptNo = donation.receipt_number || `KONDA-${financialYear}-${Date.now().toString().slice(-4)}`;

  const dateObj = donation.payment_date 
    ? new Date(donation.payment_date) 
    : donation.created_at 
      ? new Date(donation.created_at) 
      : new Date();

  const dateStr = dateObj.toLocaleDateString('hi-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const donorName = donation.donor_name || donation.head_name || '—';
  const headName = donation.families?.head_name || donation.head_name || donorName;
  const rawFamilyId = donation.panchayat_family_id || donation.families?.panchayat_family_id || donation.family_id || '026';
  const paddedFamilyId = !isNaN(Number(rawFamilyId)) 
    ? String(rawFamilyId).padStart(3, '0') 
    : rawFamilyId;

  const gotra = donation.gotra || donation.families?.gotra || 'काग';
  const village = donation.village || donation.families?.village || 'कोणदा';
  const mobile = donation.mobile_number || donation.head_mobile || donation.families?.head_mobile || '';
  const amount = Number(donation.amount || 0);
  const hindiAmount = numberToHindiWords(amount);
  const englishAmount = numberToEnglishWords(amount);

  const rawPurpose = purposeMap[donation.purpose] || donation.purpose || 'प्रतिभा सम्मान';
  const purposeName = rawPurpose.includes(String(financialYear)) ? rawPurpose : `${rawPurpose} (${financialYear})`;
  const paymentMode = paymentModeMap[donation.payment_mode] || donation.payment_mode || 'UPI';
  const utrNumber = donation.transaction_id || donation.utr || donation.reference_id || `UPI${financialYear}${Date.now().toString().slice(-6)}`;
  const remarks = donation.notes || donation.remarks || `${rawPurpose} हेतु सहयोग राशि`;
  const generatedBy = donation.created_by_name || 'चिराग भायल';

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&margin=0&data=${encodeURIComponent(`https://www.seervisamajkonda.com/verify?receipt=${receiptNo}`)}`;

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
    const text = `🚩 *श्री सीरवी समाज कोणदा* 🚩
━━━━━━━━━━━━━━━━━━━━
📄 *दान एवं सहयोग राशि रसीद (FAMILY PAYMENT RECEIPT)*
━━━━━━━━━━━━━━━━━━━━
▪ *रसीद क्र.*: ${receiptNo}
▪ *दिनांक*: ${dateStr} ${timeStr}
▪ *कोष / शाखा*: ${purposeName}
▪ *परिवार क्र.*: #${paddedFamilyId}
▪ *परिवार मुखिया*: ${headName}
▪ *भुगतानकर्ता / सदस्य*: ${donorName}
▪ *गोत्र*: ${gotra}
▪ *ग्राम / क्षेत्र*: ${village}
▪ *प्राप्त कुल राशि*: ₹${amount.toLocaleString('en-IN')} /-
▪ *राशि शब्दों में*: ${hindiAmount} (${englishAmount})
▪ *भुगतान माध्यम*: ${paymentMode}
▪ *लेनदेन संदर्भ (UTR)*: ${utrNumber}
▪ *सत्यापन लिंक*: https://www.seervisamajkonda.com/verify?receipt=${receiptNo}
━━━━━━━━━━━━━━━━━━━━
“समाज सेवा ही सच्ची सेवा”
आपका सहयोग समाज के उज्जवल भविष्य की नींव है।
- *श्री सीरवी समाज कोणदा*`;

    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    const targetUrl = cleanMobile.length === 10
      ? `https://wa.me/91${cleanMobile}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(targetUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
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
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: #FFFFFF !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E8DCC8] overflow-hidden my-4 sm:my-8 animate-fadeIn">
        {/* Modal Top Controls */}
        <div className="no-print flex items-center justify-between px-5 py-3.5 bg-[#FFF8EC] border-b border-[#E8DCC8]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-extrabold text-[#7A1C1C] text-sm sm:text-base">
              दान एवं सहयोग राशि रसीद (Payment Receipt)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="PDF डाउनलोड करें"
            >
              <FiDownload className="w-4 h-4" /> {downloading ? 'डाउनलोडिंग...' : 'PDF डाउनलोड'}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#7A1C1C] hover:bg-[#5E1414] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              title="प्रिंट करें"
            >
              <FiPrinter className="w-4 h-4" /> प्रिंट
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
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

        {/* Printable Receipt Card Body */}
        <div className="p-2 sm:p-4 bg-[#F2EDE4] overflow-x-auto">
          <div
            id="printable-receipt-card"
            ref={printRef}
            className="w-full max-w-[620px] mx-auto bg-[#FFFDF8] rounded-2xl shadow-xl overflow-hidden border border-[#D4A373] text-[#1E293B]"
            style={{
              boxSizing: 'border-box',
              fontFamily: "'Inter', 'Segoe UI', sans-serif",
            }}
          >
            {/* 1. Header Section */}
            <div
              className="relative px-4 sm:px-6 pt-3 pb-2 text-white"
              style={{
                background: 'linear-gradient(135deg, #7A1C1C 0%, #9B241B 50%, #7A1C1C 100%)',
              }}
            >
              {/* Spiritual Invocations */}
              <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-bold text-amber-100 tracking-wider mb-1">
                <span>॥ श्री आईजी कृपा ॥</span>
                <span>॥ ॐ श्री कुलदेवी माता नमः ॥</span>
              </div>

              {/* Main Header Row: Logo | Title & Location | Quote Card */}
              <div className="flex items-center justify-between gap-2 sm:gap-3 py-1">
                {/* Left Logo / Emblem */}
                <div className="shrink-0 flex flex-col items-center">
                  <img
                    src="/Logo.webp"
                    alt="श्री सीरवी समाज कोणदा"
                    crossOrigin="anonymous"
                    className="w-18 h-18 sm:w-22 sm:h-22 object-contain drop-shadow-md"
                    onError={(e) => {
                      e.currentTarget.src = '/Logo.webp';
                    }}
                  />
                </div>

                {/* Center Organization Title & Info */}
                <div className="flex-1 text-center px-1">
                  <h1 className="text-xl sm:text-2xl lg:text-[26px] font-black tracking-tight text-white leading-tight drop-shadow-sm">
                    श्री सीरवी समाज कोणदा
                  </h1>
                  <p className="text-[11px] sm:text-xs font-semibold text-amber-200 mt-1 flex items-center justify-center gap-1">
                    <span>📍</span> ग्राम कोणदा, तहसील कुक्षी, जिला धार (मध्य प्रदेश)
                  </p>
                  <p className="text-[10px] sm:text-[11px] font-bold text-orange-100 tracking-widest mt-1 uppercase">
                    एकता  •  सेवा  •  संस्कार  •  समृद्धि
                  </p>
                </div>

                {/* Right Quote Badge */}
                <div className="shrink-0 bg-white rounded-2xl p-2 sm:p-2.5 text-center shadow-md w-24 sm:w-28 border border-amber-200">
                  <span className="text-[#C85A17] font-serif text-lg leading-none font-black block">“</span>
                  <p className="text-[10px] sm:text-[11px] font-black text-[#7A1C1C] leading-snug">
                    समाज सेवा ही सच्ची सेवा
                  </p>
                  <span className="text-[#C85A17] font-serif text-lg leading-none font-black block text-right -mt-1">”</span>
                </div>
              </div>

              {/* Header Bottom Banner (Maroon Ribbon with Tagline) */}
              <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between text-[9px] sm:text-[10px] font-bold text-amber-100">
                <span className="leading-tight text-left">समाज से<br />समाज के लिए</span>
                <div className="bg-[#4D0D0D] border border-amber-400/40 rounded-full px-4 sm:px-6 py-1 text-center shadow-inner">
                  <span className="text-xs sm:text-sm font-black text-[#FDE68A] block leading-tight">
                    दान एवं सहयोग राशि रसीद
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-bold text-white/90 tracking-widest uppercase block">
                    FAMILY PAYMENT RECEIPT
                  </span>
                </div>
                <span className="leading-tight text-right">हमारी परंपरा<br />हमारी पहचान</span>
              </div>
            </div>

            {/* 2. Metadata Ribbon (3 Rounded Cards) */}
            <div className="bg-[#FAF2E6] px-3.5 sm:px-4 py-2.5 border-b border-[#E8DCC8]">
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {/* Card 1: Receipt Number */}
                <div className="bg-white rounded-xl p-2 sm:p-2.5 border border-[#E8DCC8] shadow-2xs flex items-center gap-2 sm:gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#7A1C1C] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <FiFileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] text-[#64748B] font-bold leading-tight">रसीद क्रमांक (Receipt No.)</p>
                    <p className="text-xs sm:text-[13px] font-black text-[#7A1C1C] font-mono truncate leading-tight mt-0.5">
                      {receiptNo}
                    </p>
                  </div>
                </div>

                {/* Card 2: Date & Time */}
                <div className="bg-white rounded-xl p-2 sm:p-2.5 border border-[#E8DCC8] shadow-2xs flex items-center gap-2 sm:gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#7A1C1C] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <FiCalendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] text-[#64748B] font-bold leading-tight">दिनांक (Date)</p>
                    <p className="text-xs sm:text-[13px] font-black text-[#1E293B] truncate leading-tight mt-0.5">
                      {dateStr}
                    </p>
                    <p className="text-[9px] text-[#64748B] font-semibold leading-none">{timeStr}</p>
                  </div>
                </div>

                {/* Card 3: Fund / Branch */}
                <div className="bg-white rounded-xl p-2 sm:p-2.5 border border-[#E8DCC8] shadow-2xs flex items-center gap-2 sm:gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#7A1C1C] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <FiTag className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] text-[#64748B] font-bold leading-tight">कोष / शाखा (Fund / Branch)</p>
                    <p className="text-xs sm:text-[13px] font-black text-[#7A1C1C] truncate leading-tight mt-0.5">
                      {purposeName}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Main Content: Two Balanced Columns */}
            <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              
              {/* Left Column: Family Details + Amount Highlight */}
              <div className="flex flex-col justify-between space-y-3">
                {/* Family & Member Box */}
                <div className="rounded-xl overflow-hidden border border-[#E8DCC8] shadow-2xs bg-white">
                  {/* Column Header */}
                  <div className="bg-[#7A1C1C] text-white px-3 py-1.5 flex items-center justify-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
                      <FiUsers className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-extrabold text-xs tracking-wide">
                      परिवार एवं सदस्य विवरण
                    </span>
                    <span className="text-[10px] text-amber-200 font-medium">
                      (Family & Member Details)
                    </span>
                  </div>

                  {/* Rows */}
                  <div className="p-2.5 sm:p-3 space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#FAF2E6] flex items-center justify-center text-[#7A1C1C] shrink-0 text-xs">
                        <FiUser className="w-3 h-3" />
                      </span>
                      <div className="min-w-0 flex-1 flex justify-between gap-1">
                        <span className="text-[#64748B] font-medium text-[11px]">
                          परिवार मुखिया का नाम <br />
                          <span className="text-[9px] text-gray-400 font-normal">(Head of Family)</span>
                        </span>
                        <span className="font-black text-[#1E293B] text-right truncate text-xs sm:text-[13px]">
                          : {headName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-[#F1E8DC]">
                      <span className="w-5 h-5 rounded-full bg-[#FAF2E6] flex items-center justify-center text-[#7A1C1C] shrink-0 text-xs">
                        <FiUsers className="w-3 h-3" />
                      </span>
                      <div className="min-w-0 flex-1 flex justify-between gap-1">
                        <span className="text-[#64748B] font-medium text-[11px]">
                          परिवार क्र. # <span className="text-[9px] text-gray-400 font-normal">(Family No.)</span>
                        </span>
                        <span className="font-black text-[#1E293B] font-mono text-right text-xs sm:text-[13px]">
                          : {paddedFamilyId}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-[#F1E8DC]">
                      <span className="w-5 h-5 rounded-full bg-[#FAF2E6] flex items-center justify-center text-[#7A1C1C] shrink-0 text-xs">
                        <FiBookmark className="w-3 h-3" />
                      </span>
                      <div className="min-w-0 flex-1 flex justify-between gap-1">
                        <span className="text-[#64748B] font-medium text-[11px]">
                          गोत्र <span className="text-[9px] text-gray-400 font-normal">(Gotra)</span>
                        </span>
                        <span className="font-black text-[#1E293B] text-right text-xs sm:text-[13px]">
                          : {gotra}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-[#F1E8DC]">
                      <span className="w-5 h-5 rounded-full bg-[#FAF2E6] flex items-center justify-center text-[#7A1C1C] shrink-0 text-xs">
                        <FiHome className="w-3 h-3" />
                      </span>
                      <div className="min-w-0 flex-1 flex justify-between gap-1">
                        <span className="text-[#64748B] font-medium text-[11px]">
                          ग्राम / क्षेत्र <span className="text-[9px] text-gray-400 font-normal">(Village)</span>
                        </span>
                        <span className="font-black text-[#1E293B] text-right text-xs sm:text-[13px]">
                          : {village}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount Received Highlight Box */}
                <div
                  className="rounded-xl p-2.5 sm:p-3 text-white flex items-center justify-between shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #C85A17 0%, #D9681E 50%, #B8470E 100%)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-white/20 border border-white/40 flex items-center justify-center font-bold text-base shadow-xs">
                      ₹
                    </div>
                    <div>
                      <p className="font-extrabold text-xs sm:text-[13px] text-white leading-tight">
                        प्राप्त कुल राशि
                      </p>
                      <p className="text-[9px] text-orange-200 leading-none">
                        (Amount Received)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-xl sm:text-2xl font-mono text-white tracking-tight drop-shadow-xs">
                      ₹ {amount.toLocaleString('en-IN')} /-
                    </span>
                  </div>
                </div>

                {/* Amount in Words Box */}
                <div className="bg-[#FFF9F0] rounded-xl p-2 border border-[#E8DCC8] text-[11px] leading-relaxed">
                  <p className="text-[#1E293B] font-bold">
                    <span className="text-[#64748B] font-medium">राशि शब्दों में : </span>
                    <span className="text-[#7A1C1C] font-black">{hindiAmount}</span>
                  </p>
                  <p className="text-[10px] text-[#64748B] font-semibold mt-0.5">
                    ({englishAmount})
                  </p>
                </div>
              </div>

              {/* Right Column: Payment Details Box */}
              <div className="rounded-xl overflow-hidden border border-[#E8DCC8] shadow-2xs bg-white flex flex-col justify-between">
                {/* Column Header */}
                <div className="bg-[#7A1C1C] text-white px-3 py-1.5 flex items-center justify-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                    ₹
                  </div>
                  <span className="font-extrabold text-xs tracking-wide">
                    भुगतान विवरण
                  </span>
                  <span className="text-[10px] text-amber-200 font-medium">
                    (Payment Details)
                  </span>
                </div>

                {/* Rows */}
                <div className="p-2.5 sm:p-3 space-y-2.5 text-xs flex-1 flex flex-col justify-around">
                  {/* Purpose */}
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#FAF2E6] flex items-center justify-center text-[#7A1C1C] shrink-0 text-xs">
                      <FiTag className="w-3 h-3" />
                    </span>
                    <div className="min-w-0 flex-1 flex justify-between gap-1">
                      <span className="text-[#64748B] font-medium text-[11px]">
                        मद / विवरण <br />
                        <span className="text-[9px] text-gray-400 font-normal">(Purpose / Ledger)</span>
                      </span>
                      <span className="font-black text-[#7A1C1C] text-right truncate text-xs sm:text-[13px]">
                        : {purposeName}
                      </span>
                    </div>
                  </div>

                  {/* Paid By Member */}
                  <div className="flex items-start gap-2 pt-1 border-t border-[#F1E8DC]">
                    <span className="w-5 h-5 rounded-full bg-[#FAF2E6] flex items-center justify-center text-[#7A1C1C] shrink-0 text-xs">
                      <FiUser className="w-3 h-3" />
                    </span>
                    <div className="min-w-0 flex-1 flex justify-between gap-1">
                      <span className="text-[#64748B] font-medium text-[11px]">
                        भुगतानकर्ता / सदस्य <br />
                        <span className="text-[9px] text-gray-400 font-normal">(Paid By Member)</span>
                      </span>
                      <span className="font-black text-[#1E293B] text-right truncate text-xs sm:text-[13px]">
                        : {donorName}
                      </span>
                    </div>
                  </div>

                  {/* Payment Mode */}
                  <div className="flex items-center gap-2 pt-1 border-t border-[#F1E8DC]">
                    <span className="w-5 h-5 rounded-full bg-[#FAF2E6] flex items-center justify-center text-[#7A1C1C] shrink-0 text-xs font-bold">
                      ₹
                    </span>
                    <div className="min-w-0 flex-1 flex justify-between gap-1">
                      <span className="text-[#64748B] font-medium text-[11px]">
                        भुगतान माध्यम <span className="text-[9px] text-gray-400 font-normal">(Payment Mode)</span>
                      </span>
                      <span className="font-black text-[#1E293B] text-right text-xs sm:text-[13px]">
                        : {paymentMode}
                      </span>
                    </div>
                  </div>

                  {/* UTR / Reference */}
                  <div className="flex items-start gap-2 pt-1 border-t border-[#F1E8DC]">
                    <span className="w-5 h-5 rounded-full bg-[#FAF2E6] flex items-center justify-center text-[#7A1C1C] shrink-0 text-xs">
                      <FiLink className="w-3 h-3" />
                    </span>
                    <div className="min-w-0 flex-1 flex justify-between gap-1">
                      <span className="text-[#64748B] font-medium text-[11px]">
                        लेनदेन संदर्भ (UTR) <br />
                        <span className="text-[9px] text-gray-400 font-normal">(Transaction ID / UTR)</span>
                      </span>
                      <span className="font-black text-[#1E293B] font-mono text-right truncate text-xs sm:text-[13px]">
                        : {utrNumber}
                      </span>
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="flex items-start gap-2 pt-1 border-t border-[#F1E8DC]">
                    <span className="w-5 h-5 rounded-full bg-[#FAF2E6] flex items-center justify-center text-[#7A1C1C] shrink-0 text-xs">
                      <FiMessageSquare className="w-3 h-3" />
                    </span>
                    <div className="min-w-0 flex-1 flex justify-between gap-1">
                      <span className="text-[#64748B] font-medium text-[11px]">
                        टिप्पणी / विवरण <br />
                        <span className="text-[9px] text-gray-400 font-normal">(Remarks)</span>
                      </span>
                      <span className="font-semibold text-[#1E293B] text-right text-xs leading-tight">
                        : {remarks}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Verification, Samaj Quote & Sign-Off Section */}
            <div className="px-3.5 sm:px-4 py-3 border-t border-[#E8DCC8] bg-[#FFFBF5]">
              <div className="grid grid-cols-3 gap-2 sm:gap-3 items-center text-center">
                {/* Left: QR Code Verification */}
                <div className="flex items-center gap-2 text-left">
                  <div className="bg-white p-1 rounded-lg border border-[#E8DCC8] shadow-2xs shrink-0">
                    <img
                      src={qrUrl}
                      alt="Verify QR"
                      crossOrigin="anonymous"
                      className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                    />
                    <p className="text-[8px] font-mono font-bold text-[#7A1C1C] text-center mt-0.5 leading-none">
                      {receiptNo}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-[11px] font-black text-[#1E293B] leading-tight">
                      रसीद की सत्यता जाँचें
                    </p>
                    <p className="text-[8px] sm:text-[9px] text-[#64748B] font-medium leading-tight">
                      (Verify Receipt)
                    </p>
                    <p className="text-[8px] text-[#64748B] mt-0.5 leading-tight">
                      स्कैन करें या विजिट करें:
                    </p>
                    <a
                      href="https://www.seervisamajkonda.com/verify"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[8px] sm:text-[9px] text-[#C85A17] font-bold underline truncate block"
                    >
                      www.seervisamajkonda.com/verify
                    </a>
                  </div>
                </div>

                {/* Center: Inspirational Samaj Quote */}
                <div className="px-1 py-1 text-center">
                  <span className="text-[#C85A17] font-serif text-base leading-none block font-black">“</span>
                  <p className="text-[11px] sm:text-xs font-black text-[#7A1C1C] leading-tight">
                    आपका सहयोग<br />
                    समाज के उज्जवल<br />
                    भविष्य की नींव है।
                  </p>
                  <span className="text-[#C85A17] font-serif text-base leading-none block font-black text-right -mt-1">”</span>
                </div>

                {/* Right: Signatory / Generated By */}
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-7 h-7 rounded-full bg-[#7A1C1C] flex items-center justify-center text-white mb-1 shadow-2xs">
                    <FiUser className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[9px] text-[#64748B] font-semibold leading-tight">
                    रसीद जारीकर्ता <br />
                    <span className="text-[8px] text-gray-400 font-normal">(Generated By)</span>
                  </p>
                  <p className="text-xs sm:text-sm font-black text-[#1E293B] leading-tight mt-0.5">
                    {generatedBy}
                  </p>
                  <p className="text-[10px] text-[#64748B] font-bold leading-tight">
                    (Admin)
                  </p>
                  <p className="text-[9px] text-[#7A1C1C] font-black leading-tight mt-0.5">
                    श्री सीरवी समाज कोणदा
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Footer Ribbon with Contacts & Silhouette Graphic */}
            <div className="p-2 sm:p-2.5 bg-[#FFFDF8]">
              <div
                className="rounded-xl px-3 py-2 text-white shadow-md text-center"
                style={{
                  background: 'linear-gradient(135deg, #7A1C1C 0%, #8E211A 100%)',
                }}
              >
                {/* 3 Contact Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[9px] sm:text-[10px] font-bold">
                  <div className="bg-white/10 border border-white/20 rounded-full py-0.5 px-2 truncate flex items-center justify-center gap-1">
                    <span>📍</span> ग्राम कोणदा, तहसील कुक्षी, जिला धार (म.प्र.)
                  </div>
                  <div className="bg-white/10 border border-white/20 rounded-full py-0.5 px-2 truncate flex items-center justify-center gap-1">
                    <span>📞</span> 74705 18252, 96918 40096
                  </div>
                  <div className="bg-white/10 border border-white/20 rounded-full py-0.5 px-2 truncate flex items-center justify-center gap-1">
                    <span>🌐</span> www.seervisamajkonda.com
                  </div>
                </div>

                {/* Bottom Graphic & Samaj Motto */}
                <div className="mt-2 pt-1.5 border-t border-white/20 flex items-center justify-between text-[8px] sm:text-[9px] text-amber-200 font-bold">
                  <span>| समाज की उन्नति में ही हमारी उन्नति है ||</span>

                  {/* Traditional Mandir & Silhouette Graphic */}
                  <div className="flex items-center justify-center opacity-90 px-2">
                    <svg viewBox="0 0 100 22" className="h-5 w-auto fill-amber-300" aria-hidden="true">
                      {/* Mandir Kalash & Dome */}
                      <path d="M50 0 L53 6 L47 6 Z M47 6 Q50 3 53 6 L54 11 Q50 9 46 11 Z M44 11 L56 11 L56 22 L44 22 Z" />
                      {/* Sun behind */}
                      <circle cx="50" cy="8" r="7" fill="#FDE68A" opacity="0.4" />
                      {/* Desert Camel Silhouette */}
                      <path d="M68 22 L69 17 L72 15 Q75 14 77 15 L79 17 L81 16 Q83 14 84 11 L86 10 L87 12 L85 14 L83 18 L83 22 L81 22 L81 19 L77 19 L77 22 L75 22 L75 18 L70 18 L69 22 Z" />
                      {/* Small Fort / Temple Turret */}
                      <path d="M25 22 L25 14 L27 12 L29 14 L29 22 Z M20 22 L20 16 L22 15 L23 16 L23 22 Z" />
                    </svg>
                  </div>

                  <span>हमारा समाज हमारी पहचान</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Action Bottom Bar */}
        <div className="no-print px-5 py-3.5 bg-[#FFF8EC] border-t border-[#E8DCC8] flex flex-wrap justify-between items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#E8DCC8] hover:bg-[#FAF1E0] text-[#2B211B] font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            बंद करें (Close)
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <FiDownload className="w-4 h-4" /> {downloading ? 'डाउनलोड हो रहा...' : 'रसीद PDF डाउनलोड करें'}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#7A1C1C] to-[#C85A17] hover:shadow-md text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
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
