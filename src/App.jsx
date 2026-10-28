import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import SupportHome from './pages/SupportHome'
import About from './pages/About'
import Terms from './pages/Terms'
import AllComplains from './pages/AllComplains'

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
      {/* legacy direct paths */}
      <Route path="/index.html" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
