import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/Home'
import LoginPage from './pages/Login'
import AnalyticsTestPage from './pages/AnalyticsTest'
import ProtectedRoute from './components/ProtectedRoute'
import RouteTracker from './components/RouteTracker'
import './App.css'

const App = () => {
  return (
    <BrowserRouter>
      <RouteTracker />
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
        <Route
          path='/analytics-test'
          element={
            <ProtectedRoute>
              <AnalyticsTestPage />
            </ProtectedRoute>
          }
        />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
