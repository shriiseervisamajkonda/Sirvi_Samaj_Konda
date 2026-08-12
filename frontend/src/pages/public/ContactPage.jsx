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
    { icon: FiMapPin, label: 'Address', value: 'Sirvi Samaj Dharmshala, Konda, Tehsil Kukshi, Dhar, MP 454335', href: null, color: 'bg-orange-500' },
    { icon: FiPhone, label: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210', color: 'bg-green-500' },
    { icon: FiMail, label: 'Email', value: 'contact@seervisamajkonda.org', href: 'mailto:contact@seervisamajkonda.org', color: 'bg-blue-500' },
  ];

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-700 py-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3">Contact Us</h1>
            <p className="text-orange-100 text-lg">Get in touch with the Shri Seervi Samaj Konda committee</p>
          </motion.div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Get In Touch</h2>

            <div className="space-y-4 mb-10">
              {contactInfo.map(({ icon: Icon, label, value, href, color }) => (
                <div key={label} className="flex gap-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                    {href ? (
                      <a href={href} className="text-gray-900 dark:text-white font-medium hover:text-orange-500 transition-colors">{value}</a>
                    ) : (
                      <p className="text-gray-900 dark:text-white font-medium">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl overflow-hidden h-64 border border-gray-200 dark:border-slate-700">
              <iframe
                title="Community Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3686.4!2d74.7!3d22.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDE4JzAwLjAiTiA3NMKwNDInMDAuMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                className="grayscale dark:contrast-75 dark:brightness-75"
              />
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send a Message</h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        {...register('name', { required: 'Name is required' })}
                        placeholder="Your name"
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all"
                      />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        {...register('phone')}
                        placeholder="+91..."
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } })}
                      type="email"
                      placeholder="your@email.com"
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subject</label>
                  <div className="relative">
                    <FiSend className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...register('subject')}
                      placeholder="What is this about?"
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message *</label>
                  <div className="relative">
                    <FiMessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'Min 10 characters' } })}
                      rows={5}
                      placeholder="Write your message here..."
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all resize-none"
                    />
                  </div>
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
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
