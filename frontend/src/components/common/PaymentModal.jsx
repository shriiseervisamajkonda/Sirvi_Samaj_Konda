import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiInfo, FiLock } from 'react-icons/fi';
import Modal from './Modal';

const PaymentModal = ({ isOpen, onClose, amount, onComplete }) => {
  return (
    <Modal isOpen={isOpen} onClose={() => onComplete('fail')} title="सुरक्षित भुगतान गेटवे (Payment Gateway Simulator)" size="md">
      <div className="p-6 space-y-6 text-center">
        {/* Banner */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-left flex items-start gap-3">
          <FiInfo className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-800 font-medium">
            <strong>सिम्युलेटर मोड सक्रिय है:</strong> बैकएंड में Razorpay API कीज कॉन्फ़िगर नहीं हैं। आप इस सिम्युलेटर का उपयोग करके पूरी दान प्रक्रिया का परीक्षण कर सकते हैं।
          </div>
        </div>

        {/* Amount */}
        <div>
          <p className="text-sm font-semibold text-[#766A60]">कुल भुगतान राशि (Payable Amount)</p>
          <h3 className="text-4xl font-extrabold text-[#2B211B] mt-1">
            ₹{amount?.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-[#CDBBA4] mt-2 flex items-center justify-center gap-1">
            <FiLock className="w-3.5 h-3.5 text-green-500" /> Secure 256-bit SSL Transaction
          </p>
        </div>

        {/* Simulation Buttons */}
        <div className="space-y-3 pt-4 border-t border-[#E8DCC8] ">
          <p className="text-xs font-bold text-[#CDBBA4] uppercase tracking-wider">भुगतान विकल्प सिमुलेट करें (Simulate Action)</p>
          
          <button
            type="button"
            onClick={() => onComplete('success')}
            className="w-full py-3 bg-green-600 text-white font-bold rounded-xl shadow-md hover:bg-green-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <FiCheckCircle className="w-5 h-5" />
            भुगतान सफल करें (Simulate Success)
          </button>

          <button
            type="button"
            onClick={() => onComplete('fail')}
            className="w-full py-3 bg-red-500 text-white font-bold rounded-xl shadow-md hover:bg-red-600 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <FiXCircle className="w-5 h-5" />
            भुगतान विफल करें (Simulate Failure)
          </button>
        </div>

        {/* Footer info */}
        <p className="text-xs text-[#CDBBA4]">
          यह केवल एक परीक्षण वातावरण (testing environment) है। कोई वास्तविक पैसा नहीं कटेगा।
        </p>
      </div>
    </Modal>
  );
};

export default PaymentModal;
