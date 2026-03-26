import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db, userService } from "../services/firebase";
import { useLocation } from "react-router-dom";

export default function Gallery() {
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("updatedAt"); // default сортировка
  const location = useLocation();

  useEffect(() => {
    loadBattles(sortBy);
  }, [sortBy, location.pathname]);

  const loadBattles = async (sortField) => {
    setLoading(true);
    try {
      const q = query(collection(db, "battles"), orderBy(sortField, "desc"));
      const querySnapshot = await getDocs(q);
      const battlesList = [];

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        const user = await userService.getUser(data.ownerId);

        battlesList.push({
          id: docSnap.id,
          ...data,
          author: user?.nickname || "Unknown",
          authorAvatar: user?.avatar || "../../../icons/default-avatar.png",
          likesCount: data.likes || 0,
          viewsCount: data.views || 0,
        });
      }

      setBattles(battlesList);
    } catch (error) {
      console.error("Error loading battles:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Загрузка галереи...</div>;

  return (
    <div className="gallery">
      <h1 className="gallery-title">Галерея карт</h1>

      <div className="battles-grid">
        {battles.map((battle) => (
          <div key={battle.id} className="battle-card">
            <h3 className="gallery-battle-card-title">{battle.title}</h3>
            <p className="gallery-battle-card-desc">{battle.description}</p>

            <div className="battle-stats">
              <span className="gallery-stats-pages">
                Страниц: {battle.pages?.length || 0}
              </span>
              <span className="gallery-stats-countly">
                <span className="gallery-stats-likes">
                  ❤️ {battle.likesCount}
                </span>
                <span className="gallery-stats-views">
                  👁 {battle.viewsCount}
                </span>
              </span>
            </div>

            <div className="gallery-battle-card-bottom">
              <Link to={`/battle/${battle.id}`} className="view-button">
                Посмотреть
              </Link>
              <div className="battle-author">
                <img
                  src={battle.authorAvatar}
                  alt={battle.author}
                  className="author-avatar"
                />
                <span className="author-name">{battle.author}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {battles.length === 0 && (
        <div className="empty-gallery">
          <p>Пока нет созданных битв. Будьте первым!</p>
          <Link to="/create" className="btn-primary">
            Создать битву
          </Link>
        </div>
      )}
    </div>
  );
}
