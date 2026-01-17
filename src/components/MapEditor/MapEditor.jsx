import { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, ImageOverlay, Marker, Popup, useMapEvents } from 'react-leaflet'
import { Icon, LatLngBounds } from 'leaflet'
import 'leaflet/dist/leaflet.css'

const customIcons = {
  infantry: new Icon({
    iconUrl: '/icons/infantry.svg',
    iconSize: [32, 32]
  }),
  cavalry: new Icon({
    iconUrl: '/icons/cavalry.svg',
    iconSize: [32, 32]
  }),
  artillery: new Icon({
    iconUrl: '/icons/artillery.svg',
    iconSize: [32, 32]
  }),
  info: new Icon({
    iconUrl: '/icons/info.svg',
    iconSize: [32, 32]
  })
}

function AddMarker({ onAddMarker, selectedIcon }) {
  useMapEvents({
    click(e) {
      onAddMarker({
        position: [e.latlng.lat, e.latlng.lng],
        type: selectedIcon,
        title: 'Новая отметка',
        description: 'Описание отметки',
        id: Date.now()
      })
    }
  })
  return null
}

export default function MapEditor({ mapData, onMapChange, isEditing }) {
  const [selectedIcon, setSelectedIcon] = useState('infantry')
  const [uploadedMap, setUploadedMap] = useState(null)
  const [mapBounds, setMapBounds] = useState(new LatLngBounds([0, 0], [100, 100]))
  const [editingMarker, setEditingMarker] = useState(null)
  const fileInputRef = useRef()

  // Загружаем сохраненную карту при монтировании
  useEffect(() => {
    if (mapData?.customMap) {
      setUploadedMap(mapData.customMap.image)
      setMapBounds(new LatLngBounds(
        mapData.customMap.bounds.southWest,
        mapData.customMap.bounds.northEast
      ))
    }
  }, [mapData])

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const imageUrl = event.target.result
          setUploadedMap(imageUrl)
          
          const bounds = new LatLngBounds(
            [0, 0],
            [img.naturalHeight / 100, img.naturalWidth / 100] // Масштабируем для отображения
          )
          setMapBounds(bounds)
          
          // Сохраняем кастомную карту в данные
          onMapChange({
            ...mapData,
            customMap: {
              image: imageUrl,
              bounds: {
                southWest: [0, 0],
                northEast: [img.naturalHeight / 100, img.naturalWidth / 100]
              }
            }
          })
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddMarker = (marker) => {
    if (!isEditing) return
    const newMarkers = [...(mapData?.markers || []), marker]
    onMapChange({ ...mapData, markers: newMarkers })
  }

  const handleUpdateMarker = (index, updatedMarker) => {
    if (!isEditing) return
    const newMarkers = [...(mapData?.markers || [])]
    newMarkers[index] = updatedMarker
    onMapChange({ ...mapData, markers: newMarkers })
    setEditingMarker(null)
  }

  const handleDeleteMarker = (index) => {
    if (!isEditing) return
    const newMarkers = [...(mapData?.markers || [])]
    newMarkers.splice(index, 1)
    onMapChange({ ...mapData, markers: newMarkers })
    setEditingMarker(null)
  }

  return (
    <div className="map-editor">
      {isEditing && (
        <div className="editor-toolbar">
          <div className="toolbar-section">
            <h4>Карта</h4>
            <button 
              onClick={() => fileInputRef.current.click()}
              className="toolbar-btn"
            >
              📁 Загрузить карту
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
          
          <div className="toolbar-section">
            <h4>Иконки</h4>
            <div className="icon-selector">
              {Object.keys(customIcons).map(icon => (
                <button
                  key={icon}
                  className={`icon-btn ${selectedIcon === icon ? 'active' : ''}`}
                  onClick={() => setSelectedIcon(icon)}
                  title={icon}
                >
                  <img src={`/icons/${icon}.png`} alt={icon} width={24} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <MapContainer
        center={mapBounds.getCenter()}
        zoom={5}
        style={{ height: '600px', width: '100%' }}
        bounds={uploadedMap ? mapBounds : null}
      >
        {uploadedMap ? (
          <ImageOverlay 
            url={uploadedMap} 
            bounds={mapBounds}
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        
        {mapData?.markers?.map((marker, index) => (
          <Marker
            key={marker.id || index}
            position={marker.position}
            icon={customIcons[marker.type]}
            draggable={isEditing}
            eventHandlers={{
              click: () => {
                if (isEditing) {
                  setEditingMarker({ ...marker, index })
                }
              },
              dragend: (e) => {
                if (isEditing) {
                  const newMarker = {
                    ...marker,
                    position: [e.target.getLatLng().lat, e.target.getLatLng().lng]
                  }
                  handleUpdateMarker(index, newMarker)
                }
              }
            }}
          >
            <Popup>
              <div className="marker-popup">
                <h3>{marker.title}</h3>
                <p>{marker.description}</p>
                {isEditing && (
                  <button 
                    onClick={() => setEditingMarker({ ...marker, index })}
                    className="edit-marker-btn"
                  >
                    ✏️ Редактировать
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        
        {isEditing && (
          <AddMarker
            onAddMarker={handleAddMarker}
            selectedIcon={selectedIcon}
          />
        )}
      </MapContainer>

      {/* Модальное окно редактирования маркера */}
      {isEditing && editingMarker && (
        <div className="marker-editor-modal">
          <div className="modal-content">
            <h3>Редактирование маркера</h3>
            <div className="form-group">
              <label>Тип:</label>
              <select
                value={editingMarker.type}
                onChange={(e) => setEditingMarker({...editingMarker, type: e.target.value})}
              >
                {Object.keys(customIcons).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Заголовок:</label>
              <input
                type="text"
                value={editingMarker.title}
                onChange={(e) => setEditingMarker({...editingMarker, title: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Описание:</label>
              <textarea
                value={editingMarker.description}
                onChange={(e) => setEditingMarker({...editingMarker, description: e.target.value})}
                rows={3}
              />
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => handleUpdateMarker(editingMarker.index, editingMarker)}
                className="save-btn"
              >
                Сохранить
              </button>
              <button 
                onClick={() => handleDeleteMarker(editingMarker.index)}
                className="delete-btn"
              >
                Удалить
              </button>
              <button 
                onClick={() => setEditingMarker(null)}
                className="cancel-btn"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}