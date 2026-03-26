import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../App'

export default function Navbar() {
  const { user, logout, darkMode, toggleDarkMode } = useApp()
  const location = useLocation()

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link'

  return (
    <nav className="navbar">
      {/* Left: Logo */}
      <Link to="/" className="navbar-brand">
        ⚽ eFootball Tournament
      </Link>
      
      {/* Center: Navigation Links */}
      <div className="navbar-center">
        <Link to="/" className={isActive('/')}>Dashboard</Link>
        <Link to="/players" className={isActive('/players')}>Players</Link>
        <Link to="/matches" className={isActive('/matches')}>Matches</Link>
        <Link to="/standings" className={isActive('/standings')}>Standings</Link>
        <Link to="/stages" className={isActive('/stages')}>Stages</Link>
        <Link to="/knockout" className={isActive('/knockout')}>Knockout</Link>
        <Link to="/contact" className={isActive('/contact')}>Contact</Link>
      </div>
      
      {/* Right: Actions */}
      <div className="navbar-actions">
        <button 
          className="dark-mode-toggle" 
          onClick={toggleDarkMode} 
          title="Toggle Dark Mode"
          aria-label="Toggle dark mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        <button className="btn btn-outline btn-sm" onClick={logout}>
          Logout ({user?.username})
        </button>
      </div>
    </nav>
  )
}

