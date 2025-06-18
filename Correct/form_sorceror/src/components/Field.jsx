// src/components/Field.jsx
import React from 'react';

export default function Field({ field, value, onChange }) {
  const { name, label, type, options = [] } = field;

  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="font-medium mb-1">
        {label}
      </label>

      {type === 'select' ? (
        <select
          id={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="!border-color-slate-700 rounded-md p-2"
        >
          <option value="">Select an option</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border rounded-md p-2"
        />
      )}
    </div>
  );
}