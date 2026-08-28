import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiMapPin, FiPhone, FiInfo } from 'react-icons/fi';
import { familyAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import { FormSection, FormField, FormActions } from '../../components/common/FormComponents';
import toast from 'react-hot-toast';

const FamiliesPage = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchFamilies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await familyAPI.getAll({ page, limit: 10, search });
      setFamilies(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch { toast.error('परिवार सूची लोड करने में त्रुटि'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchFamilies(); }, [fetchFamilies]);

  const openCreate = () => { setEditItem(null); reset({ village: 'Konda', district: 'Dhar', state: 'Madhya Pradesh', pinCode: '454335', status: 'active' }); setModalOpen(true); };
  const openEdit = (family) => { setEditItem(family); reset(family); setModalOpen(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editItem) {
        await familyAPI.update(editItem._id, data);
        toast.success('परिवार विवरण सफलतापूर्वक अपडेट हो गया!');
      } else {
        await familyAPI.create(data);
        toast.success('नया परिवार सफलतापूर्वक जुड़ गया!');
      }
      setModalOpen(false);
      fetchFamilies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'डेटा सेव करने में त्रुटि');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    const targetId = deleteItem._id;
    setDeleting(true);
    try {
      await familyAPI.delete(targetId);
      setFamilies((prev) => prev.filter((item) => item._id !== targetId));
      toast.success('परिवार रिकॉर्ड हटा दिया गया!');
      setDeleteItem(null);
      if (families.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchFamilies();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'रिकॉर्ड हटाने में त्रुटि');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'familyId', label: 'S.No.', sortable: false, render: (v, row, idx) => <span className="font-mono font-bold text-[#7A2525] bg-[#FFF8EC] px-2.5 py-1 rounded-lg border border-[#E8DCC8]">{(page - 1) * 10 + idx + 1}</span> },
    { key: 'headOfFamily', label: 'मुखिया का नाम (Head)', sortable: true, render: (v) => <span className="font-bold text-[#2B211B]">{v}</span> },
    { key: 'surname', label: 'गोत्र / उपनाम', sortable: true, render: (v) => <Badge variant="warning">{v}</Badge> },
    { key: 'mobileNumber', label: 'मोबाइल नंबर', render: (v) => v ? <span className="font-mono text-xs">{v}</span> : '—' },
    { key: 'village', label: 'गाँव (Village)' },
    { key: 'memberCount', label: 'कुल सदस्य', render: (v) => <span className="font-bold">{v || 0} सदस्य</span> },
    { key: 'status', label: 'स्थिति', render: (v) => <Badge variant={v === 'active' ? 'success' : 'danger'}>{v === 'active' ? 'सक्रिय' : 'निष्क्रिय'}</Badge> },
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

      <DataTable
        columns={columns}
        data={families}
        loading={loading}
        totalPages={totalPages}
        currentPage={page}
        onPageChange={setPage}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        serverSide
        emptyIcon={FiUsers}
        emptyText="कोई परिवार नहीं मिला"
        emptyDescription="पहला परिवार जोड़ने के लिए ऊपर दिए गए बटन पर क्लिक करें।"
      />

      {/* Standardized Form Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'परिवार विवरण संपादित करें (Edit Family)' : 'नया परिवार पंजीकृत करें (Add Family)'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-6">
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
    </div>
  );
};

export default FamiliesPage;
