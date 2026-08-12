import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiSearch, FiArrowUpRight, FiArrowDownLeft, FiInbox } from 'react-icons/fi';
import { lekhaJokhaAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
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
    { key: 'title', label: 'विवरण (Description)', render: (v) => <span className="font-semibold text-gray-800 dark:text-gray-200">{v}</span> },
    { key: 'personName', label: 'सम्बन्धित व्यक्ति (Person)', render: (v) => v || '-' },
    {
      key: 'type',
      label: 'प्रकार (Type)',
      render: (v) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
          v === 'income'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
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
        <span className={`font-bold ${r.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
          ₹{v?.toLocaleString('en-IN')}
        </span>
      )
    },
    { key: 'paymentMethod', label: 'माध्यम (Method)', render: (v) => <span className="uppercase text-xs font-semibold">{v}</span> },
    { key: 'receiptNumber', label: 'रसीद क्र. (Receipt No.)', render: (v) => v || '-' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-800 py-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/20 border border-white/30 rounded-full text-sm font-medium mb-4">
              पारदर्शिता एवं लेखा-जोखा
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3">सिर्वी समाज लेखा जोखा Ledger</h1>
            <p className="text-green-100 text-lg">समाज के सभी कोषों व निर्माण कार्यों का पारदर्शी ब्यौरा</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center border-b border-gray-200 dark:border-slate-800 pb-4 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeCategory === cat.id
                  ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
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
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">कुल आवक (Total Income)</p>
              <h3 className="text-3xl font-extrabold text-green-600 dark:text-green-400 mt-1">
                ₹{activeCatStats.totalIncome?.toLocaleString('en-IN') || 0}
              </h3>
            </div>
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl flex items-center justify-center font-bold text-xl">
              <FiArrowDownLeft className="w-6 h-6" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">कुल जावक (Total Expense)</p>
              <h3 className="text-3xl font-extrabold text-red-500 dark:text-red-400 mt-1">
                ₹{activeCatStats.totalExpense?.toLocaleString('en-IN') || 0}
              </h3>
            </div>
            <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl flex items-center justify-center font-bold text-xl">
              <FiArrowUpRight className="w-6 h-6" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">शुद्ध अवशेष (Net Balance)</p>
              <h3 className={`text-3xl font-extrabold mt-1 ${netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                ₹{netBalance?.toLocaleString('en-IN') || 0}
              </h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${
              netBalance >= 0 ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-500'
            }`}>
              <FiDollarSign className="w-6 h-6" />
            </div>
          </motion.div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">लेनदेन सूची (Transaction History)</h2>
              <p className="text-sm text-gray-500 mt-0.5">संबंधित कोष में किए गए कुल लेनदेन की जानकारी</p>
            </div>
            <div className="relative w-full sm:w-72">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="खोजें (Search विवरण/नाम)..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
