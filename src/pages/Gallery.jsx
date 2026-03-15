import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { userService } from "../services/firebase";

export default function Gallery() {
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBattles();
  }, []);

  const loadBattles = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "battles"));
      const battlesList = [];
      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();

        const user = await userService.getUser(data.ownerId);

        battlesList.push({
          id: docSnap.id,
          ...data,
          author: user?.nickname || "Unknown",
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
      <h1>Галерея битв</h1>

      <div className="battles-grid">
        {battles.map((battle) => (
          <div key={battle.id} className="battle-card">
            <h3>{battle.title}</h3>
            <p>{battle.description}</p>
            <div className="battle-stats">
              <span>Страниц: {battle.pages?.length || 0}</span>
              <span>
                Обновлено: {new Date(battle.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <Link to={`/battle/${battle.id}`} className="view-button">
              Посмотреть
            </Link>
            <p className="battle-author">Автор: {battle.author}</p>
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
