import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiDollarSign,
  FiSearch,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiInbox,
  FiTrendingUp,
  FiCreditCard,
  FiLock,
  FiShield,
  FiLogIn,
  FiHome,
  FiUserCheck,
} from 'react-icons/fi';
import { lekhaJokhaAPI } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import { useAuth } from '../../context/AuthContext';

const LekhaJokhaPage = () => {
  const { user, canViewLekhaJokha, loading: authLoading } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [stats, setStats] = useState({ categories: [], overall: { totalIncome: 0, totalExpense: 0, count: 0 } });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const categories = [
    { id: 'all', label: 'सभी कोष (All Ledgers)', desc: 'सम्पूर्ण आय-व्यय ब्यौरा' },
    { id: 'aaiji_kosh', label: 'आईजी सहायता कोष', desc: 'सहायता एवं कल्याण कोष' },
    { id: 'annapurna_bhavan', label: 'अन्नपूर्णा भवन', desc: 'भवन निर्माण व संचालन' },
    { id: 'mandir_nirman', label: 'मन्दिर निर्माण', desc: 'मंदिर जीर्णोद्धार एवं निर्माण' },
    { id: 'dharmik_karya', label: 'धार्मिक कार्य', desc: 'पूजा, आरती एवं उत्सव' },
    { id: 'pratibha_samman', label: 'प्रतिभा सम्मान', desc: 'विद्यार्थी प्रतिभा पुरस्कार' },
  ];

  // Fetch Stats (overall summary of accounts)
  const fetchStats = useCallback(async () => {
    if (!canViewLekhaJokha) return;
    try {
      const res = await lekhaJokhaAPI.getStats();
      if (res.data?.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  }, [canViewLekhaJokha]);

  // Fetch Page Data
  const fetchData = useCallback(async () => {
    if (!canViewLekhaJokha) return;
    setLoading(true);
    try {
      const res = await lekhaJokhaAPI.getPublic({
        ...(activeCategory !== 'all' && { category: activeCategory }),
        page,
        limit: 10,
        search,
      });
      setItems(res.data?.data || []);
      setTotalPages(res.data?.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to load ledger records', err);
    } finally {
      setLoading(false);
    }
  }, [canViewLekhaJokha, activeCategory, page, search]);

  useEffect(() => {
    if (canViewLekhaJokha) {
      fetchStats();
    }
  }, [canViewLekhaJokha, fetchStats]);

  useEffect(() => {
    if (canViewLekhaJokha) {
      fetchData();
    }
  }, [canViewLekhaJokha, fetchData]);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setPage(1);
    setSearch('');
  };

  // Find active category stats
  const activeCatStats = useMemo(() => {
    if (activeCategory === 'all') {
      return {
        totalIncome: stats.totalIncome || stats.categories?.reduce((sum, c) => sum + (c.totalIncome || 0), 0) || 0,
        totalExpense: stats.totalExpense || stats.categories?.reduce((sum, c) => sum + (c.totalExpense || 0), 0) || 0,
        count: stats.totalEntries || stats.categories?.reduce((sum, c) => sum + (c.count || 0), 0) || 0,
      };
    }
    return {
      totalIncome: stats.byCategory?.[activeCategory]?.income || stats.categories?.find(c => (c.id || c._id || c.category) === activeCategory)?.totalIncome || 0,
      totalExpense: stats.byCategory?.[activeCategory]?.expense || stats.categories?.find(c => (c.id || c._id || c.category) === activeCategory)?.totalExpense || 0,
      count: (stats.byCategory?.[activeCategory] ? 1 : 0),
    };
  }, [activeCategory, stats]);

  const netBalance = (activeCatStats.totalIncome || 0) - (activeCatStats.totalExpense || 0);

  const columns = [
    {
      key: 'entry_date',
      label: 'दिनांक (Date)',
      sortable: true,
      render: (v, r) => (
        <span className="font-mono font-bold text-[#7A2525] bg-[#FFF8EC] px-2.5 py-1 rounded-lg border border-[#E8DCC8]">
          {new Date(v || r.date || r.created_at || Date.now()).toLocaleDateString('hi-IN')}
        </span>
      ),
    },
    {
      key: 'title',
      label: 'विवरण (Description)',
      sortable: true,
      render: (v) => <span className="font-bold text-[#2B211B]">{v || '—'}</span>,
    },
    {
      key: 'person_name',
      label: 'सम्बन्धित व्यक्ति (Person)',
      sortable: true,
      render: (v, r) => (
        <span className="text-[#5A4D41] font-semibold">
          {v || r.personName || '—'}
        </span>
      ),
    },
    {
      key: 'entry_type',
      label: 'प्रकार (Type)',
      sortable: true,
      render: (v, r) => {
        const type = v || r.type;
        const isIncome = type === 'income';
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-xs ${
              isIncome
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-orange-50 text-orange-700 border border-orange-300'
            }`}
          >
            {isIncome ? <FiArrowDownLeft className="w-3.5 h-3.5" /> : <FiArrowUpRight className="w-3.5 h-3.5" />}
            {isIncome ? 'आवक (Income)' : 'जावक (Expense)'}
          </span>
        );
      },
    },
    {
      key: 'amount',
      label: 'राशि (Amount)',
      sortable: true,
      render: (v, r) => {
        const type = r.entry_type || r.type;
        const isIncome = type === 'income';
        return (
          <span className={`font-black font-mono text-sm sm:text-base ${isIncome ? 'text-emerald-700' : 'text-[#C85A17]'}`}>
            {isIncome ? '+' : '-'} ₹{(Number(v) || 0).toLocaleString('en-IN')}
          </span>
        );
      },
    },
    {
      key: 'payment_method',
      label: 'माध्यम (Method)',
      render: (v, r) => {
        const method = (v || r.paymentMethod || 'CASH').toUpperCase();
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200">
            <FiCreditCard className="w-3 h-3 text-amber-600" /> {method}
          </span>
        );
      },
    },
    {
      key: 'receipt_or_bill_no',
      label: 'रसीद / बिल क्र.',
      render: (v, r) => {
        const docNo = v || r.receiptNumber || r.billNumber;
        return docNo ? (
          <span className="font-mono text-xs font-bold text-[#766A60] bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
            {docNo}
          </span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        );
      },
    },
  ];

  if (authLoading) {
    return (
      <div className="bg-[#FFF8EC] min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#C85A17] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#FFF8EC] min-h-screen text-[#2B211B]">
      {/* Header Banner */}
      <div className="relative py-20 text-white overflow-hidden border-b border-[#D4AF37]/20">
        <div className="absolute inset-0">
          <img src="/hero_background.webp" alt="Header Background" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7A2525] via-[#C85A17]/85 to-[#7A2525]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 bg-white/10 border border-[#D4AF37]/35 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              पारदर्शिता एवं सामाजिक लेखा-जोखा
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3">
              आय-व्यय एवं निर्माण लेखा-जोखा (Accounts Ledger)
            </h1>
            <p className="text-orange-100 text-base sm:text-lg font-medium">
              श्री सिर्वी समाज कोणदा के सभी कोषों व निर्माण कार्यों का पारदर्शी ब्यौरा
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {!canViewLekhaJokha ? (
          /* Permission Gated / Restricted View */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#E8DCC8] shadow-lg p-8 sm:p-10 text-center space-y-6"
          >
            <div className="w-20 h-20 bg-amber-50 text-amber-600 border border-amber-200 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <FiLock className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-bold">
                <FiShield className="w-3.5 h-3.5" />
                पहुँच प्रतिबंधित (Restricted Access)
              </span>
              <h2 className="text-2xl font-black text-[#2B211B]">
                लेखा-जोखा देखने की अनुमति आवश्यक है
              </h2>
              <p className="text-sm text-[#766A60] leading-relaxed max-w-lg mx-auto">
                श्री सीरवी समाज कोणदा के वित्तीय लेखा-जोखा एवं आय-व्यय विवरण की सुरक्षा हेतु यह पृष्ठ केवल अधिकृत सदस्यों एवं व्यवस्थापकों (Admins) के लिए उपलब्ध है।
              </p>
            </div>

            {!user ? (
              <div className="bg-[#FFF8EC] border border-[#E8DCC8] rounded-2xl p-5 space-y-4">
                <p className="text-xs sm:text-sm font-semibold text-[#5A4D41]">
                  यदि आप समाज के पंजीकृत सदस्य हैं, तो कृपया अपने खाते से लॉगिन करें:
                </p>
                <Link
                  to="/auth/login?redirect=/lekha-jokha"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#7A2525] to-[#C85A17] hover:from-[#651E1E] hover:to-[#B34E12] text-white rounded-2xl text-sm font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                >
                  <FiLogIn className="w-4 h-4" />
                  <span>लॉगिन करें (Login with Phone / Google)</span>
                </Link>
              </div>
            ) : (
              <div className="bg-[#FFF8EC] border border-[#E8DCC8] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-800">
                  <FiUserCheck className="w-4 h-4 text-amber-600" />
                  <span>लॉगिन खाता: {user.name} ({user.phone || user.email})</span>
                </div>
                <p className="text-xs text-[#766A60] leading-relaxed">
                  आपके खाते को अभी व्यवस्थापक (Admin) द्वारा लेखा-जोखा देखने की अनुमति नहीं दी गई है। अधिकार प्राप्त करने हेतु कृपया समाज के मुख्य प्रशासक या कोषाध्यक्ष से संपर्क करें।
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E8DCC8] hover:bg-[#FAF1E0] text-[#2B211B] rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-2xs"
                  >
                    <FiHome className="w-4 h-4 text-[#766A60]" />
                    <span>मुख्य पृष्ठ (Home)</span>
                  </Link>
                  <Link
                    to="/admin/profile"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7A2525] to-[#C85A17] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all"
                  >
                    <span>मेरी प्रोफ़ाइल (Profile)</span>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* Authorized View */
          <>
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2.5 justify-center bg-white p-3 rounded-3xl border border-[#E8DCC8] shadow-sm">
              {categories.map((cat) => {
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#7A2525] to-[#C85A17] text-white shadow-md shadow-orange-500/20'
                        : 'bg-[#FFF8EC] text-[#5A4D41] hover:text-[#7A2525] hover:bg-[#FAF1E0] border border-[#E8DCC8]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Stats KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Income Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E8DCC8] shadow-sm hover:shadow-md transition-all flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-black text-emerald-800 uppercase tracking-wider">कुल आवक (Total Income)</p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1 font-mono">
                    ₹{activeCatStats.totalIncome?.toLocaleString('en-IN') || 0}
                  </h3>
                  <p className="text-[11px] text-[#766A60] mt-1 font-medium">प्राप्त दान, चंदा एवं सहयोग राशि</p>
                </div>
                <div className="w-14 h-14 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl flex items-center justify-center font-bold shadow-sm shrink-0">
                  <FiArrowDownLeft className="w-7 h-7" />
                </div>
              </motion.div>

              {/* Expense Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E8DCC8] shadow-sm hover:shadow-md transition-all flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-black text-[#7A2525] uppercase tracking-wider">कुल जावक (Total Expense)</p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#C85A17] mt-1 font-mono">
                    ₹{activeCatStats.totalExpense?.toLocaleString('en-IN') || 0}
                  </h3>
                  <p className="text-[11px] text-[#766A60] mt-1 font-medium">निर्माण, सामग्री व कार्यक्रम खर्च</p>
                </div>
                <div className="w-14 h-14 bg-orange-50 text-[#C85A17] border border-orange-200 rounded-2xl flex items-center justify-center font-bold shadow-sm shrink-0">
                  <FiArrowUpRight className="w-7 h-7" />
                </div>
              </motion.div>

              {/* Net Balance Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E8DCC8] shadow-sm hover:shadow-md transition-all flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-black text-[#766A60] uppercase tracking-wider">शुद्ध अवशेष (Net Balance)</p>
                  <h3 className={`text-2xl sm:text-3xl font-extrabold mt-1 font-mono ${netBalance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    ₹{netBalance?.toLocaleString('en-IN') || 0}
                  </h3>
                  <p className="text-[11px] text-[#766A60] mt-1 font-medium">वर्तमान में शेष उपलब्ध कोष</p>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold shadow-sm shrink-0 border ${
                  netBalance >= 0
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  <FiDollarSign className="w-7 h-7" />
                </div>
              </motion.div>
            </div>

            {/* Data Table Card */}
            <div className="bg-white rounded-3xl border border-[#E8DCC8] shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DCC8]">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-[#2B211B] flex items-center gap-2">
                    <FiTrendingUp className="w-5 h-5 text-[#C85A17]" />
                    लेनदेन विवरण सूची (Transaction History)
                  </h2>
                  <p className="text-xs sm:text-sm text-[#766A60] mt-0.5">
                    {categories.find(c => c.id === activeCategory)?.label || 'सभी कोष'} का मदवार रिकॉर्ड
                  </p>
                </div>

                <div className="relative w-full sm:w-80">
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#766A60] w-4 h-4" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="विवरण, व्यक्ति का नाम या रसीद खोजें..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FFF8EC] border border-[#E8DCC8] rounded-2xl text-xs sm:text-sm text-[#2B211B] placeholder-[#766A60]/70 focus:outline-none focus:ring-2 focus:ring-[#C85A17]/30 focus:border-[#C85A17] font-medium transition-all"
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
                searchable={false}
                serverSide
                emptyIcon={FiInbox}
                emptyText="इस कोष में कोई लेनदेन दर्ज नहीं है।"
                emptyDescription={search ? `"${search}" के लिए कोई रिकॉर्ड नहीं मिला।` : 'अभी तक कोई आवक या जावक प्रविष्टि दर्ज नहीं की गई है।'}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LekhaJokhaPage;
