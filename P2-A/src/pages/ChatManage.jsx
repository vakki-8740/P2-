import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { Avatar, Empty } from '../components/ui.jsx'
import { IconChat, IconChevron } from '../components/Icons.jsx'
import { useData } from '../App.jsx'
import { chatUsers, formatDateTime } from '../lib/data.js'

export default function ChatManage() {
  const { complaints, messages, loading } = useData()
  const [q, setQ] = useState('')

  const users = useMemo(() => {
    const all = chatUsers(messages, complaints)
    const term = q.trim().toLowerCase()
    if (!term) return all
    return all.filter((u) =>
      [u.name, u.lastText].filter(Boolean).some((v) => String(v).toLowerCase().includes(term))
    )
  }, [messages, complaints, q])

  return (
    <Layout title="Chat Manage" subtitle={`${users.length} chats`}>
      <input
        className="input search"
        placeholder="User ya message se search…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {loading ? (
        <div className="loading">Load ho raha hai…</div>
      ) : users.length === 0 ? (
        <Empty
          title="Koi chat nahi"
          text="Jab koi user live chat me message bhejega, wo yahan dikhega."
          icon={<IconChat width="22" height="22" />}
        />
      ) : (
        <div className="list">
          {users.map((u) => (
            <Link key={u.clientId} className="user-row" to={`/chat/${u.clientId}`}>
              <Avatar />
              <span className="user-row-text">
                <span className="user-row-name">{u.name}</span>
                <span className="user-row-meta">
                  <span className="chat-preview">
                    {u.lastSender === 'user' ? '' : 'You: '}
                    {u.lastText || '—'}
                  </span>
                </span>
                <span className="user-row-sub">{formatDateTime(u.lastAt)}</span>
              </span>
              <IconChevron className="chev" width="16" height="16" />
            </Link>
          ))}
        </div>
      )}
    </Layout>
  )
}
