import './Loaders.css'

export function Spinner({ size = 26, label = 'Loading' }) {
  return (
    <span className="own-spinner-wrap" role="status" aria-live="polite">
      <span className="own-spinner" style={{ width: size, height: size }} />
      <span className="own-sr-only">{label}</span>
    </span>
  )
}

export function DotLoader() {
  return (
    <span className="own-dots" role="status" aria-live="polite">
      <span /><span /><span />
      <span className="own-sr-only">Loading</span>
    </span>
  )
}

export function ProgressBar({ value = 62, tone = 'accent', label }) {
  const v = Math.min(100, Math.max(0, value))
  return (
    <div className="own-progress">
      {label && (
        <div className="own-progress__head">
          <span>{label}</span>
          <span>{v}%</span>
        </div>
      )}
      <div className="own-progress__track" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
        <div className={`own-progress__fill own-progress__fill--${tone}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  )
}

export function ProgressCircle({ value = 72, size = 92 }) {
  const r = 38
  const circ = 2 * Math.PI * r
  return (
    <div className="own-progress-circle" style={{ width: size, height: size }} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <svg viewBox="0 0 92 92">
        <circle className="own-progress-circle__track" cx="46" cy="46" r={r} />
        <circle
          className="own-progress-circle__fill"
          cx="46" cy="46" r={r}
          strokeDasharray={circ}
          strokeDashoffset={circ - (value / 100) * circ}
        />
      </svg>
      <strong>{value}%</strong>
    </div>
  )
}

export function Skeleton({ lines = 3, circle = false }) {
  return (
    <div className="own-skeleton" aria-hidden="true">
      {circle && <span className="own-skeleton__circle" />}
      <div className="own-skeleton__lines">
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} className="own-skeleton__line" style={{ width: `${100 - i * 18}%` }} />
        ))}
      </div>
    </div>
  )
}
