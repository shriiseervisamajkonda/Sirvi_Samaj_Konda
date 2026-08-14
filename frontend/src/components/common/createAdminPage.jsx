/**
 * createAdminPage — Factory to generate admin CRUD pages with DataTable, Modal, and ConfirmDialog.
 * Usage: const EventsPage = createAdminPage({ ... });
 */
import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const createAdminPage = ({
  title,
  subtitle,
  icon: PageIcon,
  apiModule,
  columns,
  FormFields,
  defaultValues = {},
}) => {
  const AdminPage = () => {
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

    const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm();

    const fetchItems = useCallback(async () => {
      setLoading(true);
      try {
        const res = await apiModule.getAll({ page, limit: 10, search });
        setItems(res.data.data || []);
        setTotalPages(res.data.pagination?.pages || 1);
      } catch { toast.error(`Failed to load ${title}`); }
      finally { setLoading(false); }
    }, [page, search]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const openCreate = () => { setEditItem(null); reset({ ...defaultValues }); setModalOpen(true); };
    const openEdit = (item) => { setEditItem(item); reset({ ...defaultValues, ...item }); setModalOpen(true); };

    const onSubmit = async (data) => {
      setSaving(true);
      try {
        if (editItem) {
          await apiModule.update(editItem._id, data);
          toast.success(`${title} updated!`);
        } else {
          await apiModule.create(data);
          toast.success(`${title} added!`);
        }
        setModalOpen(false);
        fetchItems();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Save failed');
      } finally { setSaving(false); }
    };

    const handleDelete = async () => {
      if (!deleteItem) return;
      const targetId = deleteItem._id;
      setDeleting(true);
      try {
        await apiModule.delete(targetId);
        setItems((prev) => prev.filter((item) => item._id !== targetId));
        toast.success(`${title.replace(' Management', '')} deleted successfully!`);
        setDeleteItem(null);
        if (items.length === 1 && page > 1) {
          setPage((prev) => prev - 1);
        } else {
          fetchItems();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || `Failed to delete ${title.replace(' Management', '')}`);
      } finally {
        setDeleting(false);
      }
    };

    const tableColumns = [
      ...columns,
      {
        key: '_actions',
        label: 'Actions',
        render: (_, row) => (
          <div className="flex gap-2">
            <button onClick={() => openEdit(row)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
              <FiEdit2 className="w-4 h-4" />
            </button>
            <button onClick={() => setDeleteItem(row)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            {subtitle && <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 shadow-md shadow-orange-500/30 transition-all"
          >
            <FiPlus className="w-4 h-4" /> Add {title.replace(' Management', '')}
          </button>
        </div>

        <DataTable
          columns={tableColumns}
          data={items}
          loading={loading}
          totalPages={totalPages}
          currentPage={page}
          onPageChange={setPage}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          serverSide
          emptyIcon={PageIcon}
          emptyText={`No ${title.replace(' Management', '')} found`}
        />

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editItem ? `Edit ${title.replace(' Management', '')}` : `Add ${title.replace(' Management', '')}`}
          size="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <FormFields register={register} errors={errors} control={control} watch={watch} setValue={setValue} editItem={editItem} />
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2">
                {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {editItem ? 'Save Changes' : `Add ${title.replace(' Management', '')}`}
              </button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog
          isOpen={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={handleDelete}
          title={`Delete ${title.replace(' Management', '')}`}
          message={`Are you sure you want to delete this record? This action cannot be undone.`}
          isLoading={deleting}
        />
      </div>
    );
  };

  AdminPage.displayName = `${title}AdminPage`;
  return AdminPage;
};

export default createAdminPage;
