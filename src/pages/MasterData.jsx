import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { masterDataApi } from '../services/masterData.service';
import DrawerForm from '../components/DrawerForm';
import MasterTable from '../components/MasterTable';
import ConfirmModal from '../components/ConfirmModal';
import { Loader2, Save, ChevronDown, ChevronRight } from 'lucide-react';
import { MASTER_DATA_CATEGORIES } from '../constants/masterData';

export default function MasterData() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeCategory, setActiveCategory] = useState(MASTER_DATA_CATEGORIES[0]);
  const [activeType, setActiveType] = useState(MASTER_DATA_CATEGORIES[0].types[0]);
  const [expandedCategories, setExpandedCategories] = useState([MASTER_DATA_CATEGORIES[0].name]);
  
  const [allCategoryData, setAllCategoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Reordering state
  const [hasOrderChanged, setHasOrderChanged] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Map category to a specific type string if required by the API.
  // For now, let's assume the API groups by category.
  const fetchMasterData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await masterDataApi.getByCategory(activeCategory.value);
      setAllCategoryData(response.data || []);
      setHasOrderChanged(false);
    } catch (error) {
      if (error.response?.status === 404) {
        setAllCategoryData([]);
      } else {
        const msg = error.response?.data?.message || 'Failed to load master data';
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory]);
  
  // Filter data by active type
  const displayData = allCategoryData
    .filter(item => item.type === activeType.value);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  const handleToggleStatus = async (row) => {
    const toastId = toast.loading('Updating status...');
    try {
      await masterDataApi.updateStatus(row.id, row.is_active ? 0 : 1);
      toast.success('Status updated', { id: toastId });
      fetchMasterData();
    } catch (error) {
      toast.error('Failed to update status', { id: toastId });
    }
  };

  const handleDeleteClick = (row) => {
    setDeleteItem(row);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    
    setIsDeleting(true);
    const toastId = toast.loading('Deleting...');
    try {
      await masterDataApi.delete(deleteItem.id);
      toast.success('Deleted successfully', { id: toastId });
      setDeleteItem(null);
      fetchMasterData();
    } catch (error) {
      toast.error('Failed to delete', { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (row) => {
    setEditItem(row);
    setIsDrawerOpen(true);
  };

  const handleAddNew = () => {
    setEditItem(null);
    setIsDrawerOpen(true);
  };

  const handleDataChange = (newData) => {
    // Replace only the filtered items in the main data array
    const newDataIds = newData.map(item => item.id);
    const unchangedData = allCategoryData.filter(item => !newDataIds.includes(item.id));
    setAllCategoryData([...unchangedData, ...newData]);
    setHasOrderChanged(true);
  };

  const handleSaveOrder = async () => {
    if (!displayData.length) return;
    
    const ids = displayData.map(item => item.id);

    setIsSavingOrder(true);
    const toastId = toast.loading('Saving order...');
    try {
      await masterDataApi.reorder(activeType.value, ids);
      toast.success('Order saved successfully', { id: toastId });
      setHasOrderChanged(false);
      fetchMasterData(); // Refresh to get updated sort_order numbers
    } catch (error) {
      toast.error('Failed to save order', { id: toastId });
    } finally {
      setIsSavingOrder(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Master Data</h1>
          <p className="text-slate-500 mt-1">Manage all categories, types, and hierarchical values.</p>
        </div>
      </div>
      
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left Panel: Categories */}
        <div className="w-64 flex-shrink-0 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-semibold text-slate-700">Categories</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {MASTER_DATA_CATEGORIES.map(category => {
              const isExpanded = expandedCategories.includes(category.name);
              return (
                <div key={category.name} className="mb-2">
                  <button
                    onClick={() => {
                      if (isExpanded) {
                        setExpandedCategories(expandedCategories.filter(c => c !== category.name));
                      } else {
                        setExpandedCategories([...expandedCategories, category.name]);
                      }
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <span className="text-sm">{category.name}</span>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="mt-1 ml-2 pl-2 border-l-2 border-slate-100 space-y-1">
                      {category.types.map(type => (
                        <div
                          key={type.value}
                          onClick={() => {
                            setActiveCategory(category);
                            setActiveType(type);
                          }}
                          className={`p-2.5 rounded-lg cursor-pointer text-sm font-medium transition-colors ${
                            activeType.value === type.value 
                              ? 'bg-primary-50 text-primary-600' 
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          {type.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Data Table */}
        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
           <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="font-semibold text-slate-700">{activeType.name}</h2>
              {hasOrderChanged && (
                <button
                  onClick={handleSaveOrder}
                  disabled={isSavingOrder}
                  className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg text-sm font-medium transition-colors animate-pulse-slow"
                >
                  <Save className="w-4 h-4" />
                  Save Order
                </button>
              )}
            </div>
            
            <button 
              onClick={handleAddNew}
              className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              + Add New
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto relative bg-slate-50/30">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-white/50 backdrop-blur-sm z-10">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <span className="text-sm font-medium">Loading...</span>
              </div>
            ) : displayData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                  <h3 className="text-lg font-semibold text-slate-700">No Data Available</h3>
                  <p className="text-slate-500 mt-2 text-sm">Add a new entry for {activeType.name} to get started.</p>
                </div>
              </div>
            ) : (
              <MasterTable 
                data={displayData} 
                onDataChange={handleDataChange}
                onSaveOrder={handleSaveOrder}
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteClick}
              />
            )}
          </div>
        </div>
      </div>

      <DrawerForm 
        isOpen={isDrawerOpen} 
        onClose={() => {
          setIsDrawerOpen(false);
          setEditItem(null);
        }} 
        category={activeCategory.value}
        type={activeType.value} 
        editData={editItem}
        onSuccess={fetchMasterData}
      />

      <ConfirmModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Master Data"
        message={`Are you sure you want to delete "${deleteItem?.name}"? This will permanently remove it from the system.`}
        confirmText="Delete Entry"
      />
    </div>
  );
}
