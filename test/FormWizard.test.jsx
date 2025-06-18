// ------------------------------
// FormWizard.test.jsx
// ------------------------------
import { render, screen, fireEvent } from '@testing-library/react'
import FormWizard from '../src/components/FormWizard'

describe('<FormWizard /> basic flow', () => {
  beforeEach(() => localStorage.clear())

  it('renders first step and navigates forward / backward', () => {
    render(<FormWizard />)

    // Step 1
    expect(screen.getByText(/contact info/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByText(/step 1 of 2/i)).toBeInTheDocument()

    // Fill minimal fields
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'John Doe' }
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' }
    })

    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    // Now on step 2
    expect(screen.getByText(/details/i)).toBeInTheDocument()
    expect(screen.getByText(/step 2 of 2/i)).toBeInTheDocument()

    // Back again
    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(screen.getByText(/contact info/i)).toBeInTheDocument()
  })

  it('undo and redo changes within a step', () => {
    render(<FormWizard />)

    const fullName = screen.getByLabelText(/full name/i)
    fireEvent.change(fullName, { target: { value: 'Alice' } })

    fireEvent.click(screen.getByRole('button', { name: /undo/i }))
    expect(fullName).toHaveValue('')

    fireEvent.click(screen.getByRole('button', { name: /redo/i }))
    expect(fullName).toHaveValue('Alice')
  })
})