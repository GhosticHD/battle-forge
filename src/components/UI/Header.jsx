import { Link } from "react-router-dom";
import { useAuth } from "../../services/firebase";

export default function Header({ user, onLogout }) {
  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo">
          Battle Forge
        </Link>
        <nav className="nav">
          <Link to="/gallery">Галерея</Link>
          <Link className="header-nav-create-btn" to="/create">Создать</Link>
        </nav>
      </div>

      <div className="header-right">
        {user ? (
          <div className="user-menu">
            <span className="user-profile">
              <Link to="/profile" className="user-profile-btn">
                👤 Мой профиль
              </Link>
              <button onClick={onLogout} className="logout-button">
                Выйти
              </button>
            </span>
          </div>
        ) : (
          <Link to="/login" className="login-button">
            Войти
          </Link>
        )}
      </div>
    </header>
  );
}
