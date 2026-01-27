import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { Home, Map, Trophy, MapPin, BookOpen } from 'lucide-react'
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

export default function App() {
  const location = useLocation()
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

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

  // Hide nav on door page for cleaner UX
  const showNav = !location.pathname.startsWith('/door/')

  return (
    <div className="app">
      {isOffline && (
        <div className="offline-banner">
          📡 You're offline — data will sync when connected
        </div>
      )}
      
      <main className="main">
        <Routes>
          <Route path="/" element={<TodayPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/door/:id" element={<DoorPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/earnings" element={<EarningsPage />} />
          <Route path="/reference" element={<ReferencePage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/zones" element={<ZonesPage />} />
          <Route path="/log" element={<LogPage />} />
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
          <NavLink to="/reference" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <BookOpen />
            <span>Scripts</span>
          </NavLink>
        </nav>
      )}
    </div>
  )
}
