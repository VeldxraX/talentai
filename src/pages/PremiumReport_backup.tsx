import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import './Report.css'

interface Archetype {
  name: string
  description: string
  strengths: string[]
  weaknesses: string[]
  score: number
}

interface SkillRoadmap {
  skill: string
  why: string
  weeks: {
    week: number
    title: string
    tasks: string[]
  }[]
  resources: {
    title: string
    url: string
    type: string
  }[]
}

interface PremiumReportData {
  scores: {
    dimensions: { [key: string]: number }
    archetype: {
      name: string
      description: string
      traits?: string[]
    }
    holland: {
      primary: string
      secondary: string
      tertiary: string
      code: string
      scores: { [key: string]: number }
    }
    mbti: {
      type: string
      traits: {
        EI: string
        SN: string
        TF: string
        JP: string
      }
      scores: {
        EI: number
        SN: number
        TF: number
        JP: number
      }
    }
    futureBuckets: string[]
  }
  topTwoArchetypes: Archetype[]
  careerRecommendations: Array<{
    title: string
    description: string
    salary: string
    pathway: string
  }>
  topFutureBuckets: Array<{
    name: string
    rationale: string
    score: number
  }>
  aiSkillRoadmap: SkillRoadmap[]
  completedAt: string
  insights: {
    topStrengths: Array<{
      dimension: string
      score: number
      description: string
    }>
    developmentAreas: Array<{
      dimension: string
      score: number
      suggestion: string
    }>
  }
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
      const token = localStorage.getItem('talentai_token')
      const response = await axios.get(`http://localhost:5000/api/report/premium/${resultId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setReportData(response.data)
      setLoading(false)
    } catch (error) {
      setError('Failed to load premium report')
      setLoading(false)
    }
  }

  const formatDimensionName = (dimension: string) => {
    return dimension
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatHollandName = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const getDimensionIcon = (dimension: string) => {
    const icons: { [key: string]: string } = {
      analytical: '🧠',
      creative_visual: '🎨',
      empathetic: '❤️',
      physical: '🏃‍♂️',
      verbal: '💬',
      systematic: '📋',
      future_forward: '🔮',
      independent: '🚀'
    }
    return icons[dimension] || '⭐'
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

  const getMBTIColor = (trait: string) => {
    const colors: { [key: string]: string } = {
      'E': '#FF6B6B', 'I': '#4ECDC4',
      'S': '#45B7D1', 'N': '#96CEB4',
      'T': '#FECA57', 'F': '#FF9FF3',
      'J': '#54A0FF', 'P': '#5F27CD'
    }
    return colors[trait] || '#666'
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
  const dimensionData = Object.entries(reportData.scores.dimensions).map(([key, value]) => ({
    dimension: formatDimensionName(key),
    score: value,
    fullMark: 100
  }))

  // Prepare data for Holland types bar chart
  const hollandData = Object.entries(reportData.scores.holland.scores).map(([key, value]) => ({
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
              <div className="summary-card archetype">
                <div className="card-icon">
                  {getArchetypeIcon(reportData.scores.archetype.name)}
                </div>
                <h3>Your Archetype</h3>
                <p>{reportData.scores.archetype.name}</p>
                <span className="archetype-description">{reportData.scores.archetype.description}</span>
              </div>
              
              <div className="summary-card holland">
                <div className="card-icon">
                  {getHollandIcon(reportData.scores.holland.primary)}
                </div>
                <h3>Career Type</h3>
                <p>{formatHollandName(reportData.scores.holland.primary)}</p>
                <span className="secondary-type">Secondary: {formatHollandName(reportData.scores.holland.secondary)}</span>
              </div>

              <div className="summary-card mbti">
                <div className="card-icon">🧬</div>
                <h3>MBTI Teaser</h3>
                <p>{reportData.scores.mbti.type}</p>
                <div className="mbti-traits">
                  {Object.entries(reportData.scores.mbti.traits).map(([key, value]) => (
                    <span key={key} className="mbti-trait" style={{ backgroundColor: getMBTIColor(value) }}>
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Dimensional Analysis Radar Chart */}
          <section className="chart-section">
            <h2>8-Dimensional Profile</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={dimensionData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10 }}
                  />
                  <Radar
                    name="Dimension Score"
                    dataKey="score"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="dimension-breakdown">
              <h3>Dimensional Breakdown</h3>
              <div className="dimension-grid">
                {Object.entries(reportData.scores.dimensions).map(([key, value]) => (
                  <div key={key} className="dimension-item">
                    <span className="dimension-icon">{getDimensionIcon(key)}</span>
                    <span className="dimension-name">{formatDimensionName(key)}</span>
                    <span className="dimension-score">{value}%</span>
                    <div className="score-bar">
                      <div 
                        className="score-fill" 
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Top Strengths & Development Areas */}
          <section className="insights-section">
            <div className="insights-grid">
              <div className="strengths-card">
                <h3>🌟 Top Strengths</h3>
                <div className="insights-list">
                  {reportData.insights.topStrengths.map((strength, index) => (
                    <div key={index} className="insight-item">
                      <div className="insight-header">
                        <span className="insight-icon">{getDimensionIcon(strength.dimension)}</span>
                        <span className="insight-dimension">{formatDimensionName(strength.dimension)}</span>
                        <span className="insight-score">{strength.score}%</span>
                      </div>
                      <p className="insight-description">{strength.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="development-card">
                <h3>🎯 Development Areas</h3>
                <div className="insights-list">
                  {reportData.insights.developmentAreas.map((area, index) => (
                    <div key={index} className="insight-item">
                      <div className="insight-header">
                        <span className="insight-icon">{getDimensionIcon(area.dimension)}</span>
                        <span className="insight-dimension">{formatDimensionName(area.dimension)}</span>
                        <span className="insight-score">{area.score}%</span>
                      </div>
                      <p className="insight-description">{area.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Holland Career Types */}
          <section className="chart-section">
            <h2>Holland Career Interest Profile</h2>
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

          {/* Future Buckets */}
          <section className="future-buckets-section">
            <h2>🔮 Future-Ready Career Buckets</h2>
            <p className="section-description">
              Based on your dimensional profile, these emerging career areas align with your strengths:
            </p>
            <div className="buckets-grid">
              {reportData.scores.futureBuckets.map((bucket, index) => (
                <div key={index} className="bucket-card">
                  <span className="bucket-icon">🚀</span>
                  <span className="bucket-name">{bucket}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Career Recommendations */}
          <section className="recommendations-section">
            <h2>💼 Career Recommendations</h2>
            <p className="section-description">
              Careers that align with your {reportData.scores.archetype.name} archetype and {formatHollandName(reportData.scores.holland.primary)} career type:
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

          {/* Personalized Learning Paths */}
          <section className="learning-paths-section">
            <h2>🤖 Personalized AI Learning Paths</h2>
            <p className="section-description">
              Leverage your dimensional strengths with these AI-powered skill development paths:
            </p>
            <div className="learning-paths-grid">
              {reportData.personalizedLearningPaths.map((path, index) => (
                <div key={index} className="learning-path-card">
                  <span className="path-icon">🤖</span>
                  <span className="path-name">{path}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Archetype Traits */}
          {reportData.scores.archetype.traits && (
            <section className="archetype-traits-section">
              <h2>🌟 Your Archetype Traits</h2>
              <div className="traits-grid">
                {reportData.scores.archetype.traits.map((trait, index) => (
                  <div key={index} className="trait-card">
                    <span className="trait-icon">✨</span>
                    <span className="trait-text">{trait}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Next Steps */}
          <section className="next-steps-section">
            <h2>🎯 Your Next Steps</h2>
            <div className="steps-grid">
              <div className="step-card">
                <h4>1. Leverage Strengths</h4>
                <p>Focus on developing your top dimensional strengths further through targeted practice and learning.</p>
              </div>
              <div className="step-card">
                <h4>2. Address Development Areas</h4>
                <p>Work on the suggested improvements for your development dimensions to create a more balanced profile.</p>
              </div>
              <div className="step-card">
                <h4>3. Explore Future Buckets</h4>
                <p>Research emerging opportunities in your aligned future-ready career buckets.</p>
              </div>
              <div className="step-card">
                <h4>4. Start Learning</h4>
                <p>Begin with your personalized AI learning paths to stay ahead in the evolving job market.</p>
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