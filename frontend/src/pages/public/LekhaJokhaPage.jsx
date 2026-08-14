import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiSearch, FiArrowUpRight, FiArrowDownLeft, FiInbox } from 'react-icons/fi';
import { lekhaJokhaAPI } from '../../services/api';
import { SkeletonTable } from '../../components/common/Skeleton';
import DataTable from '../../components/common/DataTable';

const LekhaJokhaPage = () => {
  const [activeCategory, setActiveCategory] = useState('aaiji_kosh');
  const [stats, setStats] = useState({ categories: [], overall: { totalIncome: 0, totalExpense: 0, count: 0 } });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const categories = [
    { id: 'aaiji_kosh', label: 'आईजी सहायता कोष', desc: 'Aaiji Relief/Help Fund' },
    { id: 'annapurna_bhavan', label: 'अन्नपूर्णा भवन', desc: 'Annapurna Bhawan Ledger' },
    { id: 'mandir_nirman', label: 'मन्दिर निर्माण', desc: 'Temple Construction Fund' },
    { id: 'dharmik_karya', label: 'धार्मिक कार्य', desc: 'Religious Events Ledger' },
    { id: 'pratibha_samman', label: 'प्रतिभा सम्मान लेखा-जोखा', desc: 'Talent Honor / Scholarship accounts' },
  ];

  // Fetch Stats (overall summary of accounts)
  const fetchStats = useCallback(async () => {
    try {
      const res = await lekhaJokhaAPI.getStats();
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  }, []);

  // Fetch Page Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await lekhaJokhaAPI.getPublic({
        category: activeCategory,
        page,
        limit: 10,
        search,
      });
      setItems(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to load ledger records', err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, page, search]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setPage(1);
    setSearch('');
  };

  // Find active category stats
  const activeCatStats = stats.categories?.find(c => c._id === activeCategory) || {
    totalIncome: 0,
    totalExpense: 0,
    count: 0
  };

  const netBalance = activeCatStats.totalIncome - activeCatStats.totalExpense;

  const columns = [
    { key: 'date', label: 'दिनांक (Date)', sortable: true, render: (v) => new Date(v).toLocaleDateString('hi-IN') },
    { key: 'title', label: 'विवरण (Description)', render: (v) => <span className="font-bold text-[#FFF3DD]">{v}</span> },
    { key: 'personName', label: 'सम्बन्धित व्यक्ति (Person)', render: (v) => <span className="text-[#CDBBA4] font-semibold">{v || '-'}</span> },
    {
      key: 'type',
      label: 'प्रकार (Type)',
      render: (v) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
          v === 'income'
            ? 'bg-[#3F7655]/20 text-[#3F7655]'
            : 'bg-[#7A2525]/30 text-[#C85A17]'
        }`}>
          {v === 'income' ? <FiArrowDownLeft className="w-3.5 h-3.5" /> : <FiArrowUpRight className="w-3.5 h-3.5" />}
          {v === 'income' ? 'आवक (Income)' : 'जावक (Expense)'}
        </span>
      )
    },
    {
      key: 'amount',
      label: 'राशि (Amount)',
      render: (v, r) => (
        <span className={`font-bold ${r.type === 'income' ? 'text-[#3F7655]' : 'text-[#C85A17]'}`}>
          ₹{v?.toLocaleString('en-IN')}
        </span>
      )
    },
    { key: 'paymentMethod', label: 'माध्यम (Method)', render: (v) => <span className="uppercase text-xs font-bold text-[#CDBBA4]">{v}</span> },
    { key: 'receiptNumber', label: 'रसीद क्र. (Receipt No.)', render: (v) => <span className="text-xs font-bold text-[#CDBBA4]">{v || '-'}</span> },
  ];

  return (
    <div className="bg-[#160D08] min-h-screen text-[#FFF3DD]">
      {/* Header Banner */}
      <div className="relative py-20 text-white overflow-hidden border-b border-[#D4AF37]/20">
        {/* Background image overlay */}
        <div className="absolute inset-0">
          <img src="/hero_background.webp" alt="Header Background" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/10 border border-[#D4AF37]/35 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              पारदर्शिता एवं लेखा-जोखा
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3">सिर्वी समाज लेखा जोखा Ledger</h1>
            <p className="text-[#FFF3DD] text-lg font-medium opacity-90">समाज के सभी कोषों व निर्माण कार्यों का पारदर्शी ब्यौरा</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center border-b border-[#D4AF37]/10 pb-6 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#7A2525] border-[#D4AF37]/40 text-[#D4AF37] shadow-lg'
                  : 'bg-[#2A1010] border-[#D4AF37]/15 text-[#CDBBA4] hover:border-[#D4AF37]/45'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-[#2A1010] p-6 rounded-2xl border border-[#D4AF37]/15 shadow-xl flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-[#CDBBA4] uppercase tracking-wider">कुल आवक (Total Income)</p>
              <h3 className="text-3xl font-extrabold text-[#3F7655] mt-1">
                ₹{activeCatStats.totalIncome?.toLocaleString('en-IN') || 0}
              </h3>
            </div>
            <div className="w-12 h-12 bg-[#3F7655]/10 text-[#3F7655] rounded-xl flex items-center justify-center font-bold text-xl">
              <FiArrowDownLeft className="w-6 h-6" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#2A1010] p-6 rounded-2xl border border-[#D4AF37]/15 shadow-xl flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-[#CDBBA4] uppercase tracking-wider">कुल जावक (Total Expense)</p>
              <h3 className="text-3xl font-extrabold text-[#C85A17] mt-1">
                ₹{activeCatStats.totalExpense?.toLocaleString('en-IN') || 0}
              </h3>
            </div>
            <div className="w-12 h-12 bg-[#7A2525]/20 text-[#C85A17] rounded-xl flex items-center justify-center font-bold text-xl">
              <FiArrowUpRight className="w-6 h-6" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#2A1010] p-6 rounded-2xl border border-[#D4AF37]/15 shadow-xl flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-[#CDBBA4] uppercase tracking-wider">शुद्ध अवशेष (Net Balance)</p>
              <h3 className={`text-3xl font-extrabold mt-1 ${netBalance >= 0 ? 'text-[#3F7655]' : 'text-[#C85A17]'}`}>
                ₹{netBalance?.toLocaleString('en-IN') || 0}
              </h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${
              netBalance >= 0 ? 'bg-[#3F7655]/10 text-[#3F7655]' : 'bg-[#7A2525]/20 text-[#C85A17]'
            }`}>
              <FiDollarSign className="w-6 h-6" />
            </div>
          </motion.div>
        </div>

        {/* Data Table */}
        <div className="bg-[#2A1010] rounded-2xl border border-[#D4AF37]/15 shadow-xl overflow-hidden p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-[#D4AF37]/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-[#FFF3DD]">लेनदेन सूची (Transaction History)</h2>
              <p className="text-sm text-[#CDBBA4] mt-0.5">संबंधित कोष में किए गए कुल लेनदेन की जानकारी</p>
            </div>
            <div className="relative w-full sm:w-72">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#CDBBA4]/50 w-4.5 h-4.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="खोजें विवरण या व्यक्ति का नाम..."
                className="w-full pl-11 pr-4 py-2 bg-[#160D08] border border-[#D4AF37]/15 rounded-xl text-sm text-[#FFF3DD] placeholder-[#CDBBA4]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 shadow-inner"
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={items}
            loading={loading}
            totalPages={totalPages}
            currentPage={page}
            onPageChange={setPage}
            serverSide
            emptyIcon={FiInbox}
            emptyText="इस कोष में कोई लेनदेन दर्ज नहीं है।"
          />
        </div>
      </div>
    </div>
  );
};

export default LekhaJokhaPage;
