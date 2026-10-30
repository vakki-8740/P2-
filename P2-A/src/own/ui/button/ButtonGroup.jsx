import { useState } from 'react'
import './ButtonGroup.css'

export default function ButtonGroup({
  options = [
    { id: 'day', label: 'Day' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
  ],
  defaultSelected = 'week',
  segmented = true,
  onChange,
}) {
  const [selected, setSelected] = useState(defaultSelected)
  return (
    <div className={segmented ? 'own-seg' : 'own-btn-group'} role="group" aria-label="Options">
      {options.map((opt) => {
        const active = opt.id === selected
        return (
          <button
            key={opt.id}
            type="button"
            className={segmented ? `own-seg__btn${active ? ' is-active' : ''}` : `own-btn-group__btn${active ? ' is-active' : ''}`}
            aria-pressed={active}
            onClick={() => { setSelected(opt.id); onChange?.(opt.id) }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
