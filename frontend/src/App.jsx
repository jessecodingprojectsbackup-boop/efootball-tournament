import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Players from './pages/Players'
import Matches from './pages/Matches'
import MatchDetails from './pages/MatchDetails'
import Standings from './pages/Standings'
import StageProgression from './pages/StageProgression'
import Knockout from './pages/Knockout'
import Contact from './pages/Contact'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import './App.css'

export const AppContext = createContext()
export const useApp = () => useContext(AppContext)

function App() {
  const [user, setUser] = useState(null)
  const [toast, setToast] = useState(null)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode)
    document.body.classList.toggle('dark-mode', darkMode)
  }, [darkMode])

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <AppContext.Provider value={{ user, login, logout, showToast, darkMode, toggleDarkMode }}>
      <div className="app">
        {user && <Navbar />}
        <div className="main-content">
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/players" element={user ? <Players /> : <Navigate to="/login" />} />
            <Route path="/matches" element={user ? <Matches /> : <Navigate to="/login" />} />
            <Route path="/matches/:id" element={user ? <MatchDetails /> : <Navigate to="/login" />} />
            <Route path="/standings" element={user ? <Standings /> : <Navigate to="/login" />} />
            <Route path="/stages" element={user ? <StageProgression /> : <Navigate to="/login" />} />
            <Route path="/knockout" element={user ? <Knockout /> : <Navigate to="/login" />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>
        {toast && <Toast message={toast.message} type={toast.type} />}
        
        <footer className="app-footer">
          <p>&copy; 2024 eFootball Tournament Manager | <a href="/contact">Contact Admin</a></p>
        </footer>
      </div>
    </AppContext.Provider>
  )
}

export default App


