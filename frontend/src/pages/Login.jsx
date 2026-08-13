import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@carwash.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow w-full max-w-sm">
        <h1 className="text-xl font-bold mb-1">🚿 Car Wash Manager</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to your dashboard</p>
        {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4">{error}</div>}
        <label className="block text-sm mb-1">Email</label>
        <input
          className="w-full border rounded px-3 py-2 mb-4 text-sm"
          value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
        />
        <label className="block text-sm mb-1">Password</label>
        <input
          className="w-full border rounded px-3 py-2 mb-6 text-sm"
          value={password} onChange={(e) => setPassword(e.target.value)} type="password" required
        />
        <button
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="text-xs text-gray-400 mt-4">Default admin: admin@carwash.local / Admin@123 (change after first login)</p>
      </form>
    </div>
  );
}
