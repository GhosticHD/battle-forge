import { Link } from "react-router-dom";
import { useAuth } from "../services/firebase";
import "./Home.css";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home">
      <h1 className="home-title">Battle Forge</h1>
      <p className="home-subtitle">
        Создавайте интерактивные карты исторических битв
      </p>

      <div className="home-actions">
        {user ? (
          <>
            <Link to="/create" className="btn btn-primary home-create-btn">
              🗺️ Создать новую битву
            </Link>
            <Link to="/gallery" className="btn btn-secondary">
              👀 Посмотреть галерею
            </Link>
            <Link to="/profile" className="btn btn-secondary">
              👤 Мой профиль
            </Link>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-primary">
              🔐 Войти для создания карт
            </Link>
            <Link to="/gallery" className="btn-secondary">
              👁️ Посмотреть примеры
            </Link>
          </>
        )}
      </div>
        
      <div className="features">
        <div className="feature">
          <span className="feature-ico">🗺️</span>
          <h3> Загружайте свои карты</h3>
          <p>Используйте любые изображения карт в качестве основы</p>
        </div>
        <div className="feature">
        <span className="feature-ico">📍</span>
          <h3> Добавляйте маркеры</h3>
          <p>Размещайте военные и информационные иконки на карте</p>
        </div>
        <div className="feature">
        <span className="feature-ico">📖</span>
          <h3> Создавайте многостраничные битвы</h3>
          <p>Показывайте развитие битвы по этапам</p>
        </div>
      </div>
    </div>
  );
}
