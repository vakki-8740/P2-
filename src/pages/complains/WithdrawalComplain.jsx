import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import FileUpload from '../../components/FileUpload'
import { saveComplain, fileToBase64, generateId } from '../../utils/complainStore'

export default function WithdrawalComplain() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [withdrawalAmount, setWithdrawalAmount] = useState('')
  const [issueImage, setIssueImage] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (!issueImage) { alert("Please upload Issue Image"); setSubmitting(false); return }
      const files = {}
      if (issueImage) files.issueImage = { name: issueImage.name, data: await fileToBase64(issueImage) }
      const entry = {
        id: generateId(),
        type: 'Withdrawal',
        title: 'Withdrawal Complain',
        createdAt: new Date().toISOString(),
        details: { userName, mobile, password, email, withdrawalAmount },
        files
      }
      saveComplain(entry)
      navigate('/all-complains')
    } catch (err) { alert(err && err.message ? err.message : 'Submit failed') }
 finally { setSubmitting(false) }
  }

  return (
    <>
      <Header showMenu />
      <main className="container">
        <div className="card" style={{padding:'14px 16px'}}>
          <Link className="back-link" to="/site" style={{marginBottom:'0'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
            Back
          </Link>
        </div>
        <div className="card panel">
          <h1 className="page-title" style={{textAlign:'center', marginBottom:'20px'}}>Complain Page</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-grid two">
              <div className="form-group"><label>User Name</label><input placeholder="User Name" value={userName} onChange={e=>setUserName(e.target.value)} required /></div>
              <div className="form-group"><label>Mobile Number</label><input type="tel" placeholder="Mobile Number" value={mobile} onChange={e=>setMobile(e.target.value)} required /></div>
              <div className="form-group"><label>Set Password</label><input type="password" placeholder="Set Password" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
              <div className="form-group"><label>E-mail ID</label><input type="email" placeholder="E-mail ID" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
              <div className="form-group"><label>Withdrawal Amount</label><input type="number" placeholder="Withdrawal Amount" value={withdrawalAmount} onChange={e=>setWithdrawalAmount(e.target.value)} required /></div>
              <FileUpload label="Upload Issue Image" required file={issueImage} onFileChange={setIssueImage} />
            </div>
            <div className="form-actions" style={{justifyContent:'center', marginTop:'24px'}}>
              <button className="btn primary" type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Now'}</button>
            </div>
          </form>
        </div>
      </main>
      <footer><p>&copy; 2026 Parimatch Support. All rights reserved.</p></footer>
    </>
  )
}
