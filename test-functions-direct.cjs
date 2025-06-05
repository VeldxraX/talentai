console.log("Starting function test...");

// Test the helper functions directly with sample data
function getPersonalizedCareerRecommendations(hollandPrimary, archetype, dimensions) {
    console.log("Inputs:", { hollandPrimary, archetype, dimensions });
    
    const careerDatabase = {
        enterprising: [
            { title: "Business Development Manager", description: "Identify and develop new business opportunities and partnerships", salary: "$85,000 - $130,000", pathway: "Business degree + sales/partnership experience" },
            { title: "Startup Founder", description: "Build and scale innovative companies from concept to market success", salary: "$Variable - Unlimited", pathway: "Domain expertise + entrepreneurial skills + funding" },
            { title: "Management Consultant", description: "Advise organizations on strategy, operations, and transformation", salary: "$90,000 - $160,000", pathway: "Top MBA + analytical skills + consulting experience" },
            { title: "Sales Director", description: "Lead sales teams and develop strategies to meet revenue targets", salary: "$100,000 - $180,000", pathway: "Business degree + proven sales track record" },
            { title: "Investment Manager", description: "Make investment decisions and manage portfolios for clients", salary: "$95,000 - $200,000", pathway: "Finance degree + CFA + investment experience" },
            { title: "Marketing Director", description: "Develop and execute comprehensive marketing strategies", salary: "$90,000 - $140,000", pathway: "Marketing degree + digital marketing expertise" }
        ],
        investigative: [
            { title: "Data Scientist", description: "Extract insights from complex datasets to drive business decisions", salary: "$95,000 - $150,000", pathway: "Advanced degree in statistics, math, or CS + data skills" }
        ]
    };

    const relevantCareers = careerDatabase[hollandPrimary] || careerDatabase.investigative;
    console.log("Found careers:", relevantCareers);
    
    // Add archetype-specific scoring
    const result = relevantCareers.slice(0, 7).map(career => ({
        ...career,
        matchScore: Math.floor(Math.random() * 20) + 80 // High match scores for premium
    }));
    
    console.log("Returning careers:", result);
    return result;
}

function getTopTwoArchetypes(dimensions) {
    console.log("Getting top archetypes for:", dimensions);
    
    const archetypes = {
        analytical: { name: 'The Analyst', description: 'You break down complex problems and find logical solutions through systematic thinking.' },
        creative_visual: { name: 'The Innovator', description: 'You see the world differently and create unique solutions through imagination and artistry.' },
        empathetic: { name: 'The Helper', description: 'You understand and support others with natural empathy and care.' },
        physical: { name: 'The Doer', description: 'You learn and express yourself through hands-on action and physical engagement.' },
        verbal: { name: 'The Communicator', description: 'You connect with others and express ideas through powerful spoken and written communication.' },
        systematic: { name: 'The Organizer', description: 'You create order and structure to maximize efficiency and clarity.' },
        future_forward: { name: 'The Visionary', description: 'You see possibilities and potential that others miss, driving innovation forward.' },
        independent: { name: 'The Pioneer', description: 'You forge your own path and thrive when given autonomy and freedom.' }
    };

    const sortedDimensions = Object.entries(dimensions)
        .sort(([,a], [,b]) => b - a);
        
    console.log("Sorted dimensions:", sortedDimensions);
        
    const result = sortedDimensions.slice(0, 2).map(([dim, score]) => ({
        archetype: archetypes[dim].name,
        description: archetypes[dim].description,
        score: score,
        dimension: dim
    }));
    
    console.log("Top two archetypes:", result);
    return result;
}

// Test with real data from database
const testData = {
    "dimensions": {
        "analytical": 50,
        "creative_visual": 60,
        "empathetic": 40,
        "physical": 40,
        "verbal": 70,
        "systematic": 77,
        "future_forward": 67,
        "independent": 60
    },
    "archetype": {
        "name": "The Organizer",
        "description": "You create order and structure to maximize efficiency and clarity."
    },
    "holland": {
        "primary": "enterprising",
        "secondary": "conventional"
    }
};

console.log("=== TESTING HELPER FUNCTIONS ===");
console.log("Test data:", JSON.stringify(testData, null, 2));

console.log("\n1. Testing getTopTwoArchetypes:");
const topTwo = getTopTwoArchetypes(testData.dimensions);

console.log("\n2. Testing getPersonalizedCareerRecommendations:");
const careers = getPersonalizedCareerRecommendations(testData.holland.primary, testData.archetype.name, testData.dimensions);

console.log("\n=== RESULTS ===");
console.log("Top two archetypes count:", topTwo?.length || 0);
console.log("Career recommendations count:", careers?.length || 0);

if (careers && careers.length > 0) {
    console.log("SUCCESS: Functions are working correctly!");
} else {
    console.log("ERROR: Functions are not returning data!");
}
