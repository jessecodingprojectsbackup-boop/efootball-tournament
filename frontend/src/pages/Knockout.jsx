import { useState, useEffect } from 'react'
import { useApp } from '../App'

export default function Knockout() {
  const { user, showToast } = useApp()
  const [loading, setLoading] = useState(true)
  const [tournamentStatus, setTournamentStatus] = useState(null)
  const [rounds, setRounds] = useState([])
  const [matches, setMatches] = useState([])
  const [players, setPlayers] = useState([])
  const [expandedRound, setExpandedRound] = useState(null)
  const [scoreModal, setScoreModal] = useState(null)
  const [scores, setScores] = useState({ leg1_p1: 0, leg1_p2: 0, leg2_p1: 0, leg2_p2: 0 })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statusRes, roundsRes, matchesRes, playersRes] = await Promise.all([
        fetch('/api/knockout/status'),
        fetch('/api/knockout/rounds'),
        fetch('/api/knockout'),
        fetch('/api/players')
      ])
      
      const statusData = await statusRes.json()
      const roundsData = await roundsRes.json()
      const matchesData = await matchesRes.json()
      const playersData = await playersRes.json()
      
      setTournamentStatus(statusData)
      setRounds(roundsData)
      setMatches(matchesData)
      setPlayers(playersData)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getPlayerName = (playerId) => {
    if (!playerId) return 'TBD'
    const player = players.find(p => p.player_id === playerId)
    return player?.player_name || 'Unknown'
  }

  const startTournament = async () => {
    try {
      const res = await fetch('/api/knockout/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      const data = await res.json()
      if (res.ok) {
        showToast(`Tournament started with ${data.rounds} rounds!`, 'success')
        fetchData()
      } else {
        showToast(data.error || 'Error starting tournament', 'error')
      }
    } catch (err) {
      showToast('Error starting tournament', 'error')
    }
  }

  const generateNextRound = async () => {
    try {
      const res = await fetch('/api/knockout/next', {
        method: 'POST'
      })
      const data = await res.json()
      if (res.ok) {
        if (data.champion) {
          showToast(`🏆 Champion: ${data.champion.player_name}!`, 'success')
        } else {
          showToast(data.message, 'success')
        }
        fetchData()
      } else {
        showToast(data.error || 'Error generating next round', 'error')
      }
    } catch (err) {
      showToast('Error generating next round', 'error')
    }
  }

  const updateScore = async () => {
    if (!scoreModal) return
    
    try {
      const res = await fetch(`/api/knockout/${scoreModal.match.knockout_id}/score`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leg: scoreModal.leg,
          player1_goals: scoreModal.leg === 1 ? parseInt(scores.leg1_p1) : parseInt(scores.leg2_p1),
          player2_goals: scoreModal.leg === 1 ? parseInt(scores.leg1_p2) : parseInt(scores.leg2_p2)
        })
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Score updated!', 'success')
        setScoreModal(null)
        setScores({ leg1_p1: 0, leg1_p2: 0, leg2_p1: 0, leg2_p2: 0 })
        fetchData()
      } else {
        showToast(data.error || 'Error updating score', 'error')
      }
    } catch (err) {
      showToast('Error updating score', 'error')
    }
  }

  const resetTournament = async () => {
    if (!window.confirm('Are you sure you want to reset the entire knockout tournament?')) return
    
    try {
      const res = await fetch('/api/knockout/reset', {
        method: 'POST'
      })
      if (res.ok) {
        showToast('Tournament reset', 'success')
        fetchData()
      }
    } catch (err) {
      showToast('Error resetting tournament', 'error')
    }
  }

  const openScoreModal = (match, leg) => {
    setScoreModal({ match, leg })
    setScores({
      leg1_p1: match.player1_first_leg_goals || 0,
      leg1_p2: match.player2_first_leg_goals || 0,
      leg2_p1: match.player2_second_leg_goals || 0,
      leg2_p2: match.player1_second_leg_goals || 0
    })
  }

  const canGenerateNext = () => {
    if (!tournamentStatus || tournamentStatus.status === 'not_started') return false
    if (tournamentStatus.status === 'complete') return false
    
    const currentRound = rounds.find(r => r.round === tournamentStatus.current_round)
    return currentRound && currentRound.all_completed
  }

  const isComplete = tournamentStatus?.status === 'complete'

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div className="page-container">
      {/* Hero Header */}
      <div className="knockout-hero">
        <div className="hero-icon">🏆</div>
        <div>
          <h1 className="hero-title">Champions League Knockout</h1>
          <p className="hero-subtitle">
            Track knockout rounds, fixtures, progress, and qualification paths
          </p>
        </div>
      </div>

      {/* Tournament Status Cards */}
      {tournamentStatus?.status !== 'not_started' && (
        <div className="status-grid">
          <div className="status-card">
            <div className="status-label">Current Stage</div>
            <div className="status-value">{tournamentStatus.current_stage}</div>
          </div>
          <div className="status-card">
            <div className="status-label">Round Progress</div>
            <div className="status-value">{tournamentStatus.current_round} of {tournamentStatus.rounds}</div>
          </div>
          <div className="status-card">
            <div className="status-label">Matches Completed</div>
            <div className="status-value">{tournamentStatus.completed_matches}/{tournamentStatus.total_matches}</div>
          </div>
          <div className="status-card">
            <div className="status-label">Matches Remaining</div>
            <div className="status-value">{tournamentStatus.remaining_matches}</div>
          </div>
        </div>
      )}

      {/* Controls */}
      {user?.role === 'admin' && (
        <div className="knockout-controls">
          {tournamentStatus?.status === 'not_started' && (
            <button className="btn btn-primary" onClick={startTournament}>
              🚀 Start Tournament
            </button>
          )}
          {canGenerateNext() && (
            <button className="btn btn-primary" onClick={generateNextRound}>
              ➡️ Next Round
            </button>
          )}
          {tournamentStatus?.status !== 'not_started' && (
            <button className="btn btn-outline btn-danger" onClick={resetTournament}>
              🔄 Reset Tournament
            </button>
          )}
        </div>
      )}

      {/* Rounds Section */}
      {tournamentStatus?.status === 'not_started' && (
        <div className="empty-state-card">
          <div className="empty-icon">⚽</div>
          <h2>Ready to Start</h2>
          <p>Click "Start Tournament" to generate knockout bracket from player standings.</p>
        </div>
      )}

      {rounds.length > 0 && rounds.map((round) => (
        <div key={round.round} className="round-section">
          <div 
            className="round-header"
            onClick={() => setExpandedRound(expandedRound === round.round ? null : round.round)}
          >
            <div className="round-title">
              <span className="round-number">Round {round.round}</span>
              <span className="round-stage">{round.stage}</span>
            </div>
            <div className="round-progress">
              <span className="progress-badge">
                {round.completed_matches}/{round.total_matches} matches
              </span>
              <span className={`expand-icon ${expandedRound === round.round ? 'expanded' : ''}`}>
                ▼
              </span>
            </div>
          </div>

          {expandedRound === round.round && (
            <div className="round-matches-grid">
              {matches
                .filter(m => m.round === round.round)
                .map((match) => (
                  <div key={match.knockout_id} className="match-card">
                    <div className="match-header">
                      <span className="match-name">{match.match_name}</span>
                      <span className={`match-status-badge ${match.status.toLowerCase()}`}>
                        {match.status}
                      </span>
                    </div>
                    
                    <div className="match-pairing">
                      <div className="player-slot">
                        <span className="player-name">{getPlayerName(match.player1_id)}</span>
                        <span className="player-score">{match.player1_goals || '—'}</span>
                      </div>
                      <div className="vs-separator">VS</div>
                      <div className="player-slot">
                        <span className="player-name">{getPlayerName(match.player2_id)}</span>
                        <span className="player-score">{match.player2_goals || '—'}</span>
                      </div>
                    </div>

                    {match.winner_id && (
                      <div className="winner-badge">
                        🏆 Winner: {getPlayerName(match.winner_id)}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      ))}

      {/* Score Modal */}
      {scoreModal && (
        <div className="score-modal-overlay" onClick={() => setScoreModal(null)}>
          <div className="score-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Enter Match Score</h3>
            <div className="score-inputs">
              <div className="score-input-group">
                <label>{getPlayerName(scoreModal.match.player1_id)}</label>
                <input
                  type="number"
                  min="0"
                  value={scoreModal.leg === 1 ? scores.leg1_p1 : scores.leg2_p1}
                  onChange={(e) => setScores({
                    ...scores,
                    [scoreModal.leg === 1 ? 'leg1_p1' : 'leg2_p1']: e.target.value
                  })}
                />
              </div>
              <div className="score-vs">VS</div>
              <div className="score-input-group">
                <label>{getPlayerName(scoreModal.match.player2_id)}</label>
                <input
                  type="number"
                  min="0"
                  value={scoreModal.leg === 1 ? scores.leg1_p2 : scores.leg2_p2}
                  onChange={(e) => setScores({
                    ...scores,
                    [scoreModal.leg === 1 ? 'leg1_p2' : 'leg2_p2']: e.target.value
                  })}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setScoreModal(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={updateScore}>
                Save Score
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

