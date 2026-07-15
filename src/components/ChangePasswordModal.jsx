import React, { useState } from 'react';
import { X, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from './Button';
import FormInput from './FormInput';
import { authService } from '../services/auth.service';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    try {
      setIsLoading(true);
      await authService.changePassword({ oldPassword, newPassword });
      toast.success('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined}
      />
      
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 relative z-10 animate-scale-in overflow-hidden border border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <Key className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                Change Password
              </h3>
            </div>
            <button 
              onClick={!isLoading ? onClose : undefined}
              className="text-slate-400 hover:text-slate-500 rounded-full hover:bg-slate-100 p-1 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              id="oldPassword"
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            <FormInput
              id="newPassword"
              label="New Password"
              type="password"
              placeholder="Enter new password (min. 8 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <FormInput
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
              <Button 
                type="button"
                variant="secondary" 
                onClick={onClose} 
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                isLoading={isLoading}
                className="w-full sm:w-auto"
              >
                Change Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
