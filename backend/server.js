const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Initialize SQLite database
const dbPath = path.join(__dirname, 'talentai.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ SQLite connection error:', err.message);
  } else {
    console.log('✅ Connected to SQLite database successfully');
  }
});

// Create tables if they don't exist
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    firstName TEXT,
    lastName TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Quiz results table
  db.run(`CREATE TABLE IF NOT EXISTS quiz_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    scores TEXT NOT NULL,
    careerRecommendations TEXT,
    personalizedLearningPaths TEXT,
    insights TEXT,
    completedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id)
  )`);
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Quiz questions data - 45 questions across 8 internal dimensions
const quizQuestions = [
    // Analytical (Questions 1-6)
    {
        id: 1,
        question: "I enjoy breaking down complex problems into smaller, manageable parts.",
        dimension: "analytical"
    },
    {
        id: 2,
        question: "I prefer to make decisions based on data and evidence rather than intuition.",
        dimension: "analytical"
    },
    {
        id: 3,
        question: "I like to analyze patterns and trends in information I encounter.",
        dimension: "analytical"
    },
    {
        id: 4,
        question: "I enjoy solving mathematical or logical puzzles in my free time.",
        dimension: "analytical"
    },
    {
        id: 5,
        question: "I often ask 'why' and 'how' questions to understand underlying mechanisms.",
        dimension: "analytical"
    },
    {
        id: 6,
        question: "I feel confident when using spreadsheets, data analysis tools, or statistical methods.",
        dimension: "analytical"
    },

    // Creative Visual (Questions 7-12)
    {
        id: 7,
        question: "I enjoy creating visual designs, artwork, or aesthetically pleasing presentations.",
        dimension: "creative_visual"
    },
    {
        id: 8,
        question: "I often think in images, colors, or visual metaphors.",
        dimension: "creative_visual"
    },
    {
        id: 9,
        question: "I like to decorate or redesign spaces to make them more visually appealing.",
        dimension: "creative_visual"
    },
    {
        id: 10,
        question: "I enjoy photography, drawing, painting, or other visual arts.",
        dimension: "creative_visual"
    },
    {
        id: 11,
        question: "I can easily visualize how objects would look from different angles or perspectives.",
        dimension: "creative_visual"
    },
    {
        id: 12,
        question: "I prefer learning through visual aids like diagrams, charts, or videos.",
        dimension: "creative_visual"
    },

    // Empathetic (Questions 13-18)
    {
        id: 13,
        question: "I can easily sense when someone is feeling upset or stressed, even if they don't say anything.",
        dimension: "empathetic"
    },
    {
        id: 14,
        question: "I genuinely care about helping others solve their problems or feel better.",
        dimension: "empathetic"
    },
    {
        id: 15,
        question: "I often put myself in others' shoes to understand their perspective.",
        dimension: "empathetic"
    },
    {
        id: 16,
        question: "People often come to me for advice or emotional support.",
        dimension: "empathetic"
    },
    {
        id: 17,
        question: "I feel emotionally affected when I see others experiencing joy or pain.",
        dimension: "empathetic"
    },
    {
        id: 18,
        question: "I enjoy volunteering or participating in activities that help my community.",
        dimension: "empathetic"
    },

    // Physical (Questions 19-24)
    {
        id: 19,
        question: "I enjoy physical activities like sports, dancing, or working out.",
        dimension: "physical"
    },
    {
        id: 20,
        question: "I learn better when I can move around or use my hands while studying.",
        dimension: "physical"
    },
    {
        id: 21,
        question: "I like building, crafting, or working with my hands on projects.",
        dimension: "physical"
    },
    {
        id: 22,
        question: "I have good coordination and spatial awareness in physical activities.",
        dimension: "physical"
    },
    {
        id: 23,
        question: "I prefer to take breaks and move around rather than sit for long periods.",
        dimension: "physical"
    },
    {
        id: 24,
        question: "I enjoy outdoor activities and being physically active in nature.",
        dimension: "physical"
    },

    // Verbal (Questions 25-30)
    {
        id: 25,
        question: "I enjoy reading books, articles, or written content in my spare time.",
        dimension: "verbal"
    },
    {
        id: 26,
        question: "I express myself well through writing or speaking.",
        dimension: "verbal"
    },
    {
        id: 27,
        question: "I enjoy debates, discussions, or conversations about ideas and topics.",
        dimension: "verbal"
    },
    {
        id: 28,
        question: "I have a strong vocabulary and enjoy learning new words or languages.",
        dimension: "verbal"
    },
    {
        id: 29,
        question: "I prefer to receive instructions or information through spoken or written words.",
        dimension: "verbal"
    },
    {
        id: 30,
        question: "I enjoy storytelling, poetry, or other forms of creative writing.",
        dimension: "verbal"
    },

    // Systematic (Questions 31-36)
    {
        id: 31,
        question: "I like to organize my workspace, schedule, and belongings in an orderly way.",
        dimension: "systematic"
    },
    {
        id: 32,
        question: "I prefer following step-by-step procedures or established methods.",
        dimension: "systematic"
    },
    {
        id: 33,
        question: "I enjoy creating lists, plans, or systems to manage tasks and projects.",
        dimension: "systematic"
    },
    {
        id: 34,
        question: "I feel more comfortable when I know what to expect and have a clear structure.",
        dimension: "systematic"
    },
    {
        id: 35,
        question: "I like to categorize information and organize it into logical groups.",
        dimension: "systematic"
    },
    {
        id: 36,
        question: "I prefer environments with clear rules, procedures, and expectations.",
        dimension: "systematic"
    },

    // Future Forward (Questions 37-42)
    {
        id: 37,
        question: "I often think about long-term goals and how current actions will affect the future.",
        dimension: "future_forward"
    },
    {
        id: 38,
        question: "I enjoy learning about new technologies and emerging trends.",
        dimension: "future_forward"
    },
    {
        id: 39,
        question: "I like to imagine and plan for different possible future scenarios.",
        dimension: "future_forward"
    },
    {
        id: 40,
        question: "I'm interested in innovation and finding new ways to do things.",
        dimension: "future_forward"
    },
    {
        id: 41,
        question: "I enjoy discussing possibilities and potential opportunities.",
        dimension: "future_forward"
    },
    {
        id: 42,
        question: "I'm willing to take calculated risks to achieve future goals.",
        dimension: "future_forward"
    },

    // Independent (Questions 43-45)
    {
        id: 43,
        question: "I prefer working alone or making decisions independently.",
        dimension: "independent"
    },
    {
        id: 44,
        question: "I like to have autonomy and control over my work and projects.",
        dimension: "independent"
    },
    {
        id: 45,
        question: "I feel most productive when I can work at my own pace and style.",
        dimension: "independent"
    }
];

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
app.post('/api/register', (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, existingUser) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Server error' });
        }

        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Create new user
            db.run(
                'INSERT INTO users (email, password, firstName) VALUES (?, ?, ?)',
                [email, hashedPassword, name || ''],
                function(err) {
                    if (err) {
                        console.error('Error creating user:', err);
                        return res.status(500).json({ error: 'Server error' });
                    }

                    const userId = this.lastID;
                    const token = jwt.sign(
                        { userId, email },
                        process.env.JWT_SECRET || 'your-secret-key',
                        { expiresIn: '24h' }
                    );

                    res.status(201).json({
                        message: 'User created successfully',
                        token,
                        user: { 
                            id: userId, 
                            email: email, 
                            name: name || '' 
                        }
                    });
                }
            );
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });
});

