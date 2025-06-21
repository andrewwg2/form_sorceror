import React from 'react';
import StepForm          from './StepForm';
import ProgressBar       from './ProgressBar';
import NavButtons        from './NavButtons';
import SubmissionSuccess from './SubmissionSuccess';
import StepEditor        from './StepEditor';
import { useWizard }     from '../util/useWizard';

export default function FormWizard() {
  const {
    // State
    steps,
    stepIndex,
    formData,
    submitted,
    editing,
    currentStep,
    isLastStep,
    totalSteps,
    
    // Navigation state
    canGoBack,
    canGoForward,
    canUndo,
    canRedo,
    
    // Actions
    handleFieldChange,
    nextStep,
    prevStep,
    undo,
    redo,
    handleSubmit,
    restartWizard,
    setEditing,
    saveSteps
  } = useWizard();

  /* ----------  Render flow  ---------- */
  if (editing) {
    return (
      <StepEditor
        initialSteps={steps}
        onSave={saveSteps}
        onCancel={() => setEditing(false)}
      />
    );
  }

  if (submitted) {
    return <SubmissionSuccess onRestart={restartWizard} />;
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-lg">
      {/* toolbar */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">{currentStep.title}</h2>
        <button
          onClick={() => setEditing(true)}
          className="px-3 py-1 !bg-indigo-800 rounded text-sm"
        >
          Edit Steps
        </button>
      </div>

      <ProgressBar current={stepIndex + 1} total={totalSteps} />

      <StepForm
        key={currentStep.id}
        fields={currentStep.fields}
        data={formData}
        onChange={handleFieldChange}
      />

      <NavButtons
        /* navigation */
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onBack={prevStep}
        onNext={nextStep}
        /* undo/redo */
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        /* submit */
        isLastStep={isLastStep}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
