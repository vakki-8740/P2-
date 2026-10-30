import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import { Timeline } from '../own/ui/data/Timeline.jsx'
import EmptyState from '../own/ui/feedback/EmptyState.jsx'
import { Skeleton } from '../own/ui/feedback/Loaders.jsx'
import { useData } from '../App.jsx'
import { activityFeed, formatDateTime } from '../lib/data.js'

const toneOf = (kind) => (kind === 'complaint' ? 'accent' : 'success')

export default function Activity() {
  const { complaints, messages, loading } = useData()

  const events = useMemo(
    () =>
      activityFeed(complaints, messages).map((it) => ({
        id: it.id,
        tone: toneOf(it.kind),
        time: formatDateTime(it.at),
        title: (
          <Link className="pa-link" to={`/user/${it.clientId}`}>
            <strong>{it.title}</strong> · {it.subtitle}
          </Link>
        ),
      })),
    [complaints, messages]
  )

  return (
    <AppShell title="Activity" subtitle="Complaints + chat ka poora feed">
      {loading ? (
        <div className="own-card pa-card"><Skeleton lines={5} /></div>
      ) : events.length === 0 ? (
        <EmptyState icon="clock" title="Koi activity nahi" text="Jaise hi koi complaint ya message aayega, yahan timeline me dikhega." />
      ) : (
        <Timeline events={events} />
      )}
    </AppShell>
  )
}
