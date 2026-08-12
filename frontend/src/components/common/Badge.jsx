const Badge = ({ children, variant = 'default', size = 'sm' }) => {
  const variants = {
    default: 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300',
    primary: 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400',
    success: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400',
    danger: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',
    warning: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
    info: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400',
  };

  const sizes = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};

export default Badge;
