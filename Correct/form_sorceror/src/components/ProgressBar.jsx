// src/components/ProgressBar.jsx
import React from 'react';

export default function ProgressBar({ current, total }) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="mb-6">
      <div className="text-sm text-gray-700 mb-1">
        Step {current} of {total}
      </div>
      <div className="w-full bg-gray-200 h-2 rounded">
        <div
          className="bg-blue-500 h-2 rounded"
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
}