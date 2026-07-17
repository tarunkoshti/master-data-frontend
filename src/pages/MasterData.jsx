import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { masterDataApi } from '../services/masterData.service';
import DrawerForm from '../components/DrawerForm';
import MasterTable from '../components/MasterTable';
import ConfirmModal from '../components/ConfirmModal';
import CustomSelect from '../components/CustomSelect';
import { Loader2, Search } from 'lucide-react';
import { MASTER_DATA_CATEGORIES } from '../constants/masterData';

export default function MasterData() {
  const { type } = useParams();
  
  const activeTypeInfo = useMemo(() => {
    const defaultType = 'genders';
    const targetType = type || defaultType;
    for (const cat of MASTER_DATA_CATEGORIES) {
      const foundType = cat.types.find(t => t.value === targetType);
      if (foundType) return { category: cat, type: foundType };
    }
    return { category: MASTER_DATA_CATEGORIES[0], type: MASTER_DATA_CATEGORIES[0].types[0] };
  }, [type]);

  const activeType = activeTypeInfo.type;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [displayData, setDisplayData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');

  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedStateId, setSelectedStateId] = useState('');
  const [selectedReligionId, setSelectedReligionId] = useState('');
  const [selectedCommunityId, setSelectedCommunityId] = useState('');
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [religions, setReligions] = useState([]);
  const [communities, setCommunities] = useState([]);

  // Reset filters when type changes
  useEffect(() => {
    setSelectedCountryId('');
    setSelectedStateId('');
    setSelectedReligionId('');
    setSelectedCommunityId('');
    setGlobalFilter('');
  }, [activeType.value]);

  useEffect(() => {
    if (activeType.value === 'states' || activeType.value === 'cities') {
      masterDataApi.getByType('countries').then(res => setCountries(res.data || []));
    }
    if (activeType.value === 'community') {
      masterDataApi.getByType('religion').then(res => setReligions(res.data || []));
    }
    if (activeType.value === 'subcastes' || activeType.value === 'gotras') {
      masterDataApi.getByType('community').then(res => {
        setCommunities(res.data || []);
      });
    }
  }, [activeType.value]);

  useEffect(() => {
    if (activeType.value === 'cities' && selectedCountryId) {
      masterDataApi.getByType('states', { parent_id: selectedCountryId }).then(res => {
        setStates(res.data || []);
        setSelectedStateId(''); // Reset state when country changes
      });
    } else if (activeType.value === 'cities') {
      setStates([]);
      setSelectedStateId('');
    }
  }, [selectedCountryId, activeType.value]);

  const fetchMasterData = useCallback(async () => {
    if (activeType.value === 'states' && !selectedCountryId) {
      setDisplayData([]);
      return;
    }
    if (activeType.value === 'cities' && !selectedStateId) {
      setDisplayData([]);
      return;
    }
    if (activeType.value === 'community' && !selectedReligionId) {
      setDisplayData([]);
      return;
    }
    if ((activeType.value === 'subcastes' || activeType.value === 'gotras') && !selectedCommunityId) {
      setDisplayData([]);
      return;
    }

    setIsLoading(true);
    try {
      const params = {};
      if (activeType.value === 'states') params.parent_id = selectedCountryId;
      if (activeType.value === 'cities') params.parent_id = selectedStateId;
      if (activeType.value === 'community') params.parent_id = selectedReligionId;
      if (activeType.value === 'subcastes' || activeType.value === 'gotras') params.parent_id = selectedCommunityId;

      const response = await masterDataApi.getByType(activeType.value, params);
      setDisplayData(response.data || []);
    } catch (error) {
      if (error.response?.status === 404) {
        setDisplayData([]);
      } else {
        const msg = error.response?.data?.message || 'Failed to load master data';
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeType.value, selectedCountryId, selectedStateId, selectedReligionId, selectedCommunityId]);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  // const handleDeleteClick = (row) => {
  //   setDeleteItem(row);
  // };

  // const handleConfirmDelete = async () => {
  //   if (!deleteItem) return;
  //   
  //   setIsDeleting(true);
  //   const toastId = toast.loading('Deleting...');
  //   try {
  //     await masterDataApi.delete(deleteItem.id, activeType.value);
  //     toast.success('Deleted successfully', { id: toastId });
  //     setDeleteItem(null);
  //     fetchMasterData();
  //   } catch (error) {
  //     toast.error('Failed to delete', { id: toastId });
  //   } finally {
  //     setIsDeleting(false);
  //   }
  // };

  const handleEdit = (row) => {
    setEditItem(row);
    setIsDrawerOpen(true);
  };

  const handleAddNew = () => {
    setEditItem(null);
    setIsDrawerOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: (info) => <span className="font-medium text-slate-800">{info.getValue()}</span>,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: () => null,
      },
    ],
    []
  );

  return (
    <div className="animate-in fade-in duration-300 w-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{activeType.name}</h1>
        </div>
      </div>
      
      <div className="w-full">
        {/* Main Panel: Data Table */}
        <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm">
           <div className="p-3 md:p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-3 rounded-t-xl">
             <div className="flex flex-1 gap-3 items-center flex-wrap">
               <div className="min-w-[200px] max-w-sm relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={globalFilter ?? ''}
                    onChange={e => setGlobalFilter(e.target.value)}
                    placeholder="Search in all columns..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                  />
               </div>

               {(activeType.value === 'states' || activeType.value === 'cities') && (
                 <div className="w-[200px]">
                   <CustomSelect
                     id="country-filter"
                     value={selectedCountryId}
                     onChange={setSelectedCountryId}
                     placeholder="Select Country"
                     options={countries.map(c => ({ value: c.id, label: c.name }))}
                   />
                 </div>
               )}

               {activeType.value === 'cities' && (
                 <div className="w-[200px]">
                   <CustomSelect
                     id="state-filter"
                     value={selectedStateId}
                     onChange={setSelectedStateId}
                     placeholder="Select State"
                     options={states.map(s => ({ value: s.id, label: s.name }))}
                     disabled={!selectedCountryId}
                   />
                 </div>
               )}

               {activeType.value === 'community' && (
                 <div className="w-[200px]">
                   <CustomSelect
                     id="religion-filter"
                     value={selectedReligionId}
                     onChange={setSelectedReligionId}
                     placeholder="Select Religion"
                     options={religions.map(r => ({ value: r.id, label: r.name }))}
                   />
                 </div>
               )}

               {(activeType.value === 'subcastes' || activeType.value === 'gotras') && (
                 <div className="w-[200px]">
                   <CustomSelect
                     id="community-filter"
                     value={selectedCommunityId}
                     onChange={setSelectedCommunityId}
                     placeholder="Select Community"
                     options={communities.map(c => ({ value: c.id, label: c.name }))}
                   />
                 </div>
               )}
             </div>
            
            <button 
              onClick={handleAddNew}
              disabled={(activeType.value === 'states' && !selectedCountryId) || (activeType.value === 'cities' && !selectedStateId) || (activeType.value === 'community' && !selectedReligionId) || ((activeType.value === 'subcastes' || activeType.value === 'gotras') && !selectedCommunityId)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              + Add New
            </button>
          </div>
          
          <div className="relative bg-slate-50/30 min-h-[200px] rounded-b-xl">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-white/50 backdrop-blur-sm z-10">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <span className="text-sm font-medium">Loading...</span>
              </div>
            ) : displayData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                  <h3 className="text-lg font-semibold text-slate-700">No Data Available</h3>
                  <p className="text-slate-500 mt-2 text-sm">
                    {(activeType.value === 'states' && !selectedCountryId) ? 'Please select a Country first.'
                    : (activeType.value === 'cities' && !selectedStateId) ? 'Please select a Country and State first.'
                    : (activeType.value === 'community' && !selectedReligionId) ? 'Please select a Religion first.'
                    : ((activeType.value === 'subcastes' || activeType.value === 'gotras') && !selectedCommunityId) ? 'Please select a Community first.'
                    : `Add a new entry for ${activeType.name} to get started.`}
                  </p>
                </div>
              </div>
            ) : (
              <MasterTable 
                data={displayData} 
                columns={columns}
                onEdit={handleEdit}
                // onDelete={handleDeleteClick}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
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
        type={activeType.value} 
        editData={editItem}
        onSuccess={fetchMasterData}
        parentOptions={activeType.value === 'states' ? countries : activeType.value === 'cities' ? states : activeType.value === 'community' ? religions : (activeType.value === 'subcastes' || activeType.value === 'gotras') ? communities : []}
        defaultParentId={activeType.value === 'states' ? selectedCountryId : activeType.value === 'cities' ? selectedStateId : activeType.value === 'community' ? selectedReligionId : (activeType.value === 'subcastes' || activeType.value === 'gotras') ? selectedCommunityId : ''}
      />

      {/* <ConfirmModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Master Data"
        message={`Are you sure you want to delete "${deleteItem?.name}"? This will permanently remove it from the system.`}
        confirmText="Delete Entry"
      /> */}
    </div>
  );
}
