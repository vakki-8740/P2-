import { useState } from 'react'
import './Tooltip.css'

export default function Tooltip({ text = 'Tooltip text', side = 'top', children }) {
  const [show, setShow] = useState(false)
  return (
    <span
      className="own-tooltip-wrap"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children || (
        <button type="button" className="own-tooltip-trigger">Hover or focus me</button>
      )}
      <span className={`own-tooltip own-tooltip--${side}${show ? ' is-visible' : ''}`} role="tooltip">
        {text}
      </span>
    </span>
  )
}
