import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import MasterData from './pages/MasterData';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Navigate to="master-data" replace />} />
              <Route path="master-data" element={<MasterData />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'bg-white text-slate-800 border border-slate-200 shadow-md rounded-xl',
            style: {
              background: '#ffffff',
              color: '#1e293b',
              borderColor: '#e2e8f0',
              fontSize: '14px',
              padding: '12px 16px',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
