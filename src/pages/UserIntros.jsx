import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { userIntroApi } from '../services/userIntro.service';
import { Loader2, CheckCircle, XCircle, Eye, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function UserIntros() {
  const [data, setData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ sortBy: 'id', sortOrder: 'desc' });
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [rejectModalState, setRejectModalState] = useState({ isOpen: false, introId: null, reason: '' });
  const [viewReasonModal, setViewReasonModal] = useState({ isOpen: false, text: '' });

  const fetchIntros = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await userIntroApi.getAll({ 
        sortBy: sortConfig.sortBy, 
        sortOrder: sortConfig.sortOrder 
      });
      const resData = response.data;
      if (resData && resData.data) {
        setData(resData.data);
      } else {
        setData([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch user intros');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [sortConfig]);

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

  return (
    <div className="animate-in fade-in duration-300 w-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">User Intros</h1>
      </div>

      <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="relative bg-slate-50/30 min-h-[200px] rounded-b-xl">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-white/50 backdrop-blur-sm z-10">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span className="text-sm font-medium">Loading...</span>
            </div>
          ) : data.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="text-center max-w-md">
                <h3 className="text-lg font-semibold text-slate-700">No Data Available</h3>
                <p className="text-slate-500 mt-2 text-sm">No user intros have been uploaded yet.</p>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-4">
              <div className="w-full overflow-x-auto pb-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th 
                        className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => handleSort('app_id')}
                      >
                        <div className="flex items-center gap-1">
                          App ID
                          {sortConfig.sortBy === 'app_id' ? (
                            sortConfig.sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => handleSort('profile_id')}
                      >
                        <div className="flex items-center gap-1">
                          Profile ID
                          {sortConfig.sortBy === 'profile_id' ? (
                            sortConfig.sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                          )}
                        </div>
                      </th>
                      <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Video URL</th>
                      <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                      <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Reason</th>
                      <th className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {data.map((row) => (
                      <tr key={row.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors group">
                        <td className="p-3 text-sm font-medium text-slate-800 capitalize">{row.app_id}</td>
                        <td className="p-3 text-sm text-slate-600">{row.profile_id}</td>
                        <td className="p-3 text-sm text-slate-600">
                          {row.video_url_link ? (
                            <a href={row.video_url_link} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline font-medium">
                              View Video
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="p-3 text-sm">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${row.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : row.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                            {row.status?.toUpperCase() || 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-slate-600 max-w-[200px]">
                          {row.status === 'rejected' ? (
                            <div className="flex items-center gap-2">
                              <span className="truncate">{row.reason || '-'}</span>
                              {row.reason && row.reason.length > 25 && (
                                <button 
                                  onClick={() => setViewReasonModal({ isOpen: true, text: row.reason })}
                                  className="p-1 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors shrink-0"
                                  title="View full reason"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="p-3 w-32">
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
                        </td>
                      </tr>
                    ))}
                    {/* Empty row to match MasterTable styling spacing */}
                    <tr className="h-14">
                      <td className="p-3"></td><td className="p-3"></td><td className="p-3"></td><td className="p-3"></td><td className="p-3"></td><td className="p-3"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

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
      {viewReasonModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setViewReasonModal({ isOpen: false, text: '' })} />
          
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 relative z-10 animate-scale-in overflow-hidden border border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Rejection Reason</h3>
              <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 whitespace-pre-wrap max-h-60 overflow-y-auto border border-slate-200">
                {viewReasonModal.text}
              </div>
            </div>
            
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end">
              <button 
                onClick={() => setViewReasonModal({ isOpen: false, text: '' })}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
