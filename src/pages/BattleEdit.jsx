import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MapEditor from '../components/MapEditor/MapEditor'
import Sidebar from '../components/Sidebar/Sidebar'
import { battleService } from '../services/firebase'
import { useAuth } from '../services/firebase'
import './BattleEdit.css'

export default function BattleEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [pages, setPages] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [battleInfo, setBattleInfo] = useState({
  title: 'Новая битва',
  description: 'Описание битвы',
  date: new Date().toLocaleDateString(),
  stats: {
    forces: '',
    losses: '',
    commanders: '',
    duration: ''
  }
    })
  const [loading, setLoading] = useState(!!id)

  

  useEffect(() => {
    if (id) {
      loadBattle()
    } else {
      // Создаем новую битву с одной страницей по умолчанию
      setPages([{
        id: 1,
        title: 'Страница 1',
        description: 'Начало битвы',
        mapData: { markers: [] }
      }])
      setLoading(false)
    }
  }, [id])

  const loadBattle = async () => {
  try {
    const data = await battleService.getBattle(id)
    if (data) {
      setBattleInfo({
        title: data.title || 'Новая битва',
        description: data.description || 'Описание битвы',
        date: data.date || new Date().toLocaleDateString(),
        stats: data.stats || {
          forces: '',
          losses: '',
          commanders: '',
          duration: ''
        }
      })
      setPages(data.pages || [{
        id: 1,
        title: 'Страница 1',
        description: 'Начало битвы',
        mapData: { markers: [] }
      }])
    }
  } catch (error) {
    console.error('Error loading battle:', error)
  } finally {
    setLoading(false)
  }
}

  const handleSave = async () => {
    try {
      const battleData = {
        title: battleInfo.title,
        description: battleInfo.description,
        date: battleInfo.date,
        stats: battleInfo.stats,
        pages: pages,
        ownerId: user.uid
      }

      if (id) battleData.id = id

      const battleId = await battleService.saveBattle(battleData, user.uid)
      navigate(`/battle/${battleId}`)
    } catch (error) {
      console.error('Error saving battle:', error)
      alert('Ошибка сохранения: ' + error.message)
    }
  }

  const handlePageUpdate = (pageIndex, updatedPage) => {
    const newPages = [...pages]
    newPages[pageIndex] = updatedPage
    setPages(newPages)
  }

  const handleBattleInfoUpdate = (updatedInfo) => {
    setBattleInfo(updatedInfo)
  }

  if (loading) return <div className="loading">Загрузка...</div>

  return (
    <div className="battle-edit-container">
      <div className="edit-header">
        <h1>Редактирование битвы</h1>
        <div className="edit-actions">
          <button onClick={handleSave} className="save-button">
            💾 Сохранить
          </button>
          <button onClick={() => navigate(-1)} className="cancel-button">
            Отмена
          </button>
        </div>
      </div>

      <div className="pages-navigation">
        {pages.map((page, index) => (
          <button
            key={page.id || index}
            className={`page-tab ${currentPage === index ? 'active' : ''}`}
            onClick={() => setCurrentPage(index)}
          >
            {page.title || `Страница ${index + 1}`}
            <span 
              className="delete-page"
              onClick={(e) => {
                e.stopPropagation()
                if (pages.length > 1) {
                  const newPages = pages.filter((_, i) => i !== index)
                  setPages(newPages)
                  if (currentPage >= newPages.length) {
                    setCurrentPage(newPages.length - 1)
                  }
                }
              }}
            >
              ×
            </span>
          </button>
        ))}
        <button 
          onClick={() => {
            setPages([...pages, {
              id: Date.now(),
              title: `Страница ${pages.length + 1}`,
              description: '',
              mapData: { markers: [] }
            }])
            setCurrentPage(pages.length)
          }}
          className="add-page-button"
        >
          + Добавить страницу
        </button>
      </div>

      <div className="edit-main-content">
        <div className="page-editor-area">
          <div className="page-info-editor">
            <input
              type="text"
              value={pages[currentPage]?.title || ''}
              onChange={(e) => {
                const newPages = [...pages]
                newPages[currentPage].title = e.target.value
                setPages(newPages)
              }}
              placeholder="Название страницы"
              className="page-title-input"
            />
            <textarea
              value={pages[currentPage]?.description || ''}
              onChange={(e) => {
                const newPages = [...pages]
                newPages[currentPage].description = e.target.value
                setPages(newPages)
              }}
              placeholder="Описание страницы"
              className="page-description-input"
            />
          </div>
          
          <MapEditor
            mapData={pages[currentPage]?.mapData || { markers: [] }}
            onMapChange={(newMapData) => {
              const newPages = [...pages]
              newPages[currentPage].mapData = newMapData
              setPages(newPages)
            }}
            isEditing={true}
          />
        </div>

        <Sidebar
          battleData={battleInfo}
          isEditing={true}
          onUpdate={handleBattleInfoUpdate}
        />
      </div>
    </div>
  )
}