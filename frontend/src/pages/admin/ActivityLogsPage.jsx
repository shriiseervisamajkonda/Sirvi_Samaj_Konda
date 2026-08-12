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
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = [
    { key: 'user', label: 'User', render: (v) => <span className="font-medium">{v?.name || 'System'}</span> },
    { key: 'action', label: 'Action', sortable: true, render: (v) => <Badge variant="info">{v}</Badge> },
    { key: 'module', label: 'Module', sortable: true },
    { key: 'ipAddress', label: 'IP Address' },
    { key: 'createdAt', label: 'Timestamp', sortable: true, render: (v) => new Date(v).toLocaleString('en-IN') },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
        <p className="text-gray-500 text-sm mt-1">Audit log of all admin actions and system events</p>
      </div>
      <DataTable columns={columns} data={items} loading={loading} totalPages={totalPages} currentPage={page}
        onPageChange={setPage} onSearchChange={(v) => { setSearch(v); setPage(1); }} serverSide emptyIcon={FiActivity} emptyText="No activity logs found" />
    </div>
  );
};

export default ActivityLogsPage;
