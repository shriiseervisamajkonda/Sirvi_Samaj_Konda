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
import { FormActions } from '../../components/common/FormComponents';
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
      <div className="space-y-6 text-[#2B211B]">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DCC8] shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {PageIcon && <PageIcon className="w-5 h-5 text-[#C85A17]" />}
              <h1 className="text-xl sm:text-2xl font-black text-[#2B211B]">{title}</h1>
            </div>
            {subtitle && <p className="text-[#766A60] text-xs sm:text-sm font-medium">{subtitle}</p>}
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#7A2525] to-[#C85A17] hover:from-[#8C2C1D] hover:to-[#A7450D] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <FiPlus className="w-4 h-4" /> नया रिकॉर्ड जोड़ें (Add New)
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
          emptyText={`कोई ${title.replace(' Management', '')} उपलब्ध नहीं है`}
        />

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editItem ? `संपादित करें: ${title.replace(' Management', '')}` : `नया जोड़ें: ${title.replace(' Management', '')}`}
          size="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-6">
            <FormFields register={register} errors={errors} control={control} watch={watch} setValue={setValue} editItem={editItem} />
            <FormActions
              onCancel={() => setModalOpen(false)}
              submitText={editItem ? 'बदलाव सहेजें (Save Changes)' : 'सहेजें व जोड़ें (Save)'}
              loading={saving}
            />
          </form>
        </Modal>

        <ConfirmDialog
          isOpen={!!deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={handleDelete}
          title="रिकॉर्ड हटाएँ"
          message={`क्या आप सुनिश्चित हैं कि आप इस रिकॉर्ड को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।`}
          isLoading={deleting}
        />
      </div>
    );
  };

  AdminPage.displayName = `${title}AdminPage`;
  return AdminPage;
};

export default createAdminPage;
