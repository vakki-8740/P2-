import Header from '../components/Header'
import IntroOverlay from '../components/IntroOverlay'

export default function Landing() {
  return (
    <>
      <IntroOverlay />
      <Header />
      <main className="container landing">
        <div className="card banner-wrapper">
          <img
            id="bannerImg"
            src="/banner/file_00000000c5c08211a860dc7a22339a1f.png"
            alt="Parimatch Support banner"
            onError={(e) => {
              e.target.hidden = true
              const fb = document.getElementById('bannerFallback')
              if (fb) fb.hidden = false
            }}
          />
          <div className="banner-fallback" id="bannerFallback" hidden>
            Banner image yahan add karein (banner/banner.jpg)
          </div>
        </div>

        <section className="panel content">
          <h1>Were Here to Help You</h1>

          <ul className="feature-list">
            <li>
              <span className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </span>
              <span>24/7 dedicated support team always available</span>
            </li>
            <li>
              <span className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </span>
              <span>Quick help with account &amp; payment issues</span>
            </li>
            <li>
              <span className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <span>Answers to any question anytime anywhere</span>
            </li>
            <li>
              <span className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </span>
              <span>Fast response were just a click away</span>
            </li>
          </ul>

          <div className="actions">
            <a className="btn primary" href="https://parimatch-senter-center.vercel.app" target="_blank" rel="noopener">
              Support Center
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
              </svg>
            </a>
          </div>
        </section>
      </main>

      <footer>
        <p>&copy; 2026 Parimatch Support. All rights reserved.</p>
      </footer>
    </>
  )
}
