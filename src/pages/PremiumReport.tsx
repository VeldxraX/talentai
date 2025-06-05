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
      fetchReportData()
    }
  }, [resultId])

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem('talentai_token')
      const response = await axios.get(`http://localhost:5000/api/report/premium/${resultId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setReportData(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching premium report:', error)
      setError('Failed to load your premium report')
      setLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    // PDF download functionality - would integrate with a PDF generation service
    alert('PDF download feature coming soon!')
  }

  const formatDimensions = () => {
    if (!reportData?.scores.dimensions) return []
    
    return Object.entries(reportData.scores.dimensions).map(([key, value]) => ({
      dimension: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      score: value
    }))
  }

  const formatHollandScores = () => {
    if (!reportData?.scores.holland.scores) return []
    
    const hollandNames = {
      realistic: 'Realistic',
      investigative: 'Investigative', 
      artistic: 'Artistic',
      social: 'Social',
      enterprising: 'Enterprising',
      conventional: 'Conventional'
    }
    
    return Object.entries(reportData.scores.holland.scores).map(([key, value]) => ({
      type: hollandNames[key as keyof typeof hollandNames] || key,
      score: value
    }))
  }

  const formatMBTIScores = () => {
    if (!reportData?.scores.mbti.scores) return []
    
    const mbtiLabels = {
      EI: 'Extraversion vs Introversion',
      SN: 'Sensing vs Intuition',
      TF: 'Thinking vs Feeling',
      JP: 'Judging vs Perceiving'
    }
    
    return Object.entries(reportData.scores.mbti.scores).map(([key, value]) => ({
      dimension: mbtiLabels[key as keyof typeof mbtiLabels] || key,
      score: value,
      preference: reportData.scores.mbti.traits[key as keyof typeof reportData.scores.mbti.traits]
    }))
  }

  const getHollandCodeExplanation = (code: string) => {
    const explanations = {
      'RIA': 'You thrive in hands-on, investigative, and creative environments. Consider careers in engineering design, research and development, or technical arts.',
      'IAS': 'You excel in analytical, creative, and people-oriented work. Perfect for roles in behavioral research, user experience design, or educational technology.',
      'ASE': 'You combine creativity with social impact and leadership. Ideal for careers in social entrepreneurship, creative direction, or community development.',
      'SEC': 'You excel at helping others through organized, systematic approaches. Great for healthcare administration, educational leadership, or social services management.',
      'ECR': 'You combine leadership with practical implementation and hands-on problem solving. Perfect for operations management, project leadership, or technical consulting.',
      'CRI': 'You bring structure to complex problems through systematic analysis. Ideal for data science, quality assurance, or technical project management.'
    }
    
    return explanations[code] || `Your ${code} profile suggests a unique combination of interests across multiple career clusters. This versatility opens doors to interdisciplinary roles and emerging career paths.`
  }
  const getMBTIDichotomyExplanation = (dimension: string) => {
    const explanations: { [key: string]: string } = {
      'Extraversion vs Introversion': 'How you direct and receive energy - externally through people and activities, or internally through reflection and ideas.',
      'Sensing vs Intuition': 'How you take in information - through concrete facts and details, or through patterns and possibilities.',
      'Thinking vs Feeling': 'How you make decisions - through logical analysis and objective criteria, or through personal values and impact on people.',
      'Judging vs Perceiving': 'How you approach the outside world - through planned structure and closure, or through flexibility and spontaneity.'
    }
    
    return explanations[dimension] || ''
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
        <button onClick={() => navigate('/home')} className="back-button">
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <div className="report-container premium">
      <header className="report-header">
        <button onClick={() => navigate('/home')} className="back-button">
          ← Back to Home
        </button>
        <h1>Your Premium TalentAI Report</h1>
        <button onClick={handleDownloadPDF} className="download-pdf-btn">
          Download PDF
        </button>
      </header>

      <main className="report-content">
        {/* Top Two Archetypes Section */}
        <section className="archetypes-section">
          <h2>Your Top Two Archetypes</h2>
          <div className="archetypes-grid">
            {reportData.topTwoArchetypes?.map((archetype, index) => (
              <div key={index} className="archetype-card">
                <h3>{archetype.name}</h3>
                <p className="archetype-description">{archetype.description}</p>
                
                <div className="strengths-weaknesses">
                  <div className="strengths">
                    <h4>💪 Strengths</h4>
                    <ul>
                      {archetype.strengths.map((strength, idx) => (
                        <li key={idx}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="weaknesses">
                    <h4>⚠️ Growth Areas</h4>
                    <ul>
                      {archetype.weaknesses.map((weakness, idx) => (
                        <li key={idx}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {reportData.topTwoArchetypes?.length >= 2 && (
            <div className="archetype-interaction">
              <h3>How Your Archetypes Work Together</h3>
              <p>
                Your combination of {reportData.topTwoArchetypes[0].name} and {reportData.topTwoArchetypes[1].name} creates a unique professional profile. 
                This dual nature allows you to excel in roles that require both {reportData.topTwoArchetypes[0].name.toLowerCase()} capabilities and {reportData.topTwoArchetypes[1].name.toLowerCase()} skills. 
                You can leverage the strengths of both archetypes while being mindful of potential conflicts between their different approaches to work and problem-solving.
              </p>
            </div>
          )}
        </section>

        {/* Eight Dimensions Radar Chart */}
        <section className="dimensions-section">
          <h2>Your 8 Dimensional Profile</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={formatDimensions()}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar 
                  name="Score" 
                  dataKey="score" 
                  stroke="#667eea" 
                  fill="#667eea" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Holland Profile Section */}
        <section className="holland-section">
          <h2>Your Complete Holland Profile (RIASEC)</h2>
          
          <div className="holland-overview">
            <div className="holland-code">
              <h3>Your Holland Code: {reportData.scores.holland.code}</h3>
              <p>{getHollandCodeExplanation(reportData.scores.holland.code)}</p>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={formatHollandScores()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#764ba2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* MBTI Profile Section */}
        <section className="mbti-section">
          <h2>Your Complete MBTI Profile</h2>
          
          <div className="mbti-overview">
            <h3>Your Type: {reportData.scores.mbti.type}</h3>
          </div>

          <div className="mbti-dimensions">
            {formatMBTIScores().map((dimension, index) => (
              <div key={index} className="mbti-dimension">
                <div className="dimension-header">
                  <h4>{dimension.dimension}</h4>
                  <span className="preference">{dimension.preference}</span>
                </div>
                <div className="dimension-bar">
                  <div 
                    className="dimension-fill" 
                    style={{ width: `${dimension.score}%` }}
                  ></div>
                  <span className="score-label">{dimension.score}%</span>
                </div>
                <p className="dimension-explanation">
                  {getMBTIDichotomyExplanation(dimension.dimension)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Future Buckets Section */}
        <section className="future-buckets-section">
          <h2>Your Top Future Career Buckets</h2>
          <div className="buckets-grid">
            {reportData.topFutureBuckets?.slice(0, 3).map((bucket, index) => (
              <div key={index} className="bucket-card">
                <h3>{bucket.name}</h3>
                <div className="bucket-score">Score: {bucket.score}%</div>
                <p>{bucket.rationale}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Personalized Roles Section */}
        <section className="roles-section">
          <h2>5-7 Personalized Career Matches</h2>
          <div className="roles-grid">
            {reportData.careerRecommendations?.slice(0, 7).map((role, index) => (
              <div key={index} className="role-card">
                <h3>{role.title}</h3>
                <p className="role-description">{role.description}</p>
                <div className="role-details">
                  <span className="salary">{role.salary}</span>
                  <span className="pathway">{role.pathway}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Skill Roadmap Section */}
        <section className="roadmap-section">
          <h2>Your AI Skill Roadmap</h2>
          <div className="roadmap-grid">
            {reportData.aiSkillRoadmap?.slice(0, 3).map((skill, index) => (
              <div key={index} className="skill-roadmap">
                <h3>{skill.skill}</h3>
                <p className="why-it-matters">
                  <strong>Why it matters:</strong> {skill.why}
                </p>
                
                <div className="weekly-plan">
                  <h4>3-Week Learning Plan</h4>
                  {skill.weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="week-plan">
                      <h5>Week {week.week}: {week.title}</h5>
                      <ul>
                        {week.tasks.map((task, taskIndex) => (
                          <li key={taskIndex}>{task}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                
                <div className="resources">
                  <h4>Learning Resources</h4>
                  <ul>
                    {skill.resources.map((resource, resourceIndex) => (
                      <li key={resourceIndex}>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          {resource.title} ({resource.type})
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Summary Section */}
        <section className="summary-section">
          <h2>Your TalentAI Summary</h2>
          <div className="summary-grid">
            <div className="summary-card">
              <h3>🎯 Next Steps</h3>
              <ol>
                <li>Start with your highest-scoring AI skill roadmap</li>
                <li>Explore the top 3 personalized career matches</li>
                <li>Leverage your {reportData.topTwoArchetypes?.[0]?.name} strengths</li>
                <li>Develop skills in your growth areas</li>
              </ol>
            </div>
            
            <div className="summary-card">
              <h3>📈 Key Insights</h3>
              <ul>
                <li>Your Holland code ({reportData.scores.holland.code}) opens doors to {reportData.scores.holland.primary} careers</li>
                <li>Your MBTI type ({reportData.scores.mbti.type}) suggests you work best in structured environments</li>
                <li>Focus on {reportData.topFutureBuckets?.[0]?.name} for future-ready career growth</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default PremiumReport