import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';

export default function Reports() {
  const [payments, setPayments] = useState([]);

  useEffect(() => { api.get('/payments').then((res) => setPayments(res.data)); }, []);

  const byDay = {};
  payments.forEach((p) => {
    const day = dayjs(p.created_at).format('DD MMM');
    byDay[day] = (byDay[day] || 0) + parseFloat(p.amount);
  });
  const chartData = Object.entries(byDay).map(([day, total]) => ({ day, total })).reverse();

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Reports</h1>
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="font-semibold mb-3">Revenue (recent payments)</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(v) => `R${v.toFixed(2)}`} />
              <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
