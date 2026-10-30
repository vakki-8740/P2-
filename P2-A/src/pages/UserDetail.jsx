import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import FileViewer from '../components/FileViewer.jsx'
import { Avatar, Empty, Field, prettyLabel, StatusPill, statusLabel } from '../components/ui.jsx'
import { IconChat, IconEye, IconFile, IconList } from '../components/Icons.jsx'
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
  const mobile = (rows[0] && rows[0].details && rows[0].details.mobile) || ''
  const email = (rows[0] && rows[0].details && rows[0].details.email) || ''
  const chatCount = messages.filter((m) => m.clientId === clientId).length

  const changeStatus = async (id, status) => {
    setSavingId(id)
    try {
      await updateComplaintStatus(id, status)
    } catch (err) {
      alert(err && err.message ? err.message : 'Status update fail')
    } finally {
      setSavingId('')
    }
  }

  return (
    <Layout title={name} subtitle={`${rows.length} complaint${rows.length === 1 ? '' : 's'}`} back>
      <div className="card user-card">
        <Avatar size={48} />
        <div className="user-card-text">
          <strong>{name}</strong>
          <span className="muted">{mobile || 'Mobile nahi diya'}</span>
          {email ? <span className="muted">{email}</span> : null}
        </div>
      </div>

      <div className="quick-actions">
        <Link className="btn ghost sm" to={`/chat/${clientId}`}>
          <IconChat width="16" height="16" />
          Chat {chatCount ? `(${chatCount})` : ''}
        </Link>
      </div>

      {loading ? (
        <div className="loading">Load ho raha hai…</div>
      ) : rows.length === 0 ? (
        <Empty title="Koi complaint nahi" text="Is user ki koi complaint nahi mili." icon={<IconList width="22" height="22" />} />
      ) : (
        rows.map((c) => {
          const files = Object.entries(c.files || {}).filter(([, f]) => f && (f.name || fileSrc(f)))
          const details = Object.entries(c.details || {}).filter(
            ([k]) => !['userName', 'user_name', 'password'].includes(k)
          )

          return (
            <article key={c.id} className="card complain-card">
              <div className="complain-card-head">
                <span className="type-chip">{c.type || 'Complain'}</span>
                <StatusPill status={c.status} />
              </div>

              <h3 className="complain-card-title">{c.title || `${c.type || 'Complain'} Complain`}</h3>
              <p className="muted small">{formatDateTime(c.createdAt)}</p>

              <div className="details">
                {details.length === 0 ? (
                  <Field label="Details" value="-" />
                ) : (
                  details.map(([label, value]) => (
                    <Field key={label} label={prettyLabel(label)} value={String(value)} />
                  ))
                )}
                {c.hasPassword ? <Field label="Password" value="•••••••• (secured)" /> : null}
              </div>

              {files.length > 0 && (
                <div className="files">
                  <span className="files-title">Attachments</span>
                  {files.map(([key, f]) => {
                    const src = fileSrc(f)
                    const label = prettyLabel(key)
                    return (
                      <div key={key} className="file-row">
                        <span className="file-icon"><IconFile width="16" height="16" /></span>
                        <span className="file-meta">
                          <span className="file-name">{label}</span>
                          <span className="file-sub">
                            {f.name}{f.size ? ` • ${formatFileSize(f.size)}` : ''}
                          </span>
                        </span>
                        {src ? (
                          isImageFile(f) ? (
                            <button
                              type="button"
                              className="btn ghost sm"
                              onClick={() => setViewer({ src, name: f.name || label })}
                            >
                              <IconEye width="15" height="15" />
                              View
                            </button>
                          ) : (
                            <a className="btn ghost sm" href={src} download={f.name} target="_blank" rel="noopener">
                              Open
                            </a>
                          )
                        ) : (
                          <span className="muted small">N/A</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="status-actions">
                <span className="muted small">Status:</span>
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`chip ${String(c.status || 'pending').toLowerCase() === s ? 'active' : ''}`}
                    disabled={savingId === c.id}
                    onClick={() => changeStatus(c.id, s)}
                  >
                    {statusLabel(s)}
                  </button>
                ))}
              </div>
            </article>
          )
        })
      )}

      <FileViewer
        open={Boolean(viewer)}
        src={viewer?.src}
        name={viewer?.name}
        onClose={() => setViewer(null)}
      />
    </Layout>
  )
}
