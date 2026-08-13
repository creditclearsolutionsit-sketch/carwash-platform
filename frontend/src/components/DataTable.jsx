import React from 'react';

export default function DataTable({ columns, rows, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-left text-gray-600">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-2 font-medium">{c.label}</th>
            ))}
            {(onEdit || onDelete) && <th className="px-4 py-2" />}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length + 1} className="px-4 py-6 text-center text-gray-400">No records yet</td></tr>
          )}
          {rows.map((row) => (
            <tr key={row.id} className="border-t hover:bg-gray-50">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-2">{c.render ? c.render(row) : row[c.key]}</td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-4 py-2 text-right space-x-2 whitespace-nowrap">
                  {onEdit && <button onClick={() => onEdit(row)} className="text-brand-600 hover:underline">Edit</button>}
                  {onDelete && <button onClick={() => onDelete(row)} className="text-red-600 hover:underline">Delete</button>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
