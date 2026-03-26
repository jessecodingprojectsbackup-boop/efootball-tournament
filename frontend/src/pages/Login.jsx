import { useState } from 'react'
import { useApp } from '../App'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useApp()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()

      if (data.success) {
        login(data.user)
      } else {
        setError(data.message || 'Invalid credentials')
      }
    } catch (err) {
      setError('Server error. Please try again.')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>⚽ eFootball Tournament</h1>
        <p style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--text-secondary)' }}>
          Admin Login
        </p>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          {error && <p style={{ color: 'var(--danger)', marginBottom: '15px' }}>{error}</p>}
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Default credentials: admin / admin123
        </p>
      </div>
    </div>
  )
}

