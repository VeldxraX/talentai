import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './UserResults.css'

interface QuizResult {
  id: string
  dominantIntelligence: string
  dominantHollandType: string
  completedAt: string
  quizType: string
}

function UserResults() {
  const [results, setResults] = useState<QuizResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchUserResults()
  }, [])
  const fetchUserResults = async () => {
    try {
      const token = localStorage.getItem('talentai_token')
      const response = await axios.get('http://localhost:5000/api/user/results', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setResults(response.data.results)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching results:', error)
      setError('Failed to load your results')
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getIntelligenceDisplayName = (intelligence: string) => {
    const names: { [key: string]: string } = {
      'bodily_kinesthetic': 'Bodily-Kinesthetic',
      'logical_mathematical': 'Logical-Mathematical',
      'musical': 'Musical',
      'interpersonal': 'Interpersonal',
      'intrapersonal': 'Intrapersonal',
      'spatial': 'Spatial',
      'linguistic': 'Linguistic',
      'naturalistic': 'Naturalistic'
    }
    return names[intelligence] || intelligence
  }

  const getHollandDisplayName = (holland: string) => {
    const names: { [key: string]: string } = {
      'realistic': 'Realistic (Doer)',
      'investigative': 'Investigative (Thinker)',
      'artistic': 'Artistic (Creator)',
      'social': 'Social (Helper)',
      'enterprising': 'Enterprising (Persuader)',
      'conventional': 'Conventional (Organizer)'
    }
    return names[holland] || holland
  }

  const handleViewResult = (resultId: string) => {
    navigate(`/report/free/${resultId}`)
  }

  const handleTakeNewQuiz = () => {
    navigate('/quiz')
  }

  if (loading) {
    return (
      <div className="user-results-container">
        <div className="loading">Loading your results...</div>
      </div>
    )
  }

  return (
    <div className="user-results-container">
      <header className="results-header">
        <button onClick={() => navigate('/home')} className="back-button">
          ← Back to Home
        </button>
        <h1>Your Results</h1>
        <button onClick={handleTakeNewQuiz} className="new-quiz-button">
          Take New Quiz
        </button>
      </header>

      <main className="results-main">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {results.length === 0 ? (
          <div className="no-results">
            <h2>No Results Yet</h2>
            <p>You haven't taken any assessments yet. Take your first quiz to discover your talents!</p>
            <button onClick={handleTakeNewQuiz} className="cta-button">
              Take Your First Quiz
            </button>
          </div>
        ) : (
          <div className="results-grid">
            {results.map((result) => (
              <div key={result.id} className="result-card">
                <div className="result-header">
                  <h3>Assessment Results</h3>
                  <span className="result-date">{formatDate(result.completedAt)}</span>
                </div>
                
                <div className="result-content">
                  <div className="intelligence-result">
                    <h4>Dominant Intelligence</h4>
                    <p className="intelligence-name">
                      {getIntelligenceDisplayName(result.dominantIntelligence)}
                    </p>
                  </div>
                  
                  <div className="holland-result">
                    <h4>Career Type</h4>
                    <p className="holland-name">
                      {getHollandDisplayName(result.dominantHollandType)}
                    </p>
                  </div>
                </div>
                
                <div className="result-actions">
                  <button 
                    onClick={() => handleViewResult(result.id)} 
                    className="view-button"
                  >
                    View Full Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default UserResults
