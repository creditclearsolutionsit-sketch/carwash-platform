import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/bookings', label: 'Bookings' },
  { to: '/customers', label: 'Customers' },
  { to: '/vehicles', label: 'Vehicles' },
  { to: '/services', label: 'Service Catalog' },
  { to: '/pos', label: 'POS' },
  { to: '/employees', label: 'Employees' },
  { to: '/inventory', label: 'Inventory' },
  { to: '/reports', label: 'Reports' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-brand-700 text-white flex flex-col shrink-0">
        <div className="px-4 py-5 text-lg font-bold border-b border-brand-600">🚿 Car Wash Manager</div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm ${isActive ? 'bg-brand-600 font-semibold' : 'hover:bg-brand-600/60'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-brand-600 text-sm">
          <div className="mb-2">{user?.name} <span className="opacity-70">({user?.role})</span></div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-xs bg-brand-600 hover:bg-brand-500 px-3 py-1.5 rounded"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
