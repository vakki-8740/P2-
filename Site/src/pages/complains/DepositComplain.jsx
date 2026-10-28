import { Link } from 'react-router-dom'
import Header from '../../components/Header'

export default function DepositComplain() {
  return (
    <>
      <Header showMenu />
      <main className="container">
        <Link className="back-link" to="/">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Back to Home
        </Link>

        <div className="complain-head">
          <div className="complain-icon-wrap"><img src="/icons-options/deposit.svg" alt="" /></div>
          <div>
            <h1 className="page-title" style={{marginBottom: 4}}>Deposit Complain</h1>
            <p className="page-sub" style={{marginBottom: 0}}>Payment not reflected? Submit your deposit details for fast verification.</p>
          </div>
        </div>

        <div className="card panel">
          <h2>Deposit Details</h2>
          <p className="panel-note">All fields marked with <span style={{color:'#ff6b6f'}}>*</span> are required. Yahan aap jo forms batayenge wahi add honge — abhi placeholder forms hai.</p>

          <form onSubmit={(e)=>{e.preventDefault(); alert('Deposit complain submitted (placeholder)')}}>
            <div className="form-grid two">
              <div className="form-group">
                <label>Transaction ID <span className="req">*</span></label>
                <input placeholder="e.g. TXN123456789" required />
              </div>
              <div className="form-group">
                <label>Amount <span className="req">*</span></label>
                <input type="number" placeholder="e.g. 5000" required />
              </div>
              <div className="form-group">
                <label>Payment Method <span className="req">*</span></label>
                <select required defaultValue=""><option value="" disabled>Select method</option><option>UPI</option><option>Net Banking</option><option>Card</option><option>Wallet</option><option>Other</option></select>
              </div>
              <div className="form-group">
                <label>Date & Time <span className="req">*</span></label>
                <input type="datetime-local" required />
              </div>
            </div>

            <div className="form-group" style={{marginTop: 16}}>
              <label>Screenshot / Receipt URL</label>
              <input placeholder="https://... or upload later" />
              <span className="form-hint">Payment proof helps us resolve faster</span>
            </div>

            <div className="form-group" style={{marginTop: 16}}>
              <label>Describe Your Issue <span className="req">*</span></label>
              <textarea placeholder="Explain what happened with your deposit..." required />
            </div>

            <div className="form-note">
              <strong>Note:</strong> Deposit complain page — isme aap jo forms chahenge wo baad me exact add kar dunga. Abhi placeholder form hai.
            </div>

            <div className="form-actions" style={{marginTop: 18}}>
              <button className="btn primary" type="submit">Submit Deposit Complain</button>
              <Link className="btn secondary" to="/">Cancel</Link>
            </div>
          </form>
        </div>
      </main>
      <footer><p>&copy; 2026 Parimatch Support. All rights reserved.</p></footer>
    </>
  )
}
