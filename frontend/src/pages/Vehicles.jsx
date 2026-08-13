import React, { useEffect, useState } from 'react';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const empty = { make: '', model: '', color: '', plate_number: '', vehicle_type: 'sedan', CustomerId: '' };

export default function Vehicles() {
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => api.get('/vehicles', { params: { q } }).then((res) => setRows(res.data.data));
  useEffect(() => { load(); }, [q]);
  useEffect(() => { api.get('/customers', { params: { limit: 200 } }).then((res) => setCustomers(res.data.data)); }, []);

  const openNew = () => { setForm(empty); setEditing('new'); };
  const openEdit = (row) => { setForm(row); setEditing(row.id); };

  const save = async (e) => {
    e.preventDefault();
    if (editing === 'new') await api.post('/vehicles', form);
    else await api.put(`/vehicles/${editing}`, form);
    setEditing(null);
    load();
  };

  const remove = async (row) => {
    if (!confirm(`Delete vehicle "${row.plate_number}"?`)) return;
    await api.delete(`/vehicles/${row.id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Vehicles</h1>
        <div className="flex gap-2">
          <input placeholder="Search plate/make…" value={q} onChange={(e) => setQ(e.target.value)} className="border rounded px-3 py-1.5 text-sm" />
          <button onClick={openNew} className="bg-brand-600 text-white text-sm px-3 py-1.5 rounded">+ New Vehicle</button>
        </div>
      </div>
      <DataTable
        columns={[
          { key: 'plate_number', label: 'Plate' },
          { key: 'make', label: 'Make' },
          { key: 'model', label: 'Model' },
          { key: 'color', label: 'Color' },
          { key: 'vehicle_type', label: 'Type' },
        ]}
        rows={rows}
        onEdit={openEdit}
        onDelete={remove}
      />
      {editing && (
        <Modal title={editing === 'new' ? 'New Vehicle' : 'Edit Vehicle'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-3">
            <select required value={form.CustomerId || ''} onChange={(e) => setForm({ ...form, CustomerId: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
              <option value="">Select customer…</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
            </select>
            <input required placeholder="Plate Number" value={form.plate_number} onChange={(e) => setForm({ ...form, plate_number: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <input placeholder="Make" value={form.make || ''} onChange={(e) => setForm({ ...form, make: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <input placeholder="Model" value={form.model || ''} onChange={(e) => setForm({ ...form, model: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <input placeholder="Color" value={form.color || ''} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <select value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
              {['sedan', 'suv', 'bakkie', 'truck', 'motorcycle', 'other'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <button className="w-full bg-brand-600 text-white rounded py-2 text-sm">Save</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
