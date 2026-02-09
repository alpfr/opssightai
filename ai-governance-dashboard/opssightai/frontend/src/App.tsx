import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { healthApi, notificationApi } from './services/api'
import { HealthStatus } from './types'
import AssetList from './pages/AssetList.tsx'
import AssetDetail from './pages/AssetDetail.tsx'
import Dashboard from './pages/Dashboard.tsx'
import About from './pages/About.tsx'
import Executive from './pages/Executive.tsx'
import NotificationPanel from './components/NotificationPanel.tsx'
import './App.css'

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  
  // In production, this would come from authentication context
  const userId = '166c97fe-2cd9-4149-bc42-bee305c58037'

  useEffect(() => {
    healthApi.check()
      .then(res => {
        setHealth(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch health:', err)
        setLoading(false)
      })
    
    // Load unread notification count
    loadUnreadCount()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadUnreadCount = async () => {
    try {
      const response = await notificationApi.getAll({
        userId,
        unreadOnly: true,
        limit: 1
      })
      setUnreadCount(response.data.total || 0)
    } catch (error) {
      console.error('Failed to load unread count:', error)
    }
  }

  const handleNotificationPanelToggle = () => {
    setNotificationPanelOpen(!notificationPanelOpen)
    if (!notificationPanelOpen) {
      // Refresh unread count when opening panel
      loadUnreadCount()
    }
  }

  if (loading) {
    return (
      <div className="app loading">
        <div className="loading-spinner">Loading OpsSight AI...</div>
      </div>
    )
  }

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">
            <h1>OpsSight AI</h1>
            <span className="nav-subtitle">Operational Risk Intelligence</span>
          </div>
          <div className="nav-links">
            <Link to="/">Dashboard</Link>
            <Link to="/assets">Assets</Link>
            <Link to="/executive">Executive</Link>
            <Link to="/about">About</Link>
            <button className="notification-bell" onClick={handleNotificationPanelToggle}>
              🔔
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            <div className={`health-indicator ${health?.database === 'connected' ? 'healthy' : 'unhealthy'}`}>
              {health?.database === 'connected' ? '● Online' : '● Offline'}
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assets" element={<AssetList />} />
            <Route path="/assets/:id" element={<AssetDetail />} />
            <Route path="/executive" element={<Executive />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>

        <NotificationPanel
          isOpen={notificationPanelOpen}
          onClose={() => setNotificationPanelOpen(false)}
          userId={userId}
        />
      </div>
    </Router>
  )
}

export default App
