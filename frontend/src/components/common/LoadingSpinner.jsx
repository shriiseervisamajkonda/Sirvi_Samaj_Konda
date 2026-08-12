const LoadingSpinner = ({ fullPage = false, size = 'md' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} border-4 border-orange-100 dark:border-slate-700 border-t-orange-500 rounded-full animate-spin`}
      />
      <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Loading...</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
