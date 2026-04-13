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
              СОЗДАТЬ КАРТУ <span><img className="circlus-ico" src="./icons/circulus.svg"/></span>
            </Link>
            <Link to="/gallery" className="btn btn-secondary">
              ПОСМОТРЕТЬ КАРТЫ <span><img className="eye-ico" src="./icons/eye-ico.svg"/></span>
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
    </div>
  );
}
