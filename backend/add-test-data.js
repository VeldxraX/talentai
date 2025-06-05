const sqlite3 = require('sqlite3').verbose();

function addTestQuizResult() {
    const db = new sqlite3.Database('./talentai.db');
    
    // Test scores data that matches the structure we saw earlier
    const testScores = {
        "dimensions": {
            "analytical": 70,
            "creative_visual": 80,
            "empathetic": 60,
            "physical": 40,
            "verbal": 85,
            "systematic": 75,
            "future_forward": 90,
            "independent": 65
        },
        "archetype": {
            "name": "The Visionary",
            "description": "You see possibilities and potential that others miss, driving innovation forward."
        },
        "holland": {
            "primary": "enterprising",
            "secondary": "artistic",
            "scores": {
                "realistic": 40,
                "investigative": 75,
                "artistic": 80,
                "social": 70,
                "enterprising": 90,
                "conventional": 50
            }
        },
        "mbti": {
            "type": "ENFP",
            "traits": {
                "EI": "Extraversion",
                "SN": "Intuition",
                "TF": "Feeling",
                "JP": "Perceiving"
            }
        },
        "futureBuckets": [
            "Technology & Innovation",
            "Creative Industries"
        ]
    };
    
    // Insert quiz result for user ID 5 (petertest@gmail.com)
    db.run(
        'INSERT INTO quiz_results (userId, scores, careerRecommendations, personalizedLearningPaths, insights) VALUES (?, ?, ?, ?, ?)',
        [
            5, // User ID for petertest@gmail.com
            JSON.stringify(testScores),
            JSON.stringify([]), // Empty initially
            JSON.stringify([]), // Empty initially
            JSON.stringify({})  // Empty initially
        ],
        function(err) {
            if (err) {
                console.error('Error creating test quiz result:', err);
            } else {
                console.log('✅ Test quiz result created with ID:', this.lastID);
                console.log('For user ID: 5 (petertest@gmail.com)');
                console.log('Holland primary:', testScores.holland.primary);
                console.log('Archetype:', testScores.archetype.name);
            }
            db.close();
        }
    );
}

addTestQuizResult();
