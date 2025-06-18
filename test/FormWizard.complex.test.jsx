// ==================================================
// FormWizard.complex.test.jsx  – confirms UI builds for each step
// ==================================================
import { render, screen, fireEvent } from '@testing-library/react'
import FormWizard from '../src/components/FormWizard'

describe('<FormWizard /> complex step coverage', () => {
  it('shows correct inputs when traversing all steps', () => {
    render(<FormWizard />)

    // Step 1 has 2 text inputs (Full Name, Email)
    expect(screen.getAllByRole('textbox')).toHaveLength(2)

    fireEvent.click(screen.getByRole('button', { name: /next/i }))

    // Step 2 should now have Age (number) and Country (select)
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument()
  })
})
