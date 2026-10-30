import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import FileViewer from '../components/FileViewer.jsx'
import { prettyLabel, statusLabel, statusTone, initialsOf } from '../components/status.js'
import { Avatar } from '../own/ui/data/Avatar.jsx'
import KeyValue from '../own/ui/data/KeyValue.jsx'
import Button from '../own/ui/button/Button.jsx'
import { Badge, Chip } from '../own/ui/feedback/Alert.jsx'
import EmptyState from '../own/ui/feedback/EmptyState.jsx'
import { Spinner } from '../own/ui/feedback/Loaders.jsx'
import { Icon } from '../own/ui/icons/Icons.jsx'
import { useData } from '../App.jsx'
import { complaintsOf, fileSrc, formatDateTime, formatFileSize, isImageFile, userNameOf } from '../lib/data.js'
import { updateComplaintStatus } from '../lib/actions.js'

const STATUS_OPTIONS = ['pending', 'resolved', 'rejected']

export default function UserDetail() {
  const { clientId } = useParams()
  const { complaints, messages, loading } = useData()
  const [viewer, setViewer] = useState(null)
  const [savingId, setSavingId] = useState('')

  const rows = useMemo(() => complaintsOf(complaints, clientId), [complaints, clientId])
  const name = rows.length ? userNameOf(rows[0]) : `User ${String(clientId || '').slice(0, 6)}`
  const mobile = (rows[0]?.details?.mobile) || ''
  const email = (rows[0]?.details?.email) || ''
  const chatCount = messages.filter((m) => m.clientId === clientId).length

  const changeStatus = async (id, status) => {
    setSavingId(id)
    try {
      await updateComplaintStatus(id, status)
    } catch (err) {
      alert(err?.message || 'Status update fail')
    } finally {
      setSavingId('')
    }
  }

  return (
    <AppShell
      title={name}
      subtitle={`${rows.length} complaint${rows.length === 1 ? '' : 's'}`}
      back
      nav={false}
    >
      <section className="own-card pa-card">
        <div className="pa-row">
          <Avatar initials={initialsOf(name)} size="lg" tone="accent" />
          <div className="own-list__meta">
            <strong>{name}</strong>
            <span>{mobile || 'Mobile nahi diya'}</span>
            {email ? <span>{email}</span> : null}
            <span className="pa-muted">ID: {String(clientId || '').slice(0, 8)}</span>
          </div>
        </div>

        <div className="pa-row">
          <Link className="own-btn own-btn--ghost own-btn--sm" to={`/chat/${clientId}`}>
            <Icon name="message" size={15} />
            <span>Chat{chatCount ? ` (${chatCount})` : ''}</span>
          </Link>
        </div>
      </section>

      {loading ? (
        <div className="own-card pa-card pa-center"><Spinner label="Load ho raha hai" /></div>
      ) : rows.length === 0 ? (
        <EmptyState icon="grid" title="Koi complaint nahi" text="Is user ki koi complaint nahi mili." />
      ) : (
        rows.map((c) => {
          const files = Object.entries(c.files || {}).filter(([, f]) => f && (f.name || fileSrc(f)))
          const details = Object.entries(c.details || {}).filter(
            ([k]) => !['userName', 'user_name', 'password'].includes(k)
          )
          const kv = details.map(([k, v]) => ({ k: prettyLabel(k), v: String(v) }))
          if (c.hasPassword) kv.push({ k: 'Password', v: '•••••••• (secured)' })

          return (
            <article key={c.id} className="own-card pa-card">
              <div className="pa-card__head">
                <span className="pa-card__title">{c.title || `${c.type || 'Complain'} complaint`}</span>
                <div className="pa-badges">
                  <Badge tone="accent">{c.type || 'Complain'}</Badge>
                  <Badge tone={statusTone(c.status)}>{statusLabel(c.status)}</Badge>
                </div>
              </div>

              <p className="pa-muted">{formatDateTime(c.createdAt)}</p>

              <KeyValue rows={kv.length ? kv : [{ k: 'Details', v: '-' }]} />

              {files.length > 0 && (
                <div className="pa-stack">
                  <span className="pa-section__title">Attachments</span>
                  {files.map(([key, f]) => {
                    const src = fileSrc(f)
                    const label = prettyLabel(key)
                    return (
                      <div key={key} className="pa-file">
                        <span className="pa-file__icon"><Icon name="folder" size={15} /></span>
                        <span className="pa-file__meta">
                          <span className="pa-file__name">{label}</span>
                          <span className="pa-file__sub">
                            {f.name}{f.size ? ` • ${formatFileSize(f.size)}` : ''}
                          </span>
                        </span>
                        {src ? (
                          isImageFile(f) ? (
                            <Button size="sm" variant="ghost" icon="eye" onClick={() => setViewer({ src, name: f.name || label })}>
                              View
                            </Button>
                          ) : (
                            <a className="own-btn own-btn--ghost own-btn--sm" href={src} download={f.name} target="_blank" rel="noopener">
                              Open
                            </a>
                          )
                        ) : (
                          <span className="pa-muted">N/A</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="pa-stack">
                <span className="pa-section__title">Status</span>
                <div className="pa-chip-row">
                  {STATUS_OPTIONS.map((s) => (
                    <Chip
                      key={s}
                      label={statusLabel(s)}
                      selected={String(c.status || 'pending').toLowerCase() === s}
                      onClick={() => savingId !== c.id && changeStatus(c.id, s)}
                    />
                  ))}
                </div>
                {savingId === c.id ? <span className="pa-muted">Save ho raha hai…</span> : null}
              </div>
            </article>
          )
        })
      )}

      <FileViewer open={Boolean(viewer)} src={viewer?.src} name={viewer?.name} onClose={() => setViewer(null)} />
    </AppShell>
  )
}
