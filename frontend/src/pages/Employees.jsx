import React, { useEffect, useState } from 'react';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const empty = { full_name: '', position: '', phone: '', hire_date: '' };

export default function Employees() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => api.get('/employees', { params: { limit: 200 } }).then((res) => setRows(res.data.data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(empty); setEditing('new'); };
  const openEdit = (row) => { setForm(row); setEditing(row.id); };

  const save = async (e) => {
    e.preventDefault();
    if (editing === 'new') await api.post('/employees', form);
    else await api.put(`/employees/${editing}`, form);
    setEditing(null);
    load();
  };

  const remove = async (row) => {
    if (!confirm(`Delete employee "${row.full_name}"?`)) return;
    await api.delete(`/employees/${row.id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Employees</h1>
        <button onClick={openNew} className="bg-brand-600 text-white text-sm px-3 py-1.5 rounded">+ New Employee</button>
      </div>
      <DataTable
        columns={[
          { key: 'full_name', label: 'Name' },
          { key: 'position', label: 'Position' },
          { key: 'phone', label: 'Phone' },
          { key: 'hire_date', label: 'Hire Date' },
        ]}
        rows={rows}
        onEdit={openEdit}
        onDelete={remove}
      />
      {editing && (
        <Modal title={editing === 'new' ? 'New Employee' : 'Edit Employee'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-3">
            <input required placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <input placeholder="Position" value={form.position || ''} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <input placeholder="Phone" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <input type="date" value={form.hire_date || ''} onChange={(e) => setForm({ ...form, hire_date: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            <button className="w-full bg-brand-600 text-white rounded py-2 text-sm">Save</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
