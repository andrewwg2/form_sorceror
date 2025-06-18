// ------------------------------
// StepForm.test.jsx
// ------------------------------
import { render, screen } from '@testing-library/react'
import StepForm from '../src/components/StepForm'

describe('<StepForm />', () => {
  it('renders every field provided', () => {
    const fields = [
      { name: 'a', label: 'A', type: 'text' },
      { name: 'b', label: 'B', type: 'number' },
      { name: 'c', label: 'C', type: 'select', options: ['x', 'y'] }
    ]

    render(<StepForm fields={fields} data={{}} onChange={() => {}} />)

    expect(screen.getByLabelText('A')).toBeInTheDocument()
    expect(screen.getByLabelText('B')).toBeInTheDocument()
    expect(screen.getByLabelText('C')).toBeInTheDocument()
  })
})
