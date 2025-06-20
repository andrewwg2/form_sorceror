import React, { useState, useEffect } from 'react';
import StepForm          from './StepForm';
import ProgressBar       from './ProgressBar';
import NavButtons        from './NavButtons';
import SubmissionSuccess from './SubmissionSuccess';
import StepEditor        from './StepEditor';

/* ----------  Default wizard definition (fallback)  ---------- */
const DEFAULT_STEPS = [
  {
    id: 'step1',
    title: 'Contact Info',
    fields: [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true },
      { name: 'email',    label: 'Email',     type: 'text', required: true }
    ]
  },
  {
    id: 'step2',
    title: 'Details',
    fields: [
      { name: 'age',     label: 'Age',     type: 'number', required: true },
      { name: 'country', label: 'Country', type: 'select',
        options: ['USA', 'Canada'], required: true }
    ]
  }
];

const STEPS_STORAGE_KEY = 'form_wizard_steps';   // <— new
const STATE_KEY         = 'form_wizard_state';
const SUBMISSION_KEY    = 'form_wizard_submissions';

export default function FormWizard() {
  /* ----------  Load editable step config  ---------- */
  const [steps, setSteps] = useState(() => {
    try {
      const saved = localStorage.getItem(STEPS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_STEPS;
    } catch {
      return DEFAULT_STEPS;
    }
  });

  /* ----------  Wizard state  ---------- */
  const [stepIndex, setStepIndex] = useState(0);
  const [formData,  setFormData]  = useState({});
  const [history,   setHistory]   = useState([]);
  const [future,    setFuture]    = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [editing,   setEditing]   = useState(false);

  /* ----------  Draft persistence  ---------- */
  useEffect(() => {
    const saved = localStorage.getItem(STATE_KEY);
    if (saved) {
      const { stepIndex, formData } = JSON.parse(saved);
      setStepIndex(stepIndex);
      setFormData(formData);
    }
  }, []);

  useEffect(() => {
    if (!submitted) {
      localStorage.setItem(
        STATE_KEY,
        JSON.stringify({ stepIndex, formData })
      );
    }
  }, [stepIndex, formData, submitted]);

  /* ----------  Field change + undo/redo  ---------- */
  const handleFieldChange = (name, value) => {
    setHistory((h) => [...h, formData]);
    setFuture([]);
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const undo = () => {
    if (!history.length) return;
    setFuture((f) => [formData, ...f]);
    setFormData(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
  };

  const redo = () => {
    if (!future.length) return;
    setHistory((h) => [...h, formData]);
    setFormData(future[0]);
    setFuture((f) => f.slice(1));
  };

  /* ----------  Navigation helpers  ---------- */
  const nextStep = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const prevStep = () => setStepIndex((i) => Math.max(i - 1, 0));

  /* ----------  Submit  ---------- */
  const handleSubmit = () => {
    const existing =
      JSON.parse(localStorage.getItem(SUBMISSION_KEY) || '[]');
    localStorage.setItem(
      SUBMISSION_KEY,
      JSON.stringify([...existing, { ...formData, submittedAt: Date.now() }])
    );
    localStorage.removeItem(STATE_KEY);
    setSubmitted(true);
  };

  /* ----------  Restart  ---------- */
  const restartWizard = () => {
    setStepIndex(0);
    setFormData({});
    setHistory([]);
    setFuture([]);
    setSubmitted(false);
  };

  /* ----------  Render flow  ---------- */
  if (editing) {
    return (
      <StepEditor
        initialSteps={steps}
        onSave={(newSteps) => {
          setSteps(newSteps);
          setEditing(false);
          restartWizard();           // reset progress on schema change
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  if (submitted) {
    return <SubmissionSuccess onRestart={restartWizard} />;
  }

  const currentStep = steps[stepIndex];
  const isLastStep  = stepIndex === steps.length - 1;

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

      <ProgressBar current={stepIndex + 1} total={steps.length} />

      <StepForm
        key={currentStep.id}
        fields={currentStep.fields}
        data={formData}
        onChange={handleFieldChange}
      />

      <NavButtons
        /* navigation */
        canGoBack={stepIndex > 0}
        canGoForward={!isLastStep}
        onBack={prevStep}
        onNext={nextStep}
        /* undo/redo */
        onUndo={undo}
        onRedo={redo}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
        /* submit */
        isLastStep={isLastStep}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
