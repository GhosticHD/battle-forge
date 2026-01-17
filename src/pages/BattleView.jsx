import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import MapEditor from '../components/MapEditor/MapEditor'
import Sidebar from '../components/Sidebar/Sidebar'
import { battleService } from '../services/firebase'
import { useAuth } from '../services/firebase'
import './BattleView.css'

export default function BattleView() {
  const { id } = useParams()
  const { user } = useAuth()
  const [battle, setBattle] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBattle()
  }, [id])

  const loadBattle = async () => {
    try {
      const data = await battleService.getBattle(id)
      setBattle(data)
    } catch (error) {
      console.error('Error loading battle:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Загрузка...</div>
  if (!battle) return <div className="not-found">Битва не найдена</div>

  const isOwner = user && battle.ownerId === user.uid

  return (
    <div className="battle-view-container">
      <div className="battle-header">
        <div className="battle-title-section">
          <h1>{battle.title}</h1>
          <p className="battle-description">{battle.description}</p>
          <div className="battle-meta">
            <span className="meta-item">📅 {battle.date || new Date(battle.createdAt).toLocaleDateString()}</span>
            {isOwner && (
              <Link to={`/battle/${id}/edit`} className="edit-button">
                ✏️ Редактировать
              </Link>
            )}
          </div>
        </div>

        <div className="share-section">
          <h4>🔗 Поделиться:</h4>
          <div className="share-link">
            <input 
              type="text" 
              value={`${window.location.origin}/battle/${id}`}
              readOnly
              className="share-input"
            />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/battle/${id}`)
                alert('Ссылка скопирована!')
              }}
              className="copy-button"
            >
              Копировать
            </button>
          </div>
        </div>
      </div>

      <div className="battle-main-content">
        <div className="battle-content-area">
          {battle.pages && battle.pages.length > 0 && (
            <>
              <div className="pages-tabs">
                {battle.pages.map((page, index) => (
                  <button
                    key={page.id || index}
                    className={`view-page-tab ${currentPage === index ? 'active' : ''}`}
                    onClick={() => setCurrentPage(index)}
                  >
                    {page.title || `Страница ${index + 1}`}
                  </button>
                ))}
              </div>

              <div className="current-page-view">
                <h2>{battle.pages[currentPage].title}</h2>
                <p className="page-description">{battle.pages[currentPage].description}</p>
                
                <div className="map-container">
                  <MapEditor
                    mapData={battle.pages[currentPage].mapData}
                    onMapChange={() => {}}
                    isEditing={false}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <Sidebar
          battleData={battle}
          isEditing={false}
        />
      </div>
    </div>
  )
}