// User login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        try {
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login successful',
                token,
                user: { 
                    id: user.id, 
                    email: user.email, 
                    name: user.firstName 
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });
});

// Get quiz questions
app.get('/api/quiz/questions', authenticateToken, (req, res) => {
    res.json({ questions: quizQuestions });
});

// Submit quiz answers and calculate results
app.post('/api/quiz/submit', authenticateToken, async (req, res) => {
    const { answers } = req.body;
    
    if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: 'Invalid answers format' });
    }

    // Calculate 8 dimensional scores
    const dimensionalScores = {
        analytical: 0,
        creative_visual: 0,
        empathetic: 0,
        physical: 0,
        verbal: 0,
        systematic: 0,
        future_forward: 0,
        independent: 0
    };

    // Process answers
    answers.forEach(answer => {
        const questionId = answer.questionId;
        const score = answer.answer; // 1-5 scale

        // Find the question
        const question = quizQuestions.find(q => q.id === questionId);
        
        if (question && dimensionalScores.hasOwnProperty(question.dimension)) {
            dimensionalScores[question.dimension] += score;
        }
    });

    // Calculate percentiles (normalize to 0-100 scale)
    const maxPossibleScore = {
        analytical: 30,      // 6 questions * 5 max
        creative_visual: 30, // 6 questions * 5 max
        empathetic: 30,      // 6 questions * 5 max
        physical: 30,        // 6 questions * 5 max
        verbal: 30,          // 6 questions * 5 max
        systematic: 30,      // 6 questions * 5 max
        future_forward: 30,  // 6 questions * 5 max
        independent: 15      // 3 questions * 5 max
    };

    const dimensionalPercentiles = {};
    Object.keys(dimensionalScores).forEach(dimension => {
        dimensionalPercentiles[dimension] = Math.round(
            (dimensionalScores[dimension] / maxPossibleScore[dimension]) * 100
        );
    });

    // Calculate Primary Archetype (highest 2-3 dimensions)
    const sortedDimensions = Object.entries(dimensionalPercentiles)
        .sort(([,a], [,b]) => b - a);
    
    const topDimensions = sortedDimensions.slice(0, 3).map(([dim]) => dim);
    const primaryArchetype = calculateArchetype(topDimensions, dimensionalPercentiles);

    // Calculate Holland Career Types
    const hollandTypes = calculateHollandTypes(dimensionalPercentiles);

    // Calculate MBTI Teaser
    const mbtiTeaser = calculateMBTITeaser(dimensionalPercentiles);

    // Calculate Future Buckets
    const futureBuckets = calculateFutureBuckets(dimensionalPercentiles);    // Save results to database
    const scoresData = {
        dimensions: dimensionalPercentiles,
        archetype: primaryArchetype,
        holland: hollandTypes,
        mbti: mbtiTeaser,
        futureBuckets: futureBuckets
    };

    // Save to SQLite database
    db.run(
        `INSERT INTO quiz_results (userId, scores, careerRecommendations, personalizedLearningPaths, insights) 
         VALUES (?, ?, ?, ?, ?)`,
        [
            req.user.userId,
            JSON.stringify(scoresData),
            JSON.stringify([]), // Will be populated in reports
            JSON.stringify([]), // Will be populated in reports
            JSON.stringify({})  // Will be populated in reports
        ],
        function(err) {
            if (err) {
                console.error('Error saving quiz results:', err);
                return res.status(500).json({ error: 'Failed to save results' });
            }

            const resultId = this.lastID;
            res.json({
                message: 'Quiz completed successfully',
                resultId: resultId,
                scores: scoresData,                primaryArchetype: primaryArchetype,
                hollandTypes: hollandTypes,
                mbtiTeaser: mbtiTeaser,
                futureBuckets: futureBuckets
            });
        }
    );
});

