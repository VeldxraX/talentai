import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import './Report.css'

interface PremiumReportData {
  scores: {
    intelligences: { [key: string]: number }
    holland: { [key: string]: number }
  }
  dominantIntelligence: string
  dominantHollandType: string
  careerRecommendations: string[]
  aiLearningPaths: string[]
  completedAt: string
}

function PremiumReport() {
  const { resultId } = useParams<{ resultId: string }>()
  const [reportData, setReportData] = useState<PremiumReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (resultId) {
      loadPremiumReport()
    }
  }, [resultId])

  const loadPremiumReport = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/report/premium/${resultId}`)
      setReportData(response.data)
      setLoading(false)
    } catch (error) {
      setError('Failed to load premium report')
      setLoading(false)
    }
  }

  const formatIntelligenceName = (intelligence: string) => {
    return intelligence
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatHollandName = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
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

  const getHollandIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      realistic: '🔧',
      investigative: '🔬',
      artistic: '🎭',
      social: '👥',
      enterprising: '💼',
      conventional: '📊'
    }
    return icons[type] || '💭'
  }

  if (loading) {
    return (
      <div className="report-container">
        <div className="loading">Loading your premium report...</div>
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

  // Prepare data for radar chart
  const intelligenceData = Object.entries(reportData.scores.intelligences).map(([key, value]) => ({
    intelligence: formatIntelligenceName(key),
    score: value,
    fullMark: 15 // Max possible score for 3 questions * 5 points
  }))

  // Prepare data for Holland types bar chart
  const hollandData = Object.entries(reportData.scores.holland).map(([key, value]) => ({
    type: formatHollandName(key),
    score: value
  }))

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="report-container premium">
      <header className="report-header">
        <h1>Your Complete TalentAI Report</h1>
        <p className="premium-badge">Premium Analysis</p>
        <button onClick={handlePrint} className="print-button">
          🖨️ Print Report
        </button>
      </header>

      <main className="report-main">
        <div className="premium-report-content">
          
          {/* Executive Summary */}
          <section className="summary-section">
            <h2>Executive Summary</h2>
            <div className="summary-cards">
              <div className="summary-card dominant">
                <div className="card-icon">
                  {getIntelligenceIcon(reportData.dominantIntelligence)}
                </div>
                <h3>Dominant Intelligence</h3>
                <p>{formatIntelligenceName(reportData.dominantIntelligence)}</p>
              </div>
              
              <div className="summary-card holland">
                <div className="card-icon">
                  {getHollandIcon(reportData.dominantHollandType)}
                </div>
                <h3>Career Type</h3>
                <p>{formatHollandName(reportData.dominantHollandType)}</p>
              </div>
            </div>
          </section>

          {/* Multiple Intelligences Radar Chart */}
          <section className="chart-section">
            <h2>Multiple Intelligences Profile</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={intelligenceData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="intelligence" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 15]} 
                    tick={{ fontSize: 10 }}
                  />
                  <Radar
                    name="Intelligence Score"
                    dataKey="score"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="intelligence-breakdown">
              <h3>Intelligence Breakdown</h3>
              <div className="intelligence-grid">
                {Object.entries(reportData.scores.intelligences).map(([key, value]) => (
                  <div key={key} className="intelligence-item">
                    <span className="intelligence-icon">{getIntelligenceIcon(key)}</span>
                    <span className="intelligence-name">{formatIntelligenceName(key)}</span>
                    <span className="intelligence-score">{value}/15</span>
                    <div className="score-bar">
                      <div 
                        className="score-fill" 
                        style={{ width: `${(value / 15) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Holland Career Types */}
          <section className="chart-section">
            <h2>Holland Career Interest Types</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hollandData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Career Recommendations */}
          <section className="recommendations-section">
            <h2>Career Recommendations</h2>
            <p className="section-description">
              Based on your {formatHollandName(reportData.dominantHollandType)} career type, here are careers that align with your interests:
            </p>
            <div className="recommendations-grid">
              {reportData.careerRecommendations.map((career, index) => (
                <div key={index} className="recommendation-card">
                  <span className="career-icon">💼</span>
                  <span className="career-name">{career}</span>
                </div>
              ))}
            </div>
          </section>

          {/* AI Learning Paths */}
          <section className="ai-paths-section">
            <h2>AI Learning Paths</h2>
            <p className="section-description">
              Leverage your {formatIntelligenceName(reportData.dominantIntelligence)} intelligence with these AI-powered skills:
            </p>
            <div className="ai-paths-grid">
              {reportData.aiLearningPaths.map((path, index) => (
                <div key={index} className="ai-path-card">
                  <span className="ai-icon">🤖</span>
                  <span className="path-name">{path}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Next Steps */}
          <section className="next-steps-section">
            <h2>Your Next Steps</h2>
            <div className="steps-grid">
              <div className="step-card">
                <h4>1. Explore Careers</h4>
                <p>Research the recommended careers that match your profile and interests.</p>
              </div>
              <div className="step-card">
                <h4>2. Develop Skills</h4>
                <p>Start learning the AI skills that align with your dominant intelligence.</p>
              </div>
              <div className="step-card">
                <h4>3. Build Portfolio</h4>
                <p>Create projects that showcase your unique combination of talents.</p>
              </div>
              <div className="step-card">
                <h4>4. Network</h4>
                <p>Connect with professionals in your recommended career fields.</p>
              </div>
            </div>
          </section>
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
          
          <button 
            onClick={handlePrint} 
            className="primary-button"
          >
            📄 Download PDF
          </button>
        </div>
      </main>
    </div>
  )
}

export default PremiumReport