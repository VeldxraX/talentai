const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import models
const User = require('./models/User');
const QuizResult = require('./models/QuizResult');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI + 'talentai')
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Quiz questions data
const quizQuestions = {
    multipleIntelligences: [
        {
            id: 1,
            question: "I prefer to learn by doing hands-on activities rather than reading about them.",
            category: "bodily_kinesthetic"
        },
        {
            id: 2,
            question: "I enjoy solving mathematical problems and working with numbers.",
            category: "logical_mathematical"
        },
        {
            id: 3,
            question: "I love listening to music and can easily remember song lyrics.",
            category: "musical"
        },
        {
            id: 4,
            question: "I enjoy working with others and collaborating on group projects.",
            category: "interpersonal"
        },
        {
            id: 5,
            question: "I like to spend time alone reflecting on my thoughts and feelings.",
            category: "intrapersonal"
        },
        {
            id: 6,
            question: "I'm good at visualizing and creating mental images.",
            category: "spatial"
        },
        {
            id: 7,
            question: "I enjoy reading, writing, and playing with words.",
            category: "linguistic"
        },
        {
            id: 8,
            question: "I love spending time in nature and observing plants and animals.",
            category: "naturalistic"
        },
        {
            id: 9,
            question: "I excel at sports and physical activities.",
            category: "bodily_kinesthetic"
        },
        {
            id: 10,
            question: "I enjoy analyzing patterns and logical sequences.",
            category: "logical_mathematical"
        },
        {
            id: 11,
            question: "I can easily recognize different musical instruments in a song.",
            category: "musical"
        },
        {
            id: 12,
            question: "I'm good at understanding others' emotions and motivations.",
            category: "interpersonal"
        },
        {
            id: 13,
            question: "I have a strong sense of self-awareness and personal goals.",
            category: "intrapersonal"
        },
        {
            id: 14,
            question: "I'm skilled at drawing, painting, or other visual arts.",
            category: "spatial"
        },
        {
            id: 15,
            question: "I enjoy debates and discussions about various topics.",
            category: "linguistic"
        },
        {
            id: 16,
            question: "I can easily identify different types of plants or animals.",
            category: "naturalistic"
        },
        {
            id: 17,
            question: "I learn best through physical movement and exercise.",
            category: "bodily_kinesthetic"
        },
        {
            id: 18,
            question: "I enjoy puzzles, brain teasers, and logical games.",
            category: "logical_mathematical"
        },
        {
            id: 19,
            question: "I often hum or sing throughout the day.",
            category: "musical"
        },
        {
            id: 20,
            question: "I'm naturally good at leading and organizing groups.",
            category: "interpersonal"
        },
        {
            id: 21,
            question: "I prefer working independently on projects.",
            category: "intrapersonal"
        },
        {
            id: 22,
            question: "I'm good at reading maps and understanding directions.",
            category: "spatial"
        },
        {
            id: 23,
            question: "I have a large vocabulary and enjoy learning new words.",
            category: "linguistic"
        },
        {
            id: 24,
            question: "I enjoy gardening and outdoor environmental activities.",
            category: "naturalistic"
        }
    ],
    hollandTypes: [
        {
            id: 25,
            question: "I enjoy working with tools and machines.",
            category: "realistic"
        },
        {
            id: 26,
            question: "I like conducting experiments and solving complex problems.",
            category: "investigative"
        },
        {
            id: 27,
            question: "I enjoy creative activities like painting, writing, or performing.",
            category: "artistic"
        },
        {
            id: 28,
            question: "I like helping people and making a positive difference in their lives.",
            category: "social"
        },
        {
            id: 29,
            question: "I enjoy leading projects and influencing others.",
            category: "enterprising"
        },
        {
            id: 30,
            question: "I prefer organized, structured work environments.",
            category: "conventional"
        },
        {
            id: 31,
            question: "I like building or fixing things with my hands.",
            category: "realistic"
        },
        {
            id: 32,
            question: "I enjoy researching and analyzing data.",
            category: "investigative"
        },
        {
            id: 33,
            question: "I love expressing myself through creative mediums.",
            category: "artistic"
        },
        {
            id: 34,
            question: "I enjoy teaching and mentoring others.",
            category: "social"
        },
        {
            id: 35,
            question: "I like taking charge and making important decisions.",
            category: "enterprising"
        },
        {
            id: 36,
            question: "I prefer following established procedures and guidelines.",
            category: "conventional"
        }
    ]
};

// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Routes

// User registration
app.post('/api/register', async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = new User({
            email,
            password: hashedPassword,
            name: name || ''
        });

        const savedUser = await newUser.save();

        const token = jwt.sign(
            { userId: savedUser._id, email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: { 
                id: savedUser._id, 
                email: savedUser.email, 
                name: savedUser.name 
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// User login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { 
                id: user._id, 
                email: user.email, 
                name: user.name 
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get quiz questions
app.get('/api/quiz/questions', authenticateToken, (req, res) => {
    const { type } = req.query;
    
    if (type === 'multiple-intelligences') {
        res.json({ questions: quizQuestions.multipleIntelligences });
    } else if (type === 'holland') {
        res.json({ questions: quizQuestions.hollandTypes });
    } else {
        // Return all questions for the combined quiz
        res.json({ 
            questions: [...quizQuestions.multipleIntelligences, ...quizQuestions.hollandTypes]
        });
    }
});

// Submit quiz answers and calculate results
app.post('/api/quiz/submit', authenticateToken, async (req, res) => {
    const { answers } = req.body;
    
    if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: 'Invalid answers format' });
    }

    // Calculate Multiple Intelligences scores
    const intelligenceScores = {
        bodily_kinesthetic: 0,
        logical_mathematical: 0,
        musical: 0,
        interpersonal: 0,
        intrapersonal: 0,
        spatial: 0,
        linguistic: 0,
        naturalistic: 0
    };

    // Calculate Holland Type scores
    const hollandScores = {
        realistic: 0,
        investigative: 0,
        artistic: 0,
        social: 0,
        enterprising: 0,
        conventional: 0
    };

    // Process answers
    answers.forEach(answer => {
        const questionId = answer.questionId;
        const score = answer.answer; // Assuming 1-5 scale

        // Find the question
        const allQuestions = [...quizQuestions.multipleIntelligences, ...quizQuestions.hollandTypes];
        const question = allQuestions.find(q => q.id === questionId);
        
        if (question) {
            if (intelligenceScores.hasOwnProperty(question.category)) {
                intelligenceScores[question.category] += score;
            } else if (hollandScores.hasOwnProperty(question.category)) {
                hollandScores[question.category] += score;
            }
        }
    });

    // Find dominant intelligence
    const dominantIntelligence = Object.keys(intelligenceScores).reduce((a, b) => 
        intelligenceScores[a] > intelligenceScores[b] ? a : b
    );

    // Find dominant Holland type
    const dominantHollandType = Object.keys(hollandScores).reduce((a, b) => 
        hollandScores[a] > hollandScores[b] ? a : b
    );    // Save results to database
    const scoresData = {
        intelligences: intelligenceScores,
        holland: hollandScores
    };

    try {
        const quizResult = new QuizResult({
            userId: req.user.userId,
            quizType: 'combined',
            answers: answers,
            scores: scoresData,
            dominantIntelligence,
            hollandType: dominantHollandType
        });

        const savedResult = await quizResult.save();

        res.json({
            message: 'Quiz completed successfully',
            resultId: savedResult._id,
            scores: scoresData,
            dominantIntelligence,
            dominantHollandType
        });
    } catch (error) {
        console.error('Error saving quiz results:', error);
        res.status(500).json({ error: 'Failed to save results' });
    }
});

// Get user's quiz results
app.get('/api/results/:resultId', authenticateToken, async (req, res) => {
    const { resultId } = req.params;

    try {
        const result = await QuizResult.findOne({ 
            _id: resultId, 
            userId: req.user.userId 
        });

        if (!result) {
            return res.status(404).json({ error: 'Results not found' });
        }        res.json({
            id: result._id,
            scores: result.scores,
            dominantIntelligence: result.dominantIntelligence,
            dominantHollandType: result.hollandType,
            completedAt: result.completedAt
        });
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get free report (limited)
app.get('/api/report/free/:resultId', authenticateToken, async (req, res) => {
    const { resultId } = req.params;

    try {
        const result = await QuizResult.findOne({ 
            _id: resultId, 
            userId: req.user.userId 
        });

        if (!result) {
            return res.status(404).json({ error: 'Results not found' });
        }

        // Free report only shows dominant intelligence
        const intelligenceDescriptions = {
            bodily_kinesthetic: "You learn best through physical movement and hands-on experiences.",
            logical_mathematical: "You excel at logical reasoning, mathematics, and problem-solving.",
            musical: "You have a strong appreciation for music, rhythm, and sound patterns.",
            interpersonal: "You're naturally good at understanding and working with others.",
            intrapersonal: "You have strong self-awareness and prefer independent work.",
            spatial: "You excel at visualizing and manipulating spatial information.",
            linguistic: "You have strong language skills and enjoy working with words.",
            naturalistic: "You're drawn to nature and excel at recognizing patterns in the natural world."
        };

        res.json({
            dominantIntelligence: result.dominantIntelligence,
            description: intelligenceDescriptions[result.dominantIntelligence],
            upgradeMessage: "Unlock your full potential with our premium report! Get detailed insights into all 8 intelligences, career recommendations, and AI learning paths."
        });
    } catch (error) {
        console.error('Error fetching free report:', error);        res.status(500).json({ error: 'Server error' });
    }
});

// Get premium report (full access)
app.get('/api/report/premium/:resultId', authenticateToken, (req, res) => {
    const { resultId } = req.params;

    db.get(
        'SELECT * FROM quiz_results WHERE id = ? AND user_id = ?',
        [resultId, req.user.userId],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Server error' });
            }

            if (!result) {
                return res.status(404).json({ error: 'Results not found' });
            }

            const scores = JSON.parse(result.scores);
            
            // Career recommendations based on Holland types
            const careerRecommendations = {
                realistic: ["Engineer", "Mechanic", "Carpenter", "Pilot", "Veterinarian"],
                investigative: ["Scientist", "Researcher", "Doctor", "Analyst", "Psychologist"],
                artistic: ["Designer", "Writer", "Musician", "Actor", "Photographer"],
                social: ["Teacher", "Counselor", "Social Worker", "Nurse", "Coach"],
                enterprising: ["Manager", "Entrepreneur", "Lawyer", "Sales Representative", "Executive"],
                conventional: ["Accountant", "Administrator", "Banking", "Data Entry", "Secretary"]
            };

            // AI learning paths based on dominant intelligence
            const aiLearningPaths = {
                bodily_kinesthetic: ["Robotics Programming", "VR/AR Development", "Motion Capture Technology"],
                logical_mathematical: ["Machine Learning", "Data Science", "Algorithm Design", "AI Research"],
                musical: ["AI Music Generation", "Audio Processing", "Sound Design with AI"],
                interpersonal: ["Chatbot Development", "AI Ethics", "Human-Computer Interaction"],
                intrapersonal: ["Personal AI Assistants", "Recommendation Systems", "AI Psychology"],
                spatial: ["Computer Vision", "3D Modeling with AI", "Image Recognition"],
                linguistic: ["Natural Language Processing", "AI Writing Tools", "Language Translation AI"],
                naturalistic: ["Environmental AI", "Biodiversity Monitoring", "Climate Modeling"]
            };

            res.json({
                scores,
                dominantIntelligence: result.dominant_intelligence,
                dominantHollandType: result.dominant_holland_type,
                careerRecommendations: careerRecommendations[result.dominant_holland_type],
                aiLearningPaths: aiLearningPaths[result.dominant_intelligence],
                completedAt: result.completed_at
            });
        }
    );
});

// Start server
app.listen(PORT, () => {
    console.log(`TalentAI server running on port ${PORT}`);
});

module.exports = app;