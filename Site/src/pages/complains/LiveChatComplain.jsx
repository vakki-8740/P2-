import { Link } from 'react-router-dom'
import Header from '../../components/Header'

export default function LiveChatComplain() {
  return (
    <>
      <Header showMenu />
      <main className="container">
        <Link className="back-link" to="/">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Back to Home
        </Link>
        <div className="complain-head">
          <div className="complain-icon-wrap"><img src="/icons-options/live-chat.svg" alt="" /></div>
          <div>
            <h1 className="page-title" style={{marginBottom: 4}}>Live Chat</h1>
            <p className="page-sub" style={{marginBottom: 0}}>Need instant help? Start live chat support.</p>
          </div>
        </div>
        <div className="card panel">
          <h2>Live Chat Request</h2>
          <p className="panel-note">Placeholder — aapke forms ke hisab se exact update hoga.</p>
          <form onSubmit={(e)=>{e.preventDefault(); alert('Live Chat request submitted (placeholder)')}}>
            <div className="form-grid two">
              <div className="form-group">
                <label>Your Name <span className="req">*</span></label>
                <input placeholder="e.g. Ankit" required />
              </div>
              <div className="form-group">
                <label>Email or User ID <span className="req">*</span></label>
                <input placeholder="your@email.com or USERID" required />
              </div>
              <div className="form-group">
                <label>Topic <span className="req">*</span></label>
                <select required defaultValue=""><option value="" disabled>Select topic</option><option>Account Issue</option><option>Payment Issue</option><option>Bonus</option><option>Other</option></select>
              </div>
              <div className="form-group">
                <label>Preferred Language</label>
                <select defaultValue=""><option>English</option><option>Hindi</option><option>Hinglish</option></select>
              </div>
            </div>
            <div className="form-group" style={{marginTop: 16}}>
              <label>Message <span className="req">*</span></label>
              <textarea placeholder="Type your message for support..." required />
            </div>
            <div className="form-note"><strong>Note:</strong> Live Chat page — placeholder. Real chat integration baad me add hoga.</div>
            <div className="form-actions" style={{marginTop: 18}}>
              <button className="btn primary" type="submit">Start Live Chat</button>
              <Link className="btn secondary" to="/">Cancel</Link>
            </div>
          </form>
        </div>
      </main>
      <footer><p>&copy; 2026 Parimatch Support. All rights reserved.</p></footer>
    </>
  )
}
