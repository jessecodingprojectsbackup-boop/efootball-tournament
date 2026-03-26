import { useState, useEffect } from 'react'
import { useApp } from '../App'

export default function KnockoutStages() {
  const { showToast } = useApp()
  const [knockoutMatches, setKnockoutMatches] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [scores, setScores] = useState({ player1_goals: 0, player2_goals: 0 })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [matchesRes, playersRes] = await Promise.all([
        fetch('/api/knockout'),
        fetch('/api/players')
      ])
      const matchesData = await matchesRes.json()
      const playersData = await playersRes.json()
      setKnockoutMatches(matchesData)
      setPlayers(playersData)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getPlayerName = (playerId) => {
    const player = players.find(p => p.player_id === playerId)
    return player?.player_name || 'TBD'
  }

  const generateQuarterFinals = async () => {
    try {
      const res = await fetch('/api/knockout/generate-quarter-finals', {
        method: 'POST'
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Quarter Finals generated!', 'success')
        fetchData()
      } else {
        showToast(data.error, 'error')
      }
    } catch (err) {
      showToast('Error generating Quarter Finals', 'error')
    }
  }

  const generateSemiFinals = async () => {
    try {
      const res = await fetch('/api/knockout/generate-semi-finals', {
        method: 'POST'
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Semi Finals generated!', 'success')
        fetchData()
      } else {
        showToast(data.error, 'error')
      }
    } catch (err) {
      showToast('Error generating Semi Finals', 'error')
    }
  }

  const generateFinal = async () => {
    try {
      const res = await fetch('/api/knockout/generate-final', {
        method: 'POST'
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Final generated!', 'success')
        fetchData()
      } else {
        showToast(data.error, 'error')
      }
    } catch (err) {
      showToast('Error generating Final', 'error')
    }
  }

  const updateScore = async (match, leg) => {
    try {
      const res = await fetch(`/api/knockout/${match.knockout_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leg,
          player1_goals: parseInt(scores.player1_goals),
          player2_goals: parseInt(scores.player2_goals)
        })
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Score updated!', 'success')
        fetchData()
        setSelectedMatch(null)
        setScores({ player1_goals: 0, player2_goals: 0 })
      } else {
        showToast(data.error, 'error')
      }
    } catch (err) {
      showToast('Error updating score', 'error')
    }
  }

  const resetKnockout = async () => {
    if (!window.confirm('Are you sure you want to reset all knockout stages?')) return
    try {
      const res = await fetch('/api/knockout/reset', { method: 'POST' })
      if (res.ok) {
        showToast('Knockout stages reset', 'success')
        fetchData()
      }
    } catch (err) {
      showToast('Error resetting knockout', 'error')
    }
  }

  const quarterFinals = knockoutMatches.filter(m => m.stage === 'Quarter Final')
  const semiFinals = knockoutMatches.filter(m => m.stage === 'Semi Final')
  const finals = knockoutMatches.filter(m => m.stage === 'Final')

  const canGenerateQF = quarterFinals.length === 0
  const canGenerateSF = quarterFinals.length > 0 && quarterFinals.every(m => m.status === 'Completed') && semiFinals.length === 0
  const canGenerateF = semiFinals.length > 0 && semiFinals.every(m => m.status === 'Completed') && finals.length === 0

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div className="knockout-stages">
      <div className="page-header">
        <h1 className="page-title">🏆 Knockout Stages</h1>
        <div className="header-actions">
          {canGenerateQF && (
            <button className="btn btn-primary" onClick={generateQuarterFinals}>
              Generate Quarter Finals
            </button>
          )}
          {canGenerateSF && (
            <button className="btn btn-primary" onClick={generateSemiFinals}>
              Generate Semi Finals
            </button>
          )}
          {canGenerateF && (
            <button className="btn btn-primary" onClick={generateFinal}>
              Generate Final
            </button>
          )}
          {knockoutMatches.length > 0 && (
            <button className="btn btn-outline" onClick={resetKnockout}>
              Reset All
            </button>
          )}
        </div>
      </div>

      {/* Quarter Finals */}
      <div className="knockout-stage">
        <h2 className="stage-title">Quarter Finals</h2>
        {quarterFinals.length === 0 ? (
          <div className="empty-state">
            <p>Complete Group Stage matches to generate Quarter Finals</p>
            <p className="hint">Top 4 players from standings will be randomly paired</p>
          </div>
        ) : (
          <div className="knockout-matches">
            {quarterFinals.map((match, index) => (
              <div key={match.knockout_id} className={`knockout-match-card ${match.status.toLowerCase()}`}>
                <div className="match-header">
                  <span className="match-name">{match.match_name}</span>
                  <span className="match-status ${match.status.toLowerCase()}">{match.status}</span>
                </div>
                
                {/* First Leg */}
                <div className="leg-section">
                  <div className="leg-label">First Leg</div>
                  <div className="leg-score">
                    <span className="team">{getPlayerName(match.player1_id)}</span>
                    <span className="score">{match.player1_first_leg_goals} - {match.player2_first_leg_goals}</span>
                    <span className="team">{getPlayerName(match.player2_id)}</span>
                  </div>
                </div>

                {/* Second Leg */}
                <div className="leg-section">
                  <div className="leg-label">Second Leg</div>
                  <div className="leg-score">
                    <span className="team">{getPlayerName(match.player2_id)}</span>
                    <span className="score">{match.player2_second_leg_goals} - {match.player1_second_leg_goals}</span>
                    <span className="team">{getPlayerName(match.player1_id)}</span>
                  </div>
                </div>

                {/* Aggregate Score */}
                <div className="aggregate-section">
                  <div className="aggregate-label">Aggregate</div>
                  <div className="aggregate-score">
                    <span className="team">{getPlayerName(match.player1_id)}</span>
                    <span className="score">{match.player1_total} - {match.player2_total}</span>
                    <span className="team">{getPlayerName(match.player2_id)}</span>
                  </div>
                  {match.player1_away_goals > 0 && (
                    <div className="away-goals">
                      (Away: {match.player1_away_goals} - {match.player2_away_goals})
                    </div>
                  )}
                </div>

                {/* Winner */}
                {match.winner_id && (
                  <div className="winner-section">
                    🏆 Winner: <strong>{getPlayerName(match.winner_id)}</strong>
                  </div>
                )}

                {/* Update Score Buttons */}
                {match.status !== 'Completed' && (
                  <div className="score-actions">
                    {!match.leg1_completed ? (
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => setSelectedMatch({ ...match, leg: 1 })}
                      >
                        Update 1st Leg
                      </button>
                    ) : !match.leg2_completed ? (
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => setSelectedMatch({ ...match, leg: 2 })}
                      >
                        Update 2nd Leg
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Semi Finals */}
      <div className="knockout-stage">
        <h2 className="stage-title">Semi Finals</h2>
        {semiFinals.length === 0 ? (
          <div className="empty-state">
            <p>Complete all Quarter Finals to generate Semi Finals</p>
          </div>
        ) : (
          <div className="knockout-matches">
            {semiFinals.map((match) => (
              <div key={match.knockout_id} className={`knockout-match-card ${match.status.toLowerCase()}`}>
                <div className="match-header">
                  <span className="match-name">{match.match_name}</span>
                  <span className="match-status ${match.status.toLowerCase()}">{match.status}</span>
                </div>
                
                {/* First Leg */}
                <div className="leg-section">
                  <div className="leg-label">First Leg</div>
                  <div className="leg-score">
                    <span className="team">{getPlayerName(match.player1_id)}</span>
                    <span className="score">{match.player1_first_leg_goals} - {match.player2_first_leg_goals}</span>
                    <span className="team">{getPlayerName(match.player2_id)}</span>
                  </div>
                </div>

                {/* Second Leg */}
                <div className="leg-section">
                  <div className="leg-label">Second Leg</div>
                  <div className="leg-score">
                    <span className="team">{getPlayerName(match.player2_id)}</span>
                    <span className="score">{match.player2_second_leg_goals} - {match.player1_second_leg_goals}</span>
                    <span className="team">{getPlayerName(match.player1_id)}</span>
                  </div>
                </div>

                {/* Aggregate Score */}
                <div className="aggregate-section">
                  <div className="aggregate-label">Aggregate</div>
                  <div className="aggregate-score">
                    <span className="team">{getPlayerName(match.player1_id)}</span>
                    <span className="score">{match.player1_total} - {match.player2_total}</span>
                    <span className="team">{getPlayerName(match.player2_id)}</span>
                  </div>
                </div>

                {match.winner_id && (
                  <div className="winner-section">
                    🏆 Winner: <strong>{getPlayerName(match.winner_id)}</strong>
                  </div>
                )}

                {match.status !== 'Completed' && (
                  <div className="score-actions">
                    {!match.leg1_completed ? (
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => setSelectedMatch({ ...match, leg: 1 })}
                      >
                        Update 1st Leg
                      </button>
                    ) : !match.leg2_completed ? (
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => setSelectedMatch({ ...match, leg: 2 })}
                      >
                        Update 2nd Leg
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Final */}
      <div className="knockout-stage">
        <h2 className="stage-title">🏆 Grand Final</h2>
        {finals.length === 0 ? (
          <div className="empty-state">
            <p>Complete Semi Final to generate Grand Final</p>
          </div>
        ) : (
          <div className="knockout-matches">
            {finals.map((match) => (
              <div key={match.knockout_id} className={`knockout-match-card final ${match.status.toLowerCase()}`}>
                <div className="match-header">
                  <span className="match-name">🏆 {match.match_name}</span>
                  <span className="match-status ${match.status.toLowerCase()}">{match.status}</span>
                </div>
                
                <div className="final-score">
                  <span className="team">{getPlayerName(match.player1_id)}</span>
                  <span className="score">{match.player1_goals || 0} - {match.player2_goals || 0}</span>
                  <span className="team">{getPlayerName(match.player2_id)}</span>
                </div>

                {match.winner_id && (
                  <div className="champion-section">
                    <div className="trophy">🏆</div>
                    <div className="champion-name">CHAMPION: {getPlayerName(match.winner_id)}</div>
                  </div>
                )}

                {match.status !== 'Completed' && (
                  <div className="score-actions">
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => setSelectedMatch({ ...match, leg: 'final' })}
                    >
                      Update Score
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Score Update Modal */}
      {selectedMatch && (
        <div className="modal-overlay" onClick={() => setSelectedMatch(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Update Score - {selectedMatch.leg === 'final' ? 'Final' : `Leg ${selectedMatch.leg}`}</h3>
            <div className="score-input">
              <div className="team-input">
                <label>{getPlayerName(selectedMatch.player1_id)}</label>
                <input
                  type="number"
                  min="0"
                  value={scores.player1_goals}
                  onChange={(e) => setScores({ ...scores, player1_goals: e.target.value })}
                />
              </div>
              <span className="vs">VS</span>
              <div className="team-input">
                <label>{getPlayerName(selectedMatch.player2_id)}</label>
                <input
                  type="number"
                  min="0"
                  value={scores.player2_goals}
                  onChange={(e) => setScores({ ...scores, player2_goals: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setSelectedMatch(null)}>Cancel</button>
              <button 
                className="btn btn-primary"
                onClick={() => updateScore(selectedMatch, selectedMatch.leg === 'final' ? 'final' : selectedMatch.leg)}
              >
                Save Score
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
