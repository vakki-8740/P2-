import { useMemo } from 'react'
import AppShell from '../components/AppShell.jsx'
import UserRow from '../components/UserRow.jsx'
import { StatCardGrid } from '../own/ui/data/StatCard.jsx'
import EmptyState from '../own/ui/feedback/EmptyState.jsx'
import { Skeleton } from '../own/ui/feedback/Loaders.jsx'
import { useData } from '../App.jsx'
import { groupUsers, todayUsers } from '../lib/data.js'

export default function Home() {
  const { complaints, messages, loading } = useData()

  const todays = useMemo(() => todayUsers(complaints), [complaints])
  const users = useMemo(() => groupUsers(complaints), [complaints])
  const todayCount = todays.reduce((n, u) => n + u.todayCount, 0)

  const stats = [
    { id: 'today', label: 'Aaj ki complaints', value: todayCount, delta: 'Today', up: true, icon: 'bell' },
    { id: 'users', label: 'Total users', value: users.length, delta: 'Live', up: true, icon: 'user' },
    { id: 'all', label: 'Total complaints', value: complaints.length, delta: 'All', up: true, icon: 'grid' },
    { id: 'chat', label: 'Chat messages', value: messages.length, delta: 'Live', up: true, icon: 'message' },
  ]

  return (
    <AppShell title="Aaj ke users" subtitle="Sirf aaj ki complaints">
      <section className="pa-section">
        <StatCardGrid stats={stats} />
      </section>

      <section className="pa-section">
        <h2 className="pa-section__title">Aaj ke users ({todays.length})</h2>

        {loading ? (
          <div className="own-card pa-card"><Skeleton lines={3} /></div>
        ) : todays.length === 0 ? (
          <EmptyState
            icon="user"
            title="Aaj koi complaint nahi"
            text="Aaj ke din abhi koi user complaint nahi aayi. Nayi complaint aate hi yahan turant dikhegi."
          />
        ) : (
          <div className="own-list pa-list">
            {todays.map((u) => (
              <UserRow key={u.clientId} user={u} to={`/user/${u.clientId}`} badge={u.todayCount} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  )
}