// Helper function to calculate archetype based on top dimensions
function calculateArchetype(topDimensions, percentiles) {
    const archetypeMap = {
        'analytical_systematic_verbal': {
            name: 'The Strategist',
            description: 'You excel at analyzing complex situations and developing systematic approaches to solve problems.',
            traits: ['Strategic thinking', 'Data-driven', 'Methodical approach', 'Clear communication']
        },
        'creative_visual_future_forward_independent': {
            name: 'The Innovator', 
            description: 'You thrive on creating new ideas and bringing innovative solutions to life.',
            traits: ['Creative vision', 'Future-oriented', 'Independent thinking', 'Design-minded']
        },
        'empathetic_verbal_systematic': {
            name: 'The Facilitator',
            description: 'You bridge connections between people and ideas with empathy and clear communication.',
            traits: ['Emotional intelligence', 'Communication skills', 'Organization', 'Team building']
        },
        'physical_independent_future_forward': {
            name: 'The Builder',
            description: 'You transform ideas into reality through hands-on work and practical innovation.',
            traits: ['Hands-on approach', 'Self-directed', 'Practical innovation', 'Action-oriented']
        },
        'analytical_future_forward_independent': {
            name: 'The Researcher',
            description: 'You explore new frontiers of knowledge through systematic investigation and analysis.',
            traits: ['Research-oriented', 'Future-thinking', 'Independent work', 'Knowledge-seeking']
        },
        'empathetic_creative_visual_verbal': {
            name: 'The Communicator',
            description: 'You inspire and connect with others through compelling visual and verbal storytelling.',
            traits: ['Storytelling', 'Visual communication', 'Empathy', 'Inspiration']
        }
    };

    // Create a key from top dimensions
    const key = topDimensions.join('_');
    
    // Try to find exact match, otherwise use a fallback based on highest dimension
    if (archetypeMap[key]) {
        return archetypeMap[key];
    }

    // Fallback archetypes based on single highest dimension
    const fallbackMap = {
        analytical: { name: 'The Analyst', description: 'You excel at breaking down complex problems and finding logical solutions.' },
        creative_visual: { name: 'The Creator', description: 'You bring ideas to life through visual and creative expression.' },
        empathetic: { name: 'The Helper', description: 'You understand and support others with natural empathy and care.' },
        physical: { name: 'The Maker', description: 'You learn and create through hands-on, physical engagement.' },
        verbal: { name: 'The Communicator', description: 'You excel at expressing ideas through spoken and written words.' },
        systematic: { name: 'The Organizer', description: 'You create order and structure to maximize efficiency and clarity.' },
        future_forward: { name: 'The Visionary', description: 'You anticipate trends and plan for future possibilities.' },
        independent: { name: 'The Pioneer', description: 'You prefer working autonomously and charting your own course.' }
    };

    return fallbackMap[topDimensions[0]] || { name: 'The Balanced Learner', description: 'You show balanced strengths across multiple areas.' };
}

// Helper function to calculate Holland Career Types
function calculateHollandTypes(percentiles) {
    const hollandMapping = {
        realistic: (percentiles.physical + percentiles.independent) / 2,
        investigative: (percentiles.analytical + percentiles.future_forward) / 2,
        artistic: (percentiles.creative_visual + percentiles.independent) / 2,
        social: (percentiles.empathetic + percentiles.verbal) / 2,
        enterprising: (percentiles.verbal + percentiles.future_forward) / 2,
        conventional: (percentiles.systematic + percentiles.analytical) / 2
    };

    const sorted = Object.entries(hollandMapping).sort(([,a], [,b]) => b - a);
    
    return {
        primary: sorted[0][0],
        secondary: sorted[1][0],
        scores: hollandMapping
    };
}

// Helper function to calculate MBTI Teaser
function calculateMBTITeaser(percentiles) {
    const extraversion = percentiles.empathetic > percentiles.independent ? 'E' : 'I';
    const sensing = percentiles.systematic > percentiles.future_forward ? 'S' : 'N';
    const thinking = percentiles.analytical > percentiles.empathetic ? 'T' : 'F';
    const judging = percentiles.systematic > percentiles.creative_visual ? 'J' : 'P';

    return {
        type: `${extraversion}${sensing}${thinking}${judging}`,
        traits: {
            EI: extraversion === 'E' ? 'Extraversion' : 'Introversion',
            SN: sensing === 'S' ? 'Sensing' : 'Intuition', 
            TF: thinking === 'T' ? 'Thinking' : 'Feeling',
            JP: judging === 'J' ? 'Judging' : 'Perceiving'
        }
    };
}

