import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FiShield,
  FiLock,
  FiUnlock,
  FiSearch,
  FiUserCheck,
  FiUserX,
  FiInfo,
  FiCheckCircle,
  FiUsers,
  FiRefreshCw,
  FiTrendingUp,
  FiDownload,
} from 'react-icons/fi';
import { userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

const AuthorityPage = () => {
  const { isSuperAdmin, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [permissionFilter, setPermissionFilter] = useState('all');
  const [togglingMap, setTogglingMap] = useState({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll({ page: 1, limit: 100, search });
      setUsers(res.data?.data || []);
    } catch {
      toast.error('उपयोगकर्ता सूची लोड करने में विफल (Failed to load users)');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleTogglePermission = async (userRecord, permKey, permLabel) => {
    if (userRecord.role === 'developer' || userRecord.role === 'super_admin') {
      toast('Super Admin / Developer को स्थायी मास्टर अधिकार प्राप्त है', {
        icon: '🛡️',
      });
      return;
    }

    if (permKey === 'can_export_data' && !isSuperAdmin) {
      toast.error('केवल Super Admin / Developer ही डेटा एक्सपोर्ट अधिकार बदल सकते हैं');
      return;
    }

    if (!isAdmin) {
      toast.error('अधिकार बदलने के लिए व्यवस्थापक अनुमति आवश्यक है');
      return;
    }

    const actionKey = `${userRecord.id}_${permKey}`;
    setTogglingMap((prev) => ({ ...prev, [actionKey]: true }));

    try {
      const res = await userAPI.togglePermission(userRecord.id, permKey);
      toast.success(res.data?.message || `${permLabel} अपडेट किया गया`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'अधिकार अद्यतन में त्रुटि हुई');
    } finally {
      setTogglingMap((prev) => ({ ...prev, [actionKey]: false }));
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;

      const isMaster = u.role === 'developer' || u.role === 'super_admin';
      const isStaff = isMaster || ['admin', 'treasurer'].includes(u.role);
      const hasExport = isMaster || (Array.isArray(u.permissions) && u.permissions.includes('can_export_data'));
      const hasLekhaJokha = isStaff || (Array.isArray(u.permissions) && u.permissions.includes('can_view_lekha_jokha'));

      if (permissionFilter === 'lekha_jokha_allowed' && !hasLekhaJokha) return false;
      if (permissionFilter === 'export_allowed' && !hasExport) return false;
      if (permissionFilter === 'both_restricted' && (hasExport || hasLekhaJokha)) return false;

      return true;
    });
  }, [users, roleFilter, permissionFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const masterAdmins = users.filter((u) => u.role === 'developer' || u.role === 'super_admin').length;
    const exportAuthorized = users.filter((u) => {
      const isMaster = u.role === 'developer' || u.role === 'super_admin';
      return isMaster || (Array.isArray(u.permissions) && u.permissions.includes('can_export_data'));
    }).length;
    const lekhaJokhaAuthorized = users.filter((u) => {
      const isStaff = ['developer', 'super_admin', 'admin', 'treasurer'].includes(u.role);
      return isStaff || (Array.isArray(u.permissions) && u.permissions.includes('can_view_lekha_jokha'));
    }).length;

    return { total, masterAdmins, exportAuthorized, lekhaJokhaAuthorized };
  }, [users]);

  const columns = [
    {
      key: 'name',
      label: 'सदस्य का नाम (User)',
      sortable: true,
      render: (v, r) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFF8EC] border border-[#E8DCC8] flex items-center justify-center font-bold text-[#C85A17] text-sm shrink-0">
            {v ? v.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="font-bold text-[#2B211B] text-sm">{v || '—'}</div>
            <div className="text-xs text-[#766A60] font-mono">{r.phone || r.email || '—'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'panchayat_family_id',
      label: 'परिवार क्र.',
      sortable: true,
      render: (v) =>
        v ? (
          <span className="text-xs font-mono bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-amber-900 font-bold">
            #{v}
          </span>
        ) : (
          <span className="text-xs text-[#766A60]">—</span>
        ),
    },
    {
      key: 'role',
      label: 'भूमिका (Role)',
      sortable: true,
      render: (v) => {
        const variant =
          v === 'developer' || v === 'super_admin'
            ? 'danger'
            : v === 'admin'
            ? 'warning'
            : v === 'treasurer'
            ? 'info'
            : 'default';
        return <Badge variant={variant}>{v}</Badge>;
      },
    },
    {
      key: 'lekha_jokha_status',
      label: 'लेखा-जोखा अधिकार (Ledger Access)',
      render: (_, r) => {
        const isMaster = r.role === 'developer' || r.role === 'super_admin';
        const isStaff = isMaster || ['admin', 'treasurer'].includes(r.role);
        const hasAccess = isStaff || (Array.isArray(r.permissions) && r.permissions.includes('can_view_lekha_jokha'));
        const actionKey = `${r.id}_can_view_lekha_jokha`;
        const isToggling = togglingMap[actionKey];

        if (isStaff) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs">
              <FiShield className="w-3.5 h-3.5 text-blue-600" />
              स्टाफ एक्सेस (Staff)
            </span>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isToggling}
              onClick={() => handleTogglePermission(r, 'can_view_lekha_jokha', 'लेखा-जोखा अधिकार')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer shadow-2xs ${
                hasAccess
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300'
              }`}
              title={hasAccess ? 'लेखा-जोखा अधिकार हटाएं' : 'लेखा-जोखा अधिकार प्रदान करें'}
            >
              {isToggling ? (
                <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : hasAccess ? (
                <>
                  <FiUnlock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>अनुमत (Allowed)</span>
                </>
              ) : (
                <>
                  <FiLock className="w-3.5 h-3.5 text-rose-600" />
                  <span>प्रतिबंधित (Blocked)</span>
                </>
              )}
            </button>
          </div>
        );
      },
    },
    {
      key: 'export_status',
      label: 'डेटा एक्सपोर्ट (Export Permission)',
      render: (_, r) => {
        const isMaster = r.role === 'developer' || r.role === 'super_admin';
        const hasExport = isMaster || (Array.isArray(r.permissions) && r.permissions.includes('can_export_data'));
        const actionKey = `${r.id}_can_export_data`;
        const isToggling = togglingMap[actionKey];

        if (isMaster) {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold shadow-2xs">
              <FiShield className="w-3.5 h-3.5 text-purple-600" />
              मास्टर एक्सेस (Full)
            </span>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!isSuperAdmin || isToggling}
              onClick={() => handleTogglePermission(r, 'can_export_data', 'डेटा एक्सपोर्ट अधिकार')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all border shadow-2xs cursor-pointer ${
                hasExport
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300'
              } ${!isSuperAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
              title={
                isSuperAdmin
                  ? hasExport
                    ? 'एक्सपोर्ट अधिकार हटाएं'
                    : 'एक्सपोर्ट अधिकार प्रदान करें'
                  : 'केवल Super Admin अधिकार बदल सकते हैं'
              }
            >
              {isToggling ? (
                <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : hasExport ? (
                <>
                  <FiUnlock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>अनुमत (Allowed)</span>
                </>
              ) : (
                <>
                  <FiLock className="w-3.5 h-3.5 text-rose-600" />
                  <span>प्रतिबंधित (Blocked)</span>
                </>
              )}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#7A1C1C] via-[#942626] to-[#C85A17] p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-amber-200 text-xs font-semibold mb-3 border border-white/15">
              <FiShield className="w-3.5 h-3.5" />
              <span>सुरक्षा एवं पहुँच नियंत्रण नीति (Security & Access Control)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              अधिकार प्रबंधन (Authority & Permission Matrix)
            </h1>
            <p className="text-amber-100/90 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              श्री सीरवी समाज कोंडा पोर्टल पर सदस्यों के लिए वित्तीय लेखा-जोखा (Lekha-Jokha) देखने एवं डेटा डाउनलोड (CSV/PDF Export) की अनुमति यहाँ से नियंत्रित करें।
            </p>
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="self-start md:self-center inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>रिफ्रेश करें</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8DCC8] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#766A60]">कुल उपयोगकर्ता</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <FiUsers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-[#2B211B]">{stats.total}</div>
          <div className="mt-1 text-xs text-gray-400">पंजीकृत समाज खाते</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DCC8] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700">मास्टर प्रशासक</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <FiShield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-purple-900">{stats.masterAdmins}</div>
          <div className="mt-1 text-xs text-purple-600">Developer / Super Admin</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DCC8] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700">लेखा-जोखा प्राधिकृत</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <FiTrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-900">{stats.lekhaJokhaAuthorized}</div>
          <div className="mt-1 text-xs text-emerald-600">लेखा-जोखा देखने की अनुमति</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DCC8] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700">एक्सपोर्ट प्राधिकृत</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <FiDownload className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-amber-900">{stats.exportAuthorized}</div>
          <div className="mt-1 text-xs text-amber-600">CSV/PDF डाउनलोड की अनुमति</div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8DCC8] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#766A60]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="नाम, फ़ोन नंबर, ईमेल से खोजें..."
              className="w-full pl-10 pr-4 py-2 bg-[#FFF8EC] border border-[#E8DCC8] rounded-xl text-xs sm:text-sm text-[#2B211B] placeholder-[#766A60]/70 focus:outline-none focus:ring-2 focus:ring-[#C85A17]/20 focus:border-[#C85A17] font-medium"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="रोल के अनुसार फ़िल्टर करें"
            className="px-3 py-2 bg-[#FFF8EC] border border-[#E8DCC8] rounded-xl text-xs sm:text-sm text-[#2B211B] font-medium focus:outline-none focus:border-[#C85A17] cursor-pointer"
          >
            <option value="all">सभी भूमिकाएँ (All Roles)</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="treasurer">Treasurer</option>
            <option value="member">Member</option>
          </select>

          {/* Permission Filter */}
          <select
            value={permissionFilter}
            onChange={(e) => setPermissionFilter(e.target.value)}
            aria-label="अधिकार स्थिति के अनुसार फ़िल्टर करें"
            className="px-3 py-2 bg-[#FFF8EC] border border-[#E8DCC8] rounded-xl text-xs sm:text-sm text-[#2B211B] font-medium focus:outline-none focus:border-[#C85A17] cursor-pointer"
          >
            <option value="all">सभी अधिकार स्थितियाँ (All Permissions)</option>
            <option value="lekha_jokha_allowed">लेखा-जोखा अनुमत (Lekha-Jokha Allowed)</option>
            <option value="export_allowed">एक्सपोर्ट अनुमत (Export Allowed)</option>
            <option value="both_restricted">पूर्णतः प्रतिबंधित (Restricted)</option>
          </select>
        </div>

        <div className="text-xs text-[#766A60] font-medium">
          दिखाए गए: <span className="font-bold text-[#2B211B]">{filteredUsers.length}</span> / {users.length}
        </div>
      </div>

      {/* Authority Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        downloadable={false}
        searchable={false}
        emptyIcon={FiShield}
        emptyText="कोई उपयोगकर्ता नहीं मिला"
        emptyDescription="फ़िल्टर बदलकर पुनः प्रयास करें"
      />

      {/* Security Advisory Callout */}
      <div className="bg-[#FFF8EC] border border-[#E8DCC8] rounded-2xl p-5 flex items-start gap-4">
        <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
          <FiInfo className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs sm:text-sm text-[#2B211B]">
          <h4 className="font-bold text-[#7A1C1C]">डेटा सुरक्षा एवं पहुँच नीति (Access & Privacy Policy)</h4>
          <p className="text-[#766A60] leading-relaxed">
            1. <strong>Super Admin एवं Developer</strong> को पोर्टल के सभी डेटा सेट्स तथा लेखा-जोखा का स्थायी पूर्ण अधिकार प्राप्त है।<br />
            2. <strong>लेखा-जोखा (Lekha-Jokha)</strong> केवल व्यवस्थापकों एवं उन विशिष्ट सदस्यों को दिखाई देगा जिन्हें यहाँ से <span className="text-emerald-700 font-bold">"अनुमत (Allowed)"</span> किया गया हो।<br />
            3. <strong>डेटा एक्सपोर्ट (CSV/PDF Download)</strong> की अनुमति सदस्यों को केवल समाज हित के आवश्यक कार्यों के लिए ही प्रदान की जानी चाहिए।
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthorityPage;
