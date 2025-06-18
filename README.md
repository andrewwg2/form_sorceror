# Multi-Step Form Wizard (React + Vite + Tailwind)

This is a modular, undoable multi-step form wizard built with React, Vite, and Tailwind CSS. It supports undo/redo, local persistence, and a clean submission confirmation screen.

## Features

- Multi-step wizard navigation (Next / Back)
- Progress indicator with step count and visual bar
- Per-field undo and redo support
- Autosaves progress to `localStorage`
- Appends submitted entries to `localStorage`
- Responsive layout styled with Tailwind CSS
- Optional restart after successful submission

## Technologies Used

- React (functional components with hooks)
- Vite (fast dev server and build)
- Tailwind CSS (utility-first styling)
- JavaScript (ES6+)

## Project Structure

```

src/
├── components/
│   ├── FormWizard.jsx
│   ├── NavButtons.jsx
│   ├── ProgressBar.jsx
│   ├── StepForm.jsx
│   ├── Field.jsx
│   └── SubmissionSuccess.jsx
├── App.jsx
├── main.jsx
└── index.css

````

## Getting Started (Local)

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the development server**

   ```bash
   npm run dev
   ```

3. **Build for production**

   ```bash
   npm run build
   ```

## Running the App with Docker

You can run this app in a Docker container using the included scripts.

### Run the App

```bash
. build_docker.sh form_sorceror && docker run --rm -it -p 5173:5173 form_sorceror ./run_dev.sh
```

This will:

* Build a Docker image called `form_sorceror`
* Run the app with Vite on port `5173`

### Run the Tests

```bash
. build_docker.sh form_sorceror && docker run --rm -it -p 5173:5173 form_sorceror ./run_tests.sh
```

This will:

* Build the same image
* Run your test suite (e.g., using Vitest or Jest)

Make sure your `build_docker.sh`, `run_dev.sh`, and `run_tests.sh` are all present and executable.

## Submission Storage

Submissions are stored in browser `localStorage` under the key:

```
form_wizard_submissions
```

Each submission includes a `submittedAt` timestamp.

## License

MIT License. You are free to use, modify, and distribute this code.
