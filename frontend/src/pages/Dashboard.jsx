import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../App'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useApp()

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error('Error fetching dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const resetAllData = async () => {
    if (!window.confirm('⚠️ WARNING: This will delete ALL data!\n\nAre you sure you want to reset everything?\n\nThis will delete:\n- All players\n- All matches\n- All stats\n- All knockout stages\n\nThis action cannot be undone!')) {
      return
    }
    
    if (!window.confirm('Are you REALLY sure? This will permanently delete all tournament data!')) {
      return
    }

    try {
      const res = await fetch('/api/reset-data', {
        method: 'POST'
      })
      if (res.ok) {
        showToast('All data has been reset!', 'success')
        fetchDashboard()
      }
    } catch (err) {
      showToast('Error resetting data', 'error')
    }
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div className="page-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="page-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            Overview of players, matches, standings, and recent activity
          </p>
        </div>
        <button className="btn btn-danger" onClick={resetAllData}>
          🔄 Reset All Data
        </button>
      </div>

      {/* Primary Stats */}
      <div className="dashboard-stats">
        <div className="stats-primary">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-number">{stats?.totalPlayers || 0}</div>
            <div className="stat-label">Total Players</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚽</div>
            <div className="stat-number">{stats?.totalMatches || 0}</div>
            <div className="stat-label">Total Matches</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-number">{stats?.completedMatches || 0}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-number">{stats?.scheduledMatches || 0}</div>
            <div className="stat-label">Scheduled</div>
          </div>
        </div>
      </div>

      {/* Insights & Recent */}
      <div className="dashboard-lower">
        <div className="insights-row">
          <div className="insight-card">
            <div className="insight-icon">🏆</div>
            <div className="insight-content">
              <h3>Top Player</h3>
              <div className="player-highlight">
                {stats?.topPlayer?.player_name || 'N/A'}
              </div>
              <div className="player-value">
                {stats?.topPlayer?.points || 0} <span className="value-label">points</span>
              </div>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">⚽</div>
            <div className="insight-content">
              <h3>Top Scorer</h3>
              <div className="player-highlight">
                {stats?.topScorer?.player_name || 'N/A'}
              </div>
              <div className="player-value">
                {stats?.topScorer?.goals_for || 0} <span className="value-label">goals</span>
              </div>
            </div>
          </div>
        </div>

        <div className="recent-matches-card">
          <div className="card-header">
            <h3>Recent Matches</h3>
          </div>
          <div className="recent-matches-list">
            {stats?.recentMatches?.length > 0 ? (
              stats.recentMatches.map((match) => (
                <Link key={match.match_id} to={`/matches/${match.match_id}`} className="recent-match-row">
                  <div className="match-info">
                    <div className="match-title">
                      {match.match_name || `Match #${match.match_id}`}
                    </div>
                    <div className="match-meta">
                      <span>{new Date(match.match_date).toLocaleDateString()} {match.match_time}</span>
                      <span>{match.participants || 'No participants'}</span>
                    </div>
                  </div>
                  <div className={`match-status-badge ${match.status.toLowerCase().replace(' ', '-')}`}>
                    {match.status}
                  </div>
                </Link>
              ))
            ) : (
              <div className="no-matches">
                No recent matches
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

