import React from 'react';

export default function NavButtons({
  canGoBack,
  onBack,
  canGoForward,
  onNext,
  isLastStep,
  onSubmit,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) {
  return (
    <div className="flex justify-between items-center mt-4 flex-wrap gap-2">
      {/* Undo / Redo controls */}
      <div className="flex gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Undo
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Redo
        </button>
      </div>

      {/* Navigation controls */}
      <div className="flex gap-2">
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Back
        </button>

        {isLastStep ? (
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Submit
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={!canGoForward}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
