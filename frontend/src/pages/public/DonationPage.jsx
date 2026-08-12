import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { donationAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';
import PaymentModal from '../../components/common/PaymentModal';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const DonationPage = () => {
  const [summary, setSummary] = useState(null);
  const [recentDonors, setRecentDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const { t, language } = useLanguage();

  useEffect(() => {
    donationAPI.getPublicSummary()
      .then(res => {
        setSummary(res.data.data);
        setRecentDonors(res.data.data?.recent || []);
      })
      .catch(console.error)
      .finally(() => setSummaryLoading(false));
  }, []);

  const handleRazorpayPayment = async (orderData) => {
    const res = await loadRazorpayScript();
    if (!res) {
      toast.error('Razorpay SDK failed to load. Are you offline?');
      setLoading(false);
      return;
    }

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: 'INR',
      name: 'Shri Seervi Samaj Konda',
      description: 'Community Donation / सहायता कोष',
      order_id: orderData.orderId,
      handler: async (response) => {
        setLoading(true);
        try {
          const verifyRes = await donationAPI.verifyPayment({
            donationId: orderData.donationId,
            orderId: orderData.orderId,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            mode: 'live',
          });
          if (verifyRes.data.success) {
            toast.success(language === 'en' ? 'Thank you! Donation completed successfully. 🙏' : 'धन्यवाद! दान सफलतापूर्वक प्राप्त हुआ। 🙏');
            reset();
            // Refresh stats
            donationAPI.getPublicSummary().then(sRes => {
              setSummary(sRes.data.data);
              setRecentDonors(sRes.data.data?.recent || []);
            });
          } else {
            toast.error('Payment verification failed.');
          }
        } catch {
          toast.error('Error verifying payment.');
        } finally {
          setLoading(false);
        }
      },
      prefill: {
        name: orderData.donorName,
      },
      theme: {
        color: '#C85A17',
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
        }
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const handleSimulatorComplete = async (status) => {
    setShowSimulator(false);
    setLoading(true);
    try {
      const verifyRes = await donationAPI.verifyPayment({
        donationId: paymentData.donationId,
        orderId: paymentData.orderId,
        paymentId: `mock_pay_${Date.now()}`,
        mode: 'simulator',
        status,
      });

      if (verifyRes.data.success) {
        toast.success(language === 'en' ? 'Thank you! Donation completed successfully (Simulated). 🙏' : 'धन्यवाद! सिम्युलेटेड दान सफलतापूर्वक प्राप्त हुआ। 🙏');
        reset();
        // Refresh stats
        donationAPI.getPublicSummary().then(sRes => {
          setSummary(sRes.data.data);
          setRecentDonors(sRes.data.data?.recent || []);
        });
      } else {
        toast.error(language === 'en' ? 'Simulated payment failed.' : 'सिम्युलेटेड भुगतान विफल रहा।');
      }
    } catch {
      toast.error('Error finishing simulated transaction.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const orderRes = await donationAPI.createOrder({
        ...data,
        isAnonymous,
      });

      const orderData = orderRes.data;
      if (orderData.success) {
        setPaymentData(orderData);
        if (orderData.mode === 'live') {
          await handleRazorpayPayment(orderData);
        } else {
          setShowSimulator(true);
        }
      } else {
        toast.error('Failed to create donation order.');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to initiate donation.');
      setLoading(false);
    }
  };

  const purposes = language === 'en' 
    ? ['General Fund', 'Community Center', 'Education Fund', 'Health Camp', 'Festival Celebration', 'Emergency Relief', 'Other']
    : ['सामान्य कोष (General Fund)', 'सामुदायिक धर्मशाला (Dharmshala)', 'शिक्षा कोष (Education)', 'स्वास्थ्य शिविर (Health Camp)', 'धार्मिक उत्सव (Festivals)', 'आपातकालीन राहत (Emergency)', 'अन्य (Other)'];
    
  const amounts = [100, 251, 501, 1001, 2001, 5001];

  return (
    <div className="bg-[#160D08] min-h-screen text-[#FFF3DD]">
      {/* Header Banner */}
      <div className="relative py-20 text-white overflow-hidden border-b border-[#D4AF37]/20">
        {/* Background image overlay */}
        <div className="absolute inset-0">
          <img src="/hero_background.webp" alt="Header Background" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 bg-white/10 border border-[#D4AF37]/35 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiHeart className="w-8 h-8 animate-pulse text-red-400" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3">{t('donate_title')}</h1>
            <p className="text-[#FFF3DD] text-lg font-medium opacity-90">{t('donate_subtitle')}</p>
          </motion.div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        {!summaryLoading && summary && (
          <div className="grid grid-cols-2 gap-4 mb-10 max-w-lg mx-auto">
            <div className="bg-[#2A1010] rounded-2xl p-6 border border-[#D4AF37]/15 text-center shadow-lg">
              <p className="text-3xl font-extrabold text-[#D4AF37]">₹{(summary.total || 0).toLocaleString('en-IN')}</p>
              <p className="text-[#CDBBA4] text-xs font-bold mt-1 uppercase tracking-wider">{t('donate_collected')}</p>
            </div>
            <div className="bg-[#2A1010] rounded-2xl p-6 border border-[#D4AF37]/15 text-center shadow-lg">
              <p className="text-3xl font-extrabold text-[#C85A17]">{summary.count || 0}</p>
              <p className="text-[#CDBBA4] text-xs font-bold mt-1 uppercase tracking-wider">{t('donate_donors')}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Donation Form */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="bg-[#2A1010] rounded-3xl p-8 border border-[#D4AF37]/15 shadow-xl">
              <h2 className="text-2xl font-bold text-[#FFF3DD] mb-6 border-b border-[#D4AF37]/10 pb-4">{t('donate_form_title')}</h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Quick amounts */}
                <div>
                  <label className="block text-sm font-semibold text-[#FFF3DD] mb-2">{t('donate_quick_select')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {amounts.map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setValue('amount', amt)}
                        className="px-3 py-2.5 border border-[#D4AF37]/15 bg-[#160D08] rounded-xl text-sm font-bold text-[#CDBBA4] hover:border-[#C85A17] hover:text-[#D4AF37] hover:bg-[#7A2525]/10 transition-all cursor-pointer"
                      >
                        ₹{amt.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#FFF3DD] mb-1.5">{t('donate_amount')} *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#CDBBA4] font-bold">₹</span>
                    <input
                      {...register('amount', { required: 'Amount is required', min: { value: 1, message: 'Min ₹1' } })}
                      type="number"
                      placeholder={language === 'en' ? 'Enter amount' : 'राशि दर्ज करें'}
                      className="w-full pl-8 pr-4 py-2.5 bg-[#160D08] border border-[#D4AF37]/15 rounded-xl text-[#FFF3DD] placeholder-[#CDBBA4]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all font-semibold"
                    />
                  </div>
                  {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="anon" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="w-4 h-4 text-[#C85A17] bg-[#160D08] border-[#D4AF37]/15 rounded" />
                  <label htmlFor="anon" className="text-sm font-semibold text-[#CDBBA4] cursor-pointer">{t('donate_anonymous')}</label>
                </div>

                {!isAnonymous && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[#FFF3DD] mb-1.5">{t('donate_donor_name')} *</label>
                      <div className="relative">
                        <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CDBBA4]" />
                        <input
                          {...register('donorName', { required: !isAnonymous ? 'Name is required' : false })}
                          placeholder={t('donate_placeholder_name')}
                          className="w-full pl-10 pr-4 py-2.5 bg-[#160D08] border border-[#D4AF37]/15 rounded-xl text-sm text-[#FFF3DD] placeholder-[#CDBBA4]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all"
                        />
                      </div>
                      {errors.donorName && <p className="text-red-500 text-xs mt-1">{errors.donorName.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#FFF3DD] mb-1.5">{t('contact_phone')}</label>
                        <div className="relative">
                          <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CDBBA4]" />
                          <input
                            {...register('phone')}
                            placeholder="+91..."
                            className="w-full pl-10 pr-4 py-2.5 bg-[#160D08] border border-[#D4AF37]/15 rounded-xl text-sm text-[#FFF3DD] placeholder-[#CDBBA4]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#FFF3DD] mb-1.5">{t('contact_email')}</label>
                        <div className="relative">
                          <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CDBBA4]" />
                          <input
                            {...register('email')}
                            type="email"
                            placeholder="email@..."
                            className="w-full pl-10 pr-4 py-2.5 bg-[#160D08] border border-[#D4AF37]/15 rounded-xl text-sm text-[#FFF3DD] placeholder-[#CDBBA4]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold text-[#FFF3DD] mb-1.5">{t('donate_purpose')}</label>
                  <select
                    {...register('purpose', { required: 'Please select purpose' })}
                    className="w-full py-2.5 px-4 bg-[#160D08] border border-[#D4AF37]/15 rounded-xl text-sm text-[#FFF3DD] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all font-semibold"
                  >
                    <option value="">{t('donate_purpose_select')}</option>
                    {purposes.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#FFF3DD] mb-1.5">{t('donate_msg')}</label>
                  <textarea
                    {...register('message')}
                    rows={3}
                    placeholder={t('donate_placeholder_msg')}
                    className="w-full px-4 py-2.5 bg-[#160D08] border border-[#D4AF37]/15 rounded-xl text-sm text-[#FFF3DD] placeholder-[#CDBBA4]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#C85A17] text-white font-bold rounded-xl shadow-lg hover:bg-[#E27620] cursor-pointer transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiHeart className="w-4 h-4" /> {t('donate_btn')}</>}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Recent Donors */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold text-[#FFF3DD] mb-6 border-b border-[#D4AF37]/10 pb-4">{t('donate_recent')}</h2>
            {recentDonors.length > 0 ? (
              <div className="space-y-3">
                {recentDonors.map((donor, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-[#2A1010] rounded-2xl border border-[#D4AF37]/15 shadow-lg">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C85A17] to-[#D4AF37] flex items-center justify-center text-white font-bold">
                      {donor.isAnonymous ? '🙏' : (donor.donorName?.charAt(0) || '🙏')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#FFF3DD] truncate">
                        {donor.isAnonymous ? (language === 'en' ? 'Anonymous Donor' : 'गुप्त दानदाता') : donor.donorName}
                      </p>
                      <p className="text-[#CDBBA4] text-sm font-semibold truncate">{donor.purpose}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-[#D4AF37] text-lg">₹{donor.amount?.toLocaleString('en-IN')}</p>
                      <p className="text-[#CDBBA4]/70 text-xs font-bold">{new Date(donor.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-[#CDBBA4] border border-dashed border-[#D4AF37]/10 rounded-2xl">
                <div className="text-4xl mb-3">🙏</div>
                <p className="text-sm font-medium">{t('donate_empty_donors')}</p>
              </div>
            )}

            {/* Bank Details */}
            <div className="mt-8 bg-[#2A1010]/60 border border-[#D4AF37]/15 rounded-2xl p-6 shadow-lg">
              <h3 className="font-bold text-[#D4AF37] mb-4 text-base border-b border-[#D4AF37]/10 pb-2">{t('donate_bank_title')}</h3>
              <div className="space-y-3 text-sm font-semibold text-[#CDBBA4]">
                {[
                  [t('donate_bank_name'), t('hero_title_1') + ' ' + t('hero_title_2') + ' ' + t('hero_title_3')],
                  [t('donate_bank_bank'), language === 'en' ? 'State Bank of India' : 'स्टेट बैंक ऑफ इंडिया (SBI)'],
                  [t('donate_bank_acc'), 'XXXX XXXX XXXX'],
                  [t('donate_bank_ifsc'), 'SBIN0XXXXXX'],
                  [t('donate_bank_branch'), language === 'en' ? 'Kukshi, Dhar' : 'कुक्षी, जिला धार'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-[#D4AF37]/5 pb-2 last:border-none last:pb-0">
                    <span className="opacity-80">{label}:</span>
                    <span className="font-bold text-[#FFF3DD]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <PaymentModal
        isOpen={showSimulator}
        amount={paymentData ? paymentData.amount / 100 : 0}
        onComplete={handleSimulatorComplete}
      />
    </div>
  );
};

export default DonationPage;
