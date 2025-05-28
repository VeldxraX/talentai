import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Quiz.css'

interface Question {
  id: number
  question: string
  category: string
}

interface Answer {
  questionId: number
  answer: number
}

function Quiz() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()
  const questionsPerPage = 3
  const totalPages = Math.ceil(questions.length / questionsPerPage)
  const currentQuestions = questions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  )

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/quiz/questions')
      setQuestions(response.data.questions)
      setLoading(false)
    } catch (error) {
      setError('Failed to load questions')
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId: number, value: number) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId)
      if (existing) {
        return prev.map(a => 
          a.questionId === questionId ? { ...a, answer: value } : a
        )
      } else {
        return [...prev, { questionId, answer: value }]
      }
    })
  }

  const getAnswer = (questionId: number): number => {
    const answer = answers.find(a => a.questionId === questionId)
    return answer ? answer.answer : 0
  }

  const canGoNext = () => {
    return currentQuestions.every(q => getAnswer(q.id) > 0)
  }

  const canGoBack = () => {
    return currentPage > 0
  }

  const handleNext = () => {
    if (canGoNext() && currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (canGoBack()) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (answers.length !== questions.length) {
      setError('Please answer all questions before submitting')
      return
    }

    setSubmitting(true)
    try {
      const response = await axios.post('http://localhost:5000/api/quiz/submit', {
        answers
      })
      
      const { resultId } = response.data
      
      // Navigate to free report first
      navigate(`/report/free/${resultId}`)
    } catch (error) {
      setError('Failed to submit quiz. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="loading">Loading questions...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="quiz-container">
        <div className="error">{error}</div>
      </div>
    )
  }

  const progress = ((currentPage + 1) / totalPages) * 100

  return (
    <div className="quiz-container">
      <header className="quiz-header">
        <h1>TalentAI Assessment</h1>
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-text">
            Page {currentPage + 1} of {totalPages}
          </span>
        </div>
      </header>

      <main className="quiz-main">
        <div className="questions-section">
          {currentQuestions.map((question, index) => (
            <div key={question.id} className="question-card">
              <h3 className="question-number">
                Question {currentPage * questionsPerPage + index + 1}
              </h3>
              <p className="question-text">{question.question}</p>
              
              <div className="rating-scale">
                <div className="scale-labels">
                  <span>Strongly Disagree</span>
                  <span>Strongly Agree</span>
                </div>
                <div className="rating-options">
                  {[1, 2, 3, 4, 5].map(value => (
                    <label key={value} className="rating-option">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={value}
                        checked={getAnswer(question.id) === value}
                        onChange={() => handleAnswerChange(question.id, value)}
                      />
                      <span className="rating-label">{value}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="quiz-navigation">
          <button 
            onClick={handleBack}
            disabled={!canGoBack()}
            className="nav-button secondary"
          >
            ← Previous
          </button>
          
          <div className="nav-info">
            {answers.length} of {questions.length} questions answered
          </div>
          
          {currentPage < totalPages - 1 ? (
            <button 
              onClick={handleNext}
              disabled={!canGoNext()}
              className="nav-button primary"
            >
              Next →
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={!canGoNext() || submitting}
              className="nav-button submit"
            >
              {submitting ? 'Submitting...' : 'Complete Assessment'}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

export default Quiz