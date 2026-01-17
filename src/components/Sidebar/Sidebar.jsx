import { useState, useEffect } from 'react'
import './Sidebar.css'

export default function Sidebar({ battleData = null, isEditing = false, onUpdate = null }) {
  const [localBattleInfo, setLocalBattleInfo] = useState({
    title: 'Бородинское сражение',
    description: 'Крупнейшее сражение Отечественной войны 1812 года',
    date: '7 сентября 1812',
    stats: {
      forces: '135 тыс. vs 150 тыс.',
      losses: '45 тыс. vs 58 тыс.',
      commanders: 'Кутузов vs Наполеон',
      duration: '15 часов'
    },
    pages: [
      { id: 1, title: 'Начало битвы', description: 'Французские войска атакуют' },
      { id: 2, title: 'Переправа через реку', description: 'Конница переходит реку' }
    ]
  })

  useEffect(() => {
    if (battleData) {
      setLocalBattleInfo({
        title: battleData.title || 'Название битвы',
        description: battleData.description || 'Описание битвы',
        date: battleData.date || new Date().toLocaleDateString(),
        stats: battleData.stats || {
          forces: '',
          losses: '',
          commanders: '',
          duration: ''
        },
        pages: battleData.pages || []
      })
    }
  }, [battleData])

  const handleChange = (field, value) => {
    if (!isEditing || !onUpdate) return
    
    const updated = { ...localBattleInfo, [field]: value }
    setLocalBattleInfo(updated)
    onUpdate(updated)
  }

  const handleStatsChange = (field, value) => {
    if (!isEditing || !onUpdate) return
    
    const updated = { 
      ...localBattleInfo, 
      stats: { ...localBattleInfo.stats, [field]: value } 
    }
    setLocalBattleInfo(updated)
    onUpdate(updated)
  }

  const handlePageChange = (pageIndex, field, value) => {
    if (!isEditing || !onUpdate) return
    
    const updatedPages = [...localBattleInfo.pages]
    updatedPages[pageIndex] = { ...updatedPages[pageIndex], [field]: value }
    
    const updated = { ...localBattleInfo, pages: updatedPages }
    setLocalBattleInfo(updated)
    onUpdate(updated)
  }

  return (
    <div className="sidebar">
      {isEditing ? (
        <>
          <div className="sidebar-section">
            <input
              type="text"
              className="sidebar-input title-input"
              value={localBattleInfo.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Название битвы"
            />
            <input
              type="text"
              className="sidebar-input date-input"
              value={localBattleInfo.date}
              onChange={(e) => handleChange('date', e.target.value)}
              placeholder="Дата битвы"
            />
            <textarea
              className="sidebar-textarea"
              value={localBattleInfo.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Описание битвы"
              rows={3}
            />
          </div>
        </>
      ) : (
        <>
          <div className="battle-title">
            <h2>{localBattleInfo.title}</h2>
            <p className="battle-date">{localBattleInfo.date}</p>
          </div>
          <div className="battle-description">
            <p>{localBattleInfo.description}</p>
          </div>
        </>
      )}
      
      <div className="sidebar-section">
        <h3>Статистика битвы</h3>
        {isEditing ? (
          <div className="stats-edit">
            <div className="stat-edit-row">
              <label>Силы сторон:</label>
              <input
                type="text"
                value={localBattleInfo.stats.forces}
                onChange={(e) => handleStatsChange('forces', e.target.value)}
                placeholder="135 тыс. vs 150 тыс."
              />
            </div>
            <div className="stat-edit-row">
              <label>Потери:</label>
              <input
                type="text"
                value={localBattleInfo.stats.losses}
                onChange={(e) => handleStatsChange('losses', e.target.value)}
                placeholder="45 тыс. vs 58 тыс."
              />
            </div>
            <div className="stat-edit-row">
              <label>Командующие:</label>
              <input
                type="text"
                value={localBattleInfo.stats.commanders}
                onChange={(e) => handleStatsChange('commanders', e.target.value)}
                placeholder="Кутузов vs Наполеон"
              />
            </div>
            <div className="stat-edit-row">
              <label>Длительность:</label>
              <input
                type="text"
                value={localBattleInfo.stats.duration}
                onChange={(e) => handleStatsChange('duration', e.target.value)}
                placeholder="15 часов"
              />
            </div>
          </div>
        ) : (
          <div className="stats-grid">
            {localBattleInfo.stats.forces && (
              <div className="stat-item">
                <span className="stat-label">Силы сторон</span>
                <span className="stat-value">{localBattleInfo.stats.forces}</span>
              </div>
            )}
            {localBattleInfo.stats.losses && (
              <div className="stat-item">
                <span className="stat-label">Потери</span>
                <span className="stat-value">{localBattleInfo.stats.losses}</span>
              </div>
            )}
            {localBattleInfo.stats.commanders && (
              <div className="stat-item">
                <span className="stat-label">Командующие</span>
                <span className="stat-value">{localBattleInfo.stats.commanders}</span>
              </div>
            )}
            {localBattleInfo.stats.duration && (
              <div className="stat-item">
                <span className="stat-label">Длительность</span>
                <span className="stat-value">{localBattleInfo.stats.duration}</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="sidebar-section">
        <h3>Страницы битвы</h3>
        <div className="pages-list">
          {localBattleInfo.pages.map((page, index) => (
            <div key={page.id || index} className="page-item">
              {isEditing ? (
                <div className="page-edit">
                  <input
                    type="text"
                    value={page.title}
                    onChange={(e) => handlePageChange(index, 'title', e.target.value)}
                    placeholder="Название страницы"
                  />
                  <input
                    type="text"
                    value={page.description}
                    onChange={(e) => handlePageChange(index, 'description', e.target.value)}
                    placeholder="Описание страницы"
                  />
                </div>
              ) : (
                <>
                  <h4>{page.title}</h4>
                  <p>{page.description}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}