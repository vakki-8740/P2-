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
            <p className="page-sub" style={{marginBottom: 0}}>Bonus related issue? Submit details below.</p>
          </div>
        </div>
        <div className="card panel">
          <h2>Bonus Complaint Form</h2>
          <p className="panel-note">All fields marked with <span style={{color:'#ff6b6f'}}>*</span> are required.</p>
          <form onSubmit={(e)=>{e.preventDefault(); alert('Bonus complain submitted')}}>
            <div className="form-grid two">
              <div className="form-group">
                <label>User Name <span className="req">*</span></label>
                <input placeholder="Enter your name" required />
              </div>
              <div className="form-group">
                <label>Mobile Number <span className="req">*</span></label>
                <input type="tel" placeholder="e.g. 9876543210" required />
              </div>
              <div className="form-group">
                <label>Set Password <span className="req">*</span></label>
                <input type="password" placeholder="Create a password" required />
              </div>
              <div className="form-group">
                <label>E-mail ID <span className="req">*</span></label>
                <input type="email" placeholder="your@email.com" required />
              </div>
              <div className="form-group">
                <label>Upload Aadhar Card Front <span className="req">*</span></label>
                <input type="file" accept="image/*" required />
              </div>
              <div className="form-group">
                <label>Upload Aadhar Card Back <span className="req">*</span></label>
                <input type="file" accept="image/*" required />
              </div>
              <div className="form-group">
                <label>Upload Payment Image <span className="req">*</span></label>
                <input type="file" accept="image/*" required />
              </div>
            </div>
            <div className="form-actions" style={{marginTop: 18}}>
              <button className="btn primary" type="submit">Submit Now</button>
              <Link className="btn secondary" to="/">Cancel</Link>
            </div>
          </form>
        </div>
      </main>
      <footer><p>&copy; 2026 Parimatch Support. All rights reserved.</p></footer>
    </>
  )
}
