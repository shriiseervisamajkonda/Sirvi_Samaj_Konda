import { useState, useEffect, useMemo } from 'react';
import { FiSearch, FiChevronUp, FiChevronDown, FiDownload } from 'react-icons/fi';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import { SkeletonTable } from './Skeleton';
import { useAuth } from '../../context/AuthContext';

const DataTable = ({
  columns,
  data = [],
  loading = false,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  searchable = true,
  downloadable = false, // Default false to protect sensitive community table datasets
  title,
  actions,
  emptyIcon,
  emptyText = 'कोई डेटा उपलब्ध नहीं है',
  emptyDescription,
  serverSide = false,
  onSearchChange,
  onSortChange,
  searchValue,
  initialSortField = null,
  initialSortDir = 'asc',
}) => {
  const [localSearch, setLocalSearch] = useState(searchValue !== undefined ? searchValue : '');
  const [sortField, setSortField] = useState(initialSortField);
  const [sortDir, setSortDir] = useState(initialSortDir);
  
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (searchValue !== undefined) {
      setLocalSearch(searchValue);
    }
  }, [searchValue]);

  useEffect(() => {
    setSortField(initialSortField);
  }, [initialSortField]);

  useEffect(() => {
    setSortDir(initialSortDir);
  }, [initialSortDir]);

  const handleSort = (field) => {
    const newDir = sortField === field ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
    setSortField(field);
    setSortDir(newDir);
    if (onSortChange) {
      onSortChange(field, newDir);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    if (onSearchChange) onSearchChange(value);
  };

  const getCellValue = (row, key) => {
    if (!row || !key) return '';
    // Direct property
    if (row[key] !== undefined && row[key] !== null) return row[key];
    
    // Snake_case equivalent
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (row[snakeKey] !== undefined && row[snakeKey] !== null) return row[snakeKey];

    // Specific domain mappings
    if (key === 'headOfFamily') return row.head_name || row.headOfFamily || '';
    if (key === 'surname') return row.gotra || row.surname || '';
    if (key === 'mobileNumber' || key === 'phone') return row.head_mobile || row.mobile_number || row.phone || '';
    if (key === 'numberOfMembers') return Number(row.total_members ?? row.numberOfMembers ?? 0);
    if (key === 'agriculturalLandArea') return Number(row.land_area_acres ?? row.agriculturalLandArea ?? row.land_holding ?? 0);
    if (key === 'familyId') return row.panchayat_family_id || row.familyId || '';
    if (key === 'role') return row.role?.name || row.role || '';
    if (key === 'status') return row.is_active === false || row.status === 'inactive' ? 'inactive' : 'active';
    if (key === 'createdAt') return row.created_at || row.createdAt || '';
    if (key === 'date' || key === 'settlementDate' || key === 'entryDate') return row.entry_date || row.settlement_date || row.date || row.created_at || '';
    if (key === 'amount') return Number(row.amount ?? 0);

    return '';
  };

  const filtered = useMemo(() => {
    if (serverSide || !localSearch) return data || [];
    const q = localSearch.toLowerCase();
    return (data || []).filter((row) =>
      columns.some((col) => {
        if (!col.key) return false;
        const val = getCellValue(row, col.key);
        return val !== undefined && val !== null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, localSearch, columns, serverSide]);

  const sorted = useMemo(() => {
    if (serverSide) return filtered;
    if (!sortField) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = getCellValue(a, sortField);
      const bVal = getCellValue(b, sortField);

      if (aVal === null || aVal === undefined || aVal === '') return 1;
      if (bVal === null || bVal === undefined || bVal === '') return -1;

      const aNum = Number(aVal);
      const bNum = Number(bVal);
      if (!isNaN(aNum) && !isNaN(bNum) && typeof aVal !== 'boolean' && typeof bVal !== 'boolean' && String(aVal).trim() !== '' && String(bVal).trim() !== '') {
        return sortDir === 'asc' ? aNum - bNum : bNum - aNum;
      }

      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal), undefined, { numeric: true, sensitivity: 'base' })
        : String(bVal).localeCompare(String(aVal), undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [filtered, sortField, sortDir, serverSide]);

  const exportToCSV = () => {
    if (!isAdmin || !sorted || sorted.length === 0) return;
    
    // Get headers from columns
    const exportColumns = columns.filter(col => col.key && !col.key.startsWith('_') && col.label !== 'Actions');
    const headers = exportColumns.map(col => col.label);
    const keys = exportColumns.map(col => col.key);

    const csvContent = [
      headers.join(','),
      ...sorted.map(row => 
        keys.map(key => {
          let val = row[key];
          if (val === null || val === undefined) val = '';
          else val = String(val).replace(/"/g, '""');
          return `"${val}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title ? title.replace(/\s+/g, '_') : 'konda_export'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const showHeader = Boolean(title || searchable || (downloadable && isAdmin && sorted.length > 0) || actions);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#E8DCC8] overflow-hidden">
      {/* Header */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 border-b border-[#E8DCC8] bg-gradient-to-r from-[#FFF8EC]/60 to-white">
          {title && <h3 className="font-extrabold text-[#2B211B] text-base sm:text-lg">{title}</h3>}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {searchable && (
              <div className="relative flex-1 sm:flex-none">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#766A60]" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={handleSearch}
                  placeholder="सूची में खोजें..."
                  className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-[#FFF8EC] border border-[#E8DCC8] rounded-2xl text-xs sm:text-sm text-[#2B211B] placeholder-[#766A60]/70 focus:outline-none focus:ring-2 focus:ring-[#C85A17]/20 focus:border-[#C85A17] font-medium transition-all"
                />
              </div>
            )}
            {/* Strictly Admin-only CSV/Excel table export */}
            {downloadable && isAdmin && sorted.length > 0 && (
              <button
                onClick={exportToCSV}
                className="p-2.5 bg-white border border-[#E8DCC8] rounded-2xl text-[#C85A17] hover:bg-[#FFF8EC] hover:border-[#C85A17] transition-all shadow-sm flex items-center gap-2 shrink-0 cursor-pointer"
                title="CSV डाउनलोड करें (Admin Only)"
              >
                <FiDownload className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-bold">CSV</span>
              </button>
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
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#FFF8EC]/80 border-b border-[#E8DCC8]">
                {columns.map((col) => (
                  <th
                    key={col.key || col.label}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`px-5 py-4 text-left text-xs font-black text-[#7A2525] uppercase tracking-wider whitespace-nowrap ${
                      col.sortable ? 'cursor-pointer hover:text-[#C85A17] select-none' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      {col.sortable && (
                        sortField === col.key ? (
                          sortDir === 'asc' ? (
                            <FiChevronUp className="w-3.5 h-3.5 text-[#C85A17]" />
                          ) : (
                            <FiChevronDown className="w-3.5 h-3.5 text-[#C85A17]" />
                          )
                        ) : (
                          <span className="text-[#CDBBA4] text-xs opacity-50">⇅</span>
                        )
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCC8]/60">
              {sorted.map((row, idx) => (
                <tr
                  key={row.id || row._id || idx}
                  className="hover:bg-[#FFF8EC]/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key || col.label} className="px-5 py-4 text-[#2B211B] whitespace-nowrap font-medium">
                      {col.render ? col.render(row[col.key], row, idx) : (row[col.key] ?? '—')}
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
        <div className="p-5 border-t border-[#E8DCC8] bg-gradient-to-r from-[#FFF8EC]/40 to-white">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
};

export default DataTable;
