import { Link } from 'react-router-dom'
import Header from '../../components/Header'

export default function UnlockWithdrawalComplain() {
  return (
    <>
      <Header showMenu />
      <main className="container">
        <Link className="back-link" to="/">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Back to Home
        </Link>
        <div className="complain-head">
          <div className="complain-icon-wrap"><img src="/icons-options/unlock-withdrawal.svg" alt="" /></div>
          <div>
            <h1 className="page-title" style={{marginBottom: 4}}>Unlock Withdrawal</h1>
            <p className="page-sub" style={{marginBottom: 0}}>Withdrawal locked or restricted? Request unlock here.</p>
          </div>
        </div>
        <div className="card panel">
          <h2>Unlock Request</h2>
          <p className="panel-note">Placeholder — actual forms baad me aapke hisab se add honge.</p>
          <form onSubmit={(e)=>{e.preventDefault(); alert('Unlock Withdrawal submitted (placeholder)')}}>
            <div className="form-grid two">
              <div className="form-group">
                <label>User ID <span className="req">*</span></label>
                <input placeholder="e.g. USER123" required />
              </div>
              <div className="form-group">
                <label>Withdrawal ID (if any)</label>
                <input placeholder="e.g. WD-..." />
              </div>
              <div className="form-group">
                <label>Lock Reason Shown</label>
                <select defaultValue=""><option value="">Select reason</option><option>KYC pending</option><option>Bonus wagering</option><option>Suspicious activity</option><option>Bank verification</option><option>Other</option></select>
              </div>
              <div className="form-group">
                <label>Contact Email <span className="req">*</span></label>
                <input type="email" placeholder="your@email.com" required />
              </div>
            </div>
            <div className="form-group" style={{marginTop: 16}}>
              <label>Explain Lock Issue <span className="req">*</span></label>
              <textarea placeholder="Describe why withdrawal is locked..." required />
            </div>
            <div className="form-note"><strong>Note:</strong> Unlock Withdrawal page — placeholder form.</div>
            <div className="form-actions" style={{marginTop: 18}}>
              <button className="btn primary" type="submit">Submit Unlock Request</button>
              <Link className="btn secondary" to="/">Cancel</Link>
            </div>
          </form>
        </div>
      </main>
      <footer><p>&copy; 2026 Parimatch Support. All rights reserved.</p></footer>
    </>
  )
}