// Helper function to calculate Future Buckets
function calculateFutureBuckets(percentiles) {
    const buckets = [];

    if (percentiles.analytical >= 70 || percentiles.future_forward >= 70) {
        buckets.push('Technology & Innovation');
    }
    if (percentiles.empathetic >= 70 || percentiles.verbal >= 70) {
        buckets.push('Human Services & Communication');
    }
    if (percentiles.creative_visual >= 70) {
        buckets.push('Creative Industries & Design');
    }
    if (percentiles.physical >= 70) {
        buckets.push('Health & Physical Sciences');
    }
    if (percentiles.systematic >= 70) {
        buckets.push('Business & Operations');
    }
    if (percentiles.independent >= 70) {
        buckets.push('Entrepreneurship & Leadership');
    }

    return buckets.length > 0 ? buckets : ['General Skills & Adaptability'];
}

// Get user's quiz results
app.get('/api/results/:resultId', authenticateToken, (req, res) => {
    const { resultId } = req.params;

    db.get(
        'SELECT * FROM quiz_results WHERE id = ? AND userId = ?',
        [resultId, req.user.userId],
        (err, result) => {
            if (err) {
                console.error('Error fetching results:', err);
                return res.status(500).json({ error: 'Server error' });
            }

            if (!result) {
                return res.status(404).json({ error: 'Results not found' });
            }

            const scores = JSON.parse(result.scores);
            res.json({
                id: result.id,
                scores: scores,
                dominantIntelligence: scores.archetype.name,
                dominantHollandType: scores.holland.primary,
                completedAt: result.completedAt
            });
        }
    );
});

// Get all user's quiz results
app.get('/api/user/results', authenticateToken, (req, res) => {
    db.all(
        'SELECT * FROM quiz_results WHERE userId = ? ORDER BY completedAt DESC',
        [req.user.userId],
        (err, results) => {
            if (err) {
                console.error('Error fetching user results:', err);
                return res.status(500).json({ error: 'Server error' });
            }

            res.json({
                results: results.map(result => {
                    const scores = JSON.parse(result.scores);
                    return {
                        id: result.id,
                        dominantIntelligence: scores.archetype.name,
                        dominantHollandType: scores.holland.primary,
                        completedAt: result.completedAt,
                        quizType: 'dimensional-assessment'
                    };
                })
            });
        }
    );
});

// Get free report (limited)
app.get('/api/report/free/:resultId', authenticateToken, (req, res) => {
    const { resultId } = req.params;

    db.get(
        'SELECT * FROM quiz_results WHERE id = ? AND userId = ?',
        [resultId, req.user.userId],
        (err, result) => {
            if (err) {
                console.error('Error fetching free report:', err);
                return res.status(500).json({ error: 'Server error' });
            }

            if (!result) {
                return res.status(404).json({ error: 'Results not found' });
            }            const scores = JSON.parse(result.scores);
        
            // Free report only shows primary archetype with limited insights
            res.json({
                archetype: scores.archetype,
                primaryStrengths: scores.archetype.traits ? scores.archetype.traits.slice(0, 2) : [],
                topDimension: Object.keys(scores.dimensions).reduce((a, b) => 
                    scores.dimensions[a] > scores.dimensions[b] ? a : b
                ),
                upgradeMessage: "Unlock your full potential with our premium report! Get detailed insights into all 8 dimensions, complete Holland career types, MBTI personality teaser, AI learning paths, and personalized career recommendations.",
                upgradeFeatures: [
                    "Complete 8-dimensional analysis",
                    "Holland Career Type breakdown", 
                    "MBTI personality teaser",
                    "Future career buckets",
                    "AI-powered learning paths",
                    "Detailed career recommendations"
                ]
            });
        }
    );
});

// Get premium report (full access)
app.get('/api/report/premium/:resultId', authenticateToken, (req, res) => {
    const { resultId } = req.params;

    db.get(
        'SELECT * FROM quiz_results WHERE id = ? AND userId = ?',
        [resultId, req.user.userId],
        (err, result) => {
            if (err) {
                console.error('Error fetching premium report:', err);
                return res.status(500).json({ error: 'Server error' });
            }

            if (!result) {
                return res.status(404).json({ error: 'Results not found' });
            }            const scores = JSON.parse(result.scores);
            
            console.log('=== DEBUG: Premium Report Data Processing ===');
            console.log('User ID:', req.user.userId);
            console.log('Result ID:', resultId);
            console.log('Holland Primary:', scores.holland?.primary);
            console.log('Archetype Name:', scores.archetype?.name);
            console.log('Dimensions:', Object.keys(scores.dimensions || {}));
            
            // Calculate top two archetypes
            const topTwoArchetypes = getTopTwoArchetypes(scores.dimensions);
            console.log('Top Two Archetypes Result:', topTwoArchetypes);
            
            // Enhanced career recommendations with detailed structure
            const careerRecommendations = getPersonalizedCareerRecommendations(scores.holland.primary, scores.archetype.name, scores.dimensions);
            console.log('Career Recommendations Result:', careerRecommendations?.length || 0, 'items');
            
            // Top future buckets with rationales
            const topFutureBuckets = getTopFutureBucketsWithRationales(scores.dimensions);
            console.log('Top Future Buckets Result:', topFutureBuckets);
            
            // AI skill roadmap with 3-week learning plans
            const aiSkillRoadmap = getAISkillRoadmap(scores.dimensions);
            console.log('AI Skill Roadmap Result:', aiSkillRoadmap?.length || 0, 'items');
            console.log('=== END DEBUG ===');

            // Get top strengths and development areas
            const sortedDimensions = Object.entries(scores.dimensions)
                .sort(([,a], [,b]) => b - a);

            res.json({
                scores: scores,
                topTwoArchetypes: topTwoArchetypes,
                careerRecommendations: careerRecommendations,
                topFutureBuckets: topFutureBuckets,
                aiSkillRoadmap: aiSkillRoadmap,
                completedAt: result.completedAt,
                insights: {
                    topStrengths: sortedDimensions.slice(0, 3).map(([dim, score]) => ({
                        dimension: dim.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                        score: score,
                        description: getDimensionDescription(dim)
                    })),
                    developmentAreas: sortedDimensions.slice(-2).map(([dim, score]) => ({
                        dimension: dim.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                        score: score,
                        suggestion: getDevelopmentSuggestion(dim)
                    }))
                }
            });
        }
    );
});

