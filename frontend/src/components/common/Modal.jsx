import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className={`relative w-full ${sizes[size]} bg-white rounded-3xl shadow-2xl border border-[#E8DCC8] overflow-hidden z-10 my-8`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#E8DCC8] bg-gradient-to-r from-[#FFF8EC] to-white">
              <h2 className="text-base sm:text-lg font-black text-[#2B211B] tracking-tight">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-[#766A60] hover:text-[#7A2525] hover:bg-[#FFF8EC] transition cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            {/* Content */}
            <div className="overflow-y-auto max-h-[80vh] scrollbar-thin scrollbar-thumb-[#E8DCC8]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
