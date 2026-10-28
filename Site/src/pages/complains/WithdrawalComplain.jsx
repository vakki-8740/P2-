import { Link } from 'react-router-dom'
import Header from '../../components/Header'

export default function WithdrawalComplain() {
  return (
    <>
      <Header showMenu />
      <main className="container">
        <Link className="back-link" to="/">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Back to Home
        </Link>

        <div className="complain-head">
          <div className="complain-icon-wrap"><img src="/icons-options/withdrawal.svg" alt="" /></div>
          <div>
            <h1 className="page-title" style={{marginBottom: 4}}>Withdrawal Complain</h1>
            <p className="page-sub" style={{marginBottom: 0}}>Withdrawal stuck, delayed or missing? Report here.</p>
          </div>
        </div>

        <div className="card panel">
          <h2>Withdrawal Details</h2>
          <p className="panel-note">All fields marked with <span style={{color:'#ff6b6f'}}>*</span> required — placeholder forms, aapke bataye hisab se exact forms baad me add honge.</p>
          <form onSubmit={(e)=>{e.preventDefault(); alert('Withdrawal complain submitted (placeholder)')}}>
            <div className="form-grid two">
              <div className="form-group">
                <label>Withdrawal ID <span className="req">*</span></label>
                <input placeholder="e.g. WD-987654" required />
              </div>
              <div className="form-group">
                <label>Amount <span className="req">*</span></label>
                <input type="number" placeholder="e.g. 10000" required />
              </div>
              <div className="form-group">
                <label>Withdrawal Method <span className="req">*</span></label>
                <select required defaultValue=""><option value="" disabled>Select method</option><option>Bank Transfer</option><option>UPI</option><option>Paytm</option><option>Other</option></select>
              </div>
              <div className="form-group">
                <label>Requested Date <span className="req">*</span></label>
                <input type="datetime-local" required />
              </div>
            </div>
            <div className="form-group" style={{marginTop: 16}}>
              <label>Account / UPI Details (masked)</label>
              <input placeholder="e.g. ****1234 or user@upi" />
            </div>
            <div className="form-group" style={{marginTop: 16}}>
              <label>Describe Issue <span className="req">*</span></label>
              <textarea placeholder="Explain withdrawal problem — delayed, failed, pending..." required />
            </div>
            <div className="form-note"><strong>Note:</strong> Withdrawal complain page — placeholder, exact forms aap share karenge tab replace kar dunga.</div>
            <div className="form-actions" style={{marginTop: 18}}>
              <button className="btn primary" type="submit">Submit Withdrawal Complain</button>
              <Link className="btn secondary" to="/">Cancel</Link>
            </div>
          </form>
        </div>
      </main>
      <footer><p>&copy; 2026 Parimatch Support. All rights reserved.</p></footer>
    </>
  )
}
