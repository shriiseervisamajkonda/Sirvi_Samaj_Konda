import React from 'react';

/**
 * Base Skeleton building block with accessible aria attributes.
 */
export const Skeleton = ({
  variant = 'rectangular', // 'text' | 'circular' | 'rectangular' | 'rounded'
  width,
  height,
  className = '',
  style = {},
  animation = 'pulse', // 'pulse' | 'shimmer' | 'none'
  ...props
}) => {
  const variantClasses = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-2xl',
  };

  const animClass =
    animation === 'pulse'
      ? 'animate-pulse'
      : animation === 'shimmer'
      ? 'animate-shimmer'
      : '';

  const inlineStyles = {
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    ...style,
  };

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading..."
      className={`bg-gray-200 dark:bg-slate-700/50 ${variantClasses[variant] || ''} ${animClass} ${className}`}
      style={inlineStyles}
      {...props}
    />
  );
};

/**
 * SkeletonText: Lines of text placeholder
 */
export const SkeletonText = ({
  lines = 3,
  widths = [],
  className = '',
  size = 'md', // 'sm' | 'md' | 'lg'
}) => {
  const heightMap = { sm: 'h-3', md: 'h-4', lg: 'h-5' };
  const hClass = heightMap[size] || 'h-4';

  return (
    <div className={`space-y-2.5 w-full ${className}`}>
      {Array.from({ length: lines }).map((_, i) => {
        const w = widths[i] || (i === lines - 1 && lines > 1 ? '60%' : '100%');
        return <Skeleton key={i} variant="text" width={w} className={hClass} />;
      })}
    </div>
  );
};

/**
 * SkeletonTitle: Heading text placeholder
 */
export const SkeletonTitle = ({ className = '', width = '50%' }) => (
  <Skeleton variant="text" width={width} className={`h-7 sm:h-8 mb-4 ${className}`} />
);

/**
 * SkeletonAvatar: Circular avatar placeholder
 */
export const SkeletonAvatar = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };
  const sizeClass = sizeMap[size] || (typeof size === 'string' ? size : 'w-12 h-12');
  return <Skeleton variant="circular" className={`${sizeClass} shrink-0 ${className}`} />;
};

/**
 * SkeletonButton: Button placeholder
 */
export const SkeletonButton = ({ size = 'md', className = '', width }) => {
  const heightMap = { sm: 'h-8', md: 'h-10', lg: 'h-12' };
  const hClass = heightMap[size] || 'h-10';
  return <Skeleton variant="rounded" width={width || '100px'} className={`${hClass} ${className}`} />;
};

/**
 * SkeletonCard: Card placeholder matching public & admin directory cards
 */
export const SkeletonCard = ({ hasImage = true, className = '' }) => (
  <div className={`bg-white dark:bg-[#2A1010] rounded-2xl p-5 border border-gray-100 dark:border-[#D4AF37]/15 shadow-sm space-y-4 ${className}`}>
    {hasImage && <Skeleton variant="rounded" className="w-full h-44 sm:h-48" />}
    <div className="flex items-center gap-3">
      <SkeletonAvatar size="md" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton variant="text" width="70%" className="h-4" />
        <Skeleton variant="text" width="40%" className="h-3" />
      </div>
    </div>
    <SkeletonText lines={2} size="sm" />
    <div className="pt-2 border-t border-gray-100 dark:border-[#D4AF37]/10 flex justify-between items-center">
      <Skeleton variant="text" width="30%" className="h-3" />
      <SkeletonButton size="sm" width="80px" />
    </div>
  </div>
);

/**
 * SkeletonCardGrid: Grid of cards
 */
