import { useState, useEffect, useCallback } from 'react';
import { FiEye, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import { contactAPI } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

const ContactsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contactAPI.getAll({ page, limit: 10, search });
      setItems(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleView = async (item) => {
    setViewItem(item);
    setModalOpen(true);
    if (item.status === 'new') {
      try {
        await contactAPI.update(item._id, { status: 'read' });
        fetchData(); // Refresh to update status locally
      } catch (err) {
        console.error('Failed to mark as read', err);
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    const targetId = deleteItem._id;
    setDeleting(true);
    try {
      await contactAPI.delete(targetId);
      setItems((prev) => prev.filter((item) => item._id !== targetId));
      toast.success('Message deleted successfully!');
      setDeleteItem(null);
      if (items.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete message');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new': return <Badge variant="warning">New</Badge>;
      case 'read': return <Badge variant="info">Read</Badge>;
      case 'replied': return <Badge variant="success">Replied</Badge>;
      case 'archived': return <Badge variant="neutral">Archived</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true, render: (v) => <span className="font-medium text-[#2B211B]">{v}</span> },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'subject', label: 'Subject', render: (v) => <span className="line-clamp-1">{v}</span> },
    { key: 'status', label: 'Status', render: (v) => getStatusBadge(v) },
    { key: 'createdAt', label: 'Date', sortable: true, render: (v) => new Date(v).toLocaleDateString('hi-IN') },
    {
      key: '_id', label: 'Actions', render: (_, r) => (
        <div className="flex gap-2">
          <button onClick={() => handleView(r)} className="p-1.5 text-[#C85A17] hover:bg-[#FFF8EC] rounded-lg transition-colors" title="View Message">
            <FiEye className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteItem(r)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Message">
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-[#2B211B]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#7A2525]">संपर्क संदेश (Contacts)</h1>
          <p className="text-[#766A60] text-sm font-semibold mt-1">Manage and view messages sent from the website.</p>
        </div>
      </div>
      <DataTable 
        columns={columns} 
        data={items} 
        loading={loading} 
        totalPages={totalPages} 
        currentPage={page}
        onPageChange={setPage} 
        onSearchChange={(v) => { setSearch(v); setPage(1); }} 
        serverSide 
        emptyIcon={FiMessageSquare} 
        emptyText="No messages found" 
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="View Message" size="md">
        {viewItem && (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#766A60] font-bold mb-1">Name</p>
                <p className="font-semibold">{viewItem.name}</p>
              </div>
              <div>
                <p className="text-[#766A60] font-bold mb-1">Email</p>
                <p className="font-semibold text-[#C85A17] break-all">{viewItem.email}</p>
              </div>
              <div>
                <p className="text-[#766A60] font-bold mb-1">Phone</p>
                <p className="font-semibold">{viewItem.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[#766A60] font-bold mb-1">Status</p>
                {getStatusBadge(viewItem.status)}
              </div>
              <div className="col-span-2">
                <p className="text-[#766A60] font-bold mb-1">Subject</p>
                <p className="font-semibold">{viewItem.subject}</p>
              </div>
            </div>
            
            <div className="border-t border-[#E8DCC8] pt-4">
              <p className="text-[#766A60] font-bold mb-2">Message</p>
              <div className="bg-[#FFF8EC] border border-[#E8DCC8] rounded-2xl p-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{viewItem.message}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setModalOpen(false)} 
                className="px-5 py-2.5 text-sm font-bold text-[#766A60] bg-[#FFF8EC] border border-[#E8DCC8] rounded-xl hover:bg-[#E8DCC8]/50 transition-colors cursor-pointer"
              >
                Close
              </button>
              <a 
                href={`mailto:${viewItem.email}?subject=Re: ${viewItem.subject}`}
                className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#7A2525] to-[#C85A17] rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
              >
                <FiMessageSquare className="w-4 h-4" /> Reply via Email
              </a>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog 
        isOpen={!!deleteItem} 
        onClose={() => setDeleteItem(null)} 
        onConfirm={handleDelete} 
        title="Delete Message" 
        message="Are you sure you want to permanently delete this message?" 
        isLoading={deleting} 
      />
    </div>
  );
};

export default ContactsPage;
