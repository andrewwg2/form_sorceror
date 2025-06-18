// src/App.jsx
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// ⬇️  NEW: bring in the wizard
import FormWizard from './components/FormWizard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      {/* --- NEW: the multi-step form wizard --- */}
      <FormWizard />
    </div>
  )
}

export default App
