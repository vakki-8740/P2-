import { useRef, useState } from 'react'
import './OtpInput.css'

export default function OtpInput({ length = 6, label = 'Enter verification code' }) {
  const [digits, setDigits] = useState(Array(length).fill(''))
  const refs = useRef([])

  const setDigit = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]
    next[i] = val
    setDigits(next)
    if (val && i < length - 1) refs.current[i + 1]?.focus()
  }

  const onKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus()
  }

  const onPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length).split('')
    if (!pasted.length) return
    const next = Array(length).fill('')
    pasted.forEach((d, i) => { next[i] = d })
    setDigits(next)
    refs.current[Math.min(pasted.length, length - 1)]?.focus()
  }

  return (
    <div className="own-otp">
      <span className="own-otp__label">{label}</span>
      <div className="own-otp__row" onPaste={onPaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el }}
            className="own-otp__box"
            inputMode="numeric"
            maxLength={1}
            value={d}
            aria-label={`Digit ${i + 1}`}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
          />
        ))}
      </div>
    </div>
  )
}
