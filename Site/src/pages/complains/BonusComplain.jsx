import { Link } from 'react-router-dom'
import Header from '../../components/Header'

export default function BonusComplain() {
  return (
    <>
      <Header showMenu />
      <main className="container">
        <Link className="back-link" to="/">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Back to Home
        </Link>
        <div className="complain-head">
          <div className="complain-icon-wrap"><img src="/icons-options/bonus.svg" alt="" /></div>
          <div>
            <h1 className="page-title" style={{marginBottom: 4}}>Bonus Complain</h1>
            <p className="page-sub" style={{marginBottom: 0}}>Missing bonus or wagering-related query? Submit here.</p>
          </div>
        </div>
        <div className="card panel">
          <h2>Bonus Details</h2>
          <p className="panel-note">Placeholder forms — actual forms aap baad me batayenge tab update kar dunga.</p>
          <form onSubmit={(e)=>{e.preventDefault(); alert('Bonus complain submitted (placeholder)')}}>
            <div className="form-grid two">
              <div className="form-group">
                <label>Bonus Code / Name <span className="req">*</span></label>
                <input placeholder="e.g. WELCOME100" required />
              </div>
              <div className="form-group">
                <label>Bonus Type <span className="req">*</span></label>
                <select required defaultValue=""><option value="" disabled>Select type</option><option>Welcome Bonus</option><option>Deposit Bonus</option><option>Free Bet</option><option>Cashback</option></select>
              </div>
              <div className="form-group">
                <label>Deposit Reference (if any)</label>
                <input placeholder="e.g. TXN..." />
              </div>
              <div className="form-group">
                <label>Date Claimed</label>
                <input type="date" />
              </div>
            </div>
            <div className="form-group" style={{marginTop: 16}}>
              <label>Describe Bonus Issue <span className="req">*</span></label>
              <textarea placeholder="Explain bonus not received, wagering problem etc..." required />
            </div>
            <div className="form-note"><strong>Note:</strong> Bonus complain page — placeholder form.</div>
            <div className="form-actions" style={{marginTop: 18}}>
              <button className="btn primary" type="submit">Submit Bonus Complain</button>
              <Link className="btn secondary" to="/">Cancel</Link>
            </div>
          </form>
        </div>
      </main>
      <footer><p>&copy; 2026 Parimatch Support. All rights reserved.</p></footer>
    </>
  )
}
