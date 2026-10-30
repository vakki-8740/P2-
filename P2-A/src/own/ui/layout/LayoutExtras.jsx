import './LayoutExtras.css'

export function Divider({ label, vertical = false }) {
  if (vertical) return <span className="own-divider-v" role="separator" aria-orientation="vertical" />
  if (label) {
    return (
      <div className="own-divider-label" role="separator">
        <span>{label}</span>
      </div>
    )
  }
  return <hr className="own-divider-h" />
}

export function SectionHeader({ eyebrow, title, text, align = 'left' }) {
  return (
    <header className={`own-section own-section--${align}`}>
      {eyebrow && <span className="own-section__eyebrow">{eyebrow}</span>}
      <h2 className="own-section__title">{title}</h2>
      {text && <p className="own-section__text">{text}</p>}
    </header>
  )
}

export function SplitLayout({ left, right }) {
  return (
    <div className="own-split">
      <div className="own-split__pane own-split__pane--left">{left}</div>
      <div className="own-split__pane own-split__pane--right">{right}</div>
    </div>
  )
}

export function GridLayout({ children, columns = 3 }) {
  return (
    <div className="own-grid-layout" style={{ '--cols': columns }}>
      {children}
    </div>
  )
}
