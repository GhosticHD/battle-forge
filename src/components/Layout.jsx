import { Outlet } from 'react-router-dom'
import Header from './UI/Header'
import { useAuth } from '../services/firebase'

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="app-container">
      <Header user={user} onLogout={logout} />
      <div className="main-content">
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  )
}