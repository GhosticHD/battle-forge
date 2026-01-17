import { Link } from 'react-router-dom'
import { useAuth } from '../../services/firebase'

export default function Header({ user, onLogout }) {
  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo">
          Battle Forge
        </Link>
        <nav className="nav">
          <Link to="/gallery">Галерея</Link>
          <Link to="/create">Создать</Link>
        </nav>
      </div>
      
      <div className="header-right">
        {user ? (
          <div className="user-menu">
            <span className="user-email">{user.email}</span>
            <button onClick={onLogout} className="logout-button">
              Выйти
            </button>
          </div>
        ) : (
          <Link to="/login" className="login-button">
            Войти
          </Link>
        )}
      </div>
    </header>
  )
}