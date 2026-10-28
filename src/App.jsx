import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import SupportHome from './pages/SupportHome'
import About from './pages/About'
import Terms from './pages/Terms'
import AllComplains from './pages/AllComplains'
import DepositComplain from './pages/complains/DepositComplain'
import WithdrawalComplain from './pages/complains/WithdrawalComplain'
import BonusComplain from './pages/complains/BonusComplain'
import BankStatementComplain from './pages/complains/BankStatementComplain'
import UnlockWithdrawalComplain from './pages/complains/UnlockWithdrawalComplain'
import KycComplain from './pages/complains/KycComplain'
import LiveChatComplain from './pages/complains/LiveChatComplain'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/site" element={<SupportHome />} />
      <Route path="/site/index.html" element={<Navigate to="/site" replace />} />
      <Route path="/site/about.html" element={<Navigate to="/site/about" replace />} />
      <Route path="/site/terms.html" element={<Navigate to="/site/terms" replace />} />
      <Route path="/site/all-complains.html" element={<Navigate to="/site/all-complains" replace />} />
      <Route path="/site/about" element={<About />} />
      <Route path="/site/terms" element={<Terms />} />
      <Route path="/site/all-complains" element={<AllComplains />} />
      <Route path="/site/deposit-complain" element={<DepositComplain />} />
      <Route path="/site/withdrawal-complain" element={<WithdrawalComplain />} />
      <Route path="/site/bonus-complain" element={<BonusComplain />} />
      <Route path="/site/bank-statement-complain" element={<BankStatementComplain />} />
      <Route path="/site/unlock-withdrawal-complain" element={<UnlockWithdrawalComplain />} />
      <Route path="/site/kyc-complain" element={<KycComplain />} />
      <Route path="/site/live-chat" element={<LiveChatComplain />} />
      <Route path="/site/deposit-complain.html" element={<Navigate to="/site/deposit-complain" replace />} />
      <Route path="/site/withdrawal-complain.html" element={<Navigate to="/site/withdrawal-complain" replace />} />
      <Route path="/site/bonus-complain.html" element={<Navigate to="/site/bonus-complain" replace />} />
      <Route path="/site/bank-statement-complain.html" element={<Navigate to="/site/bank-statement-complain" replace />} />
      <Route path="/site/unlock-withdrawal-complain.html" element={<Navigate to="/site/unlock-withdrawal-complain" replace />} />
      <Route path="/site/kyc-complain.html" element={<Navigate to="/site/kyc-complain" replace />} />
      <Route path="/site/live-chat.html" element={<Navigate to="/site/live-chat" replace />} />
      {/* legacy direct paths */}
      <Route path="/index.html" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
