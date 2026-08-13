import React, { useEffect, useState } from 'react';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const empty = { name: '', sku: '', unit: 'unit', quantity_on_hand: 0, reorder_level: 0, cost_per_unit: '' };

export default function Inventory() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => api.get('/inventory', { params: { limit: 200 } }).then((res) => setRows(res.data.data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(empty); setEditing('new'); };
  const openEdit = (row) => { setForm(row); setEditing(row.id); };

  const save = async (e) => {
    e.preventDefault();
    if (editing === 'new') await api.post('/inventory', form);
    else await api.put(`/inventory/${editing}`, form);
    setEditing(null);
    load();
  };

  const remove = async (row) => {
    if (!confirm(`Delete item "${row.name}"?`)) return;
    await api.delete(`/inventory/${row.id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Inventory</h1>
        <button onClick={openNew} className="bg-brand-600 text-white text-sm px-3 py-1.5 rounded">+ New Item</button>
      </div>
      <DataTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'sku', label: 'SKU' },
          { key: 'quantity_on_hand', label: 'Qty on Hand' },
          { key: 'reorder_level', label: 'Reorder Level' },
          {
            key: 'status', label: 'Status',
            render: (r) => parseFloat(r.quantity_on_hand) <= parseFloat(r.reorder_level)
              ? <span className="text-red-600 font-medium">Low stock</span>
              : <span className="text-green-600">OK</span>,
          },
        ]}
        rows={rows}
        onEdit={openEdit}
        onDelete={remove}
      />
      {editing && (
        <Modal title={editing === 'new' ? 'New Item' : 'Edit Item'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-3">
            <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <input placeholder="SKU" value={form.sku || ''} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <input placeholder="Unit (e.g. litre, box)" value={form.unit || ''} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <input type="number" step="0.01" placeholder="Quantity on Hand" value={form.quantity_on_hand} onChange={(e) => setForm({ ...form, quantity_on_hand: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <input type="number" step="0.01" placeholder="Reorder Level" value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <input type="number" step="0.01" placeholder="Cost per Unit" value={form.cost_per_unit || ''} onChange={(e) => setForm({ ...form, cost_per_unit: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <button className="w-full bg-brand-600 text-white rounded py-2 text-sm">Save</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
