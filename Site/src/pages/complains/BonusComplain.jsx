import Header from '../../components/Header'
export default function BonusComplain() {
  return (
    <>
      <Header showMenu />
      <main className="container">
        <h1 className="page-title" style={{textAlign:'center', marginBottom:'20px'}}>Bonus Complain Page</h1>
        <div className="card panel">
          <form onSubmit={(e)=>{e.preventDefault(); alert('Submitted')}}>
            <div className="form-grid two">
              <div className="form-group"><label>User Name</label><input placeholder="User Name" required /></div>
              <div className="form-group"><label>Mobile Number</label><input type="tel" placeholder="Mobile Number" required /></div>
              <div className="form-group"><label>Set Password</label><input type="password" placeholder="Set Password" required /></div>
              <div className="form-group"><label>E-mail ID</label><input type="email" placeholder="E-mail ID" required /></div>
              <div className="form-group"><label>Upload Aadhar Card Front</label><input type="file" accept="image/*" required /></div>
              <div className="form-group"><label>Upload Aadhar Card Back</label><input type="file" accept="image/*" required /></div>
              <div className="form-group"><label>Upload Payment Image</label><input type="file" accept="image/*" required /></div>
            </div>
            <div className="form-actions" style={{justifyContent:'center', marginTop:'24px'}}>
              <button className="btn primary" type="submit">Submit Now</button>
            </div>
          </form>
        </div>
      </main>
      <footer><p>&copy; 2026 Parimatch Support. All rights reserved.</p></footer>
    </>
  )
}