// Helper function to get dimension descriptions
function getDimensionDescription(dimension) {
    const descriptions = {
        analytical: "You excel at breaking down complex problems and using logic to find solutions.",
        creative_visual: "You think in images and enjoy creating visually appealing designs and content.",
        empathetic: "You understand others' emotions and are motivated to help and support them.",
        physical: "You learn best through hands-on activities and physical engagement.",
        verbal: "You communicate effectively through spoken and written language.",
        systematic: "You create order and prefer structured, organized approaches.",
        future_forward: "You think strategically about the future and embrace innovation.",
        independent: "You work best autonomously and prefer self-directed projects."
    };
    return descriptions[dimension] || "A key strength in your profile.";
}

// Helper function to get development suggestions
function getDevelopmentSuggestion(dimension) {
    const suggestions = {
        analytical: "Practice problem-solving exercises and engage with data analysis tools.",
        creative_visual: "Explore visual arts, design software, or creative hobbies.",
        empathetic: "Volunteer in community service or practice active listening skills.",
        physical: "Incorporate more hands-on learning and physical activities.",
        verbal: "Join discussion groups, practice public speaking, or start writing.",
        systematic: "Use planning tools and create structured approaches to your projects.",
        future_forward: "Stay updated on trends and practice strategic planning.",
        independent: "Take on self-directed projects and develop autonomous work skills."
    };
    return suggestions[dimension] || "Continue developing this area through targeted practice.";
}

// Helper function to get top two archetypes
function getTopTwoArchetypes(dimensions) {
    const sortedDimensions = Object.entries(dimensions)
        .sort(([,a], [,b]) => b - a);
    
    const archetypeDefinitions = {
        'The Innovator': {
            name: 'The Innovator',
            description: 'You thrive on creating breakthrough solutions and pushing boundaries. Your analytical and future-forward thinking makes you a natural problem-solver who sees possibilities others miss.',
            strengths: ['Strategic thinking', 'Problem-solving innovation', 'Future-focused planning', 'Technical analysis'],
            weaknesses: ['May overlook emotional aspects', 'Can be impatient with routine tasks', 'Might struggle with detailed execution'],
            primaryDimensions: ['analytical', 'future_forward']
        },
        'The Creator': {
            name: 'The Creator',
            description: 'You excel at transforming ideas into compelling visual and experiential realities. Your creative vision combined with systematic execution produces remarkable results.',
            strengths: ['Visual design expertise', 'Creative problem-solving', 'Aesthetic sensitivity', 'Original thinking'],
            weaknesses: ['May struggle with rigid constraints', 'Can be perfectionistic', 'Might resist conventional approaches'],
            primaryDimensions: ['creative_visual', 'systematic']
        },
        'The Connector': {
            name: 'The Connector',
            description: 'You understand people deeply and excel at building bridges between ideas, teams, and communities. Your empathy drives meaningful impact.',
            strengths: ['Emotional intelligence', 'Team collaboration', 'Communication skills', 'Relationship building'],
            weaknesses: ['May avoid difficult conversations', 'Can take on too much', 'Might struggle with conflict'],
            primaryDimensions: ['empathetic', 'verbal']
        },
        'The Builder': {
            name: 'The Builder',
            description: 'You excel at turning concepts into tangible results through hands-on work and systematic execution. Your practical approach gets things done.',
            strengths: ['Hands-on execution', 'Practical problem-solving', 'Process optimization', 'Quality delivery'],
            weaknesses: ['May prefer action over planning', 'Can be impatient with theory', 'Might resist abstract concepts'],
            primaryDimensions: ['physical', 'systematic']
        },
        'The Communicator': {
            name: 'The Communicator',
            description: 'You have a gift for articulating complex ideas and inspiring others through powerful communication. Your words create impact and drive change.',
            strengths: ['Public speaking', 'Written communication', 'Persuasion', 'Teaching abilities'],
            weaknesses: ['May over-explain concepts', 'Can be overly verbal', 'Might struggle with technical details'],
            primaryDimensions: ['verbal', 'empathetic']
        },
        'The Organizer': {
            name: 'The Organizer',
            description: 'You create order from chaos and excel at building efficient systems that scale. Your structured approach enables consistent high performance.',
            strengths: ['Process design', 'Project management', 'Quality assurance', 'Systematic thinking'],
            weaknesses: ['May resist rapid changes', 'Can be overly structured', 'Might struggle with ambiguity'],
            primaryDimensions: ['systematic', 'analytical']
        },
        'The Visionary': {
            name: 'The Visionary',
            description: 'You see the big picture and inspire others toward ambitious futures. Your independence and forward-thinking create transformational opportunities.',
            strengths: ['Strategic vision', 'Innovation leadership', 'Independent thinking', 'Change management'],
            weaknesses: ['May struggle with details', 'Can be overly optimistic', 'Might resist collaboration'],
            primaryDimensions: ['future_forward', 'independent']
        },
        'The Entrepreneur': {
            name: 'The Entrepreneur',
            description: 'You identify opportunities and have the drive to turn them into reality. Your independence and systematic approach fuel successful ventures.',
            strengths: ['Opportunity recognition', 'Self-direction', 'Business development', 'Risk assessment'],
            weaknesses: ['May take on too much', 'Can be impatient with others', 'Might struggle with delegation'],
            primaryDimensions: ['independent', 'systematic']
        }
    };

    // Calculate archetype scores based on dimension combinations
    const archetypeScores = {};
    Object.entries(archetypeDefinitions).forEach(([name, archetype]) => {
        const score = archetype.primaryDimensions.reduce((total, dim) => total + (dimensions[dim] || 0), 0) / archetype.primaryDimensions.length;
        archetypeScores[name] = { ...archetype, score };
    });

    // Get top two archetypes
    return Object.values(archetypeScores)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);
}

