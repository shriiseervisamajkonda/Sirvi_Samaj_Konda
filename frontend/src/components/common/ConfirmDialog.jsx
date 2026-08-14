import { FiAlertTriangle } from 'react-icons/fi';
import Modal from './Modal';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'क्या आप सुनिश्चित हैं?',
  message,
  confirmText = 'हटाएँ (Delete)',
  cancelText = 'रद्द करें (Cancel)',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center shrink-0 text-red-600 shadow-xs">
            <FiAlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-[#2B211B] leading-relaxed pt-1">
            {message || 'यह कार्य पूर्ववत नहीं किया जा सकता। क्या आप आगे बढ़ना चाहते हैं?'}
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-[#E8DCC8]">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-[#766A60] bg-white border border-[#E8DCC8] rounded-2xl hover:bg-[#FFF8EC] transition cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
