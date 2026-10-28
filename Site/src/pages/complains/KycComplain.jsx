import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import FileUpload from '../../components/FileUpload'
import { saveComplain, fileToBase64 } from '../../utils/complainStore'

export default function KycComplain() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [aadharFront, setAadharFront] = useState(null)
  const [aadharBack, setAadharBack] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const files = {}
      if (aadharFront) files.aadharFront = { name: aadharFront.name, data: await fileToBase64(aadharFront) }
      if (aadharBack) files.aadharBack = { name: aadharBack.name, data: await fileToBase64(aadharBack) }
      const entry = {
        id: Date.now().toString(),
        type: 'KYC',
        title: 'KYC Complain',
        createdAt: new Date().toISOString(),
        details: { userName, mobile, password, email },
        files
      }
      saveComplain(entry)
      navigate('/all-complains')
    } finally { setSubmitting(false) }
  }

  return (
    <>
      <Header showMenu />
      <main className="container">
        <div className="card" style={{padding:'14px 16px'}}>
          <Link className="back-link" to="/" style={{marginBottom:'0'}}>
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
              <FileUpload label="Upload Aadhar / Pan Card Front" required file={aadharFront} onFileChange={setAadharFront} />
              <FileUpload label="Upload Aadhar / Pan Card Back" required file={aadharBack} onFileChange={setAadharBack} />
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
