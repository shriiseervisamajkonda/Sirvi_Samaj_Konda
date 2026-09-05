import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiUpload } from 'react-icons/fi';
import { galleryAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import ImageUpload from '../../components/common/ImageUpload';
import toast from 'react-hot-toast';

const GalleryPage = () => {
  const [items, setItems] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const { register: regAlbum, handleSubmit: handleAlbumSubmit, reset: resetAlbum } = useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await galleryAPI.getAll({ page, limit: 12, search });
      setItems(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    galleryAPI.getAlbums().then((res) => setAlbums(res.data.data || [])).catch(() => {});
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    const targetId = editItem ? (editItem.id || editItem._id) : null;
    const payload = {
      ...data,
      title: data.title || 'फ़ोटो',
      photo_url: data.url || data.image_url || data.photo_url,
      album_id: data.album || data.album_id || null,
      caption: data.caption || '',
    };
    try {
      if (editItem && targetId) {
        await galleryAPI.update(targetId, payload);
        toast.success('Photo updated!');
      } else {
        await galleryAPI.create(payload);
        toast.success('Photo added!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save photo');
    } finally {
      setSaving(false);
    }
  };

  const onAlbumSubmit = async (data) => {
    setSaving(true);
    try {
      await galleryAPI.createAlbum(data);
      toast.success('Album created!');
      setAlbumModalOpen(false);
      resetAlbum({});
      galleryAPI.getAlbums().then((res) => setAlbums(res.data.data || [])).catch(() => {});
    } catch {
      toast.error('Failed to create album');
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
      await galleryAPI.delete(targetId);
      setItems((prev) => prev.filter((item) => (item.id || item._id) !== targetId));
      toast.success('Photo deleted successfully!');
      setDeleteItem(null);
      if (items.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete photo');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'url',
      label: 'Preview',
      render: (_, r) => {
        const src = r.image_url || r.url;
        return src ? (
          <img src={src} alt="Gallery" className="w-14 h-14 object-cover rounded-xl" />
        ) : (
          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
            <FiImage className="w-5 h-5 text-gray-400" />
          </div>
        );
      },
    },
    { key: 'title', label: 'Title', render: (v) => v || '—' },
    { key: 'album', label: 'Album', render: (_, r) => (r.album?.title || r.album_title ? <Badge variant="purple">{r.album?.title || r.album_title}</Badge> : '—') },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'inactive' ? 'warning' : 'success'}>{v || 'active'}</Badge> },
    {
      key: 'createdAt',
      label: 'Added',
      render: (_, r) => {
        const d = r.created_at || r.createdAt;
        return d ? new Date(d).toLocaleDateString('en-IN') : '—';
      },
    },
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

  const preventEnterSubmit = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 ">Gallery Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage photos and albums</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { resetAlbum({}); setAlbumModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 shadow-md">
            <FiPlus className="w-4 h-4" /> New Album
          </button>
          <button onClick={() => { setEditItem(null); reset({ status: 'active' }); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 shadow-md shadow-orange-500/30">
            <FiUpload className="w-4 h-4" /> Add Photo
          </button>
        </div>
      </div>
      <DataTable columns={columns} data={items} loading={loading} totalPages={totalPages} currentPage={page}
        onPageChange={setPage} onSearchChange={(v) => { setSearch(v); setPage(1); }} serverSide emptyIcon={FiImage} emptyText="No photos found" />

      {/* Add Photo Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Photo' : 'Add Photo'} size="lg">
        <form onKeyDown={preventEnterSubmit} onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <ImageUpload
            value={watch('url')}
            onChange={(url) => setValue('url', url, { shouldDirty: true })}
            label="फ़ोटो अपलोड करें (Upload Image) *"
            folder="gallery"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input {...register('title')} placeholder="Photo title" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Album</label>
              <select {...register('album')} className="input-field">
                <option value="">No Album</option>
                {albums.map(a => <option key={a.id || a._id} value={a.id || a._id}>{a.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select {...register('status')} className="input-field">
                <option value="active">Active</option>
                <option value="inactive">Hidden</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
            <input {...register('caption')} placeholder="Photo caption" className="input-field" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-orange-500 rounded-xl hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editItem ? 'Save Changes' : 'Add Photo'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Album Modal */}
      <Modal isOpen={albumModalOpen} onClose={() => setAlbumModalOpen(false)} title="Create Album" size="sm">
        <form onKeyDown={preventEnterSubmit} onSubmit={handleAlbumSubmit(onAlbumSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Album Name *</label>
            <input {...regAlbum('title', { required: true })} placeholder="e.g. Navratri 2024" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea {...regAlbum('description')} rows={2} className="input-field resize-none" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setAlbumModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-purple-500 rounded-xl hover:bg-purple-600 disabled:opacity-50">Create</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete Photo" message="Remove this photo from the gallery?" isLoading={deleting} />
    </div>
  );
};

export default GalleryPage;
