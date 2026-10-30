import './Charts.css'

const BARS = [
  { day: 'Mon', value: 46 }, { day: 'Tue', value: 72 }, { day: 'Wed', value: 58 },
  { day: 'Thu', value: 88 }, { day: 'Fri', value: 64 }, { day: 'Sat', value: 40 }, { day: 'Sun', value: 76 },
]

const SLICES = [
  { label: 'Direct', pct: 42, tone: 'var(--accent)' },
  { label: 'Search', pct: 31, tone: 'var(--yes)' },
  { label: 'Social', pct: 18, tone: 'var(--warn)' },
  { label: 'Referral', pct: 9, tone: 'var(--track-off)' },
]

export function BarChart() {
  return (
    <div className="own-chart">
      <div className="own-chart__bars">
        {BARS.map((b) => (
          <div key={b.day} className="own-chart__col">
            <span className="own-chart__bar" style={{ height: `${b.value}%` }} title={`${b.day}: ${b.value}%`} />
            <span className="own-chart__label">{b.day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DonutChart({ slices = SLICES }) {
  let acc = 0
  const stops = slices.map((s) => {
    const start = acc
    acc += s.pct
    return `${s.tone} ${start}% ${acc}%`
  }).join(', ')
  return (
    <div className="own-donut-wrap">
      <div className="own-donut" style={{ background: `conic-gradient(${stops})` }} role="img" aria-label="Traffic split donut chart">
        <span className="own-donut__hole">100%</span>
      </div>
      <ul className="own-donut__legend">
        {slices.map((s) => (
          <li key={s.label}><span style={{ background: s.tone }} />{s.label} <b>{s.pct}%</b></li>
        ))}
      </ul>
    </div>
  )
}
