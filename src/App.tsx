import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { AccountChip } from './components/AccountChip'
import { GamePage } from './pages/GamePage'
import './App.css'

const App = () => {
  return (
    <div className="app-shell">
      <nav className="top-nav" aria-label="Mode">
        <NavLink to="/daily" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Daily
        </NavLink>
        <NavLink to="/unlimited" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Unlimited
        </NavLink>
        <AccountChip />
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/daily" replace />} />
        <Route path="/daily" element={<GamePage mode="daily" />} />
        <Route path="/unlimited" element={<GamePage mode="unlimited" />} />
      </Routes>
    </div>
  )
}

export default App
