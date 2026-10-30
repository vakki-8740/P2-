import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { isLoggedIn } from './lib/auth.js'
import { isFirebaseReady } from './lib/firebase.js'
import { subscribeComplaints, subscribeMessages } from './lib/data.js'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import AllComplains from './pages/AllComplains.jsx'
import UserDetail from './pages/UserDetail.jsx'
import ChatManage from './pages/ChatManage.jsx'
import ChatThread from './pages/ChatThread.jsx'
import Activity from './pages/Activity.jsx'
import Setting from './pages/Setting.jsx'

/* ---------------- shared data (ek hi listener dono collections ke liye) --------------- */

const DataContext = createContext({ complaints: [], messages: [], loading: true, ready: false })
export const useData = () => useContext(DataContext)

function DataProvider({ children }) {
  const [complaints, setComplaints] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [ready] = useState(() => isFirebaseReady())

  useEffect(() => {
    if (!ready) { setLoading(false); return }
    const unsubC = subscribeComplaints((rows) => { setComplaints(rows); setLoading(false) })
    const unsubM = subscribeMessages((rows) => setMessages(rows))
    return () => { unsubC(); unsubM() }
  }, [ready])

  const value = useMemo(
    () => ({ complaints, messages, loading, ready }),
    [complaints, messages, loading, ready]
  )
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

/* ---------------- auth gate ---------------- */

function RequireAuth({ children }) {
  const location = useLocation()
  const [ok, setOk] = useState(() => isLoggedIn())

  useEffect(() => { setOk(isLoggedIn()) }, [location.pathname])

  if (!ok) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <DataProvider>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/all" element={<AllComplains />} />
                <Route path="/user/:clientId" element={<UserDetail />} />
                <Route path="/chat" element={<ChatManage />} />
                <Route path="/chat/:clientId" element={<ChatThread />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/setting" element={<Setting />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </DataProvider>
          </RequireAuth>
        }
      />
    </Routes>
  )
}
