import React, { useEffect, useState } from 'react';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const empty = { name: '', description: '', price: '', duration_minutes: 30, category: '' };

export default function Services() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => api.get('/services', { params: { limit: 200 } }).then((res) => setRows(res.data.data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(empty); setEditing('new'); };
  const openEdit = (row) => { setForm(row); setEditing(row.id); };

  const save = async (e) => {
    e.preventDefault();
    if (editing === 'new') await api.post('/services', form);
    else await api.put(`/services/${editing}`, form);
    setEditing(null);
    load();
  };

  const remove = async (row) => {
    if (!confirm(`Delete service "${row.name}"?`)) return;
    await api.delete(`/services/${row.id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Service Catalog</h1>
        <button onClick={openNew} className="bg-brand-600 text-white text-sm px-3 py-1.5 rounded">+ New Service</button>
      </div>
      <DataTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'category', label: 'Category' },
          { key: 'price', label: 'Price', render: (r) => `R${parseFloat(r.price).toFixed(2)}` },
          { key: 'duration_minutes', label: 'Duration (min)' },
        ]}
        rows={rows}
        onEdit={openEdit}
        onDelete={remove}
      />
      {editing && (
        <Modal title={editing === 'new' ? 'New Service' : 'Edit Service'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-3">
            <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <input placeholder="Category" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <input required type="number" step="0.01" placeholder="Price (ZAR)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <input type="number" placeholder="Duration (minutes)" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <textarea placeholder="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <button className="w-full bg-brand-600 text-white rounded py-2 text-sm">Save</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
