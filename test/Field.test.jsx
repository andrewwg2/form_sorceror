// ------------------------------
// Field.test.jsx
// ------------------------------
import { render, screen, fireEvent } from '@testing-library/react'
import Field from '../src/components/Field'

describe('<Field />', () => {
  it('renders a text input and fires onChange', () => {
    const handle = vi.fn()
    render(
      <Field
        field={{ name: 'fullName', label: 'Full Name', type: 'text' }}
        value=""
        onChange={handle}
      />
    )

    const input = screen.getByLabelText(/full name/i)
    fireEvent.change(input, { target: { value: 'Jane' } })
    expect(handle).toHaveBeenCalledWith('Jane')
  })

  it('renders a select with options', () => {
    const countries = ['USA', 'Canada']
    render(
      <Field
        field={{ name: 'country', label: 'Country', type: 'select', options: countries }}
        value="Canada"
        onChange={() => {}}
      />
    )

    const select = screen.getByLabelText(/country/i)
    // should have placeholder + 2 real options (3 total)
    expect(select.querySelectorAll('option')).toHaveLength(3)
    expect(select).toHaveValue('Canada')
  })
})
