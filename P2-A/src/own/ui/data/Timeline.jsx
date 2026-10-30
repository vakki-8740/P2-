import './Timeline.css'

const EVENTS = [
  { id: 1, title: 'Design system v1 shipped', time: 'Today, 10:24 AM', tone: 'accent' },
  { id: 2, title: 'Priya merged 12 component specs', time: 'Yesterday, 4:10 PM', tone: 'success' },
  { id: 3, title: 'Payment gateway review scheduled', time: '23 Oct, 2:00 PM', tone: 'warning' },
  { id: 4, title: 'Quarterly audit completed', time: '21 Oct, 9:45 AM', tone: 'neutral' },
]

export function Timeline({ events = EVENTS }) {
  return (
    <ol className="own-timeline">
      {events.map((e) => (
        <li key={e.id} className="own-timeline__item">
          <span className={`own-timeline__dot own-timeline__dot--${e.tone}`} />
          <div className="own-timeline__body">
            <strong>{e.title}</strong>
            <span className="own-timeline__time">{e.time}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function ActivityFeed() {
  return (
    <div className="own-feed">
      {EVENTS.map((e) => (
        <div key={e.id} className="own-feed__row">
          <span className={`own-timeline__dot own-timeline__dot--${e.tone}`} />
          <p className="own-feed__text"><strong>{e.title}</strong> — {e.time}</p>
        </div>
      ))}
    </div>
  )
}
