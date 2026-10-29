import { Routes, Route, Navigate } from 'react-router-dom'
import { siteRoutes, RouteLoader } from '../Site/src/App'
import Landing from './pages/Landing'

/**
 * Combined local project: marketing Landing at "/" and the full Support
 * Center mounted under /site. The Site pages/components are imported from
 * ../Site/src (single source of truth) with VITE_BASE_PATH=/site.
 */
export default function App() {
  return (
    <>
      <RouteLoader />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        {siteRoutes()}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
