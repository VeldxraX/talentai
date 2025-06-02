import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Report.css'

interface FreeReportData {
  archetype: {
    name: string
    description: string
    traits?: string[]
  }
  primaryStrengths: string[]
  topDimension: string
  upgradeMessage: string
  upgradeFeatures: string[]
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
      const token = localStorage.getItem('talentai_token')
      const response = await axios.get(`http://localhost:5000/api/report/free/${resultId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
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
  const formatDimensionName = (dimension: string) => {
    return dimension
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getArchetypeIcon = (archetypeName: string) => {
    const icons: { [key: string]: string } = {
      'The Strategist': '🧠',
      'The Innovator': '💡',
      'The Facilitator': '🤝',
      'The Builder': '🔨',
      'The Researcher': '🔬',
      'The Communicator': '💬',
      'The Analyst': '📊',
      'The Creator': '🎨',
      'The Helper': '❤️',
      'The Maker': '🛠️',
      'The Organizer': '📋',
      'The Visionary': '🔮',
      'The Pioneer': '🚀',
      'The Balanced Learner': '⚖️'
    }
    return icons[archetypeName] || '🌟'
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

      <main className="report-main">        <div className="free-report-content">
          <div className="dominant-intelligence-card">
            <div className="intelligence-icon">
              {getArchetypeIcon(reportData.archetype.name)}
            </div>
            <h2>Your Primary Archetype</h2>
            <h3>{reportData.archetype.name}</h3>
            <p className="intelligence-description">
              {reportData.archetype.description}
            </p>
            
            {reportData.primaryStrengths.length > 0 && (
              <div className="strengths-preview">
                <h4>Your Key Strengths:</h4>
                <ul>
                  {reportData.primaryStrengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="top-dimension">
              <p><strong>Top Dimension:</strong> {formatDimensionName(reportData.topDimension)}</p>
            </div>
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
                  {reportData.upgradeFeatures.map((feature, index) => (
                    <li key={index}>✨ {feature}</li>
                  ))}
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