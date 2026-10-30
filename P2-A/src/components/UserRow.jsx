import { Link } from 'react-router-dom'
import { Avatar } from '../own/ui/data/Avatar.jsx'
import { Badge } from '../own/ui/feedback/Alert.jsx'
import { Icon } from '../own/ui/icons/Icons.jsx'
import { formatDateTime } from '../lib/data.js'
import { initialsOf } from './status.js'

/**
 * Compact user row: icon | naam + type + date/time | chevron
 * (OWN Library `.own-list` classes)
 */
export default function UserRow({ user, to, badge = 0 }) {
  return (
    <Link className="own-list__row pa-userrow" to={to}>
      <Avatar initials={initialsOf(user.name)} tone="accent" size="md" />

      <div className="own-list__meta">
        <strong>{user.name}</strong>
        <div className="pa-userrow__meta">
          <Badge tone="accent">{user.latestType || user.type || 'Complain'}</Badge>
          <span className="pa-userrow__time">{formatDateTime(user.lastAt || user.at)}</span>
          {badge > 1 ? <Badge tone="neutral">+{badge - 1}</Badge> : null}
        </div>
      </div>

      <Icon name="chevron-right" size={16} className="pa-userrow__chev" />
    </Link>
  )
}
