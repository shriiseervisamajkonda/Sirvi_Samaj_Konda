import { useState, useEffect, useCallback, useMemo } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiMapPin, FiPhone, FiInfo, FiFilter, FiRotateCcw } from 'react-icons/fi';
import { familyAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import { FormSection, FormField, FormActions } from '../../components/common/FormComponents';
import FamilyMembersModal from '../../components/common/FamilyMembersModal';
import toast from 'react-hot-toast';

const GOTRA_OPTIONS = [
  'चौहान', 'सेप्टा', 'सेन्चा', 'काग', 'लछेटा', 'भायल', 'गेहलोत', 'पंवार', 
  'राठौड़', 'सोलंकी', 'हंबड़', 'मुलेवा', 'देवड़ा', 'बर्फा', 'सिंदड़ा', 'पडियार', 'चोयल', 'आगलेचा', 'खराड़ी'
];

const FamiliesPage = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [search, setSearch] = useState('');
  const [gotraFilter, setGotraFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('panchayat_family_id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFamilyForMembers, setSelectedFamilyForMembers] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // 1. Fetch complete dataset once (Single Source of Truth)
  const fetchFamilies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await familyAPI.getAll({ limit: 1000 });
      setFamilies(res.data?.data || []);
    } catch {
      toast.error('परिवार सूची लोड करने में त्रुटि');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFamilies();
  }, [fetchFamilies]);

  // 2. Filter over the complete dataset (All fields + member objects)
  const filteredFamilies = useMemo(() => {
    let result = families;

    // Gotra filter
    if (gotraFilter !== 'all') {
      result = result.filter((fam) => (fam.gotra || fam.surname) === gotraFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((fam) => (fam.status || 'active') === statusFilter);
    }

    // Search query across all fields of the entire table and members
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const cleanDigits = q.replace(/\D/g, '');

      result = result.filter((fam) => {
        // S.No. / Panchayat Family ID / Family code
        if (String(fam.panchayat_family_id || fam.familyId || '').toLowerCase().includes(q)) return true;
        // Head of Family Name
        if (String(fam.head_name || fam.headOfFamily || '').toLowerCase().includes(q)) return true;
        // Gotra / Surname
        if (String(fam.gotra || fam.surname || '').toLowerCase().includes(q)) return true;
        // Head Mobile Number
        if (cleanDigits && String(fam.head_mobile || fam.mobileNumber || '').replace(/\D/g, '').includes(cleanDigits)) return true;
        if (String(fam.head_mobile || fam.mobileNumber || '').toLowerCase().includes(q)) return true;
        // Village / Location
        if (String(fam.village || '').toLowerCase().includes(q)) return true;
        if (String(fam.district || '').toLowerCase().includes(q)) return true;
        if (String(fam.tehsil || '').toLowerCase().includes(q)) return true;
        if (String(fam.state || '').toLowerCase().includes(q)) return true;
        if (String(fam.pin_code || fam.pincode || fam.pinCode || '').includes(q)) return true;
        // Land Area
        if (String(fam.land_area_acres || '').includes(q)) return true;
        if (String(fam.land_details_text || fam.land_holding || '').toLowerCase().includes(q)) return true;
        // Total members
        if (`${fam.total_members || fam.memberCount || 0} सदस्य members`.toLowerCase().includes(q)) return true;
        // Status
        const statusText = (fam.status === 'inactive' ? 'निष्क्रिय inactive' : 'सक्रिय active').toLowerCase();
        if (statusText.includes(q)) return true;
        // Address / Notes / Faliya / Ward
        if (String(fam.faliya_or_ward || '').toLowerCase().includes(q)) return true;
        if (String(fam.address || fam.notes || '').toLowerCase().includes(q)) return true;

        // Family members search
        if (Array.isArray(fam.family_members)) {
          return fam.family_members.some((m) => {
            if (String(m.full_name || '').toLowerCase().includes(q)) return true;
            if (String(m.first_name || '').toLowerCase().includes(q)) return true;
            if (String(m.last_name || '').toLowerCase().includes(q)) return true;
            if (String(m.relative_name || '').toLowerCase().includes(q)) return true;
            if (String(m.occupation || '').toLowerCase().includes(q)) return true;
            if (String(m.education || '').toLowerCase().includes(q)) return true;
            if (cleanDigits && String(m.mobile_number || '').replace(/\D/g, '').includes(cleanDigits)) return true;
            return false;
          });
        }

        return false;
      });
    }

    return result;
  }, [families, gotraFilter, statusFilter, search]);

  // 3. Sort the filtered complete dataset with natural numeric sorting
  const sortedFamilies = useMemo(() => {
    const list = [...filteredFamilies];
    const isAsc = sortOrder === 'asc';

    list.sort((a, b) => {
      if (sortBy === 'panchayat_family_id' || sortBy === 'serialNumber' || sortBy === 'familyId' || sortBy === 'id') {
        const numA = parseInt(a.panchayat_family_id || a.familyId, 10);
        const numB = parseInt(b.panchayat_family_id || b.familyId, 10);
        if (!isNaN(numA) && !isNaN(numB)) {
          return isAsc ? numA - numB : numB - numA;
        }
        return isAsc
          ? String(a.panchayat_family_id || a.familyId || '').localeCompare(String(b.panchayat_family_id || b.familyId || ''), undefined, { numeric: true, sensitivity: 'base' })
          : String(b.panchayat_family_id || b.familyId || '').localeCompare(String(a.panchayat_family_id || a.familyId || ''), undefined, { numeric: true, sensitivity: 'base' });
      }

      if (sortBy === 'head_name' || sortBy === 'headOfFamily') {
        const aVal = a.head_name || a.headOfFamily || '';
        const bVal = b.head_name || b.headOfFamily || '';
        return isAsc
          ? aVal.localeCompare(bVal, undefined, { sensitivity: 'base' })
          : bVal.localeCompare(aVal, undefined, { sensitivity: 'base' });
      }

      if (sortBy === 'gotra' || sortBy === 'surname') {
        const aVal = a.gotra || a.surname || '';
        const bVal = b.gotra || b.surname || '';
        return isAsc
          ? aVal.localeCompare(bVal, undefined, { sensitivity: 'base' })
          : bVal.localeCompare(aVal, undefined, { sensitivity: 'base' });
      }

      if (sortBy === 'head_mobile' || sortBy === 'mobileNumber') {
        const aVal = a.head_mobile || a.mobileNumber || '';
        const bVal = b.head_mobile || b.mobileNumber || '';
        return isAsc
          ? aVal.localeCompare(bVal, undefined, { numeric: true })
          : bVal.localeCompare(aVal, undefined, { numeric: true });
      }

      if (sortBy === 'village') {
        const aVal = a.village || 'Konda';
        const bVal = b.village || 'Konda';
        return isAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      if (sortBy === 'total_members' || sortBy === 'memberCount' || sortBy === 'numberOfMembers') {
        const countA = Number(a.total_members ?? (Array.isArray(a.family_members) ? a.family_members.length : 0));
        const countB = Number(b.total_members ?? (Array.isArray(b.family_members) ? b.family_members.length : 0));
        return isAsc ? countA - countB : countB - countA;
      }

      if (sortBy === 'status') {
        const aVal = a.status || 'active';
        const bVal = b.status || 'active';
        return isAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return 0;
    });

    return list;
  }, [filteredFamilies, sortBy, sortOrder]);

  // 4. Calculate Total Pages & Dynamic Counts from filtered records
  const totalFilteredRecords = sortedFamilies.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredRecords / itemsPerPage));

  // Reset to page 1 whenever search or filter criteria change
  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleGotraChange = (val) => {
    setGotraFilter(val);
    setPage(1);
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleSortChange = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setGotraFilter('all');
    setStatusFilter('all');
    setSortBy('panchayat_family_id');
    setSortOrder('asc');
    setPage(1);
  };

  // 5. Automatic safety clamp: if current page exceeds totalPages
  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  // 6. Slice records for the current page
  const displayedFamilies = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return sortedFamilies.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedFamilies, page, itemsPerPage]);

  const openCreate = () => {
    setEditItem(null);
    reset({
      village: 'Konda',
      district: 'Dhar',
      state: 'Madhya Pradesh',
      pinCode: '454335',
      status: 'active',
      familyId: '',
      headOfFamily: '',
      surname: '',
      mobileNumber: '',
      whatsappNumber: '',
      agriculturalLandArea: '',
      numberOfMembers: '',
      address: '',
    });
    setModalOpen(true);
  };

  const openEdit = (family) => {
    setEditItem(family);
    reset({
      ...family,
      familyId: family.panchayat_family_id || family.familyId || '',
      headOfFamily: family.head_name || family.headOfFamily || '',
      surname: family.gotra || family.surname || '',
      mobileNumber: family.head_mobile || family.mobileNumber || '',
      whatsappNumber: family.whatsapp_number || family.whatsappNumber || '',
      agriculturalLandArea: family.land_area_acres !== undefined && family.land_area_acres !== null && family.land_area_acres !== 0 ? family.land_area_acres : (family.land_details_text || family.land_holding || family.agriculturalLandArea || ''),
      numberOfMembers: family.total_members || family.memberCount || family.numberOfMembers || '',
      village: family.village || 'Konda',
      district: family.district || 'Dhar',
      state: family.state || 'Madhya Pradesh',
      pinCode: family.pincode || family.pinCode || '454335',
      address: family.address || '',
      status: family.status || 'active',
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    const targetId = editItem ? (editItem.id || editItem._id) : null;
    const payload = {
      head_name: (data.headOfFamily || data.head_name || '').trim(),
      gotra: (data.surname || data.gotra || '').trim(),
      head_mobile: (data.mobileNumber || data.head_mobile || '').trim(),
      panchayat_family_id: String(data.familyId || data.panchayat_family_id || '').trim(),
      land_area_acres: data.agriculturalLandArea !== undefined && data.agriculturalLandArea !== '' ? Number(data.agriculturalLandArea) : (Number(data.land_area_acres) || 0),
      total_members: data.numberOfMembers ? Number(data.numberOfMembers) : (data.total_members ? Number(data.total_members) : undefined),
      village: data.village || 'Konda',
      tehsil: data.tehsil || 'Kukshi',
      district: data.district || 'Dhar',
      state: data.state || 'Madhya Pradesh',
      pin_code: data.pinCode || data.pin_code || '454335',
      status: data.status || 'active',
      notes: data.address || data.notes || null,
    };

    try {
      if (editItem && targetId) {
        await familyAPI.update(targetId, payload);
        toast.success('परिवार विवरण सफलतापूर्वक अपडेट हो गया!');
      } else {
        await familyAPI.create(payload);
        toast.success('नया परिवार सफलतापूर्वक जुड़ गया!');
      }
      setModalOpen(false);
      await fetchFamilies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'डेटा सेव करने में त्रुटि');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    const targetId = deleteItem.id || deleteItem._id;
    if (!targetId) return;
    setDeleting(true);
    try {
      await familyAPI.delete(targetId);
      setFamilies((prev) => prev.filter((item) => (item.id || item._id) !== targetId));
      toast.success('परिवार रिकॉर्ड हटा दिया गया!');
      setDeleteItem(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'रिकॉर्ड हटाने में त्रुटि');
    } finally {
      setDeleting(false);
    }
  };

  // Columns definition: S.No. displays the Family ID (panchayat_family_id)
  const columns = [
    {
      key: 'panchayat_family_id',
      label: 'S.No.',
      sortable: true,
      render: (_, row, idx) => (
        <button
          type="button"
          onClick={() => setSelectedFamilyForMembers(row)}
          className="font-mono font-bold text-[#7A2525] bg-[#FFF8EC] hover:bg-[#7A2525] hover:text-white px-2.5 py-1 rounded-lg border border-[#E8DCC8] hover:border-[#7A2525] transition cursor-pointer shadow-2xs"
          title="परिवार के सभी सदस्य देखें"
        >
          #{row.panchayat_family_id || row.familyId || ((page - 1) * itemsPerPage + idx + 1)}
        </button>
      ),
    },
    {
      key: 'head_name',
      label: 'मुखिया का नाम (Head)',
      sortable: true,
      render: (_, row) => (
        <button
          type="button"
          onClick={() => setSelectedFamilyForMembers(row)}
          className="text-left font-bold text-[#2B211B] hover:text-[#7A2525] hover:underline transition cursor-pointer flex items-center gap-1.5 group"
          title="परिवार के सभी सदस्य देखें"
        >
          <span>{row.head_name || row.headOfFamily || '—'}</span>
          <FiUsers className="w-3.5 h-3.5 text-[#C85A17] opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      ),
    },
    {
      key: 'gotra',
      label: 'गोत्र / उपनाम',
      sortable: true,
      render: (_, row) => <Badge variant="warning">{row.gotra || row.surname || '—'}</Badge>,
    },
    {
      key: 'head_mobile',
      label: 'मोबाइल नंबर',
      sortable: true,
      render: (_, row) => (row.head_mobile || row.mobileNumber) ? <span className="font-mono text-xs">{row.head_mobile || row.mobileNumber}</span> : '—',
    },
    { key: 'village', label: 'गाँव (Village)', sortable: true, render: (_, row) => row.village || 'Konda' },
    {
      key: 'total_members',
      label: 'कुल सदस्य',
      sortable: true,
      render: (_, row) => (
        <button
          type="button"
          onClick={() => setSelectedFamilyForMembers(row)}
          className="font-bold text-[#7A2525] hover:text-[#C85A17] hover:underline cursor-pointer flex items-center gap-1.5"
          title="परिवार के सभी सदस्य देखें"
        >
          <FiUsers className="w-3.5 h-3.5 text-[#C85A17]" />
          <span>
            {row.total_members || (Array.isArray(row.family_members) ? row.family_members.length : 0) || row.memberCount || row.numberOfMembers || 0} सदस्य
          </span>
        </button>
      ),
    },
    { key: 'status', label: 'स्थिति', sortable: true, render: (v) => <Badge variant={v === 'inactive' ? 'danger' : 'success'}>{v === 'inactive' ? 'निष्क्रिय' : 'सक्रिय'}</Badge> },
    {
      key: '_actions',
      label: 'कार्यवाही (Actions)',
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer" title="संपादित करें">
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteItem(row)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer" title="हटाएँ">
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const preventEnterSubmit = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  const isFiltered = search || gotraFilter !== 'all' || statusFilter !== 'all' || sortBy !== 'serialNumber' || sortOrder !== 'asc';

  return (
    <div className="space-y-6 text-[#2B211B]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DCC8] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FiUsers className="w-5 h-5 text-[#C85A17]" />
            <h1 className="text-xl sm:text-2xl font-black text-[#2B211B]">परिवार निर्देशिका प्रबंधन (Family Management)</h1>
          </div>
          <p className="text-[#766A60] text-xs sm:text-sm font-medium">गाँव एवं समाज के सभी पंजीकृत परिवारों का विवरण प्रबंधित करें।</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#7A2525] to-[#C85A17] hover:from-[#8C2C1D] hover:to-[#A7450D] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer"
        >
          <FiPlus className="w-4 h-4" /> नया परिवार जोड़ें (Add Family)
        </button>
      </div>

      {/* Filter & Sort Controls */}
      <div className="bg-white p-5 rounded-3xl border border-[#E8DCC8] shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#7A2525] uppercase tracking-wider">
            <FiFilter className="w-3.5 h-3.5 text-[#C85A17]" /> फ़िल्टर:
          </div>

          {/* Gotra Filter */}
          <select
            value={gotraFilter}
            onChange={(e) => handleGotraChange(e.target.value)}
            className="px-3 py-2 bg-[#FFF8EC] border border-[#E8DCC8] rounded-xl text-xs sm:text-sm font-semibold text-[#2B211B] focus:outline-none focus:ring-2 focus:ring-[#C85A17]/30"
          >
            <option value="all">सभी गोत्र (All Gotras)</option>
            {GOTRA_OPTIONS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 bg-[#FFF8EC] border border-[#E8DCC8] rounded-xl text-xs sm:text-sm font-semibold text-[#2B211B] focus:outline-none focus:ring-2 focus:ring-[#C85A17]/30"
          >
            <option value="all">सभी स्थिति (All Status)</option>
            <option value="active">सक्रिय (Active)</option>
            <option value="inactive">निष्क्रिय (Inactive)</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={`${sortBy}_${sortOrder}`}
            onChange={(e) => {
              const [col, ord] = e.target.value.split('_');
              handleSortChange(col, ord);
            }}
            className="px-3 py-2 bg-[#FFF8EC] border border-[#E8DCC8] rounded-xl text-xs sm:text-sm font-semibold text-[#2B211B] focus:outline-none focus:ring-2 focus:ring-[#C85A17]/30"
          >
            <option value="serialNumber_asc">क्रम: S.No. (1 ➔ 100...)</option>
            <option value="serialNumber_desc">क्रम: S.No. (उल्टा: 100 ➔ 1)</option>
            <option value="head_name_asc">मुखिया नाम (अ ➔ ज्ञ)</option>
            <option value="head_name_desc">मुखिया नाम (ज्ञ ➔ अ)</option>
            <option value="gotra_asc">गोत्र (अ ➔ ज्ञ)</option>
            <option value="total_members_desc">कुल सदस्य (अधिक ➔ कम)</option>
            <option value="total_members_asc">कुल सदस्य (कम ➔ अधिक)</option>
          </select>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition cursor-pointer"
            >
              <FiRotateCcw className="w-3 h-3" /> रीसेट
            </button>
          )}
        </div>

        <div className="text-xs font-bold text-[#766A60]">
          कुल परिवार: <span className="text-[#C85A17] font-mono text-sm">{totalFilteredRecords}</span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={displayedFamilies}
        loading={loading}
        totalPages={totalPages}
        currentPage={page}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        initialSortField={sortBy}
        initialSortDir={sortOrder}
        serverSide
        downloadable={true}
        title="परिवार सूची (Families Directory)"
        emptyIcon={FiUsers}
        emptyText="कोई परिवार नहीं मिला"
        emptyDescription="फ़िल्टर बदलें या नया परिवार जोड़ने के लिए ऊपर दिए गए बटन पर क्लिक करें।"
      />

      {/* Standardized Form Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'परिवार विवरण संपादित करें (Edit Family)' : 'नया परिवार पंजीकृत करें (Add Family)'}
        size="lg"
      >
        <form onKeyDown={preventEnterSubmit} onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-6">
          <FormSection title="1. मुख्य परिवार जानकारी (Basic Family Information)" icon={FiInfo}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="परिवार कोड / ID" required error={errors.familyId}>
                <input
                  {...register('familyId', { required: 'परिवार कोड आवश्यक है' })}
                  placeholder="उदा. KND-001"
                  className="input-field font-mono uppercase"
                />
              </FormField>

              <FormField label="मुखिया का नाम (Head of Family)" required error={errors.headOfFamily}>
                <input
                  {...register('headOfFamily', { required: 'मुखिया का नाम आवश्यक है' })}
                  placeholder="उदा. श्री रमेश जी सिर्वी"
                  className="input-field"
                />
              </FormField>

              <FormField label="गोत्र / उपनाम (Surname)" required error={errors.surname}>
                <input
                  {...register('surname', { required: 'उपनाम / गोत्र आवश्यक है' })}
                  placeholder="उदा. गेहलोत / पंवार / काग / बर्फा..."
                  className="input-field"
                />
              </FormField>

              <FormField label="पंजीकरण स्थिति (Status)">
                <select {...register('status')} className="input-field">
                  <option value="active">सक्रिय (Active)</option>
                  <option value="inactive">निष्क्रिय (Inactive)</option>
                </select>
              </FormField>

              <FormField label="कृषि भूमि रकबा (Agricultural Land Area)">
                <input
                  {...register('agriculturalLandArea')}
                  placeholder="उदा. 10 बीघा / 5 एकड़"
                  className="input-field"
                />
              </FormField>

              <FormField label="कुल सदस्य (Number of Members)">
                <input
                  type="number"
                  {...register('numberOfMembers')}
                  placeholder="सदस्यों की संख्या (उदा. 5)"
                  className="input-field"
                  min="0"
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="2. संपर्क विवरण (Contact Details)" icon={FiPhone}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="मोबाइल नंबर (Mobile Number)">
                <input
                  {...register('mobileNumber')}
                  placeholder="+91-9876543210"
                  className="input-field font-mono"
                />
              </FormField>

              <FormField label="व्हाट्सएप नंबर (WhatsApp Number)">
                <input
                  {...register('whatsappNumber')}
                  placeholder="+91-9876543210"
                  className="input-field font-mono"
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="3. पता एवं स्थान (Address & Location)" icon={FiMapPin}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="गाँव (Village)">
                <input {...register('village')} defaultValue="Konda" className="input-field" />
              </FormField>

              <FormField label="जिला (District)">
                <input {...register('district')} defaultValue="Dhar" className="input-field" />
              </FormField>

              <FormField label="राज्य (State)">
                <input {...register('state')} defaultValue="Madhya Pradesh" className="input-field" />
              </FormField>

              <FormField label="पिन कोड (PIN Code)">
                <input {...register('pinCode')} defaultValue="454335" className="input-field font-mono" />
              </FormField>
            </div>

            <FormField label="पूर्ण पता / मोहल्ला (Full Address)">
              <textarea
                {...register('address')}
                rows={2}
                placeholder="मकान नंबर, मोहल्ला / गली का नाम..."
                className="input-field resize-none"
              />
            </FormField>
          </FormSection>

          <FormActions
            onCancel={() => setModalOpen(false)}
            submitText={editItem ? 'बदलाव सहेजें (Save Changes)' : 'परिवार जोड़ें (Add Family)'}
            loading={saving}
          />
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="परिवार रिकॉर्ड हटाएँ"
        message={`क्या आप "${deleteItem?.headOfFamily}" का परिवार रिकॉर्ड हटाना चाहते हैं? इससे संबंधित सदस्यों का डेटा भी प्रभावित हो सकता है।`}
        isLoading={deleting}
      />

      <FamilyMembersModal
        isOpen={Boolean(selectedFamilyForMembers)}
        onClose={() => setSelectedFamilyForMembers(null)}
        family={selectedFamilyForMembers}
      />
    </div>
  );
};

export default FamiliesPage;
