import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './services/firebase'
import Home from './pages/Home'
import BattleView from './pages/BattleView'
import BattleEdit from './pages/BattleEdit'
import Gallery from './pages/Gallery'
import Login from './pages/Login'
import Layout from './components/Layout'

// Компонент для защищенных маршрутов
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="battle/:id" element={<BattleView />} />
            <Route path="battle/:id/edit" element={
              <PrivateRoute>
                <BattleEdit />
              </PrivateRoute>
            } />
            <Route path="create" element={
              <PrivateRoute>
                <BattleEdit />
              </PrivateRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App