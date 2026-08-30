import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiBook, FiLink } from 'react-icons/fi';
import { panchSettlementAPI } from '../../services/api';
import { useForm, useFieldArray } from 'react-hook-form';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

const PanchSettlementsPage = () => {
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

  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: {
      documents: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'documents'
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await panchSettlementAPI.getAll({ page, limit: 10, search });
      setItems(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      toast.error('Failed to load panch records');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSubmit = async (data) => {
    setSaving(true);
    const targetId = editItem ? (editItem.id || editItem._id) : null;
    const payload = {
      ...data,
      settlement_date: data.settlementDate || data.settlement_date,
    };
    try {
      if (editItem && targetId) {
        await panchSettlementAPI.update(targetId, payload);
        toast.success('Panch settlement record updated!');
      } else {
        await panchSettlementAPI.create(payload);
        toast.success('Panch settlement record created!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save record');
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
      await panchSettlementAPI.delete(targetId);
      setItems((prev) => prev.filter((item) => (item.id || item._id) !== targetId));
      toast.success('Record removed successfully!');
      setDeleteItem(null);
      if (items.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete record');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'settlementDate',
      label: 'Date',
      sortable: true,
      render: (v, r) => {
        const d = v || r.settlement_date || r.created_at;
        return d ? new Date(d).toLocaleDateString('en-IN') : '—';
      },
    },
    { key: 'title', label: 'Case Subject', sortable: true, render: (v) => <span className="font-semibold">{v || '—'}</span> },
    { key: 'parties', label: 'Parties Involved', sortable: true, render: (v) => v || '—' },
    { key: 'panchs', label: 'Panch Arbitrators', render: (v) => v || '-' },
    { key: 'status', label: 'Status', sortable: true, render: (v) => <Badge variant={v === 'resolved' ? 'success' : v === 'ongoing' ? 'warning' : 'danger'}>{v || 'resolved'}</Badge> },
    {
      key: '_actions',
      label: 'Actions',
      render: (_, r) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditItem(r);
              const d = r.settlement_date || r.settlementDate;
              reset({ ...r, settlementDate: d ? new Date(d).toISOString().split('T')[0] : '' });
              setModalOpen(true);
            }}
            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteItem(r)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 ">न्यायिक समझौते (Panch Settlements)</h1>
          <p className="text-gray-500 text-sm mt-1">Manage local arbitration records resolved by the Panch council</p>
        </div>
        <button onClick={() => { setEditItem(null); reset({ status: 'resolved', settlementDate: new Date().toISOString().split('T')[0], documents: [] }); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-md shadow-blue-600/30">
          <FiPlus className="w-4 h-4" /> Add Settlement Record
        </button>
      </div>

      <DataTable columns={columns} data={items} loading={loading} totalPages={totalPages} currentPage={page}
        onPageChange={setPage} onSearchChange={(v) => { setSearch(v); setPage(1); }} serverSide emptyIcon={FiBook} emptyText="No settlement records found" />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Settlement Record' : 'Add Settlement Record'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">केस का विषय / शीर्षक (Case Title) *</label>
              <input {...register('title', { required: true })} placeholder="शीर्षक (e.g. पारिवारिक भूमि विवाद निवारण)" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">पक्षकार (Parties Involved) *</label>
              <input {...register('parties', { required: true })} placeholder="पक्षकार अ व पक्षकार ब का नाम" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">समझौते की तारीख (Date) *</label>
              <input {...register('settlementDate', { required: true })} type="date" className="input-field" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">मध्यस्थता करने वाले पंच (Panch Arbitrators)</label>
              <input {...register('panchs')} placeholder="पंचों के नाम (comma separated)" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">स्थिति (Status)</label>
              <select {...register('status')} className="input-field">
                <option value="resolved">सुलझाया गया (Resolved)</option>
                <option value="pending">लंबित (Pending)</option>
                <option value="ongoing">जारी (Ongoing)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">न्यायिक फैसले/समझौते का पूर्ण विवरण (Settlement Details) *</label>
            <textarea {...register('description', { required: true })} rows={5} className="input-field resize-none" placeholder="आपसी सहमति व फैसले का विस्तृत विवरण लिखें..." />
          </div>

          <div className="space-y-2 border-t border-gray-100 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700 ">दस्तावेज़ / समझौता पत्रक (Documents)</span>
              <button type="button" onClick={() => append({ name: '', url: '' })} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold">
                <FiPlus className="w-3 h-3" /> Add Document Link
              </button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-center">
                <input {...register(`documents.${index}.name`)} placeholder="दस्तावेज का नाम (e.g. हस्ताक्षरित समझौता पत्रक)" className="input-field" />
                <input {...register(`documents.${index}.url`)} placeholder="https://drives.google.com/..." className="input-field flex-1" />
                <button type="button" onClick={() => remove(index)} className="p-2 text-red-500 hover:bg-red-50 :bg-red-900/20 rounded-lg">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editItem ? 'Save Changes' : 'Record'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete Record" message="Remove this settlement record?" isLoading={deleting} />
    </div>
  );
};

export default PanchSettlementsPage;
