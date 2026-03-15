import { Link } from "react-router-dom";
import { useAuth } from "../services/firebase";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home">
      <h1>Battle Forge</h1>
      <p className="subtitle">
        Создавайте интерактивные карты исторических битв
      </p>

      <div className="home-actions">
        {user ? (
          <>
            <Link to="/create" className="btn-primary">
              🗺️ Создать новую битву
            </Link>
            <Link to="/gallery" className="btn-secondary">
              👀 Посмотреть галерею
            </Link>
            <Link to="/profile" className="btn-secondary">
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
          <h3>🗺️ Загружайте свои карты</h3>
          <p>Используйте любые изображения карт в качестве основы</p>
        </div>
        <div className="feature">
          <h3>📍 Добавляйте маркеры</h3>
          <p>Размещайте военные и информационные иконки на карте</p>
        </div>
        <div className="feature">
          <h3>📖 Создавайте многостраничные битвы</h3>
          <p>Показывайте развитие битвы по этапам</p>
        </div>
      </div>
    </div>
  );
}
