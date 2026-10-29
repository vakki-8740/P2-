import { Link } from 'react-router-dom'
import Header from '../components/Header'

const problems = [
  { title: 'Deposit Problem', icon: '/site/icons-options/deposit.svg', to: '/site/deposit-complain' },
  { title: 'Withdrawal Problem', icon: '/site/icons-options/withdrawal.svg', to: '/site/withdrawal-complain' },
  { title: 'KYC Problem', icon: '/site/icons-options/kyc.svg', to: '/site/kyc-complain' },
  { title: 'Unlock Withdrawal', icon: '/site/icons-options/unlock-withdrawal.svg', to: '/site/unlock-withdrawal-complain' },
  { title: 'Bonus Problem', icon: '/site/icons-options/bonus.svg', to: '/site/bonus-complain' },
  { title: 'Bank Statement Problem', icon: '/site/icons-options/bank-statement.svg', to: '/site/bank-statement-complain' },
  { title: 'Live Chat', icon: '/site/icons-options/live-chat.svg', to: '/site/live-chat' },
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

            <footer>        <div className="footer-main">
          <p>&copy; 2026 Parimatch Support. All rights reserved.</p>
          <nav className="footer-nav">
            <Link to="/site/about">About</Link>
            <span className="sep">·</span>
            <Link to="/site/terms">Terms</Link>
            <span className="sep">·</span>
            <Link to="/site/all-complains">My Complains</Link>
          </nav>
        </div>
      </footer>
    </>
  )
}
