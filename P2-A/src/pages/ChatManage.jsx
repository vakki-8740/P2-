import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import { initialsOf } from '../components/status.js'
import { Avatar } from '../own/ui/data/Avatar.jsx'
import { Badge } from '../own/ui/feedback/Alert.jsx'
import EmptyState from '../own/ui/feedback/EmptyState.jsx'
import { Skeleton } from '../own/ui/feedback/Loaders.jsx'
import { Icon } from '../own/ui/icons/Icons.jsx'
import { useData } from '../App.jsx'
import { chatUsers, formatStamp } from '../lib/data.js'

export default function ChatManage() {
  const { messages, complaints, loading } = useData()
  const rows = useMemo(() => chatUsers(messages, complaints), [messages, complaints])

  return (
    <AppShell title="Chat Manage" subtitle={`${rows.length} chats`}>
      {loading ? (
        <div className="own-card pa-card"><Skeleton lines={4} /></div>
      ) : rows.length === 0 ? (
        <EmptyState icon="message" title="Koi chat nahi" text="Jab user message bhejega, uska chat yahan dikhega." />
      ) : (
        <div className="own-list pa-list">
          {rows.map((u) => {
            const stamp = formatStamp(u.lastAt)
            const mine = u.lastSender !== 'user'
            return (
              <Link key={u.clientId} className="own-list__row pa-userrow" to={`/chat/${u.clientId}`}>
                <Avatar initials={initialsOf(u.name)} tone="accent" size="md" />
                <div className="own-list__meta">
                  <strong>{u.name}</strong>
                  <span>{mine ? 'You: ' : ''}{u.lastText || 'Attachment'}</span>
                  <span className="pa-userrow__time">{stamp.date} • {stamp.time}</span>
                </div>
                <div className="pa-stack" style={{ alignItems: 'flex-end', gap: 4 }}>
                  <span className="pa-userrow__time">{stamp.time}</span>
                  <Badge tone={mine ? 'neutral' : 'accent'}>{u.count}</Badge>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <p className="pa-muted pa-center pa-mt">
        <Icon name="info" size={13} /> Chat khulte hi messages turant live update hote hain.
      </p>
    </AppShell>
  )
}
