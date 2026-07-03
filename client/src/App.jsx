import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import StatsCards from './components/StatsCards'
import ThreatGauge from './components/ThreatGauge'
import AttackDistribution from './components/AttackDistribution'
import AttackLog from './components/AttackLog'
import BlacklistManager from './components/BlacklistManager'

const API_BASE = '/api/dashboard'

function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [attacks, setAttacks] = useState([])
  const [distribution, setDistribution] = useState(null)
  const [blacklist, setBlacklist] = useState([])
  const [connected, setConnected] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, attacksRes, distRes, blRes] = await Promise.all([
        fetch(`${API_BASE}/stats`),
        fetch(`${API_BASE}/attacks?limit=100`),
        fetch(`${API_BASE}/distribution`),
        fetch(`${API_BASE}/blacklist`),
      ])

      const [statsData, attacksData, distData, blData] = await Promise.all([
        statsRes.json(),
        attacksRes.json(),
        distRes.json(),
        blRes.json(),
      ])

      if (statsData.success) setStats(statsData.data)
      if (attacksData.success) setAttacks(attacksData.data)
      if (distData.success) setDistribution(distData.data)
      if (blData.success) setBlacklist(blData.data)
      setConnected(true)
    } catch (err) {
      setConnected(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleAddBlacklist = async (ip, reason) => {
    try {
      await fetch(`${API_BASE}/blacklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, reason }),
      })
      fetchData()
    } catch (err) {
      console.error('Failed to add to blacklist:', err)
    }
  }

  const handleRemoveBlacklist = async (ip) => {
    try {
      await fetch(`${API_BASE}/blacklist/${ip}`, { method: 'DELETE' })
      fetchData()
    } catch (err) {
      console.error('Failed to remove from blacklist:', err)
    }
  }

  return (
    <div className="app-layout">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="main-area">
        <Header connected={connected} />
        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="tab-content">
              <StatsCards stats={stats} />
              <div className="dashboard-grid">
                <div className="card">
                  <div className="card-title">📋 Recent Attack Log</div>
                  <AttackLog attacks={attacks.slice(0, 15)} compact />
                </div>
                <div>
                  <div className="card" style={{ marginBottom: 20 }}>
                    <div className="card-title">🎯 Threat Level</div>
                    <ThreatGauge stats={stats} />
                  </div>
                  <div className="card">
                    <div className="card-title">📊 Attack Distribution</div>
                    <AttackDistribution distribution={distribution} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attacks' && (
            <div className="tab-content">
              <div className="section-title">⚔️ Full Attack Log</div>
              <div className="card">
                <AttackLog attacks={attacks} />
              </div>
            </div>
          )}

          {activeTab === 'blacklist' && (
            <div className="tab-content">
              <div className="section-title">🚫 IP Blacklist Management</div>
              <div className="card">
                <BlacklistManager
                  blacklist={blacklist}
                  onAdd={handleAddBlacklist}
                  onRemove={handleRemoveBlacklist}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
