import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, getCredentials } from '../utils/adminAuth.js'

export default function Login(){
  const [user,setUser]=useState('')
  const [pass,setPass]=useState('')
  const [err,setErr]=useState('')
  const [show,setShow]=useState(false)
  const nav = useNavigate()
  const cred = getCredentials()

  const onSubmit = (e)=>{
    e.preventDefault()
    const r = login(user, pass)
    if(r.ok) nav('/')
    else setErr(r.error)
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-head">
          <img src="/logo/logo.png" alt="logo" />
          <h1>Admin Login</h1>
          <p>Parimatch Support — Admin Panel</p>
        </div>
        {err && <div className="error-box">{err}</div>}
        <form onSubmit={onSubmit}>
          <div className="form-group-admin">
            <label>Username</label>
            <input value={user} onChange={e=>{setUser(e.target.value); setErr('')}} placeholder="Enter username" required autoFocus />
          </div>
          <div className="form-group-admin">
            <label>Password</label>
            <div style={{position:'relative', display:'flex', alignItems:'center'}}>
              <input style={{flex:1}} type={show?'text':'password'} value={pass} onChange={e=>{setPass(e.target.value); setErr('')}} placeholder="Enter password" required />
              <button type="button" onClick={()=>setShow(!show)} style={{position:'absolute', right:10, background:'none', border:'none', cursor:'pointer', fontSize:13, color:'var(--admin-muted)', fontWeight:700}}>{show?'Hide':'Show'}</button>
            </div>
          </div>
          <button className="btn-admin primary full" type="submit">Login</button>
        </form>
        <div className="hint-box">
          <div style={{fontWeight:800, marginBottom:6, color:'var(--admin-text)'}}>Demo Credentials (shareable):</div>
          <div><b>Username:</b> {cred.username}</div>
          <div><b>Password:</b> {cred.password}</div>
          <div style={{marginTop:8, fontSize:'.72rem'}}>You can change these inside Settings → Change Password after login. Credentials are stored in browser localStorage (admin_credentials) and can be updated anytime.</div>
        </div>
        <div style={{textAlign:'center', marginTop:12, fontSize:'.72rem', color:'var(--admin-muted)'}}>© 2026 Parimatch Support • Secure Admin Access</div>
      </div>
    </div>
  )
}
