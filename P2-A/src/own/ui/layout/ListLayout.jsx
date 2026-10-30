import { Badge } from '../feedback/Alert.jsx'
import './ListLayout.css'

const ROWS = [
  { name: 'Aman Kumar', role: 'Product Designer', tone: 'success', status: 'Active', initials: 'AK' },
  { name: 'Priya Sharma', role: 'Frontend Engineer', tone: 'accent', status: 'Online', initials: 'PS' },
  { name: 'Rohit Verma', role: 'Data Analyst', tone: 'warning', status: 'Away', initials: 'RV' },
  { name: 'Neha Gupta', role: 'QA Engineer', tone: 'neutral', status: 'Offline', initials: 'NG' },
]

export default function ListLayout() {
  return (
    <ul className="own-list">
      {ROWS.map((r) => (
        <li key={r.name} className="own-list__row">
          <span className="own-list__avatar">{r.initials}</span>
          <div className="own-list__meta">
            <strong>{r.name}</strong>
            <span>{r.role}</span>
          </div>
          <Badge tone={r.tone} dot>{r.status}</Badge>
        </li>
      ))}
    </ul>
  )
}
