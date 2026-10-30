import './Input.css'

export default function Textarea({ id, label, hint, error, rows = 4, ...rest }) {
  const inputId = id || `ta-${Math.random().toString(36).slice(2, 9)}`
  return (
    <div className={`own-field${error ? ' has-error' : ''}`}>
      {label && <label className="own-field__label" htmlFor={inputId}>{label}</label>}
      <textarea id={inputId} className="own-textarea" rows={rows} aria-invalid={Boolean(error)} {...rest} />
      {error ? <p className="own-field__error" role="alert">{error}</p>
        : hint ? <p className="own-field__hint">{hint}</p> : null}
    </div>
  )
}