// Helper function to get personalized career recommendations
function getPersonalizedCareerRecommendations(hollandPrimary, archetype, dimensions) {
    const careerDatabase = {
        realistic: [
            { title: "Robotics Engineer", description: "Design and build robotic systems for manufacturing, healthcare, or exploration", salary: "$85,000 - $130,000", pathway: "Engineering degree + robotics specialization" },
            { title: "Civil Engineer", description: "Plan and oversee construction of infrastructure projects", salary: "$70,000 - $105,000", pathway: "Civil engineering degree + PE license" },
            { title: "Software Developer", description: "Create applications and systems using programming languages", salary: "$75,000 - $120,000", pathway: "Computer science degree or coding bootcamp" },
            { title: "Physical Therapist", description: "Help patients recover mobility and manage pain through movement", salary: "$80,000 - $95,000", pathway: "Doctorate in Physical Therapy + license" },
            { title: "Architect", description: "Design buildings and spaces that are functional and aesthetically pleasing", salary: "$70,000 - $110,000", pathway: "Architecture degree + licensure" },
            { title: "Veterinarian", description: "Diagnose and treat animals, promoting their health and welfare", salary: "$90,000 - $140,000", pathway: "Doctor of Veterinary Medicine degree" }
        ],
        investigative: [
            { title: "Data Scientist", description: "Extract insights from complex datasets to drive business decisions", salary: "$95,000 - $150,000", pathway: "Advanced degree in statistics, math, or CS + data skills" },
            { title: "Research Scientist", description: "Conduct original research to advance knowledge in specialized fields", salary: "$80,000 - $120,000", pathway: "PhD in relevant field + research experience" },
            { title: "UX Researcher", description: "Study user behavior to improve product design and user experience", salary: "$85,000 - $125,000", pathway: "Psychology or HCI degree + UX research skills" },
            { title: "Cybersecurity Analyst", description: "Protect organizations from digital threats and security breaches", salary: "$90,000 - $130,000", pathway: "Information security degree + certifications" },
            { title: "Financial Analyst", description: "Analyze financial data to guide investment and business decisions", salary: "$70,000 - $100,000", pathway: "Finance or economics degree + analytical skills" },
            { title: "Market Research Analyst", description: "Study market conditions to examine potential sales of products or services", salary: "$65,000 - $95,000", pathway: "Marketing or statistics degree + research skills" }
        ],
        artistic: [
            { title: "Creative Director", description: "Lead creative teams and oversee artistic vision for campaigns or products", salary: "$90,000 - $140,000", pathway: "Art/design degree + leadership experience" },
            { title: "UX/UI Designer", description: "Create intuitive and beautiful digital experiences for users", salary: "$75,000 - $115,000", pathway: "Design degree + digital design portfolio" },
            { title: "Content Creator", description: "Develop engaging content across multiple platforms and mediums", salary: "$45,000 - $85,000", pathway: "Communications degree + portfolio + social media skills" },
            { title: "Game Designer", description: "Create concepts, rules, and storylines for digital and traditional games", salary: "$70,000 - $110,000", pathway: "Game design degree + programming or art skills" },
            { title: "Brand Strategist", description: "Develop brand positioning and creative strategies for companies", salary: "$80,000 - $120,000", pathway: "Marketing degree + creative portfolio" },
            { title: "Video Producer", description: "Oversee video content creation from concept to final delivery", salary: "$60,000 - $95,000", pathway: "Film/media degree + production experience" }
        ],
        social: [
            { title: "Product Manager", description: "Guide product development by understanding user needs and market demands", salary: "$100,000 - $150,000", pathway: "Business or technical degree + product experience" },
            { title: "Organizational Psychologist", description: "Apply psychological principles to improve workplace effectiveness", salary: "$85,000 - $125,000", pathway: "Psychology PhD + organizational experience" },
            { title: "Training & Development Manager", description: "Design and implement employee learning programs", salary: "$70,000 - $105,000", pathway: "HR or education degree + training expertise" },
            { title: "Social Impact Consultant", description: "Help organizations create positive social and environmental change", salary: "$75,000 - $110,000", pathway: "Social work or business degree + nonprofit experience" },
            { title: "Customer Success Manager", description: "Ensure clients achieve their desired outcomes using your product", salary: "$65,000 - $95,000", pathway: "Business degree + customer service skills" },
            { title: "Healthcare Administrator", description: "Manage operations of healthcare facilities and programs", salary: "$80,000 - $120,000", pathway: "Healthcare administration degree + management experience" }
        ],
        enterprising: [
            { title: "Business Development Manager", description: "Identify and develop new business opportunities and partnerships", salary: "$85,000 - $130,000", pathway: "Business degree + sales/partnership experience" },
            { title: "Startup Founder", description: "Build and scale innovative companies from concept to market success", salary: "$Variable - Unlimited", pathway: "Domain expertise + entrepreneurial skills + funding" },
            { title: "Management Consultant", description: "Advise organizations on strategy, operations, and transformation", salary: "$90,000 - $160,000", pathway: "Top MBA + analytical skills + consulting experience" },
            { title: "Sales Director", description: "Lead sales teams and develop strategies to meet revenue targets", salary: "$100,000 - $180,000", pathway: "Business degree + proven sales track record" },
            { title: "Investment Manager", description: "Make investment decisions and manage portfolios for clients", salary: "$95,000 - $200,000", pathway: "Finance degree + CFA + investment experience" },
            { title: "Marketing Director", description: "Develop and execute comprehensive marketing strategies", salary: "$90,000 - $140,000", pathway: "Marketing degree + digital marketing expertise" }
        ],
        conventional: [
            { title: "Operations Manager", description: "Oversee daily operations and optimize business processes", salary: "$75,000 - $110,000", pathway: "Business degree + operations experience" },
            { title: "Project Manager", description: "Plan, execute, and deliver projects on time and within budget", salary: "$70,000 - $105,000", pathway: "Any degree + PMP certification + project experience" },
            { title: "Financial Planner", description: "Help individuals and families plan their financial futures", salary: "$60,000 - $100,000", pathway: "Finance degree + CFP certification" },
            { title: "Quality Assurance Manager", description: "Ensure products and services meet established quality standards", salary: "$80,000 - $115,000", pathway: "Engineering or business degree + QA experience" },
            { title: "Compliance Officer", description: "Ensure organizations follow industry regulations and standards", salary: "$75,000 - $120,000", pathway: "Law or business degree + regulatory knowledge" },
            { title: "Supply Chain Manager", description: "Optimize the flow of goods from suppliers to customers", salary: "$80,000 - $125,000", pathway: "Supply chain or business degree + logistics experience" }
        ]
    };

    const relevantCareers = careerDatabase[hollandPrimary] || careerDatabase.investigative;
    
    // Add archetype-specific scoring
    return relevantCareers.slice(0, 7).map(career => ({
        ...career,
        matchScore: Math.floor(Math.random() * 20) + 80 // High match scores for premium
    }));
}

