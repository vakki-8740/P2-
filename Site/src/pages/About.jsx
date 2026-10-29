import Header from '../components/Header'

export default function About() {
  return (
    <>
      <Header showMenu />
      <main className="container">
        <div className="card panel">
          <h1 className="page-title">About Us</h1>
          <p className="page-sub">Your trusted support partner — available 24/7 to resolve your issues quickly and professionally.</p>

          <div className="tsec">
            <h2>Who We Are</h2>
            <p>Parimatch Support is a dedicated customer support portal built to give users a single, reliable place to report problems and get fast assistance. We understand how frustrating it can be when a deposit does not reflect, a withdrawal gets stuck, a bonus does not appear, or your account is temporarily locked. That is exactly why we exist — to listen, document, and push your complaint to the right team until it is resolved.</p>
            <p>Our support team consists of trained professionals who handle complaints with care, patience, and complete confidentiality. Every complaint submitted through our portal is treated with high priority, regardless of the issue size.</p>
          </div>

          <div className="tsec">
            <h2>Our Mission</h2>
            <p>Our mission is simple: to make support accessible, transparent, and stress-free for every user. We believe that every problem deserves a proper answer, and every user deserves to be heard without long queues or repeated follow-ups. We work around the clock so that help is always one click away.</p>
          </div>

          <div className="tsec">
            <h2>What We Help With</h2>
            <p>We provide assistance across all common account and payment issues, including:</p>
            <ul>
              <li><strong>Withdrawal Problems</strong> — stuck, delayed, or missing withdrawals</li>
              <li><strong>Deposit Problems</strong> — payments that did not reflect in the account</li>
              <li><strong>Bonus Problems</strong> — missing bonuses and wagering-related queries</li>
              <li><strong>Bank Statement Issues</strong> — statements and transaction record requests</li>
              <li><strong>Unlock Withdrawal</strong> — help with locked or restricted withdrawals</li>
              <li><strong>KYC Problems</strong> — document verification and account approval support</li>
              <li><strong>Live Chat</strong> — direct assistance for any other question</li>
            </ul>
          </div>

          <div className="tsec">
            <h2>How It Works</h2>
            <p>Getting help through our portal takes only a few steps:</p>
            <ul className="steps">
              <li><span className="step-num">1</span><span><strong>Select your problem</strong> from the Home page — Withdrawal, Deposit, Bonus, KYC, etc.</span></li>
              <li><span className="step-num">2</span><span><strong>Click “Complain Now”</strong> and fill in the required details accurately.</span></li>
              <li><span className="step-num">3</span><span><strong>Submit the complaint</strong> — you will receive a reference for tracking.</span></li>
              <li><span className="step-num">4</span><span><strong>Track your case</strong> on the “All Complains” page for updates and resolution.</span></li>
            </ul>
          </div>

          <div className="tsec">
            <h2>Our Commitment</h2>
            <p>We are committed to clear communication, quick follow-up, and complete transparency. Every complaint is documented properly, and we keep pushing until you receive a fair outcome. Your trust is our greatest responsibility, and we work every day to keep it.</p>
          </div>
        </div>
      </main>
            <footer>        <div className="footer-main">
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