export const SkeletonCardGrid = ({ count = 6, cols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' }) => (
  <div className={`grid ${cols} gap-6`}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

/**
 * SkeletonTable: Realistic Table Skeleton
 */
export const SkeletonTable = ({
  rows = 5,
  columns = 5,
  hasHeader = true,
  className = '',
}) => {
  const colCount = typeof columns === 'number' ? columns : columns?.length || 5;

  return (
    <div className={`bg-white dark:bg-[#2A1010] rounded-2xl border border-gray-100 dark:border-slate-700/60 overflow-hidden shadow-sm ${className}`}>
      {/* Header action bar */}
      <div className="p-4 border-b border-gray-100 dark:border-slate-700/60 flex items-center justify-between gap-4">
        <Skeleton variant="text" width="160px" className="h-5" />
        <div className="flex items-center gap-3">
          <Skeleton variant="rounded" width="200px" className="h-9" />
          <SkeletonButton size="sm" width="100px" />
        </div>
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {hasHeader && (
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-700/60">
                {Array.from({ length: colCount }).map((_, i) => (
                  <th key={i} className="px-4 py-3.5 text-left">
                    <Skeleton variant="text" width={`${40 + (i % 3) * 20}%`} className="h-3.5" />
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                {Array.from({ length: colCount }).map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-3.5">
                    {colIndex === 0 ? (
                      <div className="flex items-center gap-3">
                        <SkeletonAvatar size="sm" />
                        <Skeleton variant="text" width="120px" className="h-4" />
                      </div>
                    ) : colIndex === colCount - 1 ? (
                      <div className="flex gap-2">
                        <Skeleton variant="rounded" width="28px" height="28px" />
                        <Skeleton variant="rounded" width="28px" height="28px" />
                      </div>
                    ) : (
                      <Skeleton variant="text" width={`${50 + ((rowIndex + colIndex) % 4) * 12}%`} className="h-4" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * SkeletonList: List item skeleton
 */
export const SkeletonList = ({ items = 4, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 p-4 bg-white dark:bg-[#2A1010] rounded-2xl border border-gray-100 dark:border-slate-700/50"
      >
        <SkeletonAvatar size="md" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" className="h-4" />
          <Skeleton variant="text" width="40%" className="h-3" />
        </div>
        <Skeleton variant="rounded" width="70px" height="28px" />
      </div>
    ))}
  </div>
);

/**
 * SkeletonImage: Image skeleton placeholder
 */
export const SkeletonImage = ({ aspectRatio = 'aspect-video', className = '' }) => (
  <div className={`relative overflow-hidden bg-gray-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center ${aspectRatio} ${className}`}>
    <Skeleton variant="rectangular" className="w-full h-full" />
    <svg className="w-10 h-10 text-gray-300 dark:text-slate-600 absolute" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
);

/**
 * SkeletonImageGrid: Image gallery grid skeleton
 */
export const SkeletonImageGrid = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="space-y-3 bg-white dark:bg-[#2A1010] p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50">
        <SkeletonImage aspectRatio="aspect-video" />
        <Skeleton variant="text" width="80%" className="h-4" />
        <Skeleton variant="text" width="40%" className="h-3" />
      </div>
    ))}
  </div>
);

/**
 * SkeletonChart: Bar / Line chart placeholder
 */
export const SkeletonChart = ({ height = 'h-64', className = '' }) => (
  <div className={`bg-white dark:bg-[#2A1010] rounded-2xl p-6 border border-gray-100 dark:border-slate-700/60 space-y-4 ${className}`}>
    <div className="flex justify-between items-center mb-4">
      <Skeleton variant="text" width="40%" className="h-5" />
      <Skeleton variant="rounded" width="100px" className="h-8" />
    </div>
    <div className={`flex items-end justify-between gap-3 ${height} pt-6 pb-2 border-b border-gray-100 dark:border-slate-700/50`}>
      {[40, 70, 45, 90, 60, 80, 55, 100, 75, 50, 85, 65].map((h, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
          <Skeleton variant="rounded" width="100%" height={`${h}%`} />
        </div>
      ))}
    </div>
    <div className="flex justify-between text-xs pt-2">
      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((m, i) => (
        <Skeleton key={i} variant="text" width="24px" className="h-3" />
      ))}
    </div>
  </div>
);

/**
 * SkeletonForm: Skeleton form inputs & buttons
 */
export const SkeletonForm = ({ fields = 4, className = '' }) => (
  <div className={`space-y-5 bg-white dark:bg-[#2A1010] p-6 rounded-2xl border border-gray-100 dark:border-slate-700/60 ${className}`}>
    <SkeletonTitle width="40%" />
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton variant="text" width="30%" className="h-3.5" />
        <Skeleton variant="rounded" className="w-full h-10" />
      </div>
    ))}
    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700/50">
      <SkeletonButton size="md" width="90px" />
      <SkeletonButton size="md" width="120px" />
    </div>
  </div>
);

/**
 * SkeletonDashboard: Full Admin Dashboard Skeleton
 */
export const SkeletonDashboard = () => (
  <div className="space-y-8 animate-fadeIn" role="status" aria-busy="true" aria-label="Loading dashboard...">
    {/* Welcome Header */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#2A1010] p-6 rounded-2xl border border-gray-100 dark:border-slate-700/60">
      <div className="space-y-2">
        <Skeleton variant="text" width="240px" className="h-7" />
        <Skeleton variant="text" width="320px" className="h-4" />
      </div>
      <SkeletonButton size="md" width="140px" />
    </div>

    {/* Stat Cards Grid */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-[#2A1010] p-5 rounded-2xl border border-gray-100 dark:border-slate-700/60 space-y-3">
          <SkeletonAvatar size="md" />
          <Skeleton variant="text" width="50%" className="h-7" />
          <Skeleton variant="text" width="70%" className="h-3.5" />
        </div>
      ))}
    </div>

    {/* Charts & Activity */}
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <SkeletonChart height="h-72" />
      </div>
      <div className="bg-white dark:bg-[#2A1010] p-6 rounded-2xl border border-gray-100 dark:border-slate-700/60 space-y-4">
        <SkeletonTitle width="50%" />
        <SkeletonList items={5} />
      </div>
    </div>

    {/* Recent Table */}
    <SkeletonTable rows={5} columns={5} />
  </div>
);

/**
 * SkeletonHomePage: Public Home Page Skeleton
 */
export const SkeletonHomePage = () => (
  <div className="space-y-16 py-8" role="status" aria-busy="true" aria-label="Loading page...">
    {/* Hero Skeleton */}
    <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center py-12">
      <div className="space-y-6">
        <Skeleton variant="rounded" width="160px" className="h-7" />
        <Skeleton variant="text" width="90%" className="h-12" />
        <Skeleton variant="text" width="75%" className="h-10" />
        <SkeletonText lines={3} />
        <div className="flex gap-4 pt-4">
          <SkeletonButton size="lg" width="140px" />
          <SkeletonButton size="lg" width="140px" />
        </div>
      </div>
      <SkeletonImage aspectRatio="aspect-video" className="h-80" />
    </div>

    {/* Stat Cards */}
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[#2A1010] p-6 rounded-2xl border border-[#D4AF37]/15 space-y-3 text-center">
            <SkeletonAvatar size="md" className="mx-auto" />
            <Skeleton variant="text" width="60%" className="h-7 mx-auto" />
            <Skeleton variant="text" width="80%" className="h-3.5 mx-auto" />
          </div>
        ))}
      </div>
    </div>

    {/* Content Cards Section */}
    <div className="max-w-7xl mx-auto px-4">
      <SkeletonCardGrid count={6} />
    </div>
  </div>
);

/**
 * SkeletonPage: Generic Public Page Skeleton with header banner & layout
 */
export const SkeletonPage = () => (
  <div className="min-h-screen bg-[#160D08] py-12" role="status" aria-busy="true" aria-label="Loading content...">
    <div className="max-w-7xl mx-auto px-4 space-y-10">
      {/* Page Header Banner Skeleton */}
      <div className="bg-[#2A1010] p-8 sm:p-12 rounded-3xl border border-[#D4AF37]/20 text-center space-y-4">
        <Skeleton variant="rounded" width="140px" className="h-6 mx-auto" />
        <Skeleton variant="text" width="60%" className="h-9 sm:h-11 mx-auto" />
        <Skeleton variant="text" width="40%" className="h-4 mx-auto" />
      </div>

      {/* Grid Content Skeleton */}
      <SkeletonCardGrid count={6} />
    </div>
  </div>
);

export default Skeleton;
