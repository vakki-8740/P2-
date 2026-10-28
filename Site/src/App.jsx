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
import LiveChatComplain from './pages/complains/LiveChatComplain'
import KycComplain from './pages/complains/KycComplain'


function RouteLoader() {
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

export default function App() {
  return (
    <>
      <RouteLoader />
      <Routes>
      <Route path="/" element={<SupportHome />} />
      <Route path="/index.html" element={<Navigate to="/" replace />} />
      <Route path="/about" element={<About />} />
      <Route path="/about.html" element={<Navigate to="/about" replace />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/terms.html" element={<Navigate to="/terms" replace />} />
      <Route path="/all-complains" element={<AllComplains />} />
      <Route path="/all-complains.html" element={<Navigate to="/all-complains" replace />} />

      {/* Complain pages — each problem ke liye alag file */}
      <Route path="/withdrawal-complain" element={<WithdrawalComplain />} />
      <Route path="/bonus-complain" element={<BonusComplain />} />
      <Route path="/deposit-complain" element={<DepositComplain />} />
      <Route path="/bank-statement-complain" element={<BankStatementComplain />} />
      <Route path="/unlock-withdrawal-complain" element={<UnlockWithdrawalComplain />} />
      <Route path="/kyc-complain" element={<KycComplain />} />
      <Route path="/live-chat" element={<LiveChatComplain />} />

      {/* legacy .html redirects for complain pages */}
      <Route path="/deposit-complain.html" element={<Navigate to="/deposit-complain" replace />} />
      <Route path="/withdrawal-complain.html" element={<Navigate to="/withdrawal-complain" replace />} />
      <Route path="/bonus-complain.html" element={<Navigate to="/bonus-complain" replace />} />
      <Route path="/bank-statement-complain.html" element={<Navigate to="/bank-statement-complain" replace />} />
      <Route path="/unlock-withdrawal-complain.html" element={<Navigate to="/unlock-withdrawal-complain" replace />} />
      <Route path="/kyc-complain.html" element={<Navigate to="/kyc-complain" replace />} />
      <Route path="/live-chat.html" element={<Navigate to="/live-chat" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
