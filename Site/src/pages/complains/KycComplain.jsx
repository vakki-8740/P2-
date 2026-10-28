import { Link } from 'react-router-dom'
import Header from '../../components/Header'

export default function KycComplain() {
  return (
    <>
      <Header showMenu />
      <main className="container">
        <Link className="back-link" to="/">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Back to Home
        </Link>
        <div className="complain-head">
          <div className="complain-icon-wrap"><img src="/icons-options/kyc.svg" alt="" /></div>
          <div>
            <h1 className="page-title" style={{marginBottom: 4}}>KYC Complain</h1>
            <p className="page-sub" style={{marginBottom: 0}}>Document verification or KYC approval issue? Report here.</p>
          </div>
        </div>
        <div className="card panel">
          <h2>KYC Details</h2>
          <p className="panel-note">Placeholder forms — exact fields aap baad me batayenge.</p>
          <form onSubmit={(e)=>{e.preventDefault(); alert('KYC complain submitted (placeholder)')}}>
            <div className="form-grid two">
              <div className="form-group">
                <label>KYC Status <span className="req">*</span></label>
                <select required defaultValue=""><option value="" disabled>Select status</option><option>Pending</option><option>Rejected</option><option>Under Review</option><option>Documents Requested</option></select>
              </div>
              <div className="form-group">
                <label>Document Type <span className="req">*</span></label>
                <select required defaultValue=""><option value="" disabled>Select document</option><option>Aadhaar</option><option>PAN</option><option>Passport</option><option>Driving Licence</option><option>Other</option></select>
              </div>
              <div className="form-group">
                <label>Full Name (as per doc) <span className="req">*</span></label>
                <input placeholder="e.g. Rahul Sharma" required />
              </div>
              <div className="form-group">
                <label>Mobile Number <span className="req">*</span></label>
                <input placeholder="e.g. 9876543210" required />
              </div>
            </div>
            <div className="form-group" style={{marginTop: 16}}>
              <label>Describe KYC Issue <span className="req">*</span></label>
              <textarea placeholder="Explain KYC rejection or delay..." required />
            </div>
            <div className="form-note"><strong>Note:</strong> KYC complain page — placeholder.</div>
            <div className="form-actions" style={{marginTop: 18}}>
              <button className="btn primary" type="submit">Submit KYC Complain</button>
              <Link className="btn secondary" to="/">Cancel</Link>
            </div>
          </form>
        </div>
      </main>
      <footer><p>&copy; 2026 Parimatch Support. All rights reserved.</p></footer>
    </>
  )
}
