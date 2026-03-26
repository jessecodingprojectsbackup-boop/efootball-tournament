import { useState, useEffect } from 'react'
import { useApp } from '../App'

export default function Standings() {
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useApp()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      showToast('Error fetching standings', 'error')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['Rank', 'Player', 'Nickname', 'Matches', 'Wins', 'Draws', 'Losses', 'GF', 'GA', 'GD', 'Points', 'Stage']
    const rows = stats.map((s, i) => [
      i + 1,
      s.player_name,
      s.nickname || '',
      s.matches_played,
      s.wins,
      s.draws,
      s.losses,
      s.goals_for,
      s.goals_against,
      s.goal_difference,
      s.points,
      s.stage_reached
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'standings.csv'
    a.click()
    window.URL.revokeObjectURL(url)
    showToast('Standings exported to CSV')
  }

  const printStandings = () => {
    window.print()
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div className="standings-page">
      <div className="page-header no-print">
        <h1 className="page-title">Standings</h1>
        <div className="standings-controls">
          <button className="btn btn-outline" onClick={exportToCSV}>📥 Export CSV</button>
          <button className="btn btn-outline" onClick={printStandings}>🖨️ Print</button>
        </div>
      </div>

      {stats.length > 0 ? (
        <div className="standings-table">
          <table>
            <thead>
              <tr>
                <th className="position">#</th>
                <th>Player</th>
                <th>Matches</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GF</th>
                <th>GA</th>
                <th>GD</th>
                <th>Points</th>
                <th className="stage-reached">Stage Reached</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s, index) => (
                <tr key={s.player_id}>
                  <td className="position">{index + 1}</td>
                  <td>
                    <div>
                      <strong>{s.player_name}</strong>
                      {s.nickname && <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>({s.nickname})</span>}
                    </div>
                  </td>
                  <td>{s.matches_played}</td>
                  <td style={{ color: 'var(--success)', fontWeight: '600' }}>{s.wins}</td>
                  <td style={{ color: 'var(--warning)', fontWeight: '600' }}>{s.draws}</td>
                  <td style={{ color: 'var(--danger)', fontWeight: '600' }}>{s.losses}</td>
                  <td>{s.goals_for}</td>
                  <td>{s.goals_against}</td>
                  <td style={{ 
                    color: s.goal_difference > 0 ? 'var(--success)' : s.goal_difference < 0 ? 'var(--danger)' : 'inherit',
                    fontWeight: '600'
                  }}>
                    {s.goal_difference > 0 ? '+' : ''}{s.goal_difference}
                  </td>
                  <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{s.points}</td>
                  <td className="stage-reached">
                    <span className={`badge badge-${
                      s.stage_reached === 'Final' ? 'danger' :
                      s.stage_reached === 'Semi Final' ? 'info' :
                      s.stage_reached === 'Quarter Final' ? 'warning' : 'success'
                    }`}>
                      {s.stage_reached}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <p>No statistics available yet</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '10px' }}>
            Complete some matches to see the standings
          </p>
        </div>
      )}
    </div>
  )
}

