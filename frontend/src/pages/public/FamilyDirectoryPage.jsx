import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiInbox } from 'react-icons/fi';
import { familyAPI } from '../../services/api';
import DataTable from '../../components/common/DataTable';

const FamilyDirectoryPage = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchFamilies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await familyAPI.getAll({ page, limit: 10, search, status: 'active' });
      setFamilies(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch families:', err);
      setFamilies([]); // Fallback to prevent rendering crashes
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchFamilies();
  }, [fetchFamilies]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const columns = [
    {
      key: 'familyId',
      label: 'S.No.',
      sortable: false,
      render: (_, row, idx) => (
        <span className="font-mono font-bold text-[#7A2525] bg-[#FFF8EC] px-2.5 py-1 rounded-lg border border-[#E8DCC8]">
          {row.panchayat_family_id || row.familyId || ((page - 1) * 10 + idx + 1)}
        </span>
      ),
    },
    { 
      key: 'headOfFamily', 
      label: 'मुखिया (Head)', 
      sortable: true, 
      render: (_, row) => {
        const headName = row.head_name || row.headOfFamily || '—';
        const gotra = row.gotra || row.surname || '';
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#C85A17] to-[#C9A44C] text-white text-sm font-bold shrink-0">
              {row.familyPhoto || row.family_photo ? (
                <img src={row.familyPhoto || row.family_photo} alt="Family" className="w-full h-full object-cover" />
              ) : (
                gotra.charAt(0) || headName.charAt(0) || 'F'
              )}
            </div>
            <span className="font-bold text-[#2B211B]">{headName}</span>
          </div>
        );
      },
    },
    { key: 'surname', label: 'गोत्र (Surname)', sortable: true, render: (_, row) => <span className="font-medium text-[#C85A17]">{row.gotra || row.surname || '—'}</span> },
    { key: 'village', label: 'गाँव (Village)', render: (v) => v || 'Konda' },
    { key: 'mobileNumber', label: 'मोबाइल (Mobile)', render: (_, row) => (row.head_mobile || row.mobileNumber) ? <span className="font-mono text-sm">{row.head_mobile || row.mobileNumber}</span> : '—' },
    {
      key: 'numberOfMembers',
      label: 'सदस्य (Members)',
      render: (_, row) => (
        <span className="font-bold">
          {row.total_members || (Array.isArray(row.family_members) ? row.family_members.length : 0) || row.numberOfMembers || row.memberCount || 0}
        </span>
      ),
    },
    { key: 'agriculturalLandArea', label: 'कृषि भूमि (Land Area)', render: (_, row) => (row.land_holding || row.agriculturalLandArea) ? <span className="font-bold text-[#3F7655]">{row.land_holding || row.agriculturalLandArea}</span> : '—' },
  ];

  return (
    <div className="bg-[#FFF8EC] min-h-screen text-[#2B211B]">
      {/* Header Banner */}
      <div className="relative py-20 text-white overflow-hidden">
        {/* Background image overlay */}
        <div className="absolute inset-0">
          <img src="/hero_background.webp" alt="Header Background" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/20 border border-amber-400/30 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              समाज निर्देशिका
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3">परिवार निर्देशिका (Family Directory)</h1>
            <p className="text-orange-100 text-lg font-medium">श्री सिर्वी समाज कोणदा के सभी पंजीकृत परिवारों की सूची</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="mb-10 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-xl w-full">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#CDBBA4]" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="परिवार का नाम, मुखिया का नाम खोजें..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E8DCC8] rounded-2xl text-[#2B211B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C85A17]/20 focus:border-[#C85A17] shadow-sm transition-all"
            />
          </div>
          {!loading && (
            <p className="text-[#766A60] text-sm font-semibold shrink-0">
              कुल {total} परिवार मिले
            </p>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-3xl border border-[#E8DCC8] shadow-sm overflow-hidden p-2 sm:p-6">
          <DataTable
            columns={columns}
            data={families}
            loading={loading}
            totalPages={totalPages}
            currentPage={page}
            onPageChange={setPage}
            searchable={false}
            serverSide
            emptyIcon={FiInbox}
            emptyText="कोई परिवार नहीं मिला"
            emptyDescription={search ? `"${search}" के लिए कोई परिणाम नहीं मिले।` : 'अभी तक कोई परिवार पंजीकृत नहीं किया गया है।'}
          />
        </div>
      </div>
    </div>
  );
};

export default FamilyDirectoryPage;
