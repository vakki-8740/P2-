import { useState } from 'react'
import './RangeSlider.css'

export default function RangeSlider({ min = 0, max = 100, step = 1, defaultValue = 40, label = 'Budget range', prefix = '₹' }) {
  const [val, setVal] = useState(defaultValue)
  const pct = ((val - min) / (max - min)) * 100
  return (
    <div className="own-range">
      <div className="own-range__head">
        <label htmlFor="range-input">{label}</label>
        <output className="own-range__value">{prefix}{val.toLocaleString('en-IN')}</output>
      </div>
      <input
        id="range-input"
        type="range"
        min={min}
        max={max}
        step={step}
        value={val}
        onChange={(e) => setVal(Number(e.target.value))}
        style={{ '--fill': `${pct}%` }}
      />
      <div className="own-range__scale"><span>{prefix}{min}</span><span>{prefix}{max}</span></div>
    </div>
  )
}
