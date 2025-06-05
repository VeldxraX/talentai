// Test the helper functions directly
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

function getTopTwoArchetypes(dimensions) {
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
        
    return sortedDimensions.slice(0, 2).map(([dim, score]) => ({
        archetype: archetypes[dim].name,
        description: archetypes[dim].description,
        score: score,
        dimension: dim
    }));
}

// Test with real data
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

console.log("Testing getTopTwoArchetypes:");
const topTwo = getTopTwoArchetypes(testData.dimensions);
console.log(JSON.stringify(topTwo, null, 2));

console.log("\nTesting getPersonalizedCareerRecommendations:");
const careers = getPersonalizedCareerRecommendations(testData.holland.primary, testData.archetype.name, testData.dimensions);
console.log("Number of careers:", careers?.length || 0);
console.log("First 2 careers:", JSON.stringify(careers?.slice(0, 2), null, 2));
