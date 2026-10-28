import { Routes, Route, Navigate } from 'react-router-dom'
import SupportHome from './pages/SupportHome'
import About from './pages/About'
import Terms from './pages/Terms'
import AllComplains from './pages/AllComplains'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SupportHome />} />
      <Route path="/index.html" element={<Navigate to="/" replace />} />
      <Route path="/about" element={<About />} />
      <Route path="/about.html" element={<Navigate to="/about" replace />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/terms.html" element={<Navigate to="/terms" replace />} />
      <Route path="/all-complains" element={<AllComplains />} />
      <Route path="/all-complains.html" element={<Navigate to="/all-complains" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
