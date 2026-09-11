import React, { useRef, useState, useEffect } from 'react';
import {
  FiPrinter, FiX, FiShare2, FiDownload,
  FiFileText, FiCalendar, FiTag, FiUser, FiUsers,
  FiHome, FiBookmark, FiCreditCard, FiLink, FiMessageSquare,
  FiEdit2, FiCheck, FiRotateCcw
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
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

const extractGotra = (name) => {
  if (!name || name === '—') return '';
  const clean = String(name).replace(/^(श्री|श्रीमती|श्रीमान|डॉ|प्रो)\s+/i, '').trim();
  const words = clean.split(/\s+/);
  if (words.length >= 2) {
    return words[words.length - 1].replace(/[()]/g, '');
  }
  return '';
};

const PaymentReceiptModal = ({ isOpen, onClose, donation }) => {
  const { user, isAdmin } = useAuth();
  const printRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);

  // Initialize admin name from donation or logged-in user
  const initialAdminName = donation?.created_by_name || donation?.collected_by_name || user?.name || 'चिराग भायल';
  const initialAdminRole = donation?.created_by_role || (user?.role === 'treasurer' ? 'Treasurer' : 'Admin');

  const [adminName, setAdminName] = useState(initialAdminName);
  const [adminRole, setAdminRole] = useState(initialAdminRole);

  useEffect(() => {
    if (donation) {
      setAdminName(donation.created_by_name || donation.collected_by_name || user?.name || 'चिराग भायल');
      setAdminRole(donation.created_by_role || (user?.role === 'treasurer' ? 'Treasurer' : 'Admin'));
      setIsEditingAdmin(false);
    }
  }, [donation, user]);

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
  
  const rawFamilyId = donation.panchayat_family_id || donation.families?.panchayat_family_id || donation.family_id || '';
  const paddedFamilyId = rawFamilyId && !isNaN(Number(rawFamilyId))
    ? String(rawFamilyId).padStart(3, '0')
    : rawFamilyId || '—';

  const rawGotra = donation.gotra && donation.gotra !== '—'
    ? donation.gotra
    : donation.families?.gotra && donation.families.gotra !== '—'
      ? donation.families.gotra
      : extractGotra(headName) || extractGotra(donorName) || 'काग';

  const gotra = rawGotra || '—';
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

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=0&data=${encodeURIComponent(`https://www.seervisamajkonda.com/verify?receipt=${receiptNo}`)}`;

  const handlePrint = () => {
    setIsEditingAdmin(false);
    setTimeout(() => {
      window.print();
    }, 50);
  };

  const handleDownload = async () => {
    if (downloading) return;
    setIsEditingAdmin(false);
    setDownloading(true);
    try {
      const receiptPayload = {
        ...donation,
        created_by_name: adminName,
        collected_by_name: adminName,
      };
      await downloadReceiptAsPDF(printRef.current, receiptPayload);
    } finally {
      setDownloading(false);
    }
  };

  const handleWhatsAppShare = () => {
    setIsEditingAdmin(false);
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
▪ *रसीद जारीकर्ता*: ${adminName} (${adminRole})
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs">
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

      {/* Main Modal Shell (Max height with internal scroll so it never clips!) */}
      <div className="relative w-full max-w-[800px] max-h-[96vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-[#E8DCC8] overflow-hidden my-auto animate-fadeIn">
        
        {/* Sticky Top Controls */}
        <div className="no-print shrink-0 flex items-center justify-between px-5 py-3 bg-[#FFF8EC] border-b border-[#E8DCC8]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-extrabold text-[#7A1C1C] text-sm sm:text-base">
              दान एवं सहयोग राशि रसीद (Payment Receipt)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Admin-only: Edit receipt issuer name */}
            {isAdmin && (
              <button
                onClick={() => setIsEditingAdmin((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer ${
                  isEditingAdmin
                    ? 'bg-amber-600 text-white'
                    : 'bg-white border border-[#E8DCC8] hover:bg-[#FAF1E0] text-[#7A1C1C]'
                }`}
                title="रसीद जारीकर्ता / एडमिन नाम बदलें"
              >
                <FiEdit2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isEditingAdmin ? 'संपादन बंद करें' : 'एडमिन नाम बदलें'}</span>
                <span className="sm:hidden">नाम</span>
              </button>
            )}
            {/* Admin-only: PDF Download */}
            {isAdmin && (
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                title="PDF डाउनलोड करें"
              >
                <FiDownload className="w-4 h-4" /> {downloading ? 'डाउनलोडिंग...' : 'PDF डाउनलोड'}
              </button>
            )}
            {/* Admin-only: Print */}
            {isAdmin && (
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#7A1C1C] hover:bg-[#5E1414] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                title="प्रिंट करें"
              >
                <FiPrinter className="w-4 h-4" /> प्रिंट
              </button>
            )}
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

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-[#EFE8DC]">
          <div
            id="printable-receipt-card"
            ref={printRef}
            className="w-full max-w-[740px] mx-auto bg-[#FFFDF8] rounded-2xl shadow-xl overflow-hidden border-2 border-[#8E211A] text-[#1E293B]"
            style={{
              boxSizing: 'border-box',
              fontFamily: "'Inter', 'Segoe UI', sans-serif",
            }}
          >
            {/* 1. Header Section */}
            <div
              className="relative px-5 sm:px-6 pt-3 pb-2 text-white"
              style={{
                background: 'linear-gradient(135deg, #7A1C1C 0%, #9B241B 50%, #7A1C1C 100%)',
              }}
            >
              {/* Spiritual Invocations */}
              <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-bold text-amber-100 tracking-wider mb-1">
                <span>॥ श्री आईजी कृपा ॥</span>
                <span>॥ ॐ श्री कुलदेवी माता नमः ॥</span>
              </div>

              {/* Main Header Row */}
              <div className="flex items-center justify-between gap-3 py-1">
                {/* Left Logo / Emblem */}
                <div className="shrink-0">
                  <img
                    src="/Logo.webp"
                    alt="श्री सीरवी समाज कोणदा"
                    crossOrigin="anonymous"
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-md"
                    onError={(e) => {
                      e.currentTarget.src = '/Logo.webp';
                    }}
                  />
                </div>

                {/* Center Title & Info */}
                <div className="flex-1 text-center px-1">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight drop-shadow-sm">
                    श्री सीरवी समाज कोणदा
                  </h1>
                  <p className="text-xs sm:text-[13px] font-bold text-amber-200 mt-1 flex items-center justify-center gap-1">
                    <span>📍</span> ग्राम कोणदा, तहसील कुक्षी, जिला धार (मध्य प्रदेश)
                  </p>
                  <p className="text-[10px] sm:text-[11px] font-bold text-orange-100 tracking-widest mt-1 uppercase">
                    एकता  •  सेवा  •  संस्कार  •  समृद्धि
                  </p>
                </div>

                {/* Right Quote Badge */}
                <div className="shrink-0 bg-white rounded-2xl p-2.5 text-center shadow-md w-28 sm:w-32 border border-amber-200">
                  <span className="text-[#C85A17] font-serif text-lg leading-none font-black block">“</span>
                  <p className="text-[11px] font-black text-[#7A1C1C] leading-snug">
                    समाज सेवा ही सच्ची सेवा
                  </p>
                  <span className="text-[#C85A17] font-serif text-lg leading-none font-black block text-right -mt-1">”</span>
                </div>
              </div>

              {/* Header Bottom Banner */}
              <div className="mt-2.5 pt-2 border-t border-white/20 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-amber-100">
                <span className="leading-tight text-left">समाज से<br />समाज के लिए</span>
                <div className="bg-[#4D0D0D] border border-amber-400/40 rounded-full px-6 sm:px-8 py-1 text-center shadow-inner">
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

            {/* 2. Metadata Ribbon (3 Balanced Cards) */}
            <div className="bg-[#FAF2E6] px-4 py-2.5 border-b border-[#E8DCC8]">
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {/* Card 1: Receipt Number */}
                <div className="bg-white rounded-xl p-2.5 border border-[#E8DCC8] shadow-2xs flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#7A1C1C] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <FiFileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] text-[#64748B] font-bold uppercase leading-tight">रसीद क्रमांक (Receipt No.)</p>
                    <p className="text-xs sm:text-[13px] font-black text-[#7A1C1C] font-mono truncate leading-tight mt-0.5">
                      {receiptNo}
                    </p>
                  </div>
                </div>

                {/* Card 2: Date & Time */}
                <div className="bg-white rounded-xl p-2.5 border border-[#E8DCC8] shadow-2xs flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#7A1C1C] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <FiCalendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] text-[#64748B] font-bold uppercase leading-tight">दिनांक (Date)</p>
                    <p className="text-xs sm:text-[13px] font-black text-[#1E293B] truncate leading-tight mt-0.5">
                      {dateStr}
                    </p>
                    <p className="text-[9px] text-[#64748B] font-semibold leading-none">{timeStr}</p>
                  </div>
                </div>

                {/* Card 3: Fund / Branch */}
                <div className="bg-white rounded-xl p-2.5 border border-[#E8DCC8] shadow-2xs flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#7A1C1C] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <FiTag className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] text-[#64748B] font-bold uppercase leading-tight">कोष / शाखा (Fund / Branch)</p>
                    <p className="text-xs sm:text-[13px] font-black text-[#7A1C1C] truncate leading-tight mt-0.5">
                      {purposeName}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Main Content: Two Perfectly Aligned Columns */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Left Column: Family Details + Amount Highlight */}
              <div className="flex flex-col justify-between space-y-3.5">
                {/* Family Details Card */}
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

                  {/* Rows with Perfect Column Alignment */}
                  <div className="p-3 space-y-2.5 text-xs">
                    {/* Head of Family */}
                    <div className="grid grid-cols-[130px_10px_1fr] items-baseline gap-x-1">
                      <div className="flex items-center gap-1.5 text-[#64748B] font-semibold leading-tight">
                        <span className="w-4 h-4 rounded-full bg-[#FAF2E6] flex items-center justify-center text-[#7A1C1C] shrink-0 text-[10px]">
                          <FiUser className="w-2.5 h-2.5" />
                        </span>
                        <span>
                          परिवार मुखिया का नाम <br />
                          <span className="text-[9px] text-[#94A3B8] font-normal">(Head of Family)</span>
                        </span>
                      </div>
                      <span className="text-[#64748B] font-black text-center">:</span>
                      <span className="font-extrabold text-[#1E293B] text-xs sm:text-[13px] break-words">
                        {headName}
                      </span>
                    </div>

                    {/* Family No. */}
                    <div className="grid grid-cols-[130px_10px_1fr] items-baseline gap-x-1 pt-1.5 border-t border-[#F1E8DC]">
                      <div className="flex items-center gap-1.5 text-[#64748B] font-semibold leading-tight">
                        <span className="w-4 h-4 rounded-full bg-[#FAF2E6] flex items-center justify-center text-[#7A1C1C] shrink-0 text-[10px]">
                          <FiUsers className="w-2.5 h-2.5" />
                        </span>
                        <span>
                          परिवार क्र. # <br />
                          <span className="text-[9px] text-[#94A3B8] font-normal">(Family No.)</span>
                        </span>
                      </div>
                      <span className="text-[#64748B] font-black text-center">:</span>
                      <span className="font-extrabold text-[#1E293B] text-xs sm:text-[13px] font-mono">
                        {paddedFamilyId}
                      </span>
                    </div>

                    {/* Gotra */}
                    <div className="grid grid-cols-[130px_10px_1fr] items-baseline gap-x-1 pt-1.5 border-t border-[#F1E8DC]">
                      <div className="flex items-center gap-1.5 text-[#64748B] font-semibold leading-tight">
                        <span className="w-4 h-4 rounded-full bg-[#FAF2E6] flex items-center justify-center text-[#7A1C1C] shrink-0 text-[10px]">
                          <FiBookmark className="w-2.5 h-2.5" />
                        </span>
                        <span>
                          गोत्र <br />
                          <span className="text-[9px] text-[#94A3B8] font-normal">(Gotra)</span>
                        </span>
                      </div>
                      <span className="text-[#64748B] font-black text-center">:</span>
                      <span className="font-extrabold text-[#1E293B] text-xs sm:text-[13px]">
                        {gotra}
                      </span>
                    </div>

                    {/* Village */}
                    <div className="grid grid-cols-[130px_10px_1fr] items-baseline gap-x-1 pt-1.5 border-t border-[#F1E8DC]">
                      <div className="flex items-center gap-1.5 text-[#64748B] font-semibold leading-tight">
                        <span className="w-4 h-4 rounded-full bg-[#FAF2E6] flex items-center justify-center text-[#7A1C1C] shrink-0 text-[10px]">
                          <FiHome className="w-2.5 h-2.5" />
                        </span>
                        <span>
                          ग्राम / क्षेत्र <br />
                          <span className="text-[9px] text-[#94A3B8] font-normal">(Village)</span>
                        </span>
                      </div>
                      <span className="text-[#64748B] font-black text-center">:</span>
                      <span className="font-extrabold text-[#1E293B] text-xs sm:text-[13px]">
                        {village}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount Received Highlight Box */}
                <div
                  className="rounded-xl p-3 text-white flex items-center justify-between shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #C85A17 0%, #D9681E 50%, #B8470E 100%)',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center font-black text-lg shadow-xs">
                      ₹
                    </div>
                    <div>
                      <p className="font-black text-xs sm:text-sm text-white leading-tight">
                        प्राप्त कुल राशि
                      </p>
                      <p className="text-[9px] text-orange-100 font-semibold leading-none">
                        (Amount Received)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-2xl font-mono text-white tracking-tight drop-shadow-xs">
                      ₹ {amount.toLocaleString('en-IN')} /-
                    </span>
                  </div>
                </div>

                {/* Amount in Words Box */}
                <div className="bg-[#FFF9F0] rounded-xl p-2.5 border border-[#E8DCC8] text-[11px] leading-relaxed">
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

                {/* Rows with Perfect Column Alignment */}
                <div className="p-3 space-y-2.5 text-xs flex-1 flex flex-col justify-around">
                  {/* Purpose / Ledger */}
                  <div className="grid grid-cols-[130px_10px_1fr] items-baseline gap-x-1">
                    <div className="flex items-center gap-1.5 text-[#64748B] font-semibold leading-tight">
                      <span className="w-4 h-4 rounded-full bg-[#FAF2E6] flex items-center justify-center text-[#7A1C1C] shrink-0 text-[10px]">
                        <FiTag className="w-2.5 h-2.5" />
                      </span>
                      <span>
                        मद / विवरण <br />
                        <span className="text-[9px] text-[#94A3B8] font-normal">(Purpose / Ledger)</span>
                      </span>
                    </div>
                    <span className="text-[#64748B] font-black text-center">:</span>
                    <span className="font-extrabold text-[#7A1C1C] text-xs sm:text-[13px] break-words">
                      {purposeName}
                    </span>
                  </div>

                  {/* Paid By Member */}
                  <div className="grid grid-cols-[130px_10px_1fr] items-baseline gap-x-1 pt-1.5 border-t border-[#F1E8DC]">
                    <div className="flex items-center gap-1.5 text-[#64748B] font-semibold leading-tight">
                      <span className="w-4 h-4 rounded-full bg-[#FAF2E6] flex items-center justify-center text-[#7A1C1C] shrink-0 text-[10px]">
                        <FiUser className="w-2.5 h-2.5" />
                      </span>
                      <span>
                        भुगतानकर्ता / सदस्य <br />
                        <span className="text-[9px] text-[#94A3B8] font-normal">(Paid By Member)</span>
                      </span>
                    </div>
                    <span className="text-[#64748B] font-black text-center">:</span>
                    <span className="font-extrabold text-[#1E293B] text-xs sm:text-[13px] break-words">
                      {donorName}
                    </span>
                  </div>

                  {/* Payment Mode */}
                  <div className="grid grid-cols-[130px_10px_1fr] items-baseline gap-x-1 pt-1.5 border-t border-[#F1E8DC]">
                    <div className="flex items-center gap-1.5 text-[#64748B] font-semibold leading-tight">
                      <span className="w-4 h-4 rounded-full bg-[#FAF2E6] flex items-center justify-center text-[#7A1C1C] shrink-0 text-[10px] font-bold">
                        ₹
                      </span>
                      <span>
                        भुगतान माध्यम <br />
                        <span className="text-[9px] text-[#94A3B8] font-normal">(Payment Mode)</span>
                      </span>
                    </div>
                    <span className="text-[#64748B] font-black text-center">:</span>
                    <span className="font-extrabold text-[#1E293B] text-xs sm:text-[13px]">
                      {paymentMode}
                    </span>
                  </div>

                  {/* UTR / Transaction ID */}
                  <div className="grid grid-cols-[130px_10px_1fr] items-baseline gap-x-1 pt-1.5 border-t border-[#F1E8DC]">
                    <div className="flex items-center gap-1.5 text-[#64748B] font-semibold leading-tight">
                      <span className="w-4 h-4 rounded-full bg-[#FAF2E6] flex items-center justify-center text-[#7A1C1C] shrink-0 text-[10px]">
                        <FiLink className="w-2.5 h-2.5" />
                      </span>
                      <span>
                        लेनदेन संदर्भ (UTR) <br />
                        <span className="text-[9px] text-[#94A3B8] font-normal">(Transaction ID / UTR)</span>
                      </span>
                    </div>
                    <span className="text-[#64748B] font-black text-center">:</span>
                    <span className="font-extrabold text-[#1E293B] font-mono text-xs sm:text-[13px] break-all">
                      {utrNumber}
                    </span>
                  </div>

                  {/* Remarks */}
                  <div className="grid grid-cols-[130px_10px_1fr] items-baseline gap-x-1 pt-1.5 border-t border-[#F1E8DC]">
                    <div className="flex items-center gap-1.5 text-[#64748B] font-semibold leading-tight">
                      <span className="w-4 h-4 rounded-full bg-[#FAF2E6] flex items-center justify-center text-[#7A1C1C] shrink-0 text-[10px]">
                        <FiMessageSquare className="w-2.5 h-2.5" />
                      </span>
                      <span>
                        टिप्पणी / विवरण <br />
                        <span className="text-[9px] text-[#94A3B8] font-normal">(Remarks)</span>
                      </span>
                    </div>
                    <span className="text-[#64748B] font-black text-center">:</span>
                    <span className="font-bold text-[#1E293B] text-xs leading-snug break-words">
                      {remarks}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Verification, Samaj Quote & Sign-Off Section */}
            <div className="px-5 py-3 border-t border-[#E8DCC8] bg-[#FFFBF5]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-center">
                {/* Left: QR Code Verification (Non-truncated URL!) */}
                <div className="flex items-center gap-2.5 text-left">
                  <div className="bg-white p-1 rounded-lg border border-[#E8DCC8] shadow-2xs shrink-0">
                    <img
                      src={qrUrl}
                      alt="Verify QR"
                      crossOrigin="anonymous"
                      className="w-16 h-16 object-contain"
                    />
                    <p className="text-[8px] font-mono font-bold text-[#7A1C1C] text-center mt-0.5 leading-none">
                      {receiptNo}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black text-[#1E293B] leading-tight">
                      रसीद की सत्यता जाँचें
                    </p>
                    <p className="text-[9px] text-[#64748B] font-medium leading-tight">
                      (Verify Receipt)
                    </p>
                    <p className="text-[8px] text-[#64748B] mt-0.5 leading-tight">
                      स्कैन करें या विजिट करें:
                    </p>
                    <a
                      href="https://www.seervisamajkonda.com/verify"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] text-[#C85A17] font-bold underline break-all block"
                    >
                      www.seervisamajkonda.com/verify
                    </a>
                  </div>
                </div>

                {/* Center: Inspirational Samaj Quote */}
                <div className="px-2 py-1 text-center">
                  <span className="text-[#C85A17] font-serif text-lg leading-none block font-black">“</span>
                  <p className="text-xs font-black text-[#7A1C1C] leading-tight">
                    आपका सहयोग<br />
                    समाज के उज्जवल<br />
                    भविष्य की नींव है।
                  </p>
                  <span className="text-[#C85A17] font-serif text-lg leading-none block font-black text-right -mt-1">”</span>
                </div>

                {/* Right: Signatory / Generated By (Editable) */}
                <div className="flex flex-col items-center justify-center text-center relative group">
                  <div className="w-8 h-8 rounded-full bg-[#7A1C1C] flex items-center justify-center text-white mb-1 shadow-2xs">
                    <FiUser className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-[9px] text-[#64748B] font-semibold leading-tight">
                      रसीद जारीकर्ता <br />
                      <span className="text-[8px] text-gray-400 font-normal">(Generated By)</span>
                    </p>
                    {!isEditingAdmin && (
                      <button
                        type="button"
                        onClick={() => setIsEditingAdmin(true)}
                        className="no-print p-0.5 text-[#7A1C1C] hover:text-[#C85A17] hover:bg-amber-100/70 rounded transition-all cursor-pointer"
                        title="जारीकर्ता का नाम बदलें (Edit Signatory Name)"
                      >
                        <FiEdit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {isEditingAdmin ? (
                    <div className="no-print mt-1 flex flex-col items-center gap-1 z-20">
                      <input
                        type="text"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        placeholder="जारीकर्ता का नाम"
                        className="text-xs font-black text-[#1E293B] border-2 border-[#7A1C1C] bg-white rounded-lg px-2 py-0.5 text-center focus:outline-hidden focus:ring-2 focus:ring-[#7A1C1C] w-40 shadow-xs"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setIsEditingAdmin(false);
                          if (e.key === 'Escape') setIsEditingAdmin(false);
                        }}
                      />
                      <div className="flex items-center gap-1 mt-0.5">
                        <button
                          type="button"
                          onClick={() => setIsEditingAdmin(false)}
                          className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-[#7A1C1C] text-white text-[9px] font-bold rounded-md cursor-pointer hover:bg-[#5E1414] shadow-2xs"
                        >
                          <FiCheck className="w-2.5 h-2.5" /> ठीक है
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAdminName(donation?.created_by_name || donation?.collected_by_name || user?.name || 'चिराग भायल');
                            setIsEditingAdmin(false);
                          }}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-200 text-gray-700 text-[9px] font-medium rounded-md cursor-pointer hover:bg-gray-300"
                          title="डिफ़ॉल्ट नाम रीसेट करें"
                        >
                          <FiRotateCcw className="w-2.5 h-2.5" /> रीसेट
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsEditingAdmin(true)}
                      className="cursor-pointer group/name flex items-center justify-center gap-1 mt-0.5 px-2 py-0.5 rounded-lg hover:bg-amber-100/60 transition-colors"
                      title="नाम बदलने के लिए क्लिक करें (Click to edit name)"
                    >
                      <p className="text-sm font-black text-[#1E293B] leading-tight group-hover/name:text-[#7A1C1C] transition-colors">
                        {adminName}
                      </p>
                      <FiEdit2 className="no-print w-2.5 h-2.5 text-[#7A1C1C] opacity-0 group-hover/name:opacity-100 transition-opacity" />
                    </div>
                  )}

                  {/* Plain text fallback when printing or capturing PDF */}
                  {isEditingAdmin && (
                    <p className="hidden print:block text-sm font-black text-[#1E293B] leading-tight mt-0.5">
                      {adminName}
                    </p>
                  )}

                  <p className="text-[10px] text-[#64748B] font-bold leading-tight">
                    ({adminRole})
                  </p>
                  <p className="text-[10px] text-[#7A1C1C] font-black leading-tight mt-0.5">
                    श्री सीरवी समाज कोणदा
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Footer Ribbon with Contacts & Silhouette Graphic */}
            <div className="p-2 sm:p-2.5 bg-[#FFFDF8]">
              <div
                className="rounded-xl px-4 py-2.5 text-white shadow-md text-center"
                style={{
                  background: 'linear-gradient(135deg, #7A1C1C 0%, #8E211A 100%)',
                }}
              >
                {/* 3 Contact Pills (No cutoffs!) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] sm:text-[11px] font-bold">
                  <div className="bg-white/10 border border-white/20 rounded-full py-1 px-2.5 flex items-center justify-center gap-1 leading-tight">
                    <span>📍</span> ग्राम कोणदा, तहसील कुक्षी, जिला धार (मध्य प्रदेश)
                  </div>
                  <div className="bg-white/10 border border-white/20 rounded-full py-1 px-2.5 flex items-center justify-center gap-1 leading-tight">
                    <span>📞</span> 74705 18252, 96918 40096
                  </div>
                  <div className="bg-white/10 border border-white/20 rounded-full py-1 px-2.5 flex items-center justify-center gap-1 leading-tight">
                    <span>🌐</span> www.seervisamajkonda.com
                  </div>
                </div>

                {/* Bottom Graphic & Samaj Motto */}
                <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between text-[9px] sm:text-[10px] text-amber-200 font-bold px-1">
                  <span>| समाज की उन्नति में ही हमारी उन्नति है ||</span>

                  {/* Traditional Mandir & Camel Silhouette Graphic */}
                  <div className="flex items-center justify-center opacity-90 px-2">
                    <svg viewBox="0 0 100 22" className="h-5 w-auto fill-amber-300" aria-hidden="true">
                      {/* Mandir Kalash & Dome */}
                      <path d="M50 0 L53 6 L47 6 Z M47 6 Q50 3 53 6 L54 11 Q50 9 46 11 Z M44 11 L56 11 L56 22 L44 22 Z" />
                      {/* Sun behind */}
                      <circle cx="50" cy="8" r="7" fill="#FDE68A" opacity="0.4" />
                      {/* Desert Camel Silhouette */}
                      <path d="M68 22 L69 17 L72 15 Q75 14 77 15 L79 17 L81 16 Q83 14 84 11 L86 10 L87 12 L85 14 L83 18 L83 22 L81 22 L81 19 L77 19 L77 22 L75 22 L75 18 L70 18 L69 22 Z" />
                      {/* Fort / Temple Turret */}
                      <path d="M25 22 L25 14 L27 12 L29 14 L29 22 Z M20 22 L20 16 L22 15 L23 16 L23 22 Z" />
                    </svg>
                  </div>

                  <span>हमारा समाज हमारी पहचान</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Sticky Bottom Controls */}
        <div className="no-print shrink-0 px-5 py-3 bg-[#FFF8EC] border-t border-[#E8DCC8] flex flex-wrap justify-between items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#E8DCC8] hover:bg-[#FAF1E0] text-[#2B211B] font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            बंद करें (Close)
          </button>
          <div className="flex items-center gap-2">
            {/* Admin-only: PDF Download (bottom) */}
            {isAdmin && (
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <FiDownload className="w-4 h-4" /> {downloading ? 'डाउनलोड हो रहा...' : 'रसीद PDF डाउनलोड करें'}
              </button>
            )}
            {/* Admin-only: Print (bottom) */}
            {isAdmin && (
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#7A1C1C] to-[#C85A17] hover:shadow-md text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
              >
                <FiPrinter className="w-4 h-4" /> प्रिंट करें (Print)
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentReceiptModal;
