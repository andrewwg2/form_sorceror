// ------------------------------
// localStorage.integration.test.jsx
// ------------------------------
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FormWizard from '../src/components/FormWizard'

const SUBMISSION_KEY = 'form_wizard_submissions'

beforeEach(() => localStorage.clear())

describe('LocalStorage integration', () => {
  it('persists progress between reloads', async () => {
    const { unmount } = render(<FormWizard />)
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Persisted User' }
    })
    // simulate reload
    unmount()
    render(<FormWizard />)
    expect(screen.getByLabelText(/full name/i)).toHaveValue('Persisted User')
  })

  it('saves submissions array on submit', async () => {
    render(<FormWizard />)
    // Fill Step 1
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Submit User' }
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'submit@example.com' }
    })
    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    // Fill Step 2
    fireEvent.change(screen.getByLabelText(/age/i), {
      target: { value: '30' }
    })
    fireEvent.change(screen.getByLabelText(/country/i), {
      target: { value: 'USA' }
    })

    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      const submissions = JSON.parse(localStorage.getItem(SUBMISSION_KEY) || '[]')
      expect(submissions).toHaveLength(1)
      expect(submissions[0]).toMatchObject({ fullName: 'Submit User', country: 'USA' })
    })
  })
})