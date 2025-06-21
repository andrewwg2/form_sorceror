// Storage utility functions for managing localStorage operations

export const STORAGE_KEYS = {
  STEPS: 'form_wizard_steps',
  STATE: 'form_wizard_state',
  SUBMISSIONS: 'form_wizard_submissions'
};

/**
 * Safely get and parse JSON from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist or parse fails
 * @returns {*} Parsed value or default
 */
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Failed to parse localStorage item for key: ${key}`, error);
    return defaultValue;
  }
};

/**
 * Safely set value in localStorage as JSON
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 */
export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to set localStorage item for key: ${key}`, error);
  }
};

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove localStorage item for key: ${key}`, error);
  }
};

/**
 * Clear all wizard-related items from localStorage
 */
export const clearWizardStorage = () => {
  Object.values(STORAGE_KEYS).forEach(removeFromStorage);
};

/**
 * Get wizard state from storage
 * @returns {Object} Wizard state or default
 */
export const getWizardState = () => {
  return getFromStorage(STORAGE_KEYS.STATE, { stepIndex: 0, formData: {} });
};

/**
 * Save wizard state to storage
 * @param {number} stepIndex - Current step index
 * @param {Object} formData - Form data
 */
export const saveWizardState = (stepIndex, formData) => {
  setToStorage(STORAGE_KEYS.STATE, { stepIndex, formData });
};

/**
 * Get wizard steps configuration
 * @param {Array} defaultSteps - Default steps if none saved
 * @returns {Array} Steps configuration
 */
export const getWizardSteps = (defaultSteps) => {
  return getFromStorage(STORAGE_KEYS.STEPS, defaultSteps);
};

/**
 * Save wizard steps configuration
 * @param {Array} steps - Steps configuration
 */
export const saveWizardSteps = (steps) => {
  setToStorage(STORAGE_KEYS.STEPS, steps);
};

/**
 * Get submission history
 * @returns {Array} Array of submissions
 */
export const getSubmissions = () => {
  return getFromStorage(STORAGE_KEYS.SUBMISSIONS, []);
};

/**
 * Add new submission
 * @param {Object} formData - Form data to submit
 */
export const addSubmission = (formData) => {
  const submissions = getSubmissions();
  setToStorage(STORAGE_KEYS.SUBMISSIONS, [
    ...submissions,
    { ...formData, submittedAt: Date.now() }
  ]);
};
