import React from 'react';

export default function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-gray-500 text-sm">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}
