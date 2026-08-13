import React, { useEffect, useState } from 'react';
import api from '../api/client';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get('/dashboard/summary').then((res) => setSummary(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Bookings Today" value={summary?.today_bookings ?? '—'} />
        <StatCard label="Active Jobs" value={summary?.active_jobs ?? '—'} />
        <StatCard label="Revenue Today" value={summary ? `R${summary.today_revenue.toFixed(2)}` : '—'} />
        <StatCard label="Total Customers" value={summary?.total_customers ?? '—'} />
        <StatCard label="Low Stock Items" value={summary?.low_stock_items ?? '—'} />
      </div>
      <div className="mt-6 bg-white rounded-lg shadow p-5 text-sm text-gray-500">
        Use the sidebar to manage bookings, customers, vehicles, inventory and more.
        The AI receptionist endpoint (<code>/api/ai/chat</code>) is ready once you add your
        Anthropic API key to the backend <code>.env</code>.
      </div>
    </div>
  );
}
