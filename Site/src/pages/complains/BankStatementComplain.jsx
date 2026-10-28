import { Link } from 'react-router-dom'
import Header from '../../components/Header'

export default function BankStatementComplain() {
  return (
    <>
      <Header showMenu />
      <main className="container">
        <Link className="back-link" to="/">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Back to Home
        </Link>
        <div className="complain-head">
          <div className="complain-icon-wrap"><img src="/icons-options/bank-statement.svg" alt="" /></div>
          <div>
            <h1 className="page-title" style={{marginBottom: 4}}>Bank Statement Complain</h1>
            <p className="page-sub" style={{marginBottom: 0}}>Statement or transaction record issue? Report here.</p>
          </div>
        </div>
        <div className="card panel">
          <h2>Bank Statement Details</h2>
          <p className="panel-note">Placeholder forms — exact fields aap baad me share karenge.</p>
          <form onSubmit={(e)=>{e.preventDefault(); alert('Bank Statement complain submitted (placeholder)')}}>
            <div className="form-grid two">
              <div className="form-group">
                <label>Statement Period <span className="req">*</span></label>
                <select required defaultValue=""><option value="" disabled>Select period</option><option>Last 7 days</option><option>Last 30 days</option><option>Last 3 months</option><option>Custom Range</option></select>
              </div>
              <div className="form-group">
                <label>Bank Name <span className="req">*</span></label>
                <input placeholder="e.g. HDFC, SBI" required />
              </div>
              <div className="form-group">
                <label>Account Last 4 Digits</label>
                <input placeholder="e.g. 1234" maxLength={4} />
              </div>
              <div className="form-group">
                <label>Email for Statement <span className="req">*</span></label>
                <input type="email" placeholder="your@email.com" required />
              </div>
            </div>
            <div className="form-group" style={{marginTop: 16}}>
              <label>Reason / Issue <span className="req">*</span></label>
              <textarea placeholder="Describe bank statement problem..." required />
            </div>
            <div className="form-note"><strong>Note:</strong> Bank Statement complain page — placeholder.</div>
            <div className="form-actions" style={{marginTop: 18}}>
              <button className="btn primary" type="submit">Submit Bank Statement Request</button>
              <Link className="btn secondary" to="/">Cancel</Link>
            </div>
          </form>
        </div>
      </main>
      <footer><p>&copy; 2026 Parimatch Support. All rights reserved.</p></footer>
    </>
  )
}