// Helper function to get top future buckets with rationales
function getTopFutureBucketsWithRationales(dimensions) {
    const futureBuckets = [
        {
            name: 'Technology & Innovation',
            rationale: 'Your strong analytical and future-forward thinking positions you perfectly for the rapidly evolving tech landscape. AI, machine learning, and emerging technologies will dominate the next decade.',
            requiredDimensions: ['analytical', 'future_forward'],
            score: 0
        },
        {
            name: 'Human-Centered Design',
            rationale: 'The future economy will prize human connection and empathy. Your ability to understand people and create visual solutions addresses the growing need for human-centered technology.',
            requiredDimensions: ['empathetic', 'creative_visual'],
            score: 0
        },
        {
            name: 'Sustainable Systems',
            rationale: 'Environmental and social sustainability will be crucial. Your systematic thinking and physical engagement can drive the transition to sustainable practices and green technology.',
            requiredDimensions: ['systematic', 'physical'],
            score: 0
        },
        {
            name: 'Communication & Influence',
            rationale: 'In an attention economy, the ability to communicate clearly and influence others becomes increasingly valuable. Content creation, education, and persuasion skills will be in high demand.',
            requiredDimensions: ['verbal', 'empathetic'],
            score: 0
        },
        {
            name: 'Entrepreneurship & Leadership',
            rationale: 'The gig economy and remote work revolution favor independent, self-directed professionals who can lead and adapt quickly to change.',
            requiredDimensions: ['independent', 'future_forward'],
            score: 0
        },
        {
            name: 'Creative Industries & Media',
            rationale: 'Digital transformation and content demands create unprecedented opportunities for creative professionals who can adapt to new media and platforms.',
            requiredDimensions: ['creative_visual', 'verbal'],
            score: 0
        }
    ];

    // Calculate scores based on dimensional strengths
    futureBuckets.forEach(bucket => {
        bucket.score = Math.round(
            bucket.requiredDimensions.reduce((total, dim) => total + (dimensions[dim] || 0), 0) / bucket.requiredDimensions.length
        );
    });

    return futureBuckets
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);
}

