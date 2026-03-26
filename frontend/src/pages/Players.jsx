import { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import { useApp } from '../App'

export default function Players() {
  const { user, showToast } = useApp()
  const [players, setPlayers] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  const [formData, setFormData] = useState({
    player_name: '',
    nickname: '',
    phone: ''
  })

  useEffect(() => {
    fetchPlayers()
    fetchStats()
  }, [])

  const fetchPlayers = async () => {
    try {
      const res = await fetch(`/api/players?search=${search}`)
      const data = await res.json()
      setPlayers(data)
    } catch (err) {
      showToast('Error fetching players', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      const statsMap = {}
      data.forEach(s => { statsMap[s.player_id] = s })
      setStats(statsMap)
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlayers()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingPlayer ? `/api/players/${editingPlayer.player_id}` : '/api/players'
      const method = editingPlayer ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        showToast(editingPlayer ? 'Player updated' : 'Player created')
        setShowModal(false)
        setEditingPlayer(null)
        setFormData({ player_name: '', nickname: '', phone: '' })
        fetchPlayers()
        fetchStats()
      } else {
        showToast('Error saving player', 'error')
      }
    } catch (err) {
      showToast('Error saving player', 'error')
    }
  }

  const handleEdit = (player) => {
    setEditingPlayer(player)
    setFormData({
      player_name: player.player_name,
      nickname: player.nickname || '',
      phone: player.phone || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (player) => {
    try {
      const res = await fetch(`/api/players/${player.player_id}`, { method: 'DELETE' })
      if (res.ok) {
        showToast('Player deleted')
        setShowDeleteConfirm(null)
        fetchPlayers()
        fetchStats()
      } else {
        showToast('Error deleting player', 'error')
      }
    } catch (err) {
      showToast('Error deleting player', 'error')
    }
  }

  const openAddModal = () => {
    setEditingPlayer(null)
    setFormData({ player_name: '', nickname: '', phone: '' })
    setShowModal(true)
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div className="players-page">
      <div className="page-header">
        <h1 className="page-title">Players</h1>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={openAddModal}>+ Add Player</button>
        )}
      </div>

      <div className="search-box">
        <input
          type="text"
          className="form-control"
          placeholder="Search players by name or nickname..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {players.length > 0 ? (
        <div className="players-horizontal">
          {players.map((player) => {
            const playerStats = stats[player.player_id] || {}
            return (
              <div key={player.player_id} className="player-card">

                <div className="player-header">
                  <div>
                    <div className="player-name">{player.player_name}</div>
                    <div className="player-nickname">{player.nickname || 'No nickname'}</div>
                  </div>
                  {user?.role === 'admin' && (
                    <div className="player-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => handleEdit(player)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteConfirm(player)}>Delete</button>
                    </div>
                  )}
                </div>
                <div className="player-info">
                  <p>📱 {player.phone || 'No phone'}</p>
                </div>
                <div className="player-stats">
                  <div className="player-stat">
                    <div className="player-stat-value">{playerStats.matches_played || 0}</div>
                    <div className="player-stat-label">Matches</div>
                  </div>
                  <div className="player-stat">
                    <div className="player-stat-value">{playerStats.goals_for || 0}</div>
                    <div className="player-stat-label">Goals</div>
                  </div>
                  <div className="player-stat">
                    <div className="player-stat-value">{playerStats.points || 0}</div>
                    <div className="player-stat-label">Points</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="empty-state">
          <p>No players found</p>
          {user?.role === 'admin' && (
            <button className="btn btn-primary" onClick={openAddModal} style={{ marginTop: '15px' }}>
              Add First Player
            </button>
          )}
        </div>
      )}

      {user?.role === 'admin' && (
        <>
          <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingPlayer ? 'Edit Player' : 'Add Player'}>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Player Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.player_name}
                  onChange={(e) => setFormData({ ...formData, player_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nickname</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingPlayer ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </Modal>

          <Modal isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} title="Confirm Delete">
            <div className="confirm-dialog">
              <p>Are you sure you want to delete <strong>{showDeleteConfirm?.player_name}</strong>?</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>This will also remove all their match history and stats.</p>
              <div className="modal-actions">
                <button className="btn btn-outline" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => handleDelete(showDeleteConfirm)}>Delete</button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  )
}

