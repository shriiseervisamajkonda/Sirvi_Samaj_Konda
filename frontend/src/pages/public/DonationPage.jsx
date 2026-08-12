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
        color: '#10B981',
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
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 py-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiHeart className="w-8 h-8 animate-pulse text-red-200" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3">{t('donate_title')}</h1>
            <p className="text-green-100 text-lg font-medium">{t('donate_subtitle')}</p>
          </motion.div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        {!summaryLoading && summary && (
          <div className="grid grid-cols-2 gap-4 mb-10 max-w-lg mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 text-center shadow-sm">
              <p className="text-3xl font-extrabold text-green-600">₹{(summary.total || 0).toLocaleString('en-IN')}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mt-1 uppercase tracking-wider">{t('donate_collected')}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 text-center shadow-sm">
              <p className="text-3xl font-extrabold text-orange-500">{summary.count || 0}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-bold mt-1 uppercase tracking-wider">{t('donate_donors')}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Donation Form */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('donate_form_title')}</h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Quick amounts */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('donate_quick_select')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {amounts.map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setValue('amount', amt)}
                        className="px-3 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-green-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all cursor-pointer"
                      >
                        ₹{amt.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('donate_amount')} *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                    <input
                      {...register('amount', { required: 'Amount is required', min: { value: 1, message: 'Min ₹1' } })}
                      type="number"
                      placeholder={language === 'en' ? 'Enter amount' : 'राशि दर्ज करें'}
                      className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all font-semibold"
                    />
                  </div>
                  {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="anon" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="w-4 h-4 text-green-500 rounded" />
                  <label htmlFor="anon" className="text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer">{t('donate_anonymous')}</label>
                </div>

                {!isAnonymous && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('donate_donor_name')} *</label>
                      <div className="relative">
                        <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register('donorName', { required: !isAnonymous ? 'Name is required' : false })}
                          placeholder={t('donate_placeholder_name')}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all"
                        />
                      </div>
                      {errors.donorName && <p className="text-red-500 text-xs mt-1">{errors.donorName.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('contact_phone')}</label>
                        <div className="relative">
                          <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            {...register('phone')}
                            placeholder="+91..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('contact_email')}</label>
                        <div className="relative">
                          <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            {...register('email')}
                            type="email"
                            placeholder="email@..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('donate_purpose')}</label>
                  <select
                    {...register('purpose', { required: 'Please select purpose' })}
                    className="w-full py-2.5 px-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all font-medium"
                  >
                    <option value="">{t('donate_purpose_select')}</option>
                    {purposes.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('donate_msg')}</label>
                  <textarea
                    {...register('message')}
                    rows={3}
                    placeholder={t('donate_placeholder_msg')}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiHeart className="w-4 h-4" /> {t('donate_btn')}</>}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Recent Donors */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('donate_recent')}</h2>
            {recentDonors.length > 0 ? (
              <div className="space-y-3">
                {recentDonors.map((donor, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                      {donor.isAnonymous ? '🙏' : (donor.donorName?.charAt(0) || '🙏')}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {donor.isAnonymous ? (language === 'en' ? 'Anonymous Donor' : 'गुप्त दानदाता') : donor.donorName}
                      </p>
                      <p className="text-gray-500 text-sm font-medium">{donor.purpose}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">₹{donor.amount?.toLocaleString('en-IN')}</p>
                      <p className="text-gray-400 text-xs font-semibold">{new Date(donor.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
                <div className="text-4xl mb-3">🙏</div>
                <p className="text-sm font-medium">{t('donate_empty_donors')}</p>
              </div>
            )}

            {/* Bank Details */}
            <div className="mt-8 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-blue-700 dark:text-blue-400 mb-3">{t('donate_bank_title')}</h3>
              <div className="space-y-2 text-sm font-medium">
                {[
                  [t('donate_bank_name'), t('hero_title_1') + ' ' + t('hero_title_2') + ' ' + t('hero_title_3')],
                  [t('donate_bank_bank'), language === 'en' ? 'State Bank of India' : 'स्टेट बैंक ऑफ इंडिया (SBI)'],
                  [t('donate_bank_acc'), 'XXXX XXXX XXXX'],
                  [t('donate_bank_ifsc'), 'SBIN0XXXXXX'],
                  [t('donate_bank_branch'), language === 'en' ? 'Kukshi, Dhar' : 'कुक्षी, जिला धार'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{label}:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{value}</span>
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
