import { useState } from 'react'
import { Icon } from '../icons/Icons.jsx'
import './Input.css'

export default function Input({
  id,
  label,
  hint,
  error,
  icon,
  type = 'text',
  value,
  defaultValue,
  onChange,
  disabled,
  placeholder,
  allowPasswordToggle = false,
  ...rest
}) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && show ? 'text' : type
  const inputId = id || `in-${Math.random().toString(36).slice(2, 9)}`
  const describedBy = error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined

  return (
    <div className={`own-field${disabled ? ' is-disabled' : ''}${error ? ' has-error' : ''}`}>
      {label && <label className="own-field__label" htmlFor={inputId}>{label}</label>}
      <div className="own-field__control">
        {icon && <Icon name={icon} size={17} className="own-field__icon" />}
        <input
          id={inputId}
          className="own-input"
          type={inputType}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...rest}
        />
        {isPassword && allowPasswordToggle && (
          <button
            type="button"
            className="own-field__action"
            aria-label={show ? 'Hide password' : 'Show password'}
            onClick={() => setShow((s) => !s)}
          >
            <Icon name="eye" size={17} />
          </button>
        )}
      </div>
      {error ? (
        <p className="own-field__error" id={`${inputId}-err`} role="alert">{error}</p>
      ) : hint ? (
        <p className="own-field__hint" id={`${inputId}-hint`}>{hint}</p>
      ) : null}
    </div>
  )
}
