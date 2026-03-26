import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../App'

export default function StageProgression() {
  const [matches, setMatches] = useState([])
  const [participants, setParticipants] = useState({})
  const [loading, setLoading] = useState(true)
  const { showToast } = useApp()

  const stages = ['Group Stage', 'Knockout', 'Quarter Final', 'Semi Final', 'Final']

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matches')
      const data = await res.json()
      setMatches(data)
      
      // Fetch participants for all matches
      for (const match of data) {
        const pRes = await fetch(`/api/matches/${match.match_id}/participants`)
        const pData = await pRes.json()
        setParticipants(prev => ({ ...prev, [match.match_id]: pData }))
      }
    } catch (err) {
      showToast('Error fetching matches', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getStageClass = (stage) => {
    return stage.toLowerCase().replace(' ', '-')
  }

  const getMatchesByStage = (stage) => {
    return matches.filter(m => m.stage === stage)
  }

  const getMatchScore = (matchId) => {
    const parts = participants[matchId] || []
    if (parts.length === 2) {
      return `${parts[0].goals_scored} - ${parts[1].goals_scored}`
    }
    return null
  }

  const getMatchWinner = (matchId) => {
    const parts = participants[matchId] || []
    if (parts.length !== 2) return null
    
    if (parts[0].goals_scored > parts[1].goals_scored) return parts[0]
    if (parts[1].goals_scored > parts[0].goals_scored) return parts[1]
    return 'draw'
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>
  }

  return (
    <div className="stage-progression-page">
      <div className="page-header">
        <h1 className="page-title">Stage Progression</h1>
      </div>
      
      <div className="stages-horizontal">
        {stages.map((stage) => {
          const stageMatches = getMatchesByStage(stage)
          
          return (
            <div key={stage} className="stage-section">
              <h2>
                <span className={`stage-badge ${getStageClass(stage)}`}>{stage}</span>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)', marginLeft: '10px' }}>
                  ({stageMatches.length} match{stageMatches.length !== 1 ? 'es' : ''})
                </span>
              </h2>
              
              {stageMatches.length > 0 ? (
                <div className="matches-list">
                  {stageMatches.map((match) => {
                    const winner = getMatchWinner(match.match_id)
                    
                    return (
                      <Link to={`/matches/${match.match_id}`} key={match.match_id} style={{ textDecoration: 'none' }}>
                        <div className="match-accordion">
                          <div className="match-accordion-header">
                            <div className="match-main">
                              <div className="match-details-info">
                                <span>{match.match_name || `Match #${match.match_id}`}</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                  {new Date(match.match_date).toLocaleDateString()} at {match.match_time}
                                </span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                              {match.status === 'Completed' && getMatchScore(match.match_id) && (
                                <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                                  {getMatchScore(match.match_id)}
                                </span>
                              )}
                              <span className={`match-status ${match.status.toLowerCase().replace(' ', '-')}`}>
                                {match.status}
                              </span>
                            </div>
                          </div>
                          
                          {participants[match.match_id]?.length > 0 && (
                            <div className="match-accordion-content">
                              <div className="participants-list">
                                {participants[match.match_id].map((p) => (
                                  <div key={p.match_participant_id} className="participant-card">
                                    <div className="participant-info">
                                      <div className="participant-avatar">
                                        {p.player_name.charAt(0)}
                                      </div>
                                      <div>
                                        <div className="participant-name">
                                          {p.player_name}
                                          {winner && winner !== 'draw' && winner.player_id === p.player_id && ' 🏆'}
                                        </div>
                                        {p.nickname && <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.nickname}</div>}
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{p.goals_scored}</span>
                                      <span className={`participant-result ${p.result?.toLowerCase()}`}>
                                        {p.result}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                  No matches in this stage yet
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

