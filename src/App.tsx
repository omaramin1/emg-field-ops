import { Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom'
import { Home, Map, Trophy, MapPin, BookOpen, User } from 'lucide-react'
import { useEffect, useState } from 'react'

// Pages
import TodayPage from './pages/Today'
import MapPage from './pages/Map'
import LeaderboardPage from './pages/Leaderboard'
import EarningsPage from './pages/Earnings'
import ReferencePage from './pages/Reference'
import DoorPage from './pages/Door'
import AchievementsPage from './pages/Achievements'
import AnalyticsPage from './pages/Analytics'
import ZonesPage from './pages/Zones'
import LogPage from './pages/Log'
import { Login } from './pages/Login'
import { Profile } from './pages/Profile'

// Auth
import { useAuthStore } from './stores/authStore'

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentRep } = useAuthStore()
  if (!currentRep) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default function App() {
  const location = useLocation()
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const { currentRep } = useAuthStore()

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Hide nav on login, door page
  const showNav = currentRep && !location.pathname.startsWith('/door/') && location.pathname !== '/login'

  return (
    <div className="app">
      {isOffline && (
        <div className="offline-banner">
          📡 You're offline — data will sync when connected
        </div>
      )}
      
      <main className="main">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><TodayPage /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
          <Route path="/door/:id" element={<ProtectedRoute><DoorPage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path="/earnings" element={<ProtectedRoute><EarningsPage /></ProtectedRoute>} />
          <Route path="/reference" element={<ProtectedRoute><ReferencePage /></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/zones" element={<ProtectedRoute><ZonesPage /></ProtectedRoute>} />
          <Route path="/log" element={<ProtectedRoute><LogPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </main>

      {showNav && (
        <nav className="nav">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Home />
            <span>Today</span>
          </NavLink>
          <NavLink to="/map" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Map />
            <span>Map</span>
          </NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Trophy />
            <span>Rank</span>
          </NavLink>
          <NavLink to="/zones" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MapPin />
            <span>Zones</span>
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {currentRep?.profile_pic ? (
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: `url(${currentRep.profile_pic}) center/cover`
              }} />
            ) : (
              <User />
            )}
            <span>Me</span>
          </NavLink>
        </nav>
      )}
    </div>
  )
}
