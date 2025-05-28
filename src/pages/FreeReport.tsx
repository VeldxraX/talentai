import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Report.css'

interface FreeReportData {
  dominantIntelligence: string
  description: string
  upgradeMessage: string
}

function FreeReport() {
  const { resultId } = useParams<{ resultId: string }>()
  const [reportData, setReportData] = useState<FreeReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (resultId) {
      loadFreeReport()
    }
  }, [resultId])

  const loadFreeReport = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/report/free/${resultId}`)
      setReportData(response.data)
      setLoading(false)
    } catch (error) {
      setError('Failed to load report')
      setLoading(false)
    }
  }

  const handleUpgrade = () => {
    navigate(`/report/premium/${resultId}`)
  }

  const formatIntelligenceName = (intelligence: string) => {
    return intelligence
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getIntelligenceIcon = (intelligence: string) => {
    const icons: { [key: string]: string } = {
      bodily_kinesthetic: '🏃‍♂️',
      logical_mathematical: '🧮',
      musical: '🎵',
      interpersonal: '👥',
      intrapersonal: '🧘‍♀️',
      spatial: '🎨',
      linguistic: '📚',
      naturalistic: '🌿'
    }
    return icons[intelligence] || '🧠'
  }

  if (loading) {
    return (
      <div className="report-container">
        <div className="loading">Loading your results...</div>
      </div>
    )
  }

  if (error || !reportData) {
    return (
      <div className="report-container">
        <div className="error">{error || 'Report not found'}</div>
      </div>
    )
  }

  return (
    <div className="report-container">
      <header className="report-header">
        <h1>Your TalentAI Results</h1>
        <p>Free Report - Limited Preview</p>
      </header>

      <main className="report-main">
        <div className="free-report-content">
          <div className="dominant-intelligence-card">
            <div className="intelligence-icon">
              {getIntelligenceIcon(reportData.dominantIntelligence)}
            </div>
            <h2>Your Dominant Intelligence</h2>
            <h3>{formatIntelligenceName(reportData.dominantIntelligence)}</h3>
            <p className="intelligence-description">
              {reportData.description}
            </p>
          </div>

          <div className="upgrade-section">
            <div className="upgrade-card">
              <h3>🔒 Unlock Your Full Potential</h3>
              <p className="upgrade-message">
                {reportData.upgradeMessage}
              </p>
              
              <div className="premium-features">
                <h4>Get the Premium Report to see:</h4>
                <ul>
                  <li>✨ Complete breakdown of all 8 intelligences</li>
                  <li>📊 Interactive radar chart visualization</li>
                  <li>🎯 Holland Career Type analysis</li>
                  <li>💼 Personalized career recommendations</li>
                  <li>🤖 AI skill learning paths matched to your profile</li>
                  <li>📄 Downloadable PDF report</li>
                </ul>
              </div>

              <button onClick={handleUpgrade} className="upgrade-button">
                🚀 Upgrade to Premium Report
              </button>
              
              <p className="demo-note">
                <em>For demo purposes, click above to see the premium version!</em>
              </p>
            </div>
          </div>
        </div>

        <div className="report-actions">
          <button 
            onClick={() => navigate('/home')} 
            className="secondary-button"
          >
            Back to Home
          </button>
          
          <button 
            onClick={() => navigate('/quiz')} 
            className="secondary-button"
          >
            Take Quiz Again
          </button>
        </div>
      </main>
    </div>
  )
}

export default FreeReport