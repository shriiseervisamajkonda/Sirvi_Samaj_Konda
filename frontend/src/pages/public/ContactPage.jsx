import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPhone, FiMail, FiMapPin, FiSend, FiUser, FiMessageSquare } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { contactAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await contactAPI.submit(data);
      toast.success('Message sent! We will get back to you soon. 🙏');
      reset();
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: FiMapPin, label: 'Address', value: 'Sirvi Samaj Dharmshala, Konda, Tehsil Kukshi, Dhar, MP 454335', href: null, color: 'from-[#C85A17] to-[#D4AF37]' },
    { icon: FiPhone, label: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210', color: 'from-[#C85A17] to-[#E27620]' },
    { icon: FiMail, label: 'Email', value: 'contact@seervisamajkonda.org', href: 'mailto:contact@seervisamajkonda.org', color: 'from-[#7A2525] to-[#C85A17]' },
  ];

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
            <span className="inline-block px-4 py-1.5 bg-white/10 border border-[#D4AF37]/35 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              संपर्क सूत्र
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3">संपर्क करें (Contact Us)</h1>
            <p className="text-[#FFF3DD] text-lg font-medium opacity-90">श्री सिर्वी समाज कोणदा कार्यकारिणी समिति से संवाद स्थापित करें</p>
          </motion.div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold text-[#FFF3DD] mb-8 border-b border-[#D4AF37]/10 pb-4">संपर्क सूत्र (Get In Touch)</h2>

            <div className="space-y-4 mb-10">
              {contactInfo.map(({ icon: Icon, label, value, href, color }) => (
                <div key={label} className="flex gap-4 p-5 bg-[#2A1010] rounded-2xl border border-[#D4AF37]/15 hover:border-[#D4AF37]/35 transition-all shadow-lg">
                  <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#C85A17] uppercase tracking-wider mb-1">{label}</p>
                    {href ? (
                      <a href={href} className="text-[#FFF3DD] font-semibold hover:text-[#D4AF37] transition-colors break-words">{value}</a>
                    ) : (
                      <p className="text-[#FFF3DD] font-semibold break-words">{value.replace(/Konda/g, 'कोणदा')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="bg-[#2A1010] rounded-3xl overflow-hidden h-64 border border-[#D4AF37]/15 shadow-xl">
              <iframe
                title="Community Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3686.4!2d74.7!3d22.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDE4JzAwLjAiTiA3NMKwNDInMDAuMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                className="grayscale "
              />
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="bg-[#2A1010] rounded-3xl p-8 border border-[#D4AF37]/15 shadow-xl">
              <h2 className="text-2xl font-bold text-[#FFF3DD] mb-6 border-b border-[#D4AF37]/10 pb-4">संदेश भेजें (Send a Message)</h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#FFF3DD] mb-1.5">पूरा नाम (Full Name) *</label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CDBBA4]" />
                      <input
                        {...register('name', { required: 'Name is required' })}
                        placeholder="नाम दर्ज करें"
                        className="w-full pl-9 pr-4 py-2.5 bg-[#160D08] border border-[#D4AF37]/15 rounded-xl text-sm text-[#FFF3DD] placeholder-[#CDBBA4]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all"
                      />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#FFF3DD] mb-1.5">फ़ोन नंबर (Phone)</label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CDBBA4]" />
                      <input
                        {...register('phone')}
                        placeholder="+91..."
                        className="w-full pl-9 pr-4 py-2.5 bg-[#160D08] border border-[#D4AF37]/15 rounded-xl text-sm text-[#FFF3DD] placeholder-[#CDBBA4]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#FFF3DD] mb-1.5">ईमेल (Email) *</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CDBBA4]" />
                    <input
                      {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } })}
                      type="email"
                      placeholder="email@example.com"
                      className="w-full pl-9 pr-4 py-2.5 bg-[#160D08] border border-[#D4AF37]/15 rounded-xl text-sm text-[#FFF3DD] placeholder-[#CDBBA4]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#FFF3DD] mb-1.5">विषय (Subject)</label>
                  <div className="relative">
                    <FiSend className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CDBBA4]" />
                    <input
                      {...register('subject')}
                      placeholder="किस बारे में है?"
                      className="w-full pl-9 pr-4 py-2.5 bg-[#160D08] border border-[#D4AF37]/15 rounded-xl text-sm text-[#FFF3DD] placeholder-[#CDBBA4]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#FFF3DD] mb-1.5">संदेश (Message) *</label>
                  <div className="relative">
                    <FiMessageSquare className="absolute left-3 top-3 w-4 h-4 text-[#CDBBA4]" />
                    <textarea
                      {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'Min 10 characters' } })}
                      rows={5}
                      placeholder="अपना संदेश यहाँ लिखें..."
                      className="w-full pl-9 pr-4 py-2.5 bg-[#160D08] border border-[#D4AF37]/15 rounded-xl text-sm text-[#FFF3DD] placeholder-[#CDBBA4]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all resize-none"
                    />
                  </div>
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#C85A17] text-white font-bold rounded-xl shadow-lg hover:bg-[#E27620] cursor-pointer transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiSend className="w-4 h-4" /> Send Message</>}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
