import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';
import { eventAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import ImageUpload from '../../components/common/ImageUpload';
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
  const { register, handleSubmit, reset, setValue, watch } = useForm();

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
    const targetId = editItem ? (editItem.id || editItem._id) : null;
    const payload = {
      title: (data.title || '').trim(),
      description: (data.description || '').trim(),
      location: (data.location || '').trim(),
      status: data.status || 'published',
      event_type: data.eventType || data.event_type || 'upcoming',
      start_date: data.startDate || data.start_date || new Date().toISOString(),
      end_date: data.endDate || data.end_date || null,
      images: data.image ? [data.image] : (Array.isArray(data.images) ? data.images : []),
    };
    try {
      if (editItem && targetId) {
        await eventAPI.update(targetId, payload);
        toast.success('Event updated!');
      } else {
        await eventAPI.create(payload);
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
    if (!deleteItem) return;
    const targetId = deleteItem.id || deleteItem._id;
    if (!targetId) return;
    setDeleting(true);
    try {
      await eventAPI.delete(targetId);
      setItems((prev) => prev.filter((item) => (item.id || item._id) !== targetId));
      toast.success('Event deleted successfully!');
      setDeleteItem(null);
      if (items.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'title', label: 'Event Title', sortable: true, render: (v) => <span className="font-medium">{v}</span> },
    {
      key: 'startDate',
      label: 'Date',
      sortable: true,
      render: (v, r) => {
        const d = v || r.date || r.start_date || r.created_at;
        return d ? new Date(d).toLocaleDateString('en-IN') : '—';
      },
    },
    { key: 'location', label: 'Location', sortable: true, render: (v) => v || '—' },
    { key: 'status', label: 'Status', sortable: true, render: (v) => <Badge variant={v === 'published' ? 'success' : 'warning'}>{v || 'published'}</Badge> },
    { key: 'registrationRequired', label: 'Registration', sortable: true, render: (v) => <Badge variant={v ? 'info' : 'default'}>{v ? 'Required' : 'Open'}</Badge> },
    {
      key: '_actions',
      label: 'Actions',
      render: (_, r) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditItem(r);
              reset({
                ...r,
                title: r.title || '',
                description: r.description || '',
                location: r.location || '',
                status: r.status || 'published',
                eventType: r.event_type || r.eventType || 'upcoming',
                startDate: r.start_date ? r.start_date.slice(0, 16) : (r.startDate ? r.startDate.slice(0, 16) : ''),
                endDate: r.end_date ? r.end_date.slice(0, 16) : (r.endDate ? r.endDate.slice(0, 16) : ''),
                image: Array.isArray(r.images) && r.images[0] ? r.images[0] : (r.image || ''),
              });
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

  const preventEnterSubmit = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 ">Events Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all community events</p>
        </div>
        <button
          onClick={() => {
            setEditItem(null);
            reset({
              title: '',
              description: '',
              location: 'Sirvi Samaj Dharmshala, Konda',
              eventType: 'upcoming',
              status: 'published',
              startDate: '',
              endDate: '',
              image: '',
            });
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 shadow-md shadow-orange-500/30"
        >
          <FiPlus className="w-4 h-4" /> Add Event
        </button>
      </div>
      <DataTable columns={columns} data={items} loading={loading} totalPages={totalPages} currentPage={page}
        onPageChange={setPage} onSearchChange={(v) => { setSearch(v); setPage(1); }} serverSide emptyIcon={FiCalendar} emptyText="No events found" />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Event' : 'New Event'} size="xl">
        <form onKeyDown={preventEnterSubmit} onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
            <input {...register('title', { required: true })} placeholder="Event name" className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input {...register('startDate', { required: true })} type="datetime-local" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input {...register('endDate')} type="datetime-local" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input {...register('location')} defaultValue="Sirvi Samaj Dharmshala, Konda" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select {...register('status')} className="input-field">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-4">
              <input {...register('registrationRequired')} type="checkbox" id="regReq" className="w-4 h-4 text-orange-500 rounded" />
              <label htmlFor="regReq" className="text-sm font-medium text-gray-700 ">Registration Required</label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea {...register('description')} rows={4} placeholder="Event details..." className="input-field resize-none" />
          </div>
          <ImageUpload
            value={watch('image')}
            onChange={(url) => setValue('image', url, { shouldDirty: true })}
            label="कार्यक्रम बैनर / फ़ोटो (Upload Event Image)"
            folder="events"
          />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
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
