import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiShield,
  FiAward,
  FiHeart,
  FiCheckCircle,
  FiFilter,
  FiSearch,
  FiPhone,
  FiMapPin,
  FiUserCheck,
} from 'react-icons/fi';
import { committeeAPI, gramUnitAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import ImageUpload from '../../components/common/ImageUpload';
import toast from 'react-hot-toast';

const committeeTypes = [
  { id: 'all', label: 'सभी समितियाँ (All)', icon: FiUsers },
  { id: 'sankal_panch', label: 'सकल पंच (Sakal Panch)', icon: FiShield },
  { id: 'women_committee', label: 'श्री आई जी महिला समिती', icon: FiHeart },
  { id: 'konda_gram_unit', label: 'कोणदा ग्राम इकाई (महासभा)', icon: FiAward },
  { id: 'yuva_sangathan', label: 'सिर्वी समाज युवा संगठन', icon: FiUsers },
  { id: 'sahayata_kosh', label: 'श्री आईं जी सहायता कोष समिति', icon: FiHeart },
  { id: 'bhavan_samiti', label: 'माँ अन्नपूर्णा भवन समिति', icon: FiAward },
  { id: 'committee', label: 'सामान्य कार्यकारिणी समिति', icon: FiUsers },
];

const designationsList = [
  'सकल पंच / वरिष्ठ मार्गदर्शक',
  'अध्यक्ष (President)',
  'महासचिव (General Secretary)',
  'उपाध्यक्ष (Vice President)',
  'सचिव (Secretary)',
  'सहसचिव (Joint Secretary)',
  'कोषाध्यक्ष (Treasurer)',
  'सह कोषाध्यक्ष (Joint Treasurer)',
  'तहसील प्रतिनिधि (Tehsil Rep)',
  'जिला प्रतिनिधि (District Rep)',
  'प्रदेश प्रतिनिधि (State Rep)',
  'कार्यकारिणी सदस्य (Member)',
  'सलाहकार / संरक्षक (Advisor/Patron)',
];

const CommitteePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, search };
      if (selectedType !== 'all') {
        params.type = selectedType;
      }
      const res = await committeeAPI.getAll(params);
      setItems(res.data?.data || []);
      setTotalPages(res.data?.pagination?.pages || 1);
    } catch {
      toast.error('समिति डेटा लोड करने में त्रुटि');
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      sakalPanch: items.filter((i) => i.type === 'sankal_panch').length,
      women: items.filter((i) => i.type === 'women_committee').length,
      gramUnit: items.filter((i) => i.type === 'konda_gram_unit' || i.type === 'sangathan').length,
    };
  }, [items]);

  const handleOpenAdd = () => {
    setEditItem(null);
    reset({
      name: '',
      designation: designationsList[0],
      type: selectedType !== 'all' ? selectedType : 'sankal_panch',
      phone: '',
      email: '',
      whatsapp: '',
      photo: '',
      bio: '',
      order: 0,
      status: 'active',
      representativeLevel: 'none',
      village: 'कोणदा',
      tehsil: 'कुक्षी',
      district: 'धार',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditItem(item);
    reset({
      ...item,
      status: item.isActive === false ? 'inactive' : 'active',
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        isActive: data.status === 'active',
        order: Number(data.order) || 0,
      };

      if (editItem) {
        await committeeAPI.update(editItem._id, payload);
        toast.success('समिति पदाधिकारी सफलतापूर्वक अद्यतन किया गया!');
      } else {
        await committeeAPI.create(payload);
        toast.success('नया समिति पदाधिकारी सफलतापूर्वक जोड़ा गया!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'सुरक्षित करने में विफलता');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    const targetId = deleteItem._id;
    setDeleting(true);
    try {
      await committeeAPI.delete(targetId);
      setItems((prev) => prev.filter((item) => item._id !== targetId));
      toast.success('समिति पदाधिकारी सफलतापूर्वक हटाया गया!');
      setDeleteItem(null);
      if (items.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'हटाने में विफलता');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'photo',
      label: 'फ़ोटो / अवतार',
      render: (v, r) => (
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7A2525] via-[#C85A17] to-[#C9A44C] p-0.5 shadow-sm flex items-center justify-center text-white font-black overflow-hidden">
          {v ? (
            <img src={v} alt={r.name} className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <span className="text-base">{r.name?.charAt(0) || 'प'}</span>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'नाम (Full Name)',
      sortable: true,
      render: (v, r) => (
        <div>
          <span className="font-bold text-[#2B211B] text-sm block">{v}</span>
          {r.phone && (
            <span className="text-xs text-[#766A60] flex items-center gap-1 mt-0.5">
              <FiPhone className="w-3 h-3 text-[#C85A17]" /> {r.phone}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'designation',
      label: 'पद (Designation)',
      render: (v) => (
        <span className="inline-block px-3 py-1 bg-[#FFF8EC] border border-[#E8DCC8] rounded-full text-xs font-extrabold text-[#7A2525]">
          {v}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'समिति प्रकार (Committee Type)',
      render: (v) => {
        const matchingType = committeeTypes.find((t) => t.id === v);
        return (
          <span className="inline-block px-3 py-1 bg-amber-50 border border-amber-200 text-[#C85A17] rounded-xl text-xs font-bold">
            {matchingType ? matchingType.label.split('(')[0] : v}
          </span>
        );
      },
    },
    {
      key: 'order',
      label: 'क्रम (Order)',
      render: (v) => <span className="font-mono text-xs font-bold">{v || 0}</span>,
    },
    {
      key: 'isActive',
      label: 'स्थिति (Status)',
      render: (v) => (
        <Badge variant={v !== false ? 'success' : 'warning'}>
          {v !== false ? 'सक्रिय' : 'निष्क्रिय'}
        </Badge>
      ),
    },
    {
      key: '_id',
      label: 'कार्यवाही (Actions)',
      render: (_, r) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenEdit(r)}
            className="p-2 text-blue-600 hover:bg-blue-50 :bg-blue-900/20 rounded-xl transition cursor-pointer"
            title="संपादित करें"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteItem(r)}
            className="p-2 text-red-600 hover:bg-red-50 :bg-red-900/20 rounded-xl transition cursor-pointer"
            title="हटाएँ"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-[#2B211B]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DCC8] shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFF8EC] border border-[#E8DCC8] rounded-full text-xs font-bold text-[#C85A17] uppercase tracking-wider mb-2">
            <FiShield className="w-3.5 h-3.5" /> केंद्रीय समिति प्रबंधन
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B211B]">
            समितियाँ एवं सकल पंच प्रबंधन
          </h1>
          <p className="text-xs sm:text-sm text-[#766A60] font-medium mt-1">
            सकल पंच, महिला समिति, ग्राम इकाई पदाधिकारी, प्रतिनिधि एवं अन्य सामाजिक समितियों का पूर्ण प्रबंधन
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#7A2525] to-[#C85A17] hover:from-[#5C1A1A] hover:to-[#B04C10] text-white font-extrabold rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm cursor-pointer self-start sm:self-auto"
        >
          <FiPlus className="w-4 h-4" /> नया सदस्य / पंच जोड़ें
        </button>
      </div>

      {/* Committee Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        {committeeTypes.map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedType(tab.id);
                setPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-[#7A2525] to-[#C85A17] text-white shadow-md font-black'
                  : 'bg-white text-[#2B211B] hover:bg-[#FFF8EC] border border-[#E8DCC8]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        totalPages={totalPages}
        currentPage={page}
        onPageChange={setPage}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        serverSide
        emptyIcon={FiUsers}
        emptyText="इस समिति में कोई सदस्य या पदाधिकारी उपलब्ध नहीं है।"
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'समिति सदस्य / पदाधिकारी संपादित करें' : 'नया समिति सदस्य / पंच जोड़ें'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A2525] mb-1.5">
                पूरा नाम (Full Name) *
              </label>
              <input
                {...register('name', { required: 'नाम आवश्यक है' })}
                placeholder="उदा. सुनिल/पन्नालाल जी भायल"
                className="w-full px-4 py-3 bg-[#FFF8EC] border border-[#E8DCC8] rounded-2xl text-[#2B211B] placeholder-[#766A60]/60 focus:outline-none focus:border-[#C85A17] focus:ring-2 focus:ring-[#C85A17]/20 text-sm font-medium"
              />
            </div>

            {/* Committee Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A2525] mb-1.5">
                समिति प्रकार (Committee Type) *
              </label>
              <select
                {...register('type', { required: true })}
                className="w-full px-4 py-3 bg-[#FFF8EC] border border-[#E8DCC8] rounded-2xl text-[#2B211B] focus:outline-none focus:border-[#C85A17] focus:ring-2 focus:ring-[#C85A17]/20 text-sm font-medium"
              >
                <option value="sankal_panch">सकल पंच (Sakal Panch)</option>
                <option value="women_committee">श्री आई जी महिला समिती (Women Committee)</option>
                <option value="konda_gram_unit">कोणदा ग्राम इकाई (महासभा)</option>
                <option value="yuva_sangathan">सिर्वी समाज युवा संगठन</option>
                <option value="sahayata_kosh">श्री आईं जी सहायता कोष समिति</option>
                <option value="bhavan_samiti">माँ अन्नपूर्णा भवन समिति</option>
                <option value="committee">सामान्य समिति (General Committee)</option>
                <option value="sangathan">सामाजिक संगठन (Sangathan)</option>
              </select>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A2525] mb-1.5">
                पद (Designation) *
              </label>
              <input
                {...register('designation', { required: 'पद आवश्यक है' })}
                placeholder="उदा. अध्यक्ष / सकल पंच / सचिव"
                list="designation-suggestions"
                className="w-full px-4 py-3 bg-[#FFF8EC] border border-[#E8DCC8] rounded-2xl text-[#2B211B] focus:outline-none focus:border-[#C85A17] focus:ring-2 focus:ring-[#C85A17]/20 text-sm font-medium"
              />
              <datalist id="designation-suggestions">
                {designationsList.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A2525] mb-1.5">
                मोबाइल नंबर (Phone)
              </label>
              <input
                {...register('phone')}
                placeholder="+91-9876543210"
                className="w-full px-4 py-3 bg-[#FFF8EC] border border-[#E8DCC8] rounded-2xl text-[#2B211B] focus:outline-none focus:border-[#C85A17] focus:ring-2 focus:ring-[#C85A17]/20 text-sm font-medium"
              />
            </div>

            {/* Representative Level */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A2525] mb-1.5">
                प्रतिनिधि स्तर (Rep Level)
              </label>
              <select
                {...register('representativeLevel')}
                className="w-full px-4 py-3 bg-[#FFF8EC] border border-[#E8DCC8] rounded-2xl text-[#2B211B] focus:outline-none focus:border-[#C85A17] focus:ring-2 focus:ring-[#C85A17]/20 text-sm font-medium"
              >
                <option value="none">कोई नहीं (Not a Representative)</option>
                <option value="tehsil">तहसील प्रतिनिधि (कुक्षी)</option>
                <option value="district">जिला प्रतिनिधि (धार)</option>
                <option value="state">प्रदेश प्रतिनिधि (मध्यप्रदेश)</option>
              </select>
            </div>

            {/* Priority / Order */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A2525] mb-1.5">
                प्राथमिकता क्रम (Order Number)
              </label>
              <input
                {...register('order')}
                type="number"
                placeholder="1, 2, 3..."
                className="w-full px-4 py-3 bg-[#FFF8EC] border border-[#E8DCC8] rounded-2xl text-[#2B211B] focus:outline-none focus:border-[#C85A17] focus:ring-2 focus:ring-[#C85A17]/20 text-sm font-medium"
              />
            </div>

            {/* Photo Upload */}
            <div className="sm:col-span-2">
              <ImageUpload
                value={watch('photo')}
                onChange={(url) => setValue('photo', url, { shouldDirty: true })}
                label="पदाधिकारी / पंच की फ़ोटो अपलोड करें (Upload Photo)"
                folder="committees"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A2525] mb-1.5">
                स्थिति (Status)
              </label>
              <select
                {...register('status')}
                className="w-full px-4 py-3 bg-[#FFF8EC] border border-[#E8DCC8] rounded-2xl text-[#2B211B] focus:outline-none focus:border-[#C85A17] focus:ring-2 focus:ring-[#C85A17]/20 text-sm font-medium"
              >
                <option value="active">सक्रिय (Active)</option>
                <option value="inactive">निष्क्रिय (Inactive)</option>
              </select>
            </div>
          </div>

          {/* Bio / Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#7A2525] mb-1.5">
              विशेष विवरण / परिचय (Bio / Notes)
            </label>
            <textarea
              {...register('bio')}
              rows={3}
              placeholder="समिति में भूमिका, योगदान एवं अतिरिक्त विवरण..."
              className="w-full px-4 py-3 bg-[#FFF8EC] border border-[#E8DCC8] rounded-2xl text-[#2B211B] focus:outline-none focus:border-[#C85A17] focus:ring-2 focus:ring-[#C85A17]/20 text-sm font-medium"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#E8DCC8]">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 text-sm font-bold text-[#766A60] bg-white border border-[#E8DCC8] rounded-2xl hover:bg-[#FFF8EC] transition cursor-pointer"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#7A2525] to-[#C85A17] hover:from-[#5C1A1A] hover:to-[#B04C10] rounded-2xl shadow-md hover:shadow-xl disabled:opacity-50 flex items-center gap-2 cursor-pointer transition"
            >
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editItem ? 'परिवर्तन सुरक्षित करें' : 'नया जोड़ें'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="समिति पदाधिकारी हटाएँ?"
        message={`क्या आप "${deleteItem?.name}" (${deleteItem?.designation}) को इस समिति से हटाना चाहते हैं? यह परिवर्तन सार्वजनिक वेबसाइट पर तुरंत प्रभावी होगा।`}
        isLoading={deleting}
      />
    </div>
  );
};

export default CommitteePage;

