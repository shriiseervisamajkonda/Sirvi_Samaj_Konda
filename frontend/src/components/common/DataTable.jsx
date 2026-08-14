import { useState, useMemo } from 'react';
import { FiSearch, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import { SkeletonTable } from './Skeleton';

const DataTable = ({
  columns,
  data,
  loading = false,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  searchable = true,
  title,
  actions,
  emptyIcon,
  emptyText = 'No data found',
  emptyDescription,
  serverSide = false,
  onSearchChange,
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    if (onSearchChange) onSearchChange(value);
  };

  const filtered = useMemo(() => {
    if (serverSide || !localSearch) return data;
    const q = localSearch.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        if (!col.key) return false;
        const val = row[col.key];
        return val && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, localSearch, columns, serverSide]);

  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortDir]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      {(title || searchable || actions) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          {title && <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{title}</h3>}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {searchable && (
              <div className="relative flex-1 sm:flex-none">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={handleSearch}
                  placeholder="Search..."
                  className="w-full sm:w-60 pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-colors"
                />
              </div>
            )}
            {actions}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <SkeletonTable columns={columns} rows={6} hasHeader={true} className="border-none shadow-none rounded-none" />
        ) : sorted.length === 0 ? (
          <EmptyState icon={emptyIcon} title={emptyText} description={emptyDescription} />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-700/50">
                {columns.map((col) => (
                  <th
                    key={col.key || col.label}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap ${
                      col.sortable ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && sortField === col.key && (
                        sortDir === 'asc' ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {sorted.map((row, idx) => (
                <tr
                  key={row._id || idx}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key || col.label} className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="px-6 pb-4">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
};

export default DataTable;
