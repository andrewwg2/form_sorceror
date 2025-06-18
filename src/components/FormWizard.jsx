import React, { useState, useEffect } from 'react';
import StepForm from './StepForm';
import ProgressBar from './ProgressBar';
import NavButtons from './NavButtons';
import SubmissionSuccess from './SubmissionSuccess';

/* ----------  Wizard Definition  ---------- */
const STEPS = [
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

const STORAGE_KEY    = 'form_wizard_state';
const SUBMISSION_KEY = 'form_wizard_submissions';

export default function FormWizard() {
  /* Wizard state */
  const [stepIndex, setStepIndex] = useState(0);
  const [formData,  setFormData]  = useState({});
  const [history,   setHistory]   = useState([]);
  const [future,    setFuture]    = useState([]);
  const [submitted, setSubmitted] = useState(false);

  /* ----------  Load saved progress (once)  ---------- */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { stepIndex, formData } = JSON.parse(saved);
      setStepIndex(stepIndex);
      setFormData(formData);
    }
  }, []);

  /* ----------  Persist progress on change  ---------- */
  useEffect(() => {
    if (!submitted) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ stepIndex, formData })
      );
    }
  }, [stepIndex, formData, submitted]);

  /* ----------  Field change + undo/redo  ---------- */
  const handleFieldChange = (name, value) => {
    setHistory(prev => [...prev, formData]);
    setFuture([]);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const undo = () => {
    if (!history.length) return;
    setFuture(f => [formData, ...f]);
    setFormData(history[history.length - 1]);
    setHistory(h => h.slice(0, -1));
  };

  const redo = () => {
    if (!future.length) return;
    setHistory(h => [...h, formData]);
    setFormData(future[0]);
    setFuture(f => f.slice(1));
  };

  /* ----------  Navigation  ---------- */
  const nextStep = () => setStepIndex(i => Math.min(i + 1, STEPS.length - 1));
  const prevStep = () => setStepIndex(i => Math.max(i - 1, 0));

  /* ----------  Submit  ---------- */
  const handleSubmit = () => {
    /* 1 – append submission */
    const existing =
      JSON.parse(localStorage.getItem(SUBMISSION_KEY) || '[]');
    localStorage.setItem(
      SUBMISSION_KEY,
      JSON.stringify([
        ...existing,
        { ...formData, submittedAt: Date.now() }
      ])
    );

    /* 2 – clear in-progress state */
    localStorage.removeItem(STORAGE_KEY);

    /* 3 – show success screen */
    setSubmitted(true);
  };

  /* ----------  Restart after success  ---------- */
  const restartWizard = () => {
    setStepIndex(0);
    setFormData({});
    setHistory([]);
    setFuture([]);
    setSubmitted(false);
  };

  /* ----------  Early-return success page  ---------- */
  if (submitted) {
    return <SubmissionSuccess onRestart={restartWizard} />;
  }

  /* ----------  Render wizard  ---------- */
  const currentStep = STEPS[stepIndex];
  const isLastStep  = stepIndex === STEPS.length - 1;

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">{currentStep.title}</h2>

      <ProgressBar current={stepIndex + 1} total={STEPS.length} />

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
