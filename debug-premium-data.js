const axios = require('axios');

async function testPremiumData() {
    try {
        // First, let's login to get a token
        const loginResponse = await axios.post('http://localhost:3001/api/login', {
            email: 'test@example.com', 
            password: 'password123'
        });
        
        const token = loginResponse.data.token;
        console.log('Login successful, token obtained');
        
        // Get user results to find a result ID
        const resultsResponse = await axios.get('http://localhost:3001/api/user/results', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('User results:', JSON.stringify(resultsResponse.data, null, 2));
        
        if (resultsResponse.data.results && resultsResponse.data.results.length > 0) {
            const resultId = resultsResponse.data.results[0].id;
            console.log(`\nTesting premium report with result ID: ${resultId}`);
            
            // Get premium report data
            const premiumResponse = await axios.get(`http://localhost:3001/api/report/premium/${resultId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const data = premiumResponse.data;
            console.log('\n=== PREMIUM REPORT DATA ===');
            console.log('topTwoArchetypes:', JSON.stringify(data.topTwoArchetypes, null, 2));
            console.log('careerRecommendations length:', data.careerRecommendations?.length || 0);
            console.log('careerRecommendations sample:', JSON.stringify(data.careerRecommendations?.slice(0, 2), null, 2));
            console.log('topFutureBuckets:', JSON.stringify(data.topFutureBuckets, null, 2));
            console.log('aiSkillRoadmap length:', data.aiSkillRoadmap?.length || 0);
        } else {
            console.log('No results found for user');
        }
        
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testPremiumData();
