import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthPromptRoute from './components/AuthPromptRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Homepage from './pages/Homepage'
import Quiz from './pages/Quiz'
import FreeReport from './pages/FreeReport'
import PremiumReport from './pages/PremiumReport'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Homepage />} />
            <Route path="/quiz" element={<AuthPromptRoute message="You need to create an account or log in to take the talent test. Would you like to sign up now?"><Quiz /></AuthPromptRoute>} />
            <Route path="/report/free/:resultId" element={<ProtectedRoute><FreeReport /></ProtectedRoute>} />
            <Route path="/report/premium/:resultId" element={<ProtectedRoute><PremiumReport /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

export default App
