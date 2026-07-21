import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { successStoryApi } from '../services/successStory.service';
import { Loader2, CheckCircle, XCircle, Trash2, Eye, Info, Calendar, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { usePagination } from '../hooks/usePagination';
import { useDebounce } from '../hooks/useDebounce';
import CustomSelect from '../components/CustomSelect';
import DataTable from '../components/DataTable';
import TableFilters from '../components/TableFilters';
import ConfirmModal from '../components/ConfirmModal';
import ViewTextModal from '../components/ViewTextModal';
import StatusBadge from '../components/StatusBadge';

export default function SuccessStories() {
  const [data, setData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ sortBy: 'id', sortOrder: 'desc' });
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewModalState, setViewModalState] = useState({ isOpen: false, story: null });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ isOpen: false, storyId: null });
  const [viewReasonModal, setViewReasonModal] = useState({ isOpen: false, text: '' });
  const [paginationData, setPaginationData] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { page, limit, handlePageChange } = usePagination(1, 10);

  useEffect(() => {
    handlePageChange(1);
  }, [debouncedSearchQuery]);

  const fetchStories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await successStoryApi.getAll({
        page,
        limit,
        sortBy: sortConfig.sortBy,
        sortOrder: sortConfig.sortOrder,
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
      toast.error(error.response?.data?.message || 'Failed to fetch success stories');
      setData([]);
      setPaginationData(null);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, sortConfig, statusFilter, debouncedSearchQuery]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.sortBy === key && sortConfig.sortOrder === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ sortBy: key, sortOrder: direction });
  };

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleStatusUpdate = async (id, newStatus) => {
    setIsUpdating(true);
    const toastId = toast.loading(`Updating status...`);
    try {
      await successStoryApi.updateStatus(id, newStatus);
      toast.success('Status updated successfully', { id: toastId });
      if (viewModalState.isOpen) {
        setViewModalState({ isOpen: false, story: null });
      }
      fetchStories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status', { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  const getRemainingDeletionTime = (createdAt) => {
    const createdTime = new Date(createdAt).getTime();
    const targetTime = createdTime + 48 * 60 * 60 * 1000; // 48 hours
    const now = new Date().getTime();
    const diff = targetTime - now;
    if (diff <= 0) return 'Overdue for deletion';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const columns = [
    { header: 'App ID', accessor: 'app_package_name', className: 'font-medium text-slate-800 capitalize' },
    { header: 'Profile ID', accessor: 'profile_id' },
    { header: 'Mobile', accessor: 'mobile_number' },
    {
      header: 'Marriage Date',
      accessor: 'marriage_date',
      sortable: true,
      render: (row) => new Date(row.marriage_date).toLocaleDateString()
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Deletion Reason',
      accessor: 'deletion_reason',
      className: 'max-w-[200px]',
      render: (row) => row.deletion_reason ? (
        <div className="flex items-center gap-2">
          <span className="truncate">{row.deletion_reason}</span>
          {row.deletion_reason.length > 25 && (
            <button
              onClick={() => setViewReasonModal({ isOpen: true, text: row.deletion_reason })}
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
      header: 'Time Left',
      accessor: 'created_at',
      sortable: true,
      render: (row) => row.status !== 'profile_deleted' ? (
        <span className="text-amber-600 font-medium">
          {getRemainingDeletionTime(row.created_at)}
        </span>
      ) : (
        <span className="text-emerald-600">Deleted</span>
      )
    },
    {
      header: 'Submitted At',
      accessor: 'created_at',
      sortable: true,
      render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'
    },
    {
      header: 'Deleted At',
      accessor: 'deleted_at',
      sortable: true,
      render: (row) => row.deleted_at ? new Date(row.deleted_at).toLocaleDateString() : '-'
    },
    {
      header: 'Actions',
      accessor: 'actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setViewModalState({ isOpen: true, story: row })}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="View Details"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-in fade-in duration-300 w-full">
      <div className="mb-6 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Success Stories</h1>

        <TableFilters
          searchQuery={searchQuery}
          onSearchChange={(val) => {
            setSearchQuery(val);
          }}
          placeholder="Search by Profile ID or Mobile..."
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
                { value: 'verified', label: 'Verified' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'profile_deleted', label: 'Profile Deleted' }
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

      {/* View Details Modal */}
      {viewModalState.isOpen && viewModalState.story && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setViewModalState({ isOpen: false, story: null })} />

          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 relative z-10 animate-scale-in overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex-shrink-0 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Success Story Details</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium 
                  ${viewModalState.story.status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                  viewModalState.story.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                    viewModalState.story.status === 'profile_deleted' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'}`}>
                {viewModalState.story.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                <div className="flex flex-col">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Marriage Details</p>
                  <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-4 flex-1">
                    <p className="text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-700">{new Date(viewModalState.story.marriage_date).toLocaleDateString()}</span>
                    </p>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Bride</p>
                      <p className="text-sm text-slate-700 mt-1">{viewModalState.story.bride_name_address}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Groom</p>
                      <p className="text-sm text-slate-700 mt-1">{viewModalState.story.groom_name_address}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Gift Delivery Address</p>
                      <p className="text-sm text-slate-700 mt-1">{viewModalState.story.gift_delivery_address}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Marriage Photo</p>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-center flex-1 min-h-[300px]">
                    {viewModalState.story.marriage_photo && (
                      <img
                        src={viewModalState.story.marriage_photo}
                        alt="Marriage"
                        className="max-w-full max-h-[300px] object-cover rounded-md w-full h-[300px]"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextElementSibling) {
                            e.target.nextElementSibling.style.display = 'flex';
                          }
                        }}
                      />
                    )}
                    <div className={`${viewModalState.story.marriage_photo ? 'hidden' : 'flex'} flex-col items-center justify-center text-slate-400 space-y-2 h-full w-full`}>
                      <span className="text-xs font-medium">Image Not Found</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white px-6 py-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
              <div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setViewModalState({ isOpen: false, story: null })}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>

                {viewModalState.story.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(viewModalState.story.id, 'rejected')}
                      disabled={isUpdating}
                      className="px-4 py-2 text-sm font-medium text-rose-700 bg-white border border-rose-300 rounded-lg hover:bg-rose-50 transition-colors shadow-sm disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(viewModalState.story.id, 'verified')}
                      disabled={isUpdating}
                      className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                    >
                      Verify Submission
                    </button>
                  </>
                )}

                {(viewModalState.story.status === 'pending' || viewModalState.story.status === 'verified') && (
                  <button
                    onClick={() => {
                      setDeleteConfirmModal({ isOpen: true, storyId: viewModalState.story.id });
                    }}
                    disabled={isUpdating}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                  >
                    Delete Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={() => setDeleteConfirmModal({ isOpen: false, storyId: null })}
        onConfirm={() => {
          handleStatusUpdate(deleteConfirmModal.storyId, 'profile_deleted');
          setDeleteConfirmModal({ isOpen: false, storyId: null });
        }}
        title="Delete Profile"
        message="Are you sure you want to mark this profile as deleted?"
        confirmText="Delete Profile"
        cancelText="Cancel"
        isLoading={isUpdating}
      />

      <ViewTextModal
        isOpen={viewReasonModal.isOpen}
        onClose={() => setViewReasonModal({ isOpen: false, text: '' })}
        title="Deletion Reason"
        text={viewReasonModal.text}
      />
    </div>
  );
}