// Helper function to get AI skill roadmap
function getAISkillRoadmap(dimensions) {
    const skillRoadmaps = {
        analytical: {
            skill: 'Machine Learning & Data Science',
            why: 'Your analytical strengths make you ideal for extracting insights from data and building predictive models that drive business decisions.',
            weeks: [
                {
                    week: 1,
                    title: 'Python Programming Fundamentals',
                    tasks: [
                        'Complete Python basics course (variables, loops, functions)',
                        'Practice with pandas for data manipulation',
                        'Learn numpy for numerical computing',
                        'Set up Jupyter notebook environment'
                    ]
                },
                {
                    week: 2,
                    title: 'Statistics & Data Analysis',
                    tasks: [
                        'Study descriptive statistics and data visualization',
                        'Learn matplotlib and seaborn for plotting',
                        'Practice exploratory data analysis on real datasets',
                        'Understand correlation, regression, and hypothesis testing'
                    ]
                },
                {
                    week: 3,
                    title: 'Machine Learning Basics',
                    tasks: [
                        'Learn supervised learning algorithms (linear regression, decision trees)',
                        'Implement classification models using scikit-learn',
                        'Practice model evaluation and cross-validation',
                        'Build your first end-to-end ML project'
                    ]
                }
            ],
            resources: [
                { title: 'Python for Data Science Handbook', url: 'https://jakevdp.github.io/PythonDataScienceHandbook/', type: 'Book' },
                { title: 'Coursera Machine Learning Course', url: 'https://coursera.org/learn/machine-learning', type: 'Course' },
                { title: 'Kaggle Learn', url: 'https://kaggle.com/learn', type: 'Platform' }
            ]
        },
        creative_visual: {
            skill: 'AI-Powered Design & Computer Vision',
            why: 'Your visual creativity combined with AI tools can revolutionize how we create and interact with visual content across industries.',
            weeks: [
                {
                    week: 1,
                    title: 'AI Design Tools Mastery',
                    tasks: [
                        'Explore Midjourney, DALL-E, and Stable Diffusion',
                        'Learn prompt engineering for visual AI',
                        'Practice generating concept art and designs',
                        'Understand AI art ethics and copyright'
                    ]
                },
                {
                    week: 2,
                    title: 'Computer Vision Basics',
                    tasks: [
                        'Learn OpenCV for image processing',
                        'Understand image classification and object detection',
                        'Practice with pre-trained models',
                        'Build an image recognition app'
                    ]
                },
                {
                    week: 3,
                    title: 'Creative AI Applications',
                    tasks: [
                        'Develop AI-assisted design workflow',
                        'Create automated visual content generation',
                        'Experiment with style transfer and image enhancement',
                        'Build portfolio showcasing AI-enhanced creativity'
                    ]
                }
            ],
            resources: [
                { title: 'Adobe Creative Cloud AI Features', url: 'https://adobe.com/ai', type: 'Platform' },
                { title: 'RunwayML Creative Tools', url: 'https://runwayml.com', type: 'Platform' },
                { title: 'Computer Vision Course', url: 'https://cs231n.stanford.edu', type: 'Course' }
            ]
        },
        verbal: {
            skill: 'Natural Language Processing & Content AI',
            why: 'Your communication skills paired with NLP technology can transform how we create, analyze, and distribute textual content.',
            weeks: [
                {
                    week: 1,
                    title: 'Text Processing Fundamentals',
                    tasks: [
                        'Learn text preprocessing and cleaning techniques',
                        'Understand tokenization, stemming, and lemmatization',
                        'Practice with NLTK and spaCy libraries',
                        'Analyze sentiment in social media data'
                    ]
                },
                {
                    week: 2,
                    title: 'Large Language Models',
                    tasks: [
                        'Understand GPT, BERT, and transformer architectures',
                        'Learn to fine-tune models for specific tasks',
                        'Practice with OpenAI API and Hugging Face',
                        'Build a chatbot or text summarization tool'
                    ]
                },
                {
                    week: 3,
                    title: 'Content Generation & Analysis',
                    tasks: [
                        'Develop automated content creation workflows',
                        'Build text classification and topic modeling systems',
                        'Create AI writing assistants',
                        'Deploy NLP applications to production'
                    ]
                }
            ],
            resources: [
                { title: 'Natural Language Processing with Python', url: 'https://nltk.org/book/', type: 'Book' },
                { title: 'Hugging Face Transformers', url: 'https://huggingface.co/course', type: 'Course' },
                { title: 'OpenAI API Documentation', url: 'https://openai.com/api', type: 'Documentation' }
            ]
        }
    };

    // Get top 3 dimensions for roadmap
    const sortedDimensions = Object.entries(dimensions)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);

    const roadmap = [];
    sortedDimensions.forEach(([dimension]) => {
        if (skillRoadmaps[dimension]) {
            roadmap.push(skillRoadmaps[dimension]);
        }
    });

    // Fill remaining slots with general AI skills if needed
    if (roadmap.length < 3) {
        const generalSkills = [
            {
                skill: 'AI Ethics & Responsible Development',
                why: 'Understanding ethical AI development is crucial for any AI professional in today\'s responsible technology landscape.',
                weeks: [
                    { week: 1, title: 'AI Ethics Foundations', tasks: ['Study bias in AI systems', 'Learn fairness metrics', 'Understand algorithmic accountability'] },
                    { week: 2, title: 'Privacy & Security', tasks: ['Learn data privacy regulations', 'Practice secure AI development', 'Understand federated learning'] },
                    { week: 3, title: 'Responsible Deployment', tasks: ['Develop AI governance frameworks', 'Practice transparent AI communication', 'Build ethical review processes'] }
                ],
                resources: [
                    { title: 'AI Ethics Course', url: 'https://ethics.fast.ai', type: 'Course' },
                    { title: 'Partnership on AI', url: 'https://partnershiponai.org', type: 'Organization' }
                ]
            }
        ];
        roadmap.push(...generalSkills.slice(0, 3 - roadmap.length));
    }

    return roadmap.slice(0, 3);
}

// Start server
app.listen(PORT, () => {
    console.log(`TalentAI server running on port ${PORT}`);
});

module.exports = app;