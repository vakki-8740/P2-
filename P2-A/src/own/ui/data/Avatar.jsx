import './Avatar.css'

const PEOPLE = [
  { initials: 'AK', tone: 'accent' },
  { initials: 'PS', tone: 'success' },
  { initials: 'RV', tone: 'warning' },
  { initials: 'NG', tone: 'neutral' },
]

export function Avatar({ initials = 'AK', size = 'md', tone = 'accent', status }) {
  return (
    <span className={`own-avatar own-avatar--${size} own-avatar--${tone}`} title={initials}>
      {initials}
      {status && <span className={`own-avatar__status own-avatar__status--${status}`} />}
    </span>
  )
}

export function AvatarGroup({ people = PEOPLE, max = 4 }) {
  const shown = people.slice(0, max)
  const extra = people.length - shown.length
  return (
    <span className="own-avatar-group">
      {shown.map((p) => (
        <span key={p.initials} className={`own-avatar own-avatar--sm own-avatar--${p.tone}`} title={p.initials}>
          {p.initials}
        </span>
      ))}
      {extra > 0 && <span className="own-avatar own-avatar--sm own-avatar--neutral own-avatar--extra">+{extra}</span>}
    </span>
  )
}
