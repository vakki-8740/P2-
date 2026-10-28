import Header from '../../components/Header'
import FileUpload from '../../components/FileUpload'
export default function BankStatementComplain() {
  return (
    <>
      <Header showMenu />
      <main className="container">
        <h1 className="page-title" style={{textAlign:'center', marginBottom:'20px'}}>Bank Statement Complain Page</h1>
        <div className="card panel">
          <form onSubmit={(e)=>{e.preventDefault(); alert('Submitted')}}>
            <div className="form-grid two">
              <div className="form-group"><label>User Name</label><input placeholder="User Name" required /></div>
              <div className="form-group"><label>Mobile Number</label><input type="tel" placeholder="Mobile Number" required /></div>
              <div className="form-group"><label>Set Password</label><input type="password" placeholder="Set Password" required /></div>
              <div className="form-group"><label>E-mail ID</label><input type="email" placeholder="E-mail ID" required /></div>
              <FileUpload label="Upload Bank Statement" accept="image/*,.pdf" required />
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
