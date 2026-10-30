import { useMemo, useState } from 'react'
import Layout from '../components/Layout.jsx'
import UserRow from '../components/UserRow.jsx'
import { Empty } from '../components/ui.jsx'
import { IconList } from '../components/Icons.jsx'
import { useData } from '../App.jsx'
import { groupUsers } from '../lib/data.js'

export default function AllComplains() {
  const { complaints, loading } = useData()
  const [q, setQ] = useState('')

  const users = useMemo(() => {
    const all = groupUsers(complaints)
    const term = q.trim().toLowerCase()
    if (!term) return all
    return all.filter((u) =>
      [u.name, u.mobile, u.email, u.latestType]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    )
  }, [complaints, q])

  return (
    <Layout title="All Complains" subtitle={`${users.length} users`}>
      <input
        className="input search"
        placeholder="Naam, mobile ya type se search…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {loading ? (
        <div className="loading">Load ho raha hai…</div>
      ) : users.length === 0 ? (
        <Empty
          title="Koi user nahi mila"
          text={q ? 'Search badal ke dekho.' : 'Abhi tak koi complaint nahi aayi.'}
          icon={<IconList width="22" height="22" />}
        />
      ) : (
        <div className="list">
          {users.map((u) => (
            <UserRow key={u.clientId} user={u} to={`/user/${u.clientId}`} />
          ))}
        </div>
      )}
    </Layout>
  )
}
