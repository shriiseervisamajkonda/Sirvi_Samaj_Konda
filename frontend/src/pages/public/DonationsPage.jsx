import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiSearch, FiCheckCircle, FiCopy, FiShield, FiFileText, FiAward } from 'react-icons/fi';
import { donationAPI } from '../../services/api';
import toast from 'react-hot-toast';

const DonationsPage = () => {
  const [receiptNumber, setReceiptNumber] = useState('');
  const [searching, setSearching] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [searched, setSearched] = useState(false);

  const donationPurposes = [
    {
      id: 'annual_chanda',
      title: 'वार्षिक सामाजिक चंदा',
      desc: 'प्रतिवर्ष परिवार स्तर पर समाज विकास एवं व्यवस्था हेतु अनिवार्य सदस्यता चंदा।',
      icon: '📜',
    },
    {
      id: 'aaiji_kosh',
      title: 'श्री आई जी सहायता कोष',
      desc: 'समाज के जरूरतमंद परिवारों, चिकित्सा सहायता एवं आपदा में सहयोग हेतु समर्पित कोष।',
      icon: '🤝',
    },
    {
      id: 'annapurna_bhavan',
      title: 'माँ अन्नपूर्णा भवन निर्माण कोष',
      desc: 'समाज धर्मशाला, सामुदायिक भवन एवं अतिथि कक्षों के निर्माण व संवर्धन हेतु।',
      icon: '🏛️',
    },
    {
      id: 'mandir_nirman',
      title: 'आई माताजी बडेर / मंदिर विकास',
      desc: 'श्री आई माताजी बडेर, अखंड ज्योति सेवा, पूजा-अर्चना व मंदिर परिसर विकास।',
      icon: '🪔',
    },
    {
      id: 'melava_utsav',
      title: 'वार्षिक मेला एवं सामाजिक उत्सव',
      desc: 'प्रतिवर्ष आयोजित होने वाले समाज मेलों, पदयात्रा, प्रतिभा सम्मान समारोह हेतु।',
      icon: '🎉',
    },
    {
      id: 'education_fund',
      title: 'शिक्षा प्रोत्साहन एवं छात्रवृत्ति',
      desc: 'समाज के होनहार विद्यार्थियों की उच्च शिक्षा, कोचिंग एवं प्रतिभा पुरस्कार योजना।',
      icon: '🎓',
    },
  ];

  const handleSearchReceipt = async (e) => {
    e.preventDefault();
    if (!receiptNumber.trim()) {
      toast.error('कृपया रसीद क्रमांक दर्ज करें');
      return;
    }
    setSearching(true);
    setSearched(true);
    try {
      const res = await donationAPI.getReceipt(receiptNumber.trim());
      if (res.data?.success && res.data.data) {
        setReceiptData(res.data.data);
        toast.success('रसीद सत्यापित!');
      } else {
        setReceiptData(null);
      }
    } catch {
      setReceiptData(null);
      toast.error('रसीद नहीं मिली या क्रमांक अमान्य है');
    } finally {
      setSearching(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} कॉपी हो गया!`);
  };

  return (
    <div className="bg-[#FFF8EC] min-h-screen text-[#2B211B]">
      {/* Header Banner */}
      <div className="relative py-20 text-white overflow-hidden border-b border-[#E8DCC8] bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]">
        <div className="absolute inset-0">
          <img src="/hero_background.webp" alt="Header Background" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-amber-200 text-xs font-bold uppercase tracking-wider mb-4 border border-white/30">
              पारदर्शिता • सेवा • समर्पण
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
              समाज दान एवं चंदा व्यवस्था
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-orange-100 font-medium leading-relaxed">
              श्री सीरवी समाज कोणदा के विकास, सामाजिक सहायता कोष एवं बडेर सेवा में अपना अमूल्य योगदान दें।
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Donation Purposes Grid */}
        <div>
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#7A2525]">दान एवं सहयोग के प्रमुख मद</h2>
            <p className="text-sm text-[#766A60] mt-1">समाज में विभिन्न सामाजिक, धार्मिक एवं शैक्षिक गतिविधियों हेतु समर्पित कोष</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donationPurposes.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white p-6 rounded-3xl border border-[#E8DCC8] hover:border-[#C9A44C]/60 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFF8EC] to-[#FAF1E0] border border-[#E8DCC8] flex items-center justify-center text-2xl mb-4 group-hover:scale-105 transition-transform">
                    {p.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#2B211B] mb-2 group-hover:text-[#C85A17] transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-sm text-[#766A60] leading-relaxed font-medium">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bank Details & QR Code Section */}
        <div className="bg-white rounded-3xl border border-[#E8DCC8] p-8 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div>
                <span className="inline-block px-3 py-1 bg-[#FFF8EC] text-[#C85A17] rounded-full text-xs font-bold border border-[#E8DCC8] mb-2">
                  आधिकारिक बैंक खाता
                </span>
                <h3 className="text-2xl font-extrabold text-[#7A2525]">बैंक एवं डिजिटल भुगतान विवरण</h3>
                <p className="text-sm text-[#766A60] mt-1">सीधे बैंक ट्रांसफर या यूपीआई के माध्यम से सहयोग राशि प्रेषित करें</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8] flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#766A60] font-semibold">खाता धारक का नाम (Account Name)</p>
                    <p className="font-bold text-[#2B211B] text-base">Shri Seervi Samaj Konda</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard('Shri Seervi Samaj Konda', 'खाता नाम')}
                    className="p-2 rounded-xl hover:bg-white text-[#C85A17] cursor-pointer"
                    title="कॉपी करें"
                  >
                    <FiCopy className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8] flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#766A60] font-semibold">बैंक एवं शाखा (Bank & Branch)</p>
                    <p className="font-bold text-[#2B211B] text-base">State Bank of India, Kukshi (Konda)</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8] flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#766A60] font-semibold">खाता संख्या (Account Number)</p>
                    <p className="font-mono font-bold text-[#7A2525] text-base">38492019482</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard('38492019482', 'खाता संख्या')}
                    className="p-2 rounded-xl hover:bg-white text-[#C85A17] cursor-pointer"
                    title="कॉपी करें"
                  >
                    <FiCopy className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8] flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#766A60] font-semibold">आईएफएससी कोड (IFSC Code)</p>
                    <p className="font-mono font-bold text-[#7A2525] text-base">SBIN0001234</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard('SBIN0001234', 'IFSC कोड')}
                    className="p-2 rounded-xl hover:bg-white text-[#C85A17] cursor-pointer"
                    title="कॉपी करें"
                  >
                    <FiCopy className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#7A2525] via-[#C85A17] to-[#7A2525] p-8 rounded-3xl text-white text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl mb-2">
                📱
              </div>
              <h4 className="text-2xl font-bold text-white">1-क्लिक UPI भुगतान</h4>
              <p className="text-orange-100 text-sm max-w-sm">
                Google Pay, PhonePe, Paytm अथवा किसी भी BHIM UPI ऐप द्वारा सीधे दान राशि भेजें।
              </p>
              <div className="p-4 bg-white rounded-2xl shadow-inner inline-block my-2">
                <div className="w-44 h-44 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-[#C85A17]/40 text-[#7A2525] font-bold text-sm">
                  <div className="text-center p-2">
                    <p className="text-2xl mb-1">🏦</p>
                    <p className="font-bold text-xs text-[#7A2525]">seervisamajkonda@sbi</p>
                    <p className="text-[10px] text-gray-500 mt-1">BHIM UPI QR Code</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-amber-200 font-semibold">
                भुगतान के उपरांत रसीद हेतु कोषाध्यक्ष अथवा व्यवस्थापक को स्क्रीनशॉट अवश्य भेजें।
              </p>
            </div>
          </div>
        </div>

        {/* Online Receipt Verification */}
        <div className="bg-white rounded-3xl border border-[#E8DCC8] p-8 shadow-md">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C85A17] to-[#C9A44C] flex items-center justify-center text-white mx-auto mb-3 shadow-md">
                <FiSearch className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-[#7A2525]">ऑनलाइन रसीद सत्यापन (Verify Receipt)</h3>
              <p className="text-sm text-[#766A60] mt-1">अपनी दान अथवा वार्षिक चंदा रसीद संख्या दर्ज करके विवरण सत्यापित करें</p>
            </div>

            <form onSubmit={handleSearchReceipt} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="उदा. KONDA-2026-0001 या रसीद क्रमांक"
                className="flex-1 px-5 py-3.5 rounded-2xl border border-[#E8DCC8] focus:outline-none focus:border-[#C85A17] bg-[#FFF8EC] text-sm font-semibold text-[#2B211B]"
              />
              <button
                type="submit"
                disabled={searching}
                className="px-8 py-3.5 bg-gradient-to-r from-[#C85A17] to-[#7A2525] text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all text-sm cursor-pointer disabled:opacity-50"
              >
                {searching ? 'सत्यापित हो रहा है...' : 'सत्यापित करें'}
              </button>
            </form>

            {searched && receiptData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl bg-[#FFF8EC] border border-[#E8DCC8] text-left space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#E8DCC8]">
                  <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                    <FiCheckCircle className="w-5 h-5" /> सत्यापित अधिकृत रसीद
                  </div>
                  <span className="font-mono text-xs font-bold text-[#7A2525]">{receiptData.receipt_number}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-[#766A60] block font-semibold">दानदाता का नाम:</span>
                    <span className="font-bold text-[#2B211B]">{receiptData.donor_name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#766A60] block font-semibold">राशि (Amount):</span>
                    <span className="font-extrabold text-[#C85A17] text-base">₹{Number(receiptData.amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#766A60] block font-semibold">मद / उद्देश्य:</span>
                    <span className="font-bold text-[#2B211B]">{receiptData.purpose}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#766A60] block font-semibold">वित्तीय वर्ष / दिनांक:</span>
                    <span className="font-bold text-[#2B211B]">{receiptData.financial_year} ({receiptData.payment_date})</span>
                  </div>
                </div>
              </motion.div>
            )}

            {searched && !receiptData && !searching && (
              <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
                इस क्रमांक से कोई सत्यापित रसीद प्राप्त नहीं हुई। कृपया क्रमांक की जांच करें।
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationsPage;
