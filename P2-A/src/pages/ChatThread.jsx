import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { Avatar, Empty } from '../components/ui.jsx'
import { IconChat, IconSend } from '../components/Icons.jsx'
import { useData } from '../App.jsx'
import { formatStamp, messagesOf, userNameOf } from '../lib/data.js'
import { sendSupportMessage } from '../lib/actions.js'

export default function ChatThread() {
  const { clientId } = useParams()
  const { complaints, messages, loading } = useData()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  const rows = useMemo(() => messagesOf(messages, clientId), [messages, clientId])
  const userComplaints = useMemo(
    () => complaints.filter((c) => c.clientId === clientId),
    [complaints, clientId]
  )
  const name = userComplaints.length
    ? userNameOf(userComplaints[0])
    : `User ${String(clientId || '').slice(0, 6)}`

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ block: 'end' })
  }, [rows.length])

  const send = async (e) => {
    e.preventDefault()
    const body = text.trim()
    if (!body || sending) return
    setSending(true)
    setError('')
    try {
      await sendSupportMessage(clientId, body)
      setText('')
    } catch (err) {
      setError(err && err.message ? err.message : 'Message send nahi hua')
    } finally {
      setSending(false)
    }
  }

  return (
    <Layout
      title={name}
      subtitle={userComplaints.length ? `${userComplaints.length} complaints` : 'No complaints'}
      back
      nav={false}
      right={
        userComplaints.length ? (
          <Link className="btn ghost sm" to={`/user/${clientId}`}>Complaints</Link>
        ) : null
      }
    >
      <div className="chat-list">
        {loading ? (
          <div className="loading">Load ho raha hai…</div>
        ) : rows.length === 0 ? (
          <Empty title="Koi message nahi" text="Is user ne abhi koi message nahi bheja." icon={<IconChat width="22" height="22" />} />
        ) : (
          rows.map((m) => {
            const mine = m.sender !== 'user'
            const stamp = formatStamp(m.createdAt)
            return (
              <div key={m.id} className={`bubble-row ${mine ? 'right' : 'left'}`}>
                {!mine ? <Avatar size={28} /> : null}
                <div className={`bubble ${mine ? 'mine' : 'theirs'}`}>
                  {m.text ? <span className="bubble-text">{m.text}</span> : null}
                  {m.file && m.file.name ? (
                    <span className="bubble-file">📎 {m.file.name}</span>
                  ) : null}
                  <span className="bubble-time">
                    {stamp.time}{m.edited ? ' · edited' : ''}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {error ? <p className="error">{error}</p> : null}

      <form className="composer" onSubmit={send}>
        <input
          className="input"
          placeholder="Reply likho…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
        />
        <button className="btn primary" type="submit" disabled={!text.trim() || sending} aria-label="Send">
          <IconSend width="17" height="17" />
        </button>
      </form>
    </Layout>
  )
}
