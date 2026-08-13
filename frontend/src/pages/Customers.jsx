import React, { useEffect, useState } from 'react';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const empty = { name: '', phone: '', email: '', notes: '' };

export default function Customers() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => api.get('/customers', { params: { q } }).then((res) => setRows(res.data.data));
  useEffect(() => { load(); }, [q]);

  const openNew = () => { setForm(empty); setEditing('new'); };
  const openEdit = (row) => { setForm(row); setEditing(row.id); };

  const save = async (e) => {
    e.preventDefault();
    if (editing === 'new') await api.post('/customers', form);
    else await api.put(`/customers/${editing}`, form);
    setEditing(null);
    load();
  };

  const remove = async (row) => {
    if (!confirm(`Delete customer "${row.name}"?`)) return;
    await api.delete(`/customers/${row.id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Customers</h1>
        <div className="flex gap-2">
          <input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm" />
          <button onClick={openNew} className="bg-brand-600 text-white text-sm px-3 py-1.5 rounded">+ New Customer</button>
        </div>
      </div>
      <DataTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'phone', label: 'Phone' },
          { key: 'email', label: 'Email' },
          { key: 'loyalty_points', label: 'Loyalty Pts' },
        ]}
        rows={rows}
        onEdit={openEdit}
        onDelete={remove}
      />
      {editing && (
        <Modal title={editing === 'new' ? 'New Customer' : 'Edit Customer'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-3">
            <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <input placeholder="Email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <textarea placeholder="Notes" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <button className="w-full bg-brand-600 text-white rounded py-2 text-sm">Save</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
