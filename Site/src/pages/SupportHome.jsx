import Header from '../components/Header'

const problems = [
  { title: 'Withdrawal Problem', icon: '/icons-options/withdrawal.svg' },
  { title: 'Bonus Problem', icon: '/icons-options/bonus.svg' },
  { title: 'Deposit Problem', icon: '/icons-options/deposit.svg' },
  { title: 'Bank Statement Problem', icon: '/icons-options/bank-statement.svg' },
  { title: 'Unlock Withdrawal', icon: '/icons-options/unlock-withdrawal.svg' },
  { title: 'Live Chat', icon: '/icons-options/live-chat.svg' },
  { title: 'KYC Problem', icon: '/icons-options/kyc.svg' },
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
            <a className="btn primary" href="#">Complain Now</a>
          </div>
        ))}
      </main>

      <footer>
        <p>&copy; 2026 Parimatch Support. All rights reserved.</p>
      </footer>
    </>
  )
}
