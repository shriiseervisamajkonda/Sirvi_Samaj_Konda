import { useEffect } from 'react';
import { motion } from 'framer-motion';

const PageHeader = ({ title, subtitle, badge }) => {
  useEffect(() => {
    if (title) {
      document.title = `${title} — Shri Seervi Samaj Konda`;
    }
  }, [title]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {badge && (
        <span className="inline-block px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full mb-3">
          {badge}
        </span>
      )}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-gray-600 dark:text-gray-400 text-lg">{subtitle}</p>
      )}
    </motion.div>
  );
};

export default PageHeader;
