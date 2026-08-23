const Badge = ({ children, variant = 'default', size = 'sm' }) => {
  const variants = {
    default: 'bg-[#FFF8EC]/60 text-[#2B211B] ',
    primary: 'bg-orange-100 text-orange-600 ',
    success: 'bg-green-100 text-green-700 ',
    danger: 'bg-red-100 text-red-700 ',
    warning: 'bg-yellow-100 text-yellow-700 ',
    info: 'bg-blue-100 text-blue-700 ',
    purple: 'bg-purple-100 text-purple-700 ',
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
