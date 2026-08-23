import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, color = 'primary', delay = 0 }) => {
  const colors = {
    primary: 'from-primary/20 to-primary/5 text-primary',
    secondary: 'from-secondary/20 to-secondary/5 text-secondary',
    accent: 'from-accent/20 to-accent/5 text-accent',
    orange: 'from-orange-500/20 to-orange-500/5 text-orange-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-2xl p-6 card-hover "
    >
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colors[color]} mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-2xl md:text-3xl font-bold text-[#2B211B] ">{value}</p>
      <p className="text-sm text-[#766A60] mt-1">{label}</p>
    </motion.div>
  );
};

export default StatCard;
