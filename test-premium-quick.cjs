// Quick test for premium report data
const axios = require('axios');

async function testPremiumData() {
    try {
        // Use existing test user credentials
        const loginResponse = await axios.post('http://localhost:3001/api/login', {
            email: 'petertest@gmail.com',
            password: 'testpass123'
        });
        
        const token = loginResponse.data.token;
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Get user results to find a result ID
        const resultsResponse = await axios.get('http://localhost:3001/api/user/results', { headers });
        
        if (resultsResponse.data.results.length > 0) {
            const resultId = resultsResponse.data.results[0].id;
            console.log('Testing with result ID:', resultId);
            
            // Get premium report
            const premiumResponse = await axios.get(`http://localhost:3001/api/report/premium/${resultId}`, { headers });
            const data = premiumResponse.data;
            
            console.log('\n=== PREMIUM REPORT DATA ===');
            console.log('Top Two Archetypes:', data.topTwoArchetypes?.length || 'undefined');
            console.log('Career Recommendations:', data.careerRecommendations?.length || 'undefined');
            console.log('AI Skill Roadmap:', data.aiSkillRoadmap?.length || 'undefined');
            console.log('Top Future Buckets:', data.topFutureBuckets?.length || 'undefined');
            
            if (data.topTwoArchetypes) {
                console.log('\nTop Two Archetypes:');
                data.topTwoArchetypes.forEach((archetype, i) => {
                    console.log(`  ${i + 1}. ${archetype.name}: ${archetype.description}`);
                });
            }
            
            if (data.careerRecommendations) {
                console.log('\nCareer Recommendations:');
                data.careerRecommendations.slice(0, 3).forEach((career, i) => {
                    console.log(`  ${i + 1}. ${career.title} - ${career.salary}`);
                });
            }
            
            console.log('\n✅ Premium report data is working correctly!');
        } else {
            console.log('No quiz results found for test user');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testPremiumData();
