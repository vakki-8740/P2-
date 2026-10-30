import Layout from '../components/Layout.jsx'
import UserRow from '../components/UserRow.jsx'
import { Empty } from '../components/ui.jsx'
import { IconList } from '../components/Icons.jsx'
import { useData } from '../App.jsx'
import { todayUsers } from '../lib/data.js'

export default function Home() {
  const { complaints, loading, ready } = useData()
  const users = todayUsers(complaints)
  const todayCount = users.reduce((sum, u) => sum + u.todayCount, 0)

  return (
    <Layout title="Home" subtitle="Aaj ke users" right={<span className="live-dot" title="Live" />}>
      {!ready ? (
        <div className="notice">Firebase configure nahi hai — `src/firebase-config.js` check karo.</div>
      ) : null}

      <div className="stats">
        <div className="stat">
          <span className="stat-value">{users.length}</span>
          <span className="stat-label">Users today</span>
        </div>
        <div className="stat">
          <span className="stat-value">{todayCount}</span>
          <span className="stat-label">Complaints today</span>
        </div>
      </div>

      <h2 className="section-title">Today · users</h2>

      {loading ? (
        <div className="loading">Load ho raha hai…</div>
      ) : users.length === 0 ? (
        <Empty
          title="Aaj koi complaint nahi"
          text="Jab aaj koi user complaint bhejega, wo turant yahan dikhega."
          icon={<IconList width="22" height="22" />}
        />
      ) : (
        <div className="list">
          {users.map((u) => (
            <UserRow key={u.clientId} user={u} to={`/user/${u.clientId}`} badge={u.todayCount} />
          ))}
        </div>
      )}
    </Layout>
  )
}
