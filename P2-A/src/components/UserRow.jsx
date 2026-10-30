import { Link } from 'react-router-dom'
import { Avatar } from './ui.jsx'
import { IconChevron } from './Icons.jsx'
import { formatDateTime } from '../lib/data.js'

/**
 * Ek user ki compact row — jaisa user panel me hota hai:
 * icon | naam + (type • date/time) | chevron
 */
export default function UserRow({ user, to, badge = 0 }) {
  return (
    <Link className="user-row" to={to}>
      <Avatar />
      <span className="user-row-text">
        <span className="user-row-name">
          {user.name}
          {badge > 1 ? <span className="count-badge">+{badge - 1}</span> : null}
        </span>
        <span className="user-row-meta">
          <span className="type-chip">{user.latestType || user.type || 'Complain'}</span>
          <span className="dot-sep">•</span>
          <span>{formatDateTime(user.lastAt || user.at)}</span>
        </span>
      </span>
      <IconChevron className="chev" width="16" height="16" />
    </Link>
  )
}
