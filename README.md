### Multi-Step Form Wizard (React + Vite + Tailwind)

A modular, undoable multi-step form wizard.  
Supports editable step definitions, undo/redo, draft persistence, and a clean submission confirmation screen.

---

### Features

- Multi-step wizard navigation (Next / Back)
- Progress indicator with step count and visual bar
- Per-field undo and redo support
- Draft autosave to `localStorage`
- Submission log stored in `localStorage`
- JSON step editor – modify the wizard at runtime
- Built with Immer for safe immutable updates
- Responsive layout via Tailwind CSS
- Docker-ready and test-ready configuration

---

### Technologies

- React (hooks)
- Immer (immutable state updates)
- Vite (dev + build tool)
- Tailwind CSS
- JavaScript ES2022
- Vitest / Testing-Library (unit tests)

---

### Project Structure

```

src/
├── components/
│   ├── FormWizard.jsx
│   ├── NavButtons.jsx
│   ├── ProgressBar.jsx
│   ├── StepForm.jsx
│   ├── Field.jsx
│   └── SubmissionSuccess.jsx
├── util/
│   ├── storage.js        # localStorage helpers
│   └── useWizard.js      # custom hook (Immer + state logic)
├── StepEditor.jsx        # in-app JSON editor
├── App.jsx
├── main.jsx
└── index.css

````

---

### Local Development

```bash
# install deps
npm install

# start dev server (http://localhost:5173)
npm run dev

# production build
npm run build
````

---

### Running with Docker

```bash
# build image + run dev server
. build_docker.sh form_sorceror \
  && docker run --rm -it -p 5173:5173 form_sorceror ./run_dev.sh
```

```bash
# build image + run tests
. build_docker.sh form_sorceror \
  && docker run --rm -it form_sorceror ./run_tests.sh
```

Scripts `build_docker.sh`, `run_dev.sh`, and `run_tests.sh` must be executable.

---

### Step Editor & Persistence

| Key                       | Purpose                                                                    |
| ------------------------- | -------------------------------------------------------------------------- |
| `form_wizard_steps`       | JSON array of step definitions saved via the in-app **Edit Steps** button. |
| `form_wizard_state`       | Draft `{ stepIndex, formData }` autosaved after each change.               |
| `form_wizard_submissions` | Array of submitted objects, each with `submittedAt` timestamp.             |

If `form_wizard_steps` is absent, the wizard falls back to the hard-coded default in `useWizard.js`.

---

### License

MIT – free to use, modify, and distribute.
