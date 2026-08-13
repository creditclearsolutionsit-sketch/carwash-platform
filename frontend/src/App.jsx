import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Vehicles from './pages/Vehicles';
import Services from './pages/Services';
import Bookings from './pages/Bookings';
import POS from './pages/POS';
import Employees from './pages/Employees';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/customers" element={<Protected><Customers /></Protected>} />
      <Route path="/vehicles" element={<Protected><Vehicles /></Protected>} />
      <Route path="/services" element={<Protected><Services /></Protected>} />
      <Route path="/bookings" element={<Protected><Bookings /></Protected>} />
      <Route path="/pos" element={<Protected><POS /></Protected>} />
      <Route path="/employees" element={<Protected><Employees /></Protected>} />
      <Route path="/inventory" element={<Protected><Inventory /></Protected>} />
      <Route path="/reports" element={<Protected><Reports /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
