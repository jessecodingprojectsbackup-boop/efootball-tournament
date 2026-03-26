import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Modal from '../components/Modal'
import { useApp } from '../App'

export default function MatchDetails() {
  const { id } = useParams()
  const [match, setMatch] = useState(null)
  const [participants, setParticipants] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showScoreModal, setShowScoreModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [selectedParticipant, setSelectedParticipant] = useState(null)
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [goals, setGoals] = useState(0)
  const { showToast } = useApp()

  useEffect(() => {
    fetchMatch()
    fetchPlayers()
  }, [id])

  const fetchMatch = async () => {
    try {
      const res = await fetch(`/api/matches/${id}`)
      const data = await res.json()
      setMatch(data)
      await fetchParticipants()
    } catch (err) {
      showToast('Error fetching match', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchParticipants = async () => {
    try {
      const res = await fetch(`/api/matches/${id}/participants`)
      const data = await res.json()
      setParticipants(data)
    } catch (err) {
      console.error('Error fetching participants:', err)
    }
  }

  const fetchPlayers = async () => {
    try {
      const res = await fetch('/api/players')
      const data = await res.json()
      setPlayers(data)
    } catch (err) {
      console.error('Error fetching players:', err)
    }
  }

  const addParticipant = async (e) => {
    e.preventDefault()
    if (!selectedPlayer) return

    try {
      const res = await fetch(`/api/matches/${id}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: selectedPlayer })
      })
      
      if (res.ok) {
        showToast('Participant added')
        setShowAddModal(false)
        setSelectedPlayer('')
        fetchParticipants()
      } else {
        const data = await res.json()
        showToast(data.message || 'Error adding participant', 'error')
      }
    } catch (err) {
      showToast('Error adding participant', 'error')
    }
  }

  const openScoreModal = (participant) => {
    setSelectedParticipant(participant)
    setGoals(participant.goals_scored || 0)
    setShowScoreModal(true)
  }

  const saveScore = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/participants/${selectedParticipant.match_participant_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals_scored: parseInt(goals) })
      })
      
      if (res.ok) {
        showToast('Score updated')
        setShowScoreModal(false)
        fetchParticipants()
      } else {
        showToast('Error updating score', 'error')
      }
    } catch (err) {
      showToast('Error updating score', 'error')
    }
  }

  const removeParticipant = async (participant) => {
    try {
      const res = await fetch(`/api/participants/${participant.match_participant_id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        showToast('Participant removed')
        setShowDeleteConfirm(null)
        fetchParticipants()
      } else {
        showToast('Error removing participant', 'error')
      }
    } catch (err) {
      showToast('Error removing participant', 'error')
    }
  }

  const getAvailablePlayers = () => {
    const participantIds = participants.map(p => p.player_id)
    return players.filter(p => !participantIds.includes(p.player_id))
  }

  const getScoreDisplay = () => {
    if (participants.length !== 2) return null
    const sorted = [...participants].sort((a, b) => b.goals_scored - a.goals_scored)
    return { winner: sorted[0], loser: sorted[1], isDraw: sorted[0].goals_scored === sorted[1].goals_scored }
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  if (!match) {
    return <div className="empty-state">Match not found</div>
  }

  const score = getScoreDisplay()

  return (
    <div className="match-details-container">
      <div style={{ marginBottom: '20px' }}>
        <Link to="/matches" className="btn btn-outline">← Back to Matches</Link>
      </div>

      <div className="match-details-header">
        <h1>{match.match_name || `Match #${match.match_id}`}</h1>
        <div className="match-details-meta">
          <span>📅 {new Date(match.match_date).toLocaleDateString()}</span>
          <span>⏰ {match.match_time}</span>
          <span className="match-stage-badge">{match.stage}</span>
          <span className={`match-status ${match.status.toLowerCase().replace(' ', '-')}`}>{match.status}</span>
        </div>
      </div>

      {participants.length > 0 && score && match.status === 'Completed' && (
        <div className="card" style={{ marginBottom: '20px', textAlign: 'center' }}>
          <div className="score-display">
            <div className="score">
              {score.winner.goals_scored} - {score.loser.goals_scored}
            </div>
            {score.isDraw ? (
              <div style={{ color: 'var(--warning)' }}>Draw</div>
            ) : (
              <div style={{ color: 'var(--success)' }}>
                🏆 {score.winner.player_name} Wins!
              </div>
            )}
          </div>
        </div>
      )}

      <div className="add-participants">
        <h3>Participants ({participants.length}/2)</h3>
        {participants.length < 2 ? (
          <form onSubmit={addParticipant} className="participants-select">
            <select 
              className="form-control"
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              required
            >
              <option value="">Select Player</option>
              {getAvailablePlayers().map(p => (
                <option key={p.player_id} value={p.player_id}>
                  {p.player_name} {p.nickname ? `(${p.nickname})` : ''}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">Add Participant</button>
          </form>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>This match is full</p>
        )}
      </div>

      {participants.length > 0 && (
        <div className="card">
          <h3>Player Scores</h3>
          <div className="participants-list" style={{ marginTop: '15px' }}>
            {participants.map((p) => (
              <div key={p.match_participant_id} className="participant-card">
                <div className="participant-info">
                  <div className="participant-avatar">{p.player_name.charAt(0)}</div>
                  <div>
                    <div className="participant-name">{p.player_name}</div>
                    {p.nickname && <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.nickname}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => openScoreModal(p)}
                  >
                    {p.goals_scored} ⚽
                  </button>
                  {match.status !== 'Completed' && (
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => setShowDeleteConfirm(p)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Participant">
        <form onSubmit={addParticipant}>
          <div className="form-group">
            <label>Select Player</label>
            <select
              className="form-control"
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              required
            >
              <option value="">Select a player</option>
              {getAvailablePlayers().map(p => (
                <option key={p.player_id} value={p.player_id}>
                  {p.player_name} {p.nickname ? `(${p.nickname})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showScoreModal} onClose={() => setShowScoreModal(false)} title="Update Score">
        <form onSubmit={saveScore}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3>{selectedParticipant?.player_name}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{selectedParticipant?.nickname}</p>
          </div>
          <div className="form-group">
            <label>Goals Scored</label>
            <input
              type="number"
              className="form-control"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              min="0"
              required
              style={{ textAlign: 'center', fontSize: '1.5rem' }}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => setShowScoreModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Score</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} title="Confirm Remove">
        <div className="confirm-dialog">
          <p>Remove <strong>{showDeleteConfirm?.player_name}</strong> from this match?</p>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => removeParticipant(showDeleteConfirm)}>Remove</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

