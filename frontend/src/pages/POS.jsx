import React, { useEffect, useState } from 'react';
import api from '../api/client';
import DataTable from '../components/DataTable';
import dayjs from 'dayjs';

export default function POS() {
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selected, setSelected] = useState('');
  const [method, setMethod] = useState('cash');
  const [message, setMessage] = useState('');

  const loadBookings = () => api.get('/bookings').then((res) =>
    setBookings(res.data.filter((b) => b.status !== 'completed' && b.status !== 'cancelled'))
  );
  const loadPayments = () => api.get('/payments').then((res) => setPayments(res.data));

  useEffect(() => { loadBookings(); loadPayments(); }, []);

  const checkout = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await api.post('/pos/checkout', { booking_id: selected, method });
      setMessage(`Payment recorded: R${res.data.total.toFixed(2)}`);
      setSelected('');
      loadBookings();
      loadPayments();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Checkout failed');
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Point of Sale</h1>
      <div className="bg-white rounded-lg shadow p-5 mb-6 max-w-lg">
        <form onSubmit={checkout} className="space-y-3">
          <select required value={selected} onChange={(e) => setSelected(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
            <option value="">Select booking to check out…</option>
            {bookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.Customer?.name} — {b.Vehicle?.plate_number || 'no vehicle'} ({dayjs(b.scheduled_at).format('DD MMM HH:mm')})
              </option>
            ))}
          </select>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
            {['cash', 'card', 'eft', 'wallet'].map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <button className="w-full bg-brand-600 text-white rounded py-2 text-sm">Checkout & Record Payment</button>
          {message && <div className="text-sm text-center text-gray-600">{message}</div>}
        </form>
      </div>

      <h2 className="font-semibold mb-2">Recent Payments</h2>
      <DataTable
        columns={[
          { key: 'reference', label: 'Reference' },
          { key: 'amount', label: 'Amount', render: (r) => `R${parseFloat(r.amount).toFixed(2)}` },
          { key: 'method', label: 'Method' },
          { key: 'status', label: 'Status' },
          { key: 'created_at', label: 'Date', render: (r) => dayjs(r.created_at).format('DD MMM HH:mm') },
        ]}
        rows={payments}
      />
    </div>
  );
}
