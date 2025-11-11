// components/Table.js
export default function Table({ columns, data, onEdit, onDelete }) {
  return (
    <table className="w-full border-collapse border">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} className="border px-2 py-1 text-left">{col.label}</th>
          ))}
          {(onEdit || onDelete) && <th className="border px-2 py-1">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 && (
          <tr><td colSpan={columns.length + 1} className="text-center p-2">No data</td></tr>
        )}
        {data.map((row) => (
          <tr key={row.id}>
            {columns.map((col) => (
              <td key={col.key} className="border px-2 py-1">{row[col.key]}</td>
            ))}
            {(onEdit || onDelete) && (
              <td className="border px-2 py-1">
                {onEdit && <button className="mr-2 text-blue-500" onClick={() => onEdit(row)}>Edit</button>}
                {onDelete && <button className="text-red-500" onClick={() => onDelete(row.id)}>Delete</button>}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
