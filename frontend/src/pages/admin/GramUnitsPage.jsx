import { useState, useEffect, useCallback } from 'react';
import {
  FiUsers,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiAward,
  FiUserCheck,
  FiCalendar,
  FiMapPin,
  FiSave,
  FiCheck,
} from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import { FormSection, FormField, FormActions } from '../../components/common/FormComponents';
import toast from 'react-hot-toast';
import { gramUnitAPI, gramUnitMemberAPI, formationEventAPI } from '../../services/api';

const GramUnitsPage = () => {
  const [activeTab, setActiveTab] = useState('office_bearers'); // 'unit_info', 'office_bearers', 'members', 'representatives', 'formation_event'
  const [unitData, setUnitData] = useState(null);
  const [loadingUnit, setLoadingUnit] = useState(true);
  const [savingUnit, setSavingUnit] = useState(false);

  // Members list states
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Forms
  const { register: registerUnit, handleSubmit: handleUnitSubmit, reset: resetUnit } = useForm();
  const { register: registerMember, handleSubmit: handleMemberSubmit, reset: resetMember, setValue: setMemberValue } = useForm();

  // Load Unit info
  const fetchUnitData = useCallback(async () => {
    setLoadingUnit(true);
    try {
      const res = await gramUnitAPI.getPublicDetails();
      if (res.data?.success) {
        setUnitData(res.data.data);
        resetUnit(res.data.data.unit || {});
      }
    } catch {
      toast.error('Failed to load Gram Unit details');
    } finally {
      setLoadingUnit(false);
    }
  }, [resetUnit]);

  // Load members / representatives based on active tab
  const fetchMembers = useCallback(async () => {
    if (activeTab === 'unit_info' || activeTab === 'formation_event') return;

    setLoading(true);
    try {
      let category = 'office_bearer';
      let representativeLevel = undefined;

      if (activeTab === 'members') category = 'member';
      if (activeTab === 'representatives') category = 'representative';

      const res = await gramUnitMemberAPI.getAll({
        page,
        limit: 20,
        search,
        category,
        representativeLevel,
      });

      setItems(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, search]);

  useEffect(() => {
    fetchUnitData();
  }, [fetchUnitData]);

  useEffect(() => {
    setPage(1);
    fetchMembers();
  }, [activeTab, fetchMembers]);

  // Save Unit Info
  const onSaveUnit = async (formData) => {
    if (!unitData?.unit?._id) return;
    setSavingUnit(true);
    try {
      await gramUnitAPI.update(unitData.unit._id, formData);
      toast.success('Gram Unit updated successfully!');
      fetchUnitData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update unit');
    } finally {
      setSavingUnit(false);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditItem(null);
    let defaultCat = 'office_bearer';
    let defaultDesig = 'अध्यक्ष';
    let defaultRepLevel = 'none';

    if (activeTab === 'members') {
      defaultCat = 'member';
      defaultDesig = 'सदस्य';
    } else if (activeTab === 'representatives') {
      defaultCat = 'representative';
      defaultDesig = 'तहसील प्रतिनिधि';
      defaultRepLevel = 'tehsil';
    }

    resetMember({
      name: '',
      category: defaultCat,
      designation: defaultDesig,
      representativeLevel: defaultRepLevel,
      phone: '',
      order: items.length + 1,
      gramUnit: unitData?.unit?._id,
      organization: unitData?.organization?._id,
      isActive: true,
    });
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditItem(item);
    resetMember(item);
    setModalOpen(true);
  };

  // Save Member
  const onSaveMember = async (formData) => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        gramUnit: unitData?.unit?._id,
        organization: unitData?.organization?._id,
      };

      if (editItem) {
        await gramUnitMemberAPI.update(editItem._id, payload);
        toast.success('Record updated successfully!');
      } else {
        await gramUnitMemberAPI.create(payload);
        toast.success('Record added successfully!');
      }
      setModalOpen(false);
      fetchMembers();
      fetchUnitData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Delete Member
  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await gramUnitMemberAPI.delete(deleteItem._id);
      toast.success('Record deleted permanently!');
      setDeleteItem(null);
      fetchMembers();
      fetchUnitData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'नाम (Name)',
      render: (v) => <span className="font-bold text-gray-900 [#FFF8F0]">{v}</span>,
    },
    {
      key: 'designation',
      label: 'पद / दायित्व (Position)',
      render: (v) => <Badge variant="primary">{v}</Badge>,
    },
    ...(activeTab === 'representatives'
      ? [
          {
            key: 'representativeLevel',
            label: 'प्रतिनिधि स्तर (Level)',
            render: (v) => {
              const labelMap = {
                tehsil: 'तहसील स्तर',
                district: 'जिला स्तर',
                state: 'प्रदेश स्तर',
                gram: 'ग्राम स्तर',
              };
              return <Badge variant={v === 'state' ? 'warning' : 'primary'}>{labelMap[v] || v}</Badge>;
            },
          },
        ]
      : []),
    {
      key: 'order',
      label: 'क्रम (Order)',
      render: (v) => <span className="text-xs font-semibold">{v ?? 0}</span>,
    },
    {
      key: 'isActive',
      label: 'स्थिति (Status)',
      render: (v) => <Badge variant={v ? 'success' : 'danger'}>{v ? 'सक्रिय (Active)' : 'निष्क्रिय'}</Badge>,
    },
    {
      key: '_actions',
      label: 'कार्य (Actions)',
      render: (_, r) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenEdit(r)}
            className="p-1.5 text-blue-500 hover:bg-blue-50 :bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
            title="Edit"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteItem(r)}
            className="p-1.5 text-red-500 hover:bg-red-50 :bg-red-500/10 rounded-lg transition-colors cursor-pointer"
            title="Delete"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 [#FFF8F0]">
            अखिल भारतीय सिर्वी महासभा — कोणदा ग्राम इकाई
          </h1>
          <p className="text-gray-500 [#FDE68A] text-sm mt-0.5">
            ग्राम इकाई पदाधिकारी, सदस्य, प्रतिनिधि एवं गठन विवरण प्रबंधन
          </p>
        </div>

        {activeTab !== 'unit_info' && activeTab !== 'formation_event' && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 shadow-md shadow-orange-500/30 transition-all cursor-pointer text-sm"
          >
            <FiPlus className="w-4 h-4" />
            नया जोड़ें (Add New)
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-200 [#7F1D1D] gap-1">
        {[
          { id: 'office_bearers', label: 'पदाधिकारी (Office Bearers)', icon: FiAward },
          { id: 'members', label: 'सदस्य (Members)', icon: FiUsers },
          { id: 'representatives', label: 'प्रतिनिधि (Representatives)', icon: FiUserCheck },
          { id: 'unit_info', label: 'इकाई विवरण (Unit Info)', icon: FiMapPin },
          { id: 'formation_event', label: 'गठन समारोह (Formation)', icon: FiCalendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 -mb-[2px] transition-all cursor-pointer rounded-t-lg ${
                isActive
                  ? 'border-orange-500 text-orange-500 [#F59E0B] bg-orange-500/10'
                  : 'border-transparent text-gray-500 hover:text-gray-900 :text-[#FFF8F0]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Office Bearers, Members, Representatives (Data Table View) */}
      {activeTab !== 'unit_info' && activeTab !== 'formation_event' && (
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
          emptyText="कोई रिकॉर्ड नहीं मिला"
        />
      )}

      {/* TAB 2: Unit Information Edit Form */}
      {activeTab === 'unit_info' && (
        <div className="bg-white [#3B0A0A] rounded-2xl p-6 border border-gray-200 [#7F1D1D] shadow-lg">
          <h2 className="text-lg font-bold text-gray-900 [#FFF8F0] mb-4 flex items-center gap-2">
            <FiMapPin className="text-[#F59E0B]" />
            ग्राम इकाई एवं संगठन विवरण संपादित करें
          </h2>

          <form onSubmit={handleUnitSubmit(onSaveUnit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 [#FDE68A] mb-1">
                  संगठन का नाम (Organization)
                </label>
                <input
                  {...registerUnit('organizationName')}
                  className="input-field"
                  placeholder="अखिल भारतीय सिर्वी महासभा मध्यप्रदेश"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 [#FDE68A] mb-1">
                  इकाई का नाम (Gram Unit Name)
                </label>
                <input
                  {...registerUnit('unitName')}
                  className="input-field"
                  placeholder="कोणदा ग्राम इकाई"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 [#FDE68A] mb-1">
                  ग्राम (Village)
                </label>
                <input {...registerUnit('village')} className="input-field" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 [#FDE68A] mb-1">
                  तहसील (Tehsil)
                </label>
                <input {...registerUnit('tehsil')} className="input-field" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 [#FDE68A] mb-1">
                  जिला (District)
                </label>
                <input {...registerUnit('district')} className="input-field" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 [#FDE68A] mb-1">
                  राज्य (State)
                </label>
                <input {...registerUnit('state')} className="input-field" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 [#FDE68A] mb-1">
                  नियुक्त पर्यवेक्षक (Supervisor)
                </label>
                <input {...registerUnit('supervisor')} className="input-field" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 [#FDE68A] mb-1">
                  चयन प्रक्रिया (Selection Method)
                </label>
                <input {...registerUnit('selectionMethod')} className="input-field" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 [#FDE68A] mb-1">
                आधिकारिक विवरण (Official Description)
              </label>
              <textarea
                {...registerUnit('description')}
                rows={4}
                className="input-field resize-y"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingUnit}
                className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-orange-500/20"
              >
                {savingUnit ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiSave className="w-4 h-4" />
                )}
                परिवर्तन सहेजें (Save Changes)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Formation Event Overview & Edit */}
      {activeTab === 'formation_event' && (
        <div className="bg-white [#3B0A0A] rounded-2xl p-6 border border-gray-200 [#7F1D1D] shadow-lg space-y-4">
          <h2 className="text-lg font-bold text-gray-900 [#FFF8F0] mb-2 flex items-center gap-2">
            <FiCalendar className="text-[#F59E0B]" />
            ग्राम इकाई गठन समारोह विवरण
          </h2>

          <div className="p-4 rounded-xl bg-gray-50 [#230505] border border-gray-200 [#7F1D1D]/60 space-y-3 text-sm">
            <p>
              <strong className="text-orange-500">कार्यक्रम शीर्षक:</strong>{' '}
              {unitData?.formationEvent?.title || 'कोणदा ग्राम इकाई गठन'}
            </p>
            <p>
              <strong className="text-orange-500">आयोजन स्थल:</strong>{' '}
              {unitData?.formationEvent?.location || 'ग्राम कोणदा, तहसील कुक्षी, मध्यप्रदेश'}
            </p>
            <p>
              <strong className="text-orange-500">नियुक्त पर्यवेक्षक:</strong>{' '}
              {unitData?.formationEvent?.supervisor || 'हिरालालजी हम्मड कापसी'}
            </p>
            <p>
              <strong className="text-orange-500">चयन विधि:</strong>{' '}
              {unitData?.formationEvent?.selectionMethod || 'सर्वसम्मति से'}
            </p>
            <p>
              <strong className="text-orange-500">विवरण:</strong>{' '}
              {unitData?.formationEvent?.description || unitData?.unit?.description}
            </p>
          </div>
        </div>
      )}

      {/* Modal for Add/Edit Member */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editItem
            ? `सदस्य विवरण संपादित करें (${editItem.name})`
            : activeTab === 'office_bearers'
            ? 'नया पदाधिकारी जोड़ें (Add Office Bearer)'
            : activeTab === 'members'
            ? 'नया ग्राम सदस्य जोड़ें (Add Member)'
            : 'नया प्रतिनिधि जोड़ें (Add Representative)'
        }
        size="lg"
      >
        <form onSubmit={handleMemberSubmit(onSaveMember)} className="p-6 sm:p-8 space-y-6">
          <FormSection title="1. नाम व पद विवरण (Member & Designation)" icon={FiUsers}>
            <FormField label="पूरा नाम व पिता/पति का नाम (Full Name with Father/Family)" required>
              <input
                {...registerMember('name', { required: true })}
                placeholder="उदा. सुनिल/पन्नालाल जी भायल"
                className="input-field"
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="श्रेणी (Category)">
                <select {...registerMember('category')} className="input-field">
                  <option value="office_bearer">पदाधिकारी (Office Bearer)</option>
                  <option value="member">ग्राम सदस्य (Member)</option>
                  <option value="representative">प्रतिनिधि (Representative)</option>
                </select>
              </FormField>

              <FormField label="पद / दायित्व (Designation)" required>
                <input
                  {...registerMember('designation', { required: true })}
                  placeholder="उदा. अध्यक्ष, उपाध्यक्ष, सचिव, आदि"
                  className="input-field"
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="2. प्रतिनिधि स्तर एवं प्राथमिकता (Level & Order)" icon={FiAward}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="प्रतिनिधि स्तर (Representative Level)">
                <select {...registerMember('representativeLevel')} className="input-field">
                  <option value="none">लागू नहीं (None)</option>
                  <option value="tehsil">तहसील प्रतिनिधि (कुक्षी)</option>
                  <option value="district">जिला प्रतिनिधि (धार)</option>
                  <option value="state">प्रदेश प्रतिनिधि (मध्यप्रदेश)</option>
                  <option value="gram">ग्राम प्रतिनिधि (कोणदा)</option>
                </select>
              </FormField>

              <FormField label="प्रदर्शन क्रम संख्या (Display Order)">
                <input
                  type="number"
                  {...registerMember('order')}
                  defaultValue={1}
                  className="input-field font-mono"
                />
              </FormField>
            </div>
          </FormSection>

          <FormActions
            onCancel={() => setModalOpen(false)}
            submitText={editItem ? 'परिवर्तन सहेजें (Save Changes)' : 'सहेजें व जोड़ें (Save)'}
            loading={saving}
          />
        </form>
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="रिकॉर्ड हटाएं (Delete Record)"
        message={`क्या आप वाकई "${deleteItem?.name}" को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।`}
        isLoading={deleting}
      />
    </div>
  );
};

export default GramUnitsPage;
