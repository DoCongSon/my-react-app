import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/Home'
import LoginPage from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route
          path='/'
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
