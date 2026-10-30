import { useMemo, useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import UserRow from '../components/UserRow.jsx'
import Input from '../own/ui/input/Input.jsx'
import EmptyState from '../own/ui/feedback/EmptyState.jsx'
import { Skeleton } from '../own/ui/feedback/Loaders.jsx'
import { useData } from '../App.jsx'
import { groupUsers } from '../lib/data.js'

export default function AllComplains() {
  const { complaints, loading } = useData()
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    const all = groupUsers(complaints)
    const term = q.trim().toLowerCase()
    if (!term) return all
    return all.filter((u) =>
      [u.name, u.mobile, u.email, u.latestType, ...u.complaints.map((c) => c.type)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    )
  }, [complaints, q])

  return (
    <AppShell title="All Complains" subtitle={`${rows.length} users`}>
      <Input
        id="search-complains"
        icon="search"
        type="search"
        placeholder="Naam, mobile ya complaint type se search…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {loading ? (
        <div className="own-card pa-card"><Skeleton lines={4} /></div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon="search"
          title={q ? 'Kuch nahi mila' : 'Abhi koi complaint nahi'}
          text={q ? `"${q}" se koi user match nahi hua.` : 'Jab user complaint karega, wo yahan aa jayega.'}
        />
      ) : (
        <div className="own-list pa-list">
          {rows.map((u) => (
            <UserRow key={u.clientId} user={u} to={`/user/${u.clientId}`} badge={u.total} />
          ))}
        </div>
      )}
    </AppShell>
  )
}
