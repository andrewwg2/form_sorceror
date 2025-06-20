import React, { useState } from 'react';

const STEPS_STORAGE_KEY = 'form_wizard_steps';

export default function StepEditor({ initialSteps, onSave, onCancel }) {
  const [text, setText] = useState(JSON.stringify(initialSteps, null, 2));
  const [error, setError] = useState(null);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(text);
      localStorage.setItem(STEPS_STORAGE_KEY, JSON.stringify(parsed));
      onSave(parsed);
    } catch (e) {
      setError('Invalid JSON – please fix and try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-gray-50 p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Edit Wizard Steps (JSON)</h2>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={18}
        className="w-full font-mono text-sm p-3 border rounded resize-y mb-4"
      />

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Save & Reload Wizard
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
