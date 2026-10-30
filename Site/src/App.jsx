import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import SwapLoader from './components/SwapLoader'
import SupportHome from './pages/SupportHome'
import About from './pages/About'
import Terms from './pages/Terms'
import AllComplains from './pages/AllComplains'
import WithdrawalComplain from './pages/complains/WithdrawalComplain'
import BonusComplain from './pages/complains/BonusComplain'
import DepositComplain from './pages/complains/DepositComplain'
import BankStatementComplain from './pages/complains/BankStatementComplain'
import UnlockWithdrawalComplain from './pages/complains/UnlockWithdrawalComplain'
import KycComplain from './pages/complains/KycComplain'
import ChatPage from './pages/chat-page/ChatPage'
import { withBase } from './utils/base'

export function RouteLoader() {
  const location = useLocation()
  const [initial, setInitial] = useState(true)
  const [routeLoading, setRouteLoading] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setInitial(false), 1200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (initial) return
    setRouteLoading(true)
    const t = setTimeout(() => setRouteLoading(false), 650)
    return () => clearTimeout(t)
  }, [location.pathname])

  if (initial) return <SwapLoader fullScreen />
  if (routeLoading) return <SwapLoader fullScreen />
  return null
}

const legacyRedirects = [
  ['/index.html', '/'],
  ['/about.html', '/about'],
  ['/terms.html', '/terms'],
  ['/all-complains.html', '/all-complains'],
  ['/deposit-complain.html', '/deposit-complain'],
  ['/withdrawal-complain.html', '/withdrawal-complain'],
  ['/bonus-complain.html', '/bonus-complain'],
  ['/bank-statement-complain.html', '/bank-statement-complain'],
  ['/unlock-withdrawal-complain.html', '/unlock-withdrawal-complain'],
  ['/kyc-complain.html', '/kyc-complain'],
  ['/live-chat.html', '/live-chat'],
]

/**
 * All support-center routes (an array, so it can be spread inside <Routes>).
 * Paths are prefixed with BASE_PATH so the same code powers both the Site
 * deployment (root) and the combined root project (/site).
 */
export function siteRoutes() {
  return [
    <Route key="home" path={withBase('/')} element={<SupportHome />} />,
    <Route key="about" path={withBase('/about')} element={<About />} />,
    <Route key="terms" path={withBase('/terms')} element={<Terms />} />,
    <Route key="all-complains" path={withBase('/all-complains')} element={<AllComplains />} />,

    // Complain pages — one page per problem
    <Route key="deposit" path={withBase('/deposit-complain')} element={<DepositComplain />} />,
    <Route key="withdrawal" path={withBase('/withdrawal-complain')} element={<WithdrawalComplain />} />,
    <Route key="bonus" path={withBase('/bonus-complain')} element={<BonusComplain />} />,
    <Route key="bank-statement" path={withBase('/bank-statement-complain')} element={<BankStatementComplain />} />,
    <Route key="unlock" path={withBase('/unlock-withdrawal-complain')} element={<UnlockWithdrawalComplain />} />,
    <Route key="kyc" path={withBase('/kyc-complain')} element={<KycComplain />} />,
    <Route key="live-chat" path={withBase('/live-chat')} element={<ChatPage />} />,

    // legacy .html links kept alive for old shared URLs
    ...legacyRedirects.map(([from, to]) => (
      <Route key={from} path={withBase(from)} element={<Navigate to={withBase(to)} replace />} />
    )),
  ]
}

export default function App() {
  return (
    <>
      <RouteLoader />
      <Routes>
        {siteRoutes()}
        <Route path="*" element={<Navigate to={withBase('/')} replace />} />
      </Routes>
    </>
  )
}
