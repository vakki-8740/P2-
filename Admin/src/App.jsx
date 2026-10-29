import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Users from './pages/Users.jsx'
import UserDetail from './pages/UserDetail.jsx'
import Activity from './pages/Activity.jsx'
import ChatManage from './pages/ChatManage.jsx'
import ChatDetail from './pages/ChatDetail.jsx'
import Settings from './pages/Settings.jsx'
import AdminLayout from './components/AdminLayout.jsx'
import { isAuthenticated, getSession } from './utils/adminAuth.js'
import { seedDemoDataIfEmpty } from './utils/dataStore.js'

function Protected({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  return children
}

function PublicOnly({ children }) {
  if (isAuthenticated()) return <Navigate to="/" replace />
  return children
}

function ThemeInit() {
  const loc = useLocation()
  useEffect(() => {
    const t = localStorage.getItem('admin_theme') || 'dark'
    document.documentElement.setAttribute('data-theme', t)
    // keep body class for admin scope
    document.body.classList.add('admin-scope')
    // seed demo if empty for presentation
    seedDemoDataIfEmpty()
  }, [])
  // scroll to top on nav
  useEffect(() => { window.scrollTo(0,0) }, [loc.pathname])
  return null
}

export default function App() {
  return (
    <>
      <ThemeInit />
      <Routes>
        <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
        <Route path="/" element={<Protected><AdminLayout><Dashboard /></AdminLayout></Protected>} />
        <Route path="/users" element={<Protected><AdminLayout><Users /></AdminLayout></Protected>} />
        <Route path="/users/:userId" element={<Protected><AdminLayout><UserDetail /></AdminLayout></Protected>} />
        <Route path="/activity" element={<Protected><AdminLayout><Activity /></AdminLayout></Protected>} />
        <Route path="/chat" element={<Protected><AdminLayout><ChatManage /></AdminLayout></Protected>} />
        <Route path="/chat/:userId" element={<Protected><AdminLayout><ChatDetail /></AdminLayout></Protected>} />
        <Route path="/settings" element={<Protected><AdminLayout><Settings /></AdminLayout></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
