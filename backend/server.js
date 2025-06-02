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
const PORT = process.env.PORT || 5000;

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
            }

            const scores = JSON.parse(result.scores);
        
        // Career recommendations based on Holland types and archetype
        const careerRecommendations = {
            realistic: ["Engineer", "Mechanic", "Carpenter", "Pilot", "Veterinarian", "Architect", "Physical Therapist"],
            investigative: ["Data Scientist", "Researcher", "Doctor", "Analyst", "Psychologist", "Software Developer", "Lab Technician"],
            artistic: ["Graphic Designer", "Writer", "Musician", "Actor", "Photographer", "UX Designer", "Content Creator"],
            social: ["Teacher", "Counselor", "Social Worker", "Nurse", "Coach", "HR Manager", "Therapist"],
            enterprising: ["Manager", "Entrepreneur", "Lawyer", "Sales Representative", "Executive", "Marketing Director", "Consultant"],
            conventional: ["Accountant", "Administrator", "Banking Professional", "Data Entry Specialist", "Project Coordinator", "Financial Analyst"]
        };

        // AI learning paths based on dimensional strengths
        const aiLearningPaths = {
            analytical: ["Machine Learning Fundamentals", "Data Science Bootcamp", "Statistical Analysis", "Algorithm Design"],
            creative_visual: ["AI-Generated Art", "Computer Vision", "Design Automation", "Creative Coding"],
            empathetic: ["AI Ethics", "Human-Computer Interaction", "Emotional AI", "Conversational Design"],
            physical: ["Robotics Programming", "IoT Development", "Physical Computing", "Motion Sensing"],
            verbal: ["Natural Language Processing", "Chatbot Development", "Voice Recognition", "Content Generation AI"],
            systematic: ["Database Management", "System Architecture", "Process Automation", "Quality Assurance"],
            future_forward: ["Emerging Technologies", "AI Trends Analysis", "Innovation Management", "Technology Forecasting"],
            independent: ["Freelance Tech Skills", "Solo Development", "Personal AI Projects", "Self-Directed Learning"]
        };

        // Get top 3 dimensions for learning paths
        const sortedDimensions = Object.entries(scores.dimensions)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);

        const personalizedLearningPaths = [];
        sortedDimensions.forEach(([dimension]) => {
            if (aiLearningPaths[dimension]) {
                personalizedLearningPaths.push(...aiLearningPaths[dimension]);
            }
        });

        res.json({
            scores: scores,
            archetype: scores.archetype,
            dimensions: scores.dimensions,
            hollandTypes: scores.holland,
            mbtiTeaser: scores.mbti,
            futureBuckets: scores.futureBuckets,
            careerRecommendations: careerRecommendations[scores.holland.primary] || [],
            personalizedLearningPaths: personalizedLearningPaths.slice(0, 6),
            completedAt: result.completedAt,
            insights: {
                topStrengths: sortedDimensions.map(([dim, score]) => ({
                    dimension: dim.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    score: score,
                    description: getDimensionDescription(dim)
                })),
                developmentAreas: Object.entries(scores.dimensions)
                    .sort(([,a], [,b]) => a - b)                    .slice(0, 2)
                    .map(([dim, score]) => ({
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

// Start server
app.listen(PORT, () => {
    console.log(`TalentAI server running on port ${PORT}`);
});

module.exports = app;