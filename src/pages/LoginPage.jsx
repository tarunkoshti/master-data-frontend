import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Lock, LogIn } from 'lucide-react';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const toastId = toast.loading('Signing in...');
    try {
      await login(username, password);
      toast.success('Signed in successfully!', { id: toastId });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed. Please check credentials.';
      toast.error(msg, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full animate-scale-in">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 space-y-3">

          <h1 className="text-2xl font-bold text-[#002a43] tracking-widest uppercase text-center">
            Master Data Management
          </h1>
          <p className="text-sm text-slate-400 text-center">
            Enter your credentials to access the admin dashboard
          </p>
        </div>

        {/* Form Card */}
        <div className="light-panel rounded-2xl p-8 relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Username"
              id="username"
              type="text"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errors.username) {
                  setErrors((prev) => ({ ...prev, username: '' }));
                }
              }}
              error={errors.username}
              required
              icon={User}
            />

            <FormInput
              label="Password"
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: '' }));
                }
              }}
              error={errors.password}
              required
              icon={Lock}
            />

            <div className="pt-2">
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full justify-center py-3 text-base font-semibold"
                icon={LogIn}
              >
                Sign In
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
