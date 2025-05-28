import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface AuthPromptRouteProps {
  children: React.ReactNode
  message?: string
}

function AuthPromptRoute({ children, message = "You need to create an account or log in to access this feature. Would you like to sign up now?" }: AuthPromptRouteProps) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  
  React.useEffect(() => {
    if (!isAuthenticated) {
      const shouldRedirect = window.confirm(message)
      if (shouldRedirect) {
        navigate('/register')
      } else {
        navigate('/home')
      }
    }
  }, [isAuthenticated, message, navigate])
  
  if (!isAuthenticated) {
    return null
  }
  
  return <>{children}</>
}

export default AuthPromptRoute
