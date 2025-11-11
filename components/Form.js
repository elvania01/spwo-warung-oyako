// components/Form.js
import { useState, useEffect } from "react";

export default function Form({ fields, initialData = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({});

  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-2 border mb-4">
      {fields.map((field) => (
        <div key={field.name}>
          <label className="block">{field.label}</label>
          <input
            name={field.name}
            type={field.type || "text"}
            value={form[field.name] || ""}
            onChange={handleChange}
            className="border px-2 py-1 w-full"
            required={field.required}
          />
        </div>
      ))}
      <div>
        <button type="submit" className="mr-2 bg-blue-500 text-white px-4 py-1">Save</button>
        {onCancel && <button type="button" onClick={onCancel} className="bg-gray-300 px-4 py-1">Cancel</button>}
      </div>
    </form>
  );
}
