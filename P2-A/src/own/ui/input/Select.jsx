import { useState } from 'react'
import { Icon } from '../icons/Icons.jsx'
import './Select.css'

const DEFAULT_OPTIONS = [
  { value: '', label: 'Choose a plan…' },
  { value: 'free', label: 'Free — ₹0 / month' },
  { value: 'pro', label: 'Pro — ₹1,240 / month' },
  { value: 'team', label: 'Team — ₹4,900 / month' },
]

export default function Select({ id, label, options = DEFAULT_OPTIONS, defaultValue = '', onChange, hint }) {
  const [val, setVal] = useState(defaultValue)
  const sid = id || `sel-${Math.random().toString(36).slice(2, 9)}`
  return (
    <div className="own-field">
      {label && <label className="own-field__label" htmlFor={sid}>{label}</label>}
      <div className="own-select">
        <select
          id={sid}
          value={val}
          onChange={(e) => { setVal(e.target.value); onChange?.(e.target.value) }}
        >
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <Icon name="chevron-down" size={16} className="own-select__chev" />
      </div>
      {hint && <p className="own-field__hint">{hint}</p>}
    </div>
  )
}
