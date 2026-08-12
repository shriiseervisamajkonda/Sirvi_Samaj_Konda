import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  const range = [];
  const rangeWithDots = [];

  for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
    range.push(i);
  }

  if (currentPage - delta > 2) {
    rangeWithDots.push(1, '...');
  } else {
    rangeWithDots.push(1);
  }

  rangeWithDots.push(...range);

  if (currentPage + delta < totalPages - 1) {
    rangeWithDots.push('...', totalPages);
  } else {
    rangeWithDots.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronLeft className="w-5 h-5" />
      </button>

      {rangeWithDots.map((page, idx) =>
        page === '...' ? (
          <span key={`dots-${idx}`} className="px-3 py-2 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[2.5rem] h-10 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === page
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Pagination;
