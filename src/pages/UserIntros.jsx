import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { userIntroApi } from '../services/userIntro.service';
import { Loader2, CheckCircle, XCircle, Info, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { usePagination } from '../hooks/usePagination';
import { useDebounce } from '../hooks/useDebounce';
import CustomSelect from '../components/CustomSelect';
import DataTable from '../components/DataTable';
import TableFilters from '../components/TableFilters';
import ViewTextModal from '../components/ViewTextModal';
import StatusBadge from '../components/StatusBadge';

export default function UserIntros() {
  const [data, setData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ sortBy: 'id', sortOrder: 'desc' });
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [rejectModalState, setRejectModalState] = useState({ isOpen: false, introId: null, reason: '' });
  const [viewReasonModal, setViewReasonModal] = useState({ isOpen: false, text: '' });
  const [paginationData, setPaginationData] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { page, limit, handlePageChange } = usePagination(1, 10);

  // Reset page to 1 when search query changes
  useEffect(() => {
    handlePageChange(1);
  }, [debouncedSearchQuery]);

  const fetchIntros = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await userIntroApi.getAll({
        sortBy: sortConfig.sortBy,
        sortOrder: sortConfig.sortOrder,
        page,
        limit,
        status: statusFilter || undefined,
        search: debouncedSearchQuery || undefined
      });
      const resData = response.data;
      if (resData && resData.data) {
        setData(resData.data);
        setPaginationData(resData.pagination);
      } else {
        setData([]);
        setPaginationData(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch user intros');
      setData([]);
      setPaginationData(null);
    } finally {
      setIsLoading(false);
    }
  }, [sortConfig, page, limit, statusFilter, debouncedSearchQuery]);

  useEffect(() => {
    fetchIntros();
  }, [fetchIntros]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.sortBy === key && sortConfig.sortOrder === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ sortBy: key, sortOrder: direction });
  };

  const handleStatusUpdate = async (id, newStatus, reason = null) => {
    setIsUpdating(true);
    const toastId = toast.loading(`Updating status to ${newStatus}...`);
    try {
      await userIntroApi.updateStatus(id, newStatus, reason);
      toast.success('Status updated successfully', { id: toastId });
      fetchIntros(); // reload current data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status', { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  const openRejectModal = (id) => {
    setRejectModalState({ isOpen: true, introId: id, reason: '' });
  };

  const confirmReject = () => {
    handleStatusUpdate(rejectModalState.introId, 'rejected', rejectModalState.reason);
    setRejectModalState({ isOpen: false, introId: null, reason: '' });
  };

  const columns = [
    { header: 'App ID', accessor: 'app_id', className: 'font-medium text-slate-800 capitalize' },
    { header: 'Profile ID', accessor: 'profile_id' },
    {
      header: 'Video URL',
      accessor: 'video_url_link',
      render: (row) => row.video_url_link ? (
        <a href={row.video_url_link} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline font-medium">
          View Video
        </a>
      ) : '-'
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Reason',
      accessor: 'reason',
      className: 'max-w-[200px]',
      render: (row) => row.status === 'rejected' ? (
        <div className="flex items-center gap-2">
          <span className="truncate">{row.reason || '-'}</span>
          {row.reason && row.reason.length > 25 && (
            <button
              onClick={() => setViewReasonModal({ isOpen: true, text: row.reason })}
              className="p-1 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors shrink-0"
              title="View full reason"
            >
              <Info className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : '-'
    },
    {
      header: 'Actions',
      accessor: 'actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          {row.status !== 'approved' && (
            <button
              onClick={() => handleStatusUpdate(row.id, 'approved')}
              disabled={isUpdating}
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors disabled:opacity-50"
              title="Approve"
            >
              <CheckCircle className="w-5 h-5" />
            </button>
          )}
          {row.status !== 'rejected' && (
            <button
              onClick={() => openRejectModal(row.id)}
              disabled={isUpdating}
              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50"
              title="Reject"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="animate-in fade-in duration-300 w-full">
      <div className="mb-6 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-slate-900">User Intros</h1>

        <TableFilters
          searchQuery={searchQuery}
          onSearchChange={(val) => {
            setSearchQuery(val);
            // Pagination is now handled by the useEffect watching debouncedSearchQuery
          }}
          placeholder="Search by Profile ID or App ID..."
        >
          <div className="w-56">
            <CustomSelect
              id="status-filter"
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                handlePageChange(1);
              }}
              placeholder="All Statuses"
              searchable={false}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' }
              ]}
            />
          </div>
        </TableFilters>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        sortConfig={sortConfig}
        onSort={handleSort}
        paginationData={paginationData}
        onPageChange={handlePageChange}
        limit={limit}
      />

      {/* Reject Modal */}
      {rejectModalState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setRejectModalState({ isOpen: false, introId: null, reason: '' })} />

          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 relative z-10 animate-scale-in overflow-hidden border border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Reject User Intro</h3>
              <p className="text-sm text-slate-600 mb-4">Please provide a reason for rejecting this video (optional). The user will be able to see this reason.</p>

              <textarea
                value={rejectModalState.reason}
                onChange={(e) => setRejectModalState({ ...rejectModalState, reason: e.target.value })}
                placeholder="Enter rejection reason..."
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors resize-none h-24"
              />
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setRejectModalState({ isOpen: false, introId: null, reason: '' })}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Reason Modal */}
      <ViewTextModal
        isOpen={viewReasonModal.isOpen}
        onClose={() => setViewReasonModal({ isOpen: false, text: '' })}
        title="Reason"
        text={viewReasonModal.text}
      />
    </div>
  );
}
