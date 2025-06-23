# Local Storage Implementation in Form Sorcerer

## Overview
Your Form Sorcerer application uses local storage to persist data across browser sessions. The implementation handles three main types of data: wizard state, step configurations, and submission history.

## Storage Keys

The application uses three distinct localStorage keys defined in `storage.js`:

```javascript
STORAGE_KEYS = {
  STEPS: 'form_wizard_steps',        // Stores custom step configurations
  STATE: 'form_wizard_state',        // Stores current progress and form data
  SUBMISSIONS: 'form_wizard_submissions'  // Stores completed form submissions
}
```

## What Data is Saved

### 1. **Wizard State** (`form_wizard_state`)
Stores the user's current progress through the form:

```javascript
{
  stepIndex: number,  // Current step (0-based index)
  formData: {         // All form field values
    fullName: string,
    email: string,
    age: number,
    country: string,
    // ... any other fields from custom steps
  }
}
```

### 2. **Step Configuration** (`form_wizard_steps`)
Stores custom step definitions created via the Step Editor:

```javascript
[
  {
    id: 'step1',
    title: 'Contact Info',
    fields: [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'text', required: true }
    ]
  },
  // ... more steps
]
```

### 3. **Submission History** (`form_wizard_submissions`)
Stores completed form submissions with timestamps:

```javascript
[
  {
    fullName: 'John Doe',
    email: 'john@example.com',
    age: 30,
    country: 'USA',
    submittedAt: 1234567890000  // Unix timestamp
  },
  // ... more submissions
]
```

## When Data is Saved

### 1. **Wizard State Persistence**

#### Automatic Saving:
- **Triggered by**: Any change to form fields or navigation between steps
- **When**: After each state update (via the `useEffect` hook in `useWizard.js`, lines 55-59)
- **Condition**: Only saves if the form hasn't been submitted

```javascript
useEffect(() => {
  if (!wizardState.submitted) {
    saveWizardState(wizardState.stepIndex, wizardState.formData);
  }
}, [wizardState.stepIndex, wizardState.formData, wizardState.submitted]);
```

This means:
- ✅ Typing in a field → Saves immediately
- ✅ Clicking Next/Previous → Saves immediately
- ✅ Using Undo/Redo → Saves immediately
- ❌ After submission → Stops saving

### 2. **Step Configuration Saving**

#### Manual Saving:
- **Triggered by**: Clicking "Save" in the Step Editor
- **When**: User confirms custom step configuration
- **Action**: Saves new steps and restarts the wizard

```javascript
const saveSteps = useCallback((newSteps) => {
  setSteps(newSteps);
  saveWizardSteps(newSteps);  // Saves to localStorage
  setEditing(false);
  restartWizard();  // Clears form data
}, [restartWizard]);
```

### 3. **Submission History Saving**

#### On Submit:
- **Triggered by**: Clicking "Submit" on the last step
- **When**: Form is complete and validated
- **Action**: Adds timestamped submission to history array

```javascript
const handleSubmit = useCallback(() => {
  addSubmission(wizardState.formData);  // Saves to submissions array
  removeFromStorage(STORAGE_KEYS.STATE); // Clears draft state
  setWizardState(produce((draft) => {
    draft.submitted = true;
  }));
}, [wizardState.formData]);
```

## When Data is Loaded

### 1. **Initial Load**

When the `useWizard` hook initializes:

```javascript
// Load saved steps or use defaults
const [steps, setSteps] = useState(() => 
  getWizardSteps(DEFAULT_STEPS)
);

// Load saved state (stepIndex and formData)
const [wizardState, setWizardState] = useState(() => {
  const { stepIndex, formData } = getWizardState();
  return {
    stepIndex,
    formData,
    history: [],  // Not persisted
    future: [],   // Not persisted
    submitted: false,
    editing: false
  };
});
```

### 2. **Page Refresh Behavior**

When user refreshes the page:
- ✅ **Restored**: Current step position
- ✅ **Restored**: All form field values
- ✅ **Restored**: Custom step configurations
- ✅ **Restored**: Previous submissions
- ❌ **Not Restored**: Undo/Redo history
- ❌ **Not Restored**: Editing mode state

## Data Cleanup

### 1. **After Submission**
- The draft state (`form_wizard_state`) is removed
- Submission is added to the history array
- Form shows success screen

### 2. **On Restart**
- Form data is cleared from memory
- Draft state starts fresh
- Step configuration remains unchanged

### 3. **Manual Clear**
The `clearWizardStorage()` function can remove all wizard data:

```javascript
export const clearWizardStorage = () => {
  Object.values(STORAGE_KEYS).forEach(removeFromStorage);
};
```

## Important Notes

### What's NOT Saved:
1. **Undo/Redo History**: The arrays tracking form changes for undo/redo functionality are only kept in memory
2. **UI State**: Whether you're in editing mode or viewing the success screen
3. **Validation Errors**: Any validation messages are recalculated on load

### Error Handling:
All localStorage operations are wrapped in try-catch blocks to handle:
- Storage quota exceeded errors
- Browser privacy mode restrictions
- Invalid JSON data

### Data Persistence:
- Data remains until explicitly cleared
- Survives page refreshes and browser restarts
- Specific to the domain/origin
- Subject to browser storage limits (typically 5-10MB)

## Summary

Your form app implements a robust auto-save system that:
1. **Continuously saves** user progress as they fill out the form
2. **Preserves custom configurations** when editing form steps
3. **Maintains submission history** for completed forms
4. **Gracefully handles errors** with fallback values
5. **Cleans up appropriately** after successful submission

This ensures users never lose their progress and can return to exactly where they left off, even after closing the browser.