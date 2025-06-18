// src/components/StepForm.jsx
import React from 'react';
import Field from './Field';

export default function StepForm({ fields, data, onChange }) {
  return (
    <div className="space-y-4 mb-6">
      {fields.map((field) => (
        <Field
          key={field.name}
          field={field}
          value={data[field.name] || ''}
          onChange={(val) => onChange(field.name, val)}
        />
      ))}
    </div>
  );
}