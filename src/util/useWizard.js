import { useState, useEffect, useCallback } from 'react';
import { produce } from 'immer';
import {
  getWizardState,
  saveWizardState,
  getWizardSteps,
  saveWizardSteps,
  addSubmission,
  removeFromStorage,
  STORAGE_KEYS
} from './storage';

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

/**
 * Custom hook for managing wizard state and operations
 */
export function useWizard() {
  /* ----------  Load editable step config  ---------- */
  const [steps, setSteps] = useState(() => getWizardSteps(DEFAULT_STEPS));

  /* ----------  Wizard state using Immer  ---------- */
  const [wizardState, setWizardState] = useState(() => {
    const { stepIndex, formData } = getWizardState();
    return {
      stepIndex,
      formData,
      history: [],
      future: [],
      submitted: false,
      editing: false
    };
  });

  /* ----------  Draft persistence  ---------- */
  useEffect(() => {
    if (!wizardState.submitted) {
      saveWizardState(wizardState.stepIndex, wizardState.formData);
    }
  }, [wizardState.stepIndex, wizardState.formData, wizardState.submitted]);

  /* ----------  Field change with Immer + undo/redo  ---------- */
  const handleFieldChange = useCallback((name, value) => {
    setWizardState(
      produce((draft) => {
        // Push current form data to history for undo
        draft.history.push({ ...draft.formData });
        // Clear future when making new changes
        draft.future = [];
        // Update the field
        draft.formData[name] = value;
      })
    );
  }, []);

  /* ----------  Undo/Redo with Immer  ---------- */
  const undo = useCallback(() => {
    setWizardState(
      produce((draft) => {
        if (draft.history.length === 0) return;
        
        // Save current state to future
        draft.future.unshift({ ...draft.formData });
        // Restore last history state
        draft.formData = draft.history.pop();
      })
    );
  }, []);

  const redo = useCallback(() => {
    setWizardState(
      produce((draft) => {
        if (draft.future.length === 0) return;
        
        // Save current state to history
        draft.history.push({ ...draft.formData });
        // Restore first future state
        draft.formData = draft.future.shift();
      })
    );
  }, []);

  /* ----------  Navigation helpers with Immer  ---------- */
  const nextStep = useCallback(() => {
    setWizardState(
      produce((draft) => {
        draft.stepIndex = Math.min(draft.stepIndex + 1, steps.length - 1);
      })
    );
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setWizardState(
      produce((draft) => {
        draft.stepIndex = Math.max(draft.stepIndex - 1, 0);
      })
    );
  }, []);

  /* ----------  Submit  ---------- */
  const handleSubmit = useCallback(() => {
    addSubmission(wizardState.formData);
    removeFromStorage(STORAGE_KEYS.STATE);
    
    setWizardState(
      produce((draft) => {
        draft.submitted = true;
      })
    );
  }, [wizardState.formData]);

  /* ----------  Restart  ---------- */
  const restartWizard = useCallback(() => {
    setWizardState(
      produce((draft) => {
        draft.stepIndex = 0;
        draft.formData = {};
        draft.history = [];
        draft.future = [];
        draft.submitted = false;
      })
    );
  }, []);

  /* ----------  Toggle editing mode  ---------- */
  const setEditing = useCallback((value) => {
    setWizardState(
      produce((draft) => {
        draft.editing = value;
      })
    );
  }, []);

  /* ----------  Save new steps  ---------- */
  const saveSteps = useCallback((newSteps) => {
    setSteps(newSteps);
    saveWizardSteps(newSteps);
    setEditing(false);
    restartWizard();
  }, [restartWizard]);

  /* ----------  Calculate derived state  ---------- */
  const currentStep = steps[wizardState.stepIndex] || steps[0];
  const isLastStep = wizardState.stepIndex === steps.length - 1;
  const canUndo = wizardState.history.length > 0;
  const canRedo = wizardState.future.length > 0;
  const canGoBack = wizardState.stepIndex > 0;
  const canGoForward = !isLastStep;

  return {
    // State
    steps,
    stepIndex: wizardState.stepIndex,
    formData: wizardState.formData,
    submitted: wizardState.submitted,
    editing: wizardState.editing,
    currentStep,
    isLastStep,
    
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
    saveSteps,
    
    // Computed values
    totalSteps: steps.length
  };
}
