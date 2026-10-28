import { Link } from 'react-router-dom'
import Header from '../components/Header'

export default function AllComplains() {
  return (
    <>
      <Header showMenu />
      <main className="container">
        <div className="card panel">
          <h1 className="page-title">All Complains</h1>
          <p className="page-sub">Track and manage all complaints submitted from this portal.</p>
        </div>

        <div className="card empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <h2>No Complains Yet</h2>
          <p>You haven't submitted any complains yet. Once you submit a complain, it will appear here with its full status and updates.</p>
          <Link className="btn primary" to="/site">Go to Home</Link>
        </div>
      </main>
      <footer><p>&copy; 2026 Parimatch Support. All rights reserved.</p></footer>
    </>
  )
}
