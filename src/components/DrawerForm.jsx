import React, { useEffect, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import FormInput from './FormInput';
import Button from './Button';
import CustomSelect from './CustomSelect';
import { masterDataApi } from '../services/masterData.service';

export default function DrawerForm({ isOpen, onClose, category, type, editData, onSuccess, parentOptions = [] }) {
  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When drawer opens or editData changes, reset form with appropriate values
  useEffect(() => {
    if (isOpen) {
      reset({
        name: editData?.name || '',
        value: editData?.value || '',
        parent_id: editData?.parent_id || '',
        status: editData?.is_active === false ? 'inactive' : 'active',
      });
    }
  }, [isOpen, editData, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const toastId = toast.loading(editData ? 'Updating...' : 'Saving...');

    try {
      const payload = {
        name: data.name,
        value: data.value,
        category: category,
        type: type,
        parent_id: data.parent_id ? parseInt(data.parent_id) : null,
      };

      // Since status is often updated separately via patch, you might update it in the body 
      // or handle it according to backend. (Assume backend accepts it or ignores it)
      // Actually backend create/update doesn't accept is_active, only patch does.

      if (editData) {
        await masterDataApi.update(editData.id, payload);
        toast.success('Updated successfully', { id: toastId });
      } else {
        await masterDataApi.create(payload);
        toast.success('Created successfully', { id: toastId });
      }

      onSuccess();
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message || 'An error occurred';
      toast.error(msg, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              {editData ? 'Edit Master Data' : 'Add New Master Data'}
            </h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <FormInput
                label="Category"
                id="category"
                value={category}
                readOnly
                className="opacity-70 bg-slate-50 cursor-not-allowed"
              />
              <FormInput
                label="Type"
                id="type"
                value={type}
                readOnly
                className="opacity-70 bg-slate-50 cursor-not-allowed"
              />
              <FormInput
                label="Name"
                id="name"
                placeholder="Enter display name"
                required
                {...register('name', {
                  required: 'Name is required',
                  onChange: (e) => {
                    // Only auto-fill if adding new, or if they explicitly want to edit it
                    // To keep it simple, auto-fill the slug format
                    if (!editData) {
                      setValue('value', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                    }
                  }
                })}
                error={errors.name?.message}
              />
              <FormInput
                label="Value"
                id="value"
                placeholder="enter-unique-value"
                required
                {...register('value', {
                  required: 'Value is required',
                  pattern: {
                    value: /^[a-z0-9-]+$/,
                    message: 'Value can only contain lowercase letters, numbers, and hyphens'
                  }
                })}
                error={errors.value?.message}
              />
              
              {parentOptions.length > 0 && (
                <div className="flex flex-col space-y-1.5 w-full">
                  <label htmlFor="parent_id" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Select {type === 'state' ? 'Country' : type === 'city' ? 'State' : 'Parent'}
                    <span className="text-rose-500 ml-1 font-bold">*</span>
                  </label>
                  <Controller
                    name="parent_id"
                    control={control}
                    rules={{ required: 'Selection is required' }}
                    render={({ field }) => (
                      <CustomSelect
                        id="parent_id"
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.parent_id?.message}
                        placeholder={`Choose a ${type === 'state' ? 'country' : type === 'city' ? 'state' : 'parent'}...`}
                        options={parentOptions.map(opt => ({ value: opt.id, label: opt.name }))}
                      />
                    )}
                  />
                  {errors.parent_id && (
                    <span className="text-xs text-rose-600 font-medium tracking-wide">
                      {errors.parent_id.message}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end bg-slate-50">
              <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
              <Button type="submit" isLoading={isSubmitting}>
                {editData ? 'Save Changes' : 'Save Data'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
