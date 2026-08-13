import React, { useEffect, useState } from 'react';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import dayjs from 'dayjs';

const empty = { customer_id: '', vehicle_id: '', service_ids: [], scheduled_at: '', source: 'walk_in', notes: '' };

export default function Bookings() {
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(empty);

  const load = () => api.get('/bookings').then((res) => setRows(res.data));
  useEffect(() => { load(); }, []);
  useEffect(() => {
    api.get('/customers', { params: { limit: 200 } }).then((res) => setCustomers(res.data.data));
    api.get('/vehicles', { params: { limit: 200 } }).then((res) => setVehicles(res.data.data));
    api.get('/services', { params: { limit: 200 } }).then((res) => setServices(res.data.data));
  }, []);

  const openNew = () => { setForm(empty); setCreating(true); };

  const save = async (e) => {
    e.preventDefault();
    await api.post('/bookings', {
      customer_id: form.customer_id,
      vehicle_id: form.vehicle_id,
      service_ids: form.service_ids,
      scheduled_at: form.scheduled_at,
      source: form.source,
      notes: form.notes,
    });
    setCreating(false);
    load();
  };

  const setStatus = async (row, status) => {
    await api.put(`/bookings/${row.id}/status`, { status });
    load();
  };

  const toggleService = (id) => {
    setForm((f) => ({
      ...f,
      service_ids: f.service_ids.includes(id) ? f.service_ids.filter((s) => s !== id) : [...f.service_ids, id],
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Bookings</h1>
        <button onClick={openNew} className="bg-brand-600 text-white text-sm px-3 py-1.5 rounded">+ New Booking</button>
      </div>
      <DataTable
        columns={[
          { key: 'customer', label: 'Customer', render: (r) => r.Customer?.name || '—' },
          { key: 'vehicle', label: 'Vehicle', render: (r) => r.Vehicle?.plate_number || '—' },
          { key: 'scheduled_at', label: 'Scheduled', render: (r) => dayjs(r.scheduled_at).format('DD MMM HH:mm') },
          { key: 'status', label: 'Status', render: (r) => (
            <select value={r.status} onChange={(e) => setStatus(r, e.target.value)} className="border rounded text-xs px-1 py-0.5">
              {['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          ) },
          { key: 'source', label: 'Source' },
        ]}
        rows={rows}
      />
      {creating && (
        <Modal title="New Booking" onClose={() => setCreating(false)}>
          <form onSubmit={save} className="space-y-3">
            <select required value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
              <option value="">Select customer…</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
            </select>
            <select value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
              <option value="">Select vehicle (optional)…</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.plate_number} — {v.make} {v.model}</option>)}
            </select>
            <div className="border rounded p-2 max-h-32 overflow-y-auto text-sm">
              {services.map((s) => (
                <label key={s.id} className="flex items-center gap-2 py-0.5">
                  <input type="checkbox" checked={form.service_ids.includes(s.id)} onChange={() => toggleService(s.id)} />
                  {s.name} — R{parseFloat(s.price).toFixed(2)}
                </label>
              ))}
            </div>
            <input required type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
              {['walk_in', 'phone', 'whatsapp', 'web', 'app'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <button className="w-full bg-brand-600 text-white rounded py-2 text-sm">Create Booking</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
