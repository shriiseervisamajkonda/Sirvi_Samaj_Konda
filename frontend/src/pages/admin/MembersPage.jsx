import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiBriefcase, FiUsers, FiPhone } from 'react-icons/fi';
import { memberAPI, familyAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import ImageUpload from '../../components/common/ImageUpload';
import SearchableSelect from '../../components/common/SearchableSelect';
import { FormSection, FormField, FormActions } from '../../components/common/FormComponents';
import toast from 'react-hot-toast';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const MembersPage = () => {
  const [members, setMembers] = useState([]);
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

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await memberAPI.getAll({ page, limit: 10, search });
      setMembers(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch { toast.error('सदस्य सूची लोड करने में त्रुटि'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    familyAPI.getAll({ limit: 200 }).then((res) => setFamilies(res.data.data || [])).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditItem(null);
    reset({
      village: 'Konda',
      status: 'active',
      gender: 'male',
      firstName: '',
      lastName: '',
      guardianName: '',
      phone: '',
      bloodGroup: 'Unknown',
      maritalStatus: 'single',
      occupation: '',
      education: '',
      relation: '',
    });
    setModalOpen(true);
  };

  const openEdit = (member) => {
    setEditItem(member);
    reset({
      ...member,
      firstName: member.first_name || member.firstName || (member.full_name ? member.full_name.split(' ')[0] : ''),
      lastName: member.last_name || member.lastName || (member.full_name ? member.full_name.split(' ').slice(1).join(' ') : ''),
      guardianName: member.relative_name || member.guardianName || '',
      phone: member.mobile_number || member.phone || '',
      bloodGroup: member.blood_group || member.bloodGroup || 'Unknown',
      maritalStatus: member.marital_status || member.maritalStatus || 'single',
      gender: member.gender || 'male',
      occupation: member.occupation || '',
      education: member.education || '',
      relation: member.relation_to_head || member.relation || '',
      family: member.family_id || member.family?._id || member.family?.id || '',
      village: member.village || 'Konda',
      status: member.life_status || (member.status === 'inactive' ? 'deceased' : 'active'),
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    const targetId = editItem ? (editItem.id || editItem._id) : null;
    
    // Clean and map payload for both schemas
    const fName = (data.firstName || data.first_name || '').trim();
    const lName = (data.lastName || data.last_name || '').trim();
    const guardian = (data.guardianName || data.relative_name || '').trim();
    const fullName = fName && lName
      ? `${fName} ${lName}`.trim()
      : (data.full_name || fName || '');

    const rawBg = data.bloodGroup || data.blood_group || 'unknown';
    const cleanBg = rawBg.toLowerCase() === 'unknown' ? 'unknown' : rawBg;
    const cleanStatus = ['active', 'deceased', 'married_out', 'moved_away'].includes(data.status)
      ? data.status
      : (data.status === 'inactive' ? 'deceased' : 'active');

    const payload = {
      first_name: fName,
      last_name: lName,
      full_name: fullName,
      family_id: data.family || data.family_id || undefined,
      mobile_number: data.phone || data.mobile_number || null,
      relative_name: guardian || null,
      blood_group: cleanBg,
      relation_to_head: data.relation || data.relation_to_head || 'other',
      marital_status: data.maritalStatus || data.marital_status || 'single',
      gender: data.gender || 'male',
      education: data.education || null,
      occupation: data.occupation || null,
      dob: data.dateOfBirth || data.dob || null,
      life_status: cleanStatus,
    };

    try {
      if (editItem && targetId) {
        await memberAPI.update(targetId, payload);
        toast.success('सदस्य विवरण सफलतापूर्वक अपडेट हुआ!');
      } else {
        await memberAPI.create(payload);
        toast.success('नया सदस्य सफलतापूर्वक जुड़ गया!');
      }
      setModalOpen(false);
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'डेटा सेव करने में त्रुटि');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    const targetId = deleteItem.id || deleteItem._id;
    if (!targetId) return;
    setDeleting(true);
    try {
      await memberAPI.delete(targetId);
      setMembers((prev) => prev.filter((item) => (item.id || item._id) !== targetId));
      toast.success('सदस्य रिकॉर्ड हटा दिया गया!');
      setDeleteItem(null);
      if (members.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchMembers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'रिकॉर्ड हटाने में त्रुटि');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'photo',
      label: 'फ़ोटो',
      render: (v, r) => (
        <div className="w-10 h-10 rounded-2xl overflow-hidden bg-gradient-to-br from-[#7A2525] to-[#C85A17] p-0.5 shadow-xs">
          {v ? (
            <img src={v} alt={r.firstName} className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <div className="w-full h-full bg-[#FFF8EC] rounded-2xl flex items-center justify-center font-black text-xs text-[#7A2525]">
              {r.firstName?.charAt(0) || 'M'}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'firstName',
      label: 'नाम',
      sortable: true,
      render: (_, r) => {
        const name = r.full_name || `${r.firstName || ''} ${r.lastName || ''}`.trim() || '—';
        const guardian = r.relative_name || r.guardianName;
        return (
          <div>
            <div className="font-bold text-[#2B211B]">{name}</div>
            {guardian && <div className="text-xs text-gray-500">S/O, W/O: {guardian}</div>}
          </div>
        );
      },
    },
    { key: 'gender', label: 'लिंग', sortable: true, render: (v) => <Badge variant={v === 'female' ? 'warning' : 'info'}>{v === 'female' ? 'महिला' : v === 'male' ? 'पुरुष' : v || '—'}</Badge> },
    {
      key: 'bloodGroup',
      label: 'रक्त समूह',
      sortable: true,
      render: (_, r) => {
        const bg = r.blood_group || r.bloodGroup;
        return bg && bg !== 'Unknown' ? (
          <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-md font-mono text-xs font-bold">{bg}</span>
        ) : '—';
      },
    },
    {
      key: 'education',
      label: 'शैक्षणिक योग्यता (Education)',
      sortable: true,
      render: (v, r) => {
        const edu = v || r.qualification || r.education;
        return edu ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-[#FFF8EC] text-[#7A2525] border border-[#E8DCC8]">
            {edu}
          </span>
        ) : '—';
      },
    },
    { key: 'occupation', label: 'व्यवसाय', sortable: true, render: (v) => v || '—' },
    {
      key: 'family',
      label: 'परिवार',
      sortable: true,
      render: (_, r) => {
        if (r.families?.head_name) return `${r.families.head_name} (${r.families.panchayat_family_id || ''})`;
        if (r.family?.headOfFamily) return `${r.family.headOfFamily} (${r.family.familyId || ''})`;
        if (r.panchayat_family_id) return `परिवार #${r.panchayat_family_id}`;
        return '—';
      },
    },
    {
      key: 'phone',
      label: 'फ़ोन',
      sortable: true,
      render: (_, r) => {
        const num = r.mobile_number || r.phone;
        return num ? <span className="font-mono text-xs">{num}</span> : '—';
      },
    },
    { key: 'status', label: 'स्थिति', sortable: true, render: (v) => <Badge variant={v === 'inactive' ? 'danger' : 'success'}>{v === 'inactive' ? 'निष्क्रिय' : 'सक्रिय'}</Badge> },
    {
      key: '_actions',
      label: 'कार्यवाही',
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

  return (
    <div className="space-y-6 text-[#2B211B]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DCC8] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FiUser className="w-5 h-5 text-[#C85A17]" />
            <h1 className="text-xl sm:text-2xl font-black text-[#2B211B]">समाज सदस्य प्रबंधन (Member Directory)</h1>
          </div>
          <p className="text-[#766A60] text-xs sm:text-sm font-medium">समाज के सभी पंजीकृत महिला, पुरुष व बच्चों की जानकारी प्रबंधित करें।</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#7A2525] to-[#C85A17] hover:from-[#8C2C1D] hover:to-[#A7450D] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer"
        >
          <FiPlus className="w-4 h-4" /> नया सदस्य जोड़ें (Add Member)
        </button>
      </div>

      <DataTable
        columns={columns}
        data={members}
        loading={loading}
        totalPages={totalPages}
        currentPage={page}
        onPageChange={setPage}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        serverSide
        downloadable={true}
        title="सदस्य विवरण सूची (Members Directory)"
        emptyIcon={FiUser}
        emptyText="कोई सदस्य नहीं मिला"
      />

      {/* Form Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'सदस्य विवरण संपादित करें (Edit Member)' : 'नया सदस्य जोड़ें (Add Member)'}
        size="xl"
      >
        <form onKeyDown={preventEnterSubmit} onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-6">
          <FormSection title="1. व्यक्तिगत जानकारी (Personal Information)" icon={FiUser}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="प्रथम नाम (First Name)" required error={errors.firstName}>
                <input {...register('firstName', { required: 'प्रथम नाम आवश्यक है' })} placeholder="उदा. राहुल" className="input-field" />
              </FormField>

              <FormField label="पिता/पति का नाम (Father/Husband Name)">
                <input {...register('guardianName')} placeholder="उदा. सुरेश जी" className="input-field" />
              </FormField>

              <FormField label="उपनाम / गोत्र (Last Name)">
                <input {...register('lastName')} placeholder="उदा. पंवार / बर्फा / काग" className="input-field" />
              </FormField>

              <FormField label="लिंग (Gender)" required error={errors.gender}>
                <select {...register('gender', { required: 'लिंग चुनें' })} className="input-field">
                  <option value="male">पुरुष (Male)</option>
                  <option value="female">महिला (Female)</option>
                  <option value="other">अन्य (Other)</option>
                </select>
              </FormField>

              <FormField label="रक्त समूह (Blood Group)">
                <select {...register('bloodGroup')} className="input-field">
                  <option value="">रक्त समूह चुनें</option>
                  {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </FormField>

              <FormField label="जन्म दिनांक (Date of Birth)">
                <input {...register('dateOfBirth')} type="date" className="input-field" />
              </FormField>

              <FormField label="वैवाहिक स्थिति (Marital Status)">
                <select {...register('maritalStatus')} className="input-field">
                  <option value="">स्थिति चुनें</option>
                  <option value="single">अविवाहित (Single)</option>
                  <option value="married">विवाहित (Married)</option>
                  <option value="divorced">तलाकशुदा (Divorced)</option>
                  <option value="widowed">विधवा / विधुर (Widowed)</option>
                </select>
              </FormField>
            </div>
          </FormSection>

          <FormSection title="2. शिक्षा एवं व्यवसाय (Education & Occupation)" icon={FiBriefcase}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="शैक्षणिक योग्यता (Education)">
                <input {...register('education')} placeholder="उदा. B.Com / 12th / MBA" className="input-field" />
              </FormField>

              <FormField label="व्यवसाय / पद (Occupation)">
                <input {...register('occupation')} placeholder="उदा. कृषि / व्यापार / इंजीनियर" className="input-field" />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="3. परिवार व निवास (Family & Residence)" icon={FiUsers}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="संबंधित परिवार (Family)">
                <SearchableSelect
                  options={families.map(f => ({
                    value: f.id || f._id,
                    label: `${f.head_name || f.headOfFamily || 'परिवार'} (${f.panchayat_family_id || f.familyId || ''}) - ${f.gotra || ''}`
                  }))}
                  value={watch('family')}
                  onChange={(val) => setValue('family', val, { shouldDirty: true })}
                  placeholder="परिवार चुनें (Select Family)"
                  searchPlaceholder="परिवार मुखिया या ID खोजें..."
                />
              </FormField>

              <FormField label="गाँव (Village)">
                <input {...register('village')} defaultValue="Konda" className="input-field" />
              </FormField>

              <FormField label="सक्रिय स्थिति (Life Status)">
                <select {...register('status')} className="input-field">
                  <option value="active">सक्रिय / जीवित (Active)</option>
                  <option value="deceased">स्वर्गवासी (Deceased)</option>
                  <option value="married_out">विवाहित अन्यत्र (Married Out)</option>
                  <option value="moved_away">अन्यत्र स्थानांतरित (Moved Away)</option>
                </select>
              </FormField>
            </div>
          </FormSection>

          <FormSection title="4. संपर्क व फ़ोटो (Contact & Photo)" icon={FiPhone}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="फ़ोन / मोबाइल नंबर">
                <input {...register('phone')} placeholder="+91-9876543210" className="input-field font-mono" />
              </FormField>

              <FormField label="ईमेल पता (Email)">
                <input {...register('email')} type="email" placeholder="example@domain.com" className="input-field" />
              </FormField>
            </div>

            <div className="pt-2">
              <ImageUpload
                value={watch('photo')}
                onChange={(url) => setValue('photo', url, { shouldDirty: true })}
                label="सदस्य फ़ोटो (Member Photo)"
                folder="members"
              />
            </div>
          </FormSection>

          <FormActions
            onCancel={() => setModalOpen(false)}
            submitText={editItem ? 'बदलाव सहेजें (Save Changes)' : 'सदस्य जोड़ें (Add Member)'}
            loading={saving}
          />
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="सदस्य रिकॉर्ड हटाएँ"
        message={`क्या आप "${deleteItem?.firstName} ${deleteItem?.lastName || ''}" का सदस्य रिकॉर्ड हटाना चाहते हैं?`}
        isLoading={deleting}
      />
    </div>
  );
};

export default MembersPage;
