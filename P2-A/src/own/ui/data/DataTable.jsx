import { Badge } from '../feedback/Alert.jsx'
import './DataTable.css'

const ROWS = [
  { id: 1, name: 'Aman Kumar', email: 'aman@example.com', role: 'Admin', status: 'success', statusLabel: 'Active', amount: '₹12,400' },
  { id: 2, name: 'Priya Sharma', email: 'priya@example.com', role: 'Editor', status: 'accent', statusLabel: 'Online', amount: '₹8,990' },
  { id: 3, name: 'Rohit Verma', email: 'rohit@example.com', role: 'Viewer', status: 'warning', statusLabel: 'Away', amount: '₹4,120' },
  { id: 4, name: 'Neha Gupta', email: 'neha@example.com', role: 'Editor', status: 'neutral', statusLabel: 'Offline', amount: '₹2,560' },
]

export default function DataTable() {
  return (
    <div className="own-table-wrap">
      <table className="own-table">
        <thead>
          <tr>
            <th scope="col">Member</th>
            <th scope="col">Role</th>
            <th scope="col">Status</th>
            <th scope="col" className="own-table__num">Spend</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.id}>
              <td data-label="Member">
                <div className="own-table__member">
                  <span className="own-table__avatar">{r.name.split(' ').map((n) => n[0]).join('')}</span>
                  <div><strong>{r.name}</strong><span className="own-table__email">{r.email}</span></div>
                </div>
              </td>
              <td data-label="Role">{r.role}</td>
              <td data-label="Status"><Badge tone={r.status} dot>{r.statusLabel}</Badge></td>
              <td data-label="Spend" className="own-table__num">{r.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
