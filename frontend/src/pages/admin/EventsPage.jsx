import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';
import { eventAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

const EventsPage = () => {
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
  const { register, handleSubmit, reset } = useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eventAPI.getAll({ page, limit: 10, search });
      setItems(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editItem) {
        await eventAPI.update(editItem._id, data);
        toast.success('Event updated!');
      } else {
        await eventAPI.create(data);
        toast.success('Event created!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await eventAPI.delete(deleteItem._id);
      toast.success('Deleted!');
      setDeleteItem(null);
      fetchData();
    } catch {
      toast.error('Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'title', label: 'Event Title', sortable: true, render: (v) => <span className="font-medium">{v}</span> },
    { key: 'startDate', label: 'Date', sortable: true, render: (v, r) => new Date(v || r.date).toLocaleDateString('en-IN') },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'published' ? 'success' : 'warning'}>{v}</Badge> },
    { key: 'registrationRequired', label: 'Registration', render: (v) => <Badge variant={v ? 'info' : 'default'}>{v ? 'Required' : 'Open'}</Badge> },
    {
      key: '_id', label: 'Actions', render: (_, r) => (
        <div className="flex gap-2">
          <button onClick={() => { setEditItem(r); reset(r); setModalOpen(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
          <button onClick={() => setDeleteItem(r)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Events Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all community events</p>
        </div>
        <button onClick={() => { setEditItem(null); reset({ status: 'published', registrationRequired: false }); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 shadow-md shadow-orange-500/30">
          <FiPlus className="w-4 h-4" /> Add Event
        </button>
      </div>
      <DataTable columns={columns} data={items} loading={loading} totalPages={totalPages} currentPage={page}
        onPageChange={setPage} onSearchChange={(v) => { setSearch(v); setPage(1); }} serverSide emptyIcon={FiCalendar} emptyText="No events found" />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Event' : 'New Event'} size="xl">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Title *</label>
            <input {...register('title', { required: true })} placeholder="Event name" className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
              <input {...register('startDate', { required: true })} type="datetime-local" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
              <input {...register('endDate')} type="datetime-local" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <input {...register('location')} defaultValue="Sirvi Samaj Dharmshala, Konda" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Type</label>
              <select {...register('eventType')} className="input-field">
                <option value="cultural">Cultural</option>
                <option value="religious">Religious</option>
                <option value="sports">Sports</option>
                <option value="meeting">Meeting</option>
                <option value="health">Health Camp</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select {...register('status')} className="input-field">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-4">
              <input {...register('registrationRequired')} type="checkbox" id="regReq" className="w-4 h-4 text-orange-500 rounded" />
              <label htmlFor="regReq" className="text-sm font-medium text-gray-700 dark:text-gray-300">Registration Required</label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea {...register('description')} rows={4} placeholder="Event details..." className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
            <input {...register('image')} placeholder="https://..." className="input-field" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-orange-500 rounded-xl hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editItem ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete Event" message="Delete this event permanently?" isLoading={deleting} />
    </div>
  );
};

export default EventsPage;
