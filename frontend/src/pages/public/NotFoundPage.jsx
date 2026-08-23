import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <div className="text-8xl font-black text-orange-500 mb-4">404</div>
      <h1 className="text-3xl font-bold text-[#2B211B] mb-3">Page Not Found</h1>
      <p className="text-[#766A60] mb-8 max-w-md mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
      >
        <FiArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
    </motion.div>
  </div>
);

export default NotFoundPage;
