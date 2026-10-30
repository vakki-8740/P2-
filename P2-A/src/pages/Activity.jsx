import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { Avatar, Empty } from '../components/ui.jsx'
import { IconActivity, IconChat, IconList } from '../components/Icons.jsx'
import { useData } from '../App.jsx'
import { activityFeed, formatStamp, isToday } from '../lib/data.js'

function dayLabel(iso) {
  if (!iso) return 'Purana'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'Purana'
  if (isToday(iso)) return 'Today'
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (isToday(iso, yesterday)) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function Activity() {
  const { complaints, messages, loading } = useData()
  const items = useMemo(() => activityFeed(complaints, messages), [complaints, messages])

  const groups = useMemo(() => {
    const map = new Map()
    for (const item of items) {
      const key = dayLabel(item.at)
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(item)
    }
    return [...map.entries()]
  }, [items])

  return (
    <Layout title="Activity" subtitle="Sabse nayi activity pehle">
      {loading ? (
        <div className="loading">Load ho raha hai…</div>
      ) : items.length === 0 ? (
        <Empty
          title="Koi activity nahi"
          text="Complaints aur chat messages yahan timeline me dikhenge."
          icon={<IconActivity width="22" height="22" />}
        />
      ) : (
        groups.map(([day, rows]) => (
          <section key={day} className="activity-group">
            <h2 className="section-title">{day}</h2>
            <div className="list">
              {rows.map((item) => {
                const stamp = formatStamp(item.at)
                const to = item.kind === 'complaint' ? `/user/${item.clientId}` : `/chat/${item.clientId}`
                return (
                  <Link key={item.id} className="activity-row" to={to}>
                    <span className={`activity-icon ${item.kind}`}>
                      {item.kind === 'complaint'
                        ? <IconList width="16" height="16" />
                        : <IconChat width="16" height="16" />}
                    </span>
                    <span className="activity-text">
                      <span className="activity-title">{item.title}</span>
                      <span className="activity-sub">{item.subtitle}</span>
                    </span>
                    <span className="activity-time">{stamp.time}</span>
                  </Link>
                )
              })}
            </div>
          </section>
        ))
      )}
    </Layout>
  )
}
