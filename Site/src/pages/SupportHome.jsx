import { Link } from 'react-router-dom'
import Header from '../components/Header'

const problems = [
  { title: 'Withdrawal Problem', icon: '/icons-options/withdrawal.svg', to: '/withdrawal-complain' },
  { title: 'Bonus Problem', icon: '/icons-options/bonus.svg', to: '/bonus-complain' },
  { title: 'Deposit Problem', icon: '/icons-options/deposit.svg', to: '/deposit-complain' },
  { title: 'Bank Statement Problem', icon: '/icons-options/bank-statement.svg', to: '/bank-statement-complain' },
  { title: 'Unlock Withdrawal', icon: '/icons-options/unlock-withdrawal.svg', to: '/unlock-withdrawal-complain' },
  { title: 'Live Chat', icon: '/icons-options/live-chat.svg', to: '/live-chat' },
  { title: 'KYC Problem', icon: '/icons-options/kyc.svg', to: '/kyc-complain' },
]

export default function SupportHome() {
  return (
    <>
      <Header showMenu />
      <main className="container site">
        <div className="card banner-wrapper">
          <img src="/banner/file_00000000c5c08211a860dc7a22339a1f.png" alt="Parimatch Support banner" />
        </div>

        <div className="problem-heading">Select Your Problem</div>

        {problems.map((p) => (
          <div key={p.title} className="card problem-card">
            <img className="problem-icon" src={p.icon} alt={p.title} />
            <div className="problem-title">{p.title}</div>
            <Link className="btn primary" to={p.to}>{p.title === "Live Chat" ? "Live Chat" : "Complain Now"}</Link>
          </div>
        ))}
      </main>

            <footer>
        <div className="footer-prof">
          <span className="fp-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
            Secure & Encrypted
          </span>
          <span className="fp-dot">·</span>
          <span className="fp-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            24/7 Support
          </span>
          <span className="fp-dot">·</span>
          <span className="fp-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Verified Help Center
          </span>
        </div>
        <div className="footer-main">
          <p>&copy; 2026 Parimatch Support. All rights reserved.</p>
          <nav className="footer-nav">
            <Link to="/about">About</Link>
            <span className="sep">·</span>
            <Link to="/terms">Terms</Link>
            <span className="sep">·</span>
            <Link to="/all-complains">My Complains</Link>
          </nav>
        </div>
      </footer>
    </>
  )
}
