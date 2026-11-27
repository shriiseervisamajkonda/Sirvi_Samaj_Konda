import { useState, useEffect, useCallback } from 'react';
import { FiActivity } from 'react-icons/fi';
import { activityLogAPI } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

const ActivityLogsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await activityLogAPI.getAll({ page, limit: 15, search });
      setItems(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      toast.error('गतिविधि लॉग लोड करने में त्रुटि');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = [
    {
      key: 'user_name',
      label: 'User',
      render: (v, r) => (
        <span className="font-medium text-gray-900">
          {v || r.user_name || r.user?.name || 'System'}
        </span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      render: (v) => <Badge variant="info">{v}</Badge>,
    },
    { key: 'module', label: 'Module', sortable: true },
    {
      key: 'ip_address',
      label: 'IP Address',
      render: (v, r) => <span className="font-mono text-xs">{v || r.ip_address || r.ipAddress || '—'}</span>,
    },
    {
      key: 'created_at',
      label: 'Timestamp',
      sortable: true,
      render: (v, r) => {
        const val = v || r.created_at || r.createdAt;
        return val ? new Date(val).toLocaleString('en-IN') : '—';
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 ">गतिविधि लॉग (Activity Logs)</h1>
        <p className="text-gray-500 text-sm mt-1">सिस्टम एवं प्रशासक गतिविधियों का ऑडिट लॉग</p>
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
        emptyIcon={FiActivity}
        emptyText="कोई गतिविधि लॉग उपलब्ध नहीं है"
      />
    </div>
  );
};

export default ActivityLogsPage;
