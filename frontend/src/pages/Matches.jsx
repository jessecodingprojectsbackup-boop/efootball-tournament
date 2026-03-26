import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../components/Modal'
import { useApp } from '../App'

export default function Matches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [stageFilter, setStageFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [expandedMatch, setExpandedMatch] = useState(null)
  const [participants, setParticipants] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [editingMatch, setEditingMatch] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const { user, showToast } = useApp()

  const [formData, setFormData] = useState({
    match_name: '',
    match_date: '',
    match_time: '',
    stage: 'Group Stage',
    status: 'Scheduled'
  })

  const stages = ['Group Stage', 'Knockout', 'Quarter Final', 'Semi Final', 'Final']
  const statuses = ['Scheduled', 'In Progress', 'Completed', 'Cancelled']

  useEffect(() => {
    fetchMatches()
  }, [stageFilter, statusFilter])

  const fetchMatches = async () => {
    try {
      let url = '/api/matches'
      const params = []
      if (stageFilter) params.push(`stage=${stageFilter}`)
      if (statusFilter) params.push(`status=${statusFilter}`)
      if (params.length > 0) url += '?' + params.join('&')
      
      const res = await fetch(url)
      const data = await res.json()
      setMatches(data)
    } catch (err) {
      showToast('Error fetching matches', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchParticipants = async (matchId) => {
    try {
      const res = await fetch(`/api/matches/${matchId}/participants`)
      const data = await res.json()
      setParticipants(prev => ({ ...prev, [matchId]: data }))
    } catch (err) {
      console.error('Error fetching participants:', err)
    }
  }

  const toggleExpand = async (matchId) => {
    if (expandedMatch === matchId) {
      setExpandedMatch(null)
    } else {
      setExpandedMatch(matchId)
      if (!participants[matchId]) {
        await fetchParticipants(matchId)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingMatch ? `/api/matches/${editingMatch.match_id}` : '/api/matches'
      const method = editingMatch ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        showToast(editingMatch ? 'Match updated' : 'Match created')
        setShowModal(false)
        setEditingMatch(null)
        setFormData({
          match_name: '',
          match_date: '',
          match_time: '',
          stage: 'Group Stage',
          status: 'Scheduled'
        })
        fetchMatches()
      } else {
        showToast('Error saving match', 'error')
      }
    } catch (err) {
      showToast('Error saving match', 'error')
    }
  }

  const handleEdit = (match) => {
    setEditingMatch(match)
    setFormData({
      match_name: match.match_name || '',
      match_date: match.match_date,
      match_time: match.match_time,
      stage: match.stage,
      status: match.status
    })
    setShowModal(true)
  }

  const handleDelete = async (match) => {
    try {
      const res = await fetch(`/api/matches/${match.match_id}`, { method: 'DELETE' })
      if (res.ok) {
        showToast('Match deleted')
        setShowDeleteConfirm(null)
        fetchMatches()
      } else {
        showToast('Error deleting match', 'error')
      }
    } catch (err) {
      showToast('Error deleting match', 'error')
    }
  }

  const openAddModal = () => {
    setEditingMatch(null)
    setFormData({
      match_name: '',
      match_date: new Date().toISOString().split('T')[0],
      match_time: '10:00:00',
      stage: 'Group Stage',
      status: 'Scheduled'
    })
    setShowModal(true)
  }

  const getMatchScore = (matchId) => {
    const parts = participants[matchId] || []
    if (parts.length === 2) {
      return `${parts[0].goals_scored} - ${parts[1].goals_scored}`
    }
    return null
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div className="page-container">
      {/* Hero Header */}
      <div className="matches-hero">
        <div>
          <h1 className="hero-title">Matches</h1>
          <p className="hero-subtitle">
            Manage fixtures, stages, schedules, and results
          </p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={openAddModal}>
            ➕ Create Match
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="matches-toolbar">
        <div className="toolbar-section">
          <label className="toolbar-label">Stage</label>
          <select 
            className="form-control toolbar-select" 
            value={stageFilter} 
            onChange={(e) => setStageFilter(e.target.value)}
          >
            <option value="">All Stages</option>
            {stages.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="toolbar-section">
          <label className="toolbar-label">Status</label>
          <select 
            className="form-control toolbar-select" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Matches List */}
      {matches.length > 0 ? (
        <div className="matches-grid">
          {matches.map((match) => (
            <div key={match.match_id} className="match-card">
              {/* Match Header */}
              <div className="match-header">
                <div className="match-primary">
                  <span className={`stage-badge stage-${match.stage.toLowerCase().replace(' ', '-')} `}>
                    {match.stage}
                  </span>
                  <h3 className="match-title">{match.match_name || `Match #${match.match_id}`}</h3>
                  <div className="match-meta">
                    <span className="meta-item">
                      📅 {new Date(match.match_date).toLocaleDateString()}
                    </span>
                    <span className="meta-item">
                      🕒 {match.match_time}
                    </span>
                  </div>
                </div>
                <div className="match-actions">
                  <span className={`status-badge status-${match.status.toLowerCase().replace(' ', '-')}`}>
                    {match.status}
                  </span>
                  <button 
                    className="expand-btn"
                    onClick={() => toggleExpand(match.match_id)}
                  >
                    {expandedMatch === match.match_id ? '▲' : '▼'}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedMatch === match.match_id && (
                <div className="match-details">
                  {participants[match.match_id]?.length > 0 ? (
                    <div className="participants-grid">
                      {participants[match.match_id].map((p) => (
                        <div key={p.match_participant_id} className="participant-card">
                          <div className="participant-header">
                            <div className="participant-avatar">
                              {p.player_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="participant-name">{p.player_name}</div>
                              {p.nickname && <div className="participant-nickname">{p.nickname}</div>}
                            </div>
                          </div>
                          <div className="participant-score">
                            <span className="goals">{p.goals_scored}</span>
                            <span className={`result-badge ${p.result?.toLowerCase()}`}>
                              {p.result}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-participants">
                      <p>No participants assigned yet</p>
                    </div>
                  )}
                  
                  <div className="match-actions-row">
                    <Link to={`/matches/${match.match_id}`} className="btn btn-primary btn-sm">
                      Manage Match
                    </Link>
                    {user?.role === 'admin' && (
                      <>
                        <button className="btn btn-outline btn-sm" onClick={() => handleEdit(match)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteConfirm(match)}>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">⚽</div>
          <h2>No Matches</h2>
          <p>No matches match your current filters</p>
          {user?.role === 'admin' && (
            <button className="btn btn-primary" onClick={openAddModal} style={{ marginTop: '1rem' }}>
              Create First Match
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingMatch ? 'Edit Match' : 'Create Match'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Match Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.match_name}
              onChange={(e) => setFormData({ ...formData, match_name: e.target.value })}
              placeholder="e.g., Quarter Final #1"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                className="form-control"
                value={formData.match_date}
                onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Time *</label>
              <input
                type="time"
                className="form-control"
                value={formData.match_time}
                onChange={(e) => setFormData({ ...formData, match_time: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Stage *</label>
              <select
                className="form-control"
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                required
              >
                {stages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editingMatch ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} title="Confirm Delete">
        <div className="confirm-dialog">
          <p>Are you sure you want to delete <strong>{showDeleteConfirm?.match_name || `Match #${showDeleteConfirm?.match_id}`}</strong>?</p>
          <p>This will also remove all participants and results.</p>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(showDeleteConfirm)}>Delete Match</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

