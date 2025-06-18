import React from 'react';

/**
 * A lightweight “success” screen that replaces the wizard
 * after the user submits.
 */
export default function SubmissionSuccess({ onRestart }) {
  return (
    <div className="max-w-xl mx-auto mt-10 bg-green-100 p-6 rounded-xl shadow-lg text-center">
      <h2 className="text-2xl font-semibold text-green-800 mb-4">
        🎉 All set!
      </h2>
      <p className="text-green-700 mb-6">
        Your information was saved successfully.
      </p>

      <button
        onClick={onRestart}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Fill another form
      </button>
    </div>
  );
}
