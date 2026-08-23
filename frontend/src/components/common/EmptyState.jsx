import { motion } from 'framer-motion';

const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {Icon && (
        <div className="w-20 h-20 rounded-2xl bg-[#FFF8EC]/60 flex items-center justify-center mb-5">
          <Icon className="w-10 h-10 text-[#CDBBA4] " />
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      {description && (
        <p className="text-[#766A60] max-w-md mb-6">{description}</p>
      )}
      {action && action}
    </motion.div>
  );
};

export default EmptyState;
