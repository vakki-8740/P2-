import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import SwapLoader from './components/SwapLoader'
import Landing from './pages/Landing'


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
      <Route path="/" element={<Landing />} />
      <Route path="/index.html" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
