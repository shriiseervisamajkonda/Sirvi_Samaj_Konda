import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiBook } from 'react-icons/fi';
import { studentAPI, memberAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

const StudentsPage = () => {
  const [items, setItems] = useState([]);
  const [members, setMembers] = useState([]);
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentAPI.getAll({ page, limit: 10, search });
      setItems(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    memberAPI.getAll({ limit: 200 }).then((res) => setMembers(res.data.data || [])).catch(() => {});
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    const targetId = editItem ? (editItem.id || editItem._id) : null;
    const payload = {
      ...data,
      college_name: data.collegeName || data.college_name,
      current_year: data.currentYear || data.current_year,
    };
    try {
      if (editItem && targetId) {
        await studentAPI.update(targetId, payload);
        toast.success('Updated!');
      } else {
        await studentAPI.create(payload);
        toast.success('Added!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
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
      await studentAPI.delete(targetId);
      setItems((prev) => prev.filter((item) => (item.id || item._id) !== targetId));
      toast.success('Student record deleted successfully!');
      setDeleteItem(null);
      if (items.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'member',
      label: 'Name',
      render: (_, r) => <span className="font-medium">{r.name || r.full_name || (r.member?.firstName ? `${r.member.firstName} ${r.member.lastName || ''}` : '—')}</span>,
    },
    { key: 'collegeName', label: 'College/School', sortable: true, render: (_, r) => r.college_name || r.collegeName || '—' },
    { key: 'course', label: 'Course', render: (v) => v || '—' },
    {
      key: 'currentYear',
      label: 'Year',
      render: (_, r) => {
        const y = r.current_year || r.currentYear;
        return y ? <Badge variant="info">Year {y}</Badge> : '—';
      },
    },
    { key: 'cgpa', label: 'CGPA / %', render: (v) => v || '—' },
    { key: 'scholarship', label: 'Scholarship', render: (v) => v ? <Badge variant="success">Yes</Badge> : <Badge variant="default">No</Badge> },
    {
      key: '_actions',
      label: 'Actions',
      render: (_, r) => (
        <div className="flex gap-2">
          <button onClick={() => { setEditItem(r); reset(r); setModalOpen(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
          <button onClick={() => setDeleteItem(r)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 ">Student Management</h1><p className="text-gray-500 text-sm mt-1">Manage student records</p></div>
        <button onClick={() => { setEditItem(null); reset({}); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 shadow-md shadow-orange-500/30">
          <FiPlus className="w-4 h-4" /> Add Student
        </button>
      </div>
      <DataTable columns={columns} data={items} loading={loading} totalPages={totalPages} currentPage={page}
        onPageChange={setPage} onSearchChange={(v) => { setSearch(v); setPage(1); }} serverSide emptyIcon={FiBook} emptyText="No students found" />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Student' : 'Add Student'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Member *</label>
              <select {...register('member', { required: true })} className="input-field">
                <option value="">Select member</option>
                {members.map(m => <option key={m._id} value={m._id}>{m.firstName} {m.lastName}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">School/College</label><input {...register('collegeName')} placeholder="Institution name" className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">University</label><input {...register('universityName')} placeholder="University" className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Course</label><input {...register('course')} placeholder="Course/Stream" className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Current Year</label>
              <select {...register('currentYear')} className="input-field">
                <option value="">Select year</option>
                {[1,2,3,4,5].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">CGPA/Percentage</label><input {...register('cgpa')} placeholder="e.g. 8.5 / 85%" className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Scholarship</label>
              <select {...register('scholarship')} className="input-field"><option value={false}>No</option><option value={true}>Yes</option></select>
            </div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Achievements</label>
            <textarea {...register('achievements')} rows={2} className="input-field resize-none" placeholder="Notable achievements..." /></div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-orange-500 rounded-xl hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editItem ? 'Save Changes' : 'Add Student'}
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete Student" message="Remove this student record?" isLoading={deleting} />
    </div>
  );
};

export default StudentsPage;
