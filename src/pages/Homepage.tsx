import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Homepage.css'

function Homepage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleStartQuiz = () => {
    navigate('/quiz')
  }

  const handleUpgrade = () => {
    // For now, just start the quiz - in a real app this would handle payment
    alert('Upgrade feature coming soon! For now, take the free test and we\'ll show you both versions.')
    navigate('/quiz')
  }

  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <div className="header-content">
          <h1>TalentAI</h1>
          <div className="user-info">
            <span>Welcome, {user?.name || user?.email}!</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <main className="homepage-main">
        <div className="hero-section">
          <h2>Discover Your Unique Talents</h2>
          <p className="hero-subtitle">
            Unlock your potential with science-backed assessments based on Gardner's Multiple Intelligences 
            and Holland's Career Interest Types. Get personalized career guidance and AI learning paths.
          </p>
        </div>

        <div className="options-section">
          <div className="option-card free">
            <div className="card-header">
              <h3>Free Talent Test</h3>
              <span className="price">Free</span>
            </div>
            <div className="card-content">
              <ul className="features-list">
                <li>✓ 36 science-backed questions</li>
                <li>✓ Discover your dominant intelligence</li>
                <li>✓ Basic personality insights</li>
                <li>✓ Get started in 10 minutes</li>
              </ul>
              <button onClick={handleStartQuiz} className="cta-button primary">
                Try Free Test
              </button>
            </div>
          </div>

          <div className="option-card premium">
            <div className="card-header">
              <h3>Full Report</h3>
              <span className="price">$19.99</span>
              <span className="badge">Most Popular</span>
            </div>
            <div className="card-content">
              <ul className="features-list">
                <li>✓ Everything in Free Test</li>
                <li>✓ Complete intelligence breakdown</li>
                <li>✓ Holland career type analysis</li>
                <li>✓ Personalized career recommendations</li>
                <li>✓ AI skill learning paths</li>
                <li>✓ Detailed radar chart visualization</li>
                <li>✓ Printable PDF report</li>
              </ul>
              <button onClick={handleUpgrade} className="cta-button premium">
                Get Full Report
              </button>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>Why TalentAI?</h3>
          <div className="info-grid">
            <div className="info-item">
              <h4>🧠 Science-Based</h4>
              <p>Built on proven psychological theories by Howard Gardner and John Holland</p>
            </div>
            <div className="info-item">
              <h4>🎯 Personalized</h4>
              <p>Get recommendations tailored to your unique intelligence profile</p>
            </div>
            <div className="info-item">
              <h4>🚀 Future-Ready</h4>
              <p>Learn which AI skills match your natural talents and interests</p>
            </div>
            <div className="info-item">
              <h4>⚡ Quick & Easy</h4>
              <p>Complete assessment in just 10-15 minutes</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Homepage