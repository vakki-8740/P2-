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
            <Link className="btn primary" to={p.to}>Complain Now</Link>
          </div>
        ))}
      </main>

      <footer>
        <p>&copy; 2026 Parimatch Support. All rights reserved.</p>
      </footer>
    </>
  )
}
