const axios = require('axios');

async function testPremiumData() {
    try {
        console.log('🚀 Starting premium data test...');
        
        // First, let's login to get a token
        console.log('📝 Attempting login...');
        const loginResponse = await axios.post('http://localhost:3001/api/login', {
            email: 'petertest@gmail.com', 
            password: 'password123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful, token obtained');
        
        // Get user results to find a result ID
        console.log('📊 Fetching user results...');
        const resultsResponse = await axios.get('http://localhost:3001/api/user/results', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ User results fetched');
        console.log('Results found:', resultsResponse.data.results?.length || 0);
        
        if (resultsResponse.data.results && resultsResponse.data.results.length > 0) {
            const resultId = resultsResponse.data.results[0].id;
            console.log(`\n🔍 Testing premium report with result ID: ${resultId}`);
            
            // Get premium report data
            const premiumResponse = await axios.get(`http://localhost:3001/api/report/premium/${resultId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const data = premiumResponse.data;
            console.log('\n=== 📋 PREMIUM REPORT DATA ===');
            console.log('✅ Premium report fetched successfully');
            
            console.log('\n🎯 Top Two Archetypes:');
            console.log('Count:', data.topTwoArchetypes?.length || 0);
            if (data.topTwoArchetypes && data.topTwoArchetypes.length > 0) {
                console.log('Data:', JSON.stringify(data.topTwoArchetypes, null, 2));
            } else {
                console.log('❌ topTwoArchetypes is empty or undefined');
            }
            
            console.log('\n💼 Career Recommendations:');
            console.log('Count:', data.careerRecommendations?.length || 0);
            if (data.careerRecommendations && data.careerRecommendations.length > 0) {
                console.log('✅ Career recommendations found!');
                console.log('Sample (first 2):');
                console.log(JSON.stringify(data.careerRecommendations.slice(0, 2), null, 2));
            } else {
                console.log('❌ careerRecommendations is empty or undefined');
            }
            
            console.log('\n🔮 Top Future Buckets:');
            console.log('Data:', JSON.stringify(data.topFutureBuckets, null, 2));
            
            console.log('\n🎓 AI Skill Roadmap:');
            console.log('Count:', data.aiSkillRoadmap?.length || 0);
            
            // Check the raw scores data structure
            console.log('\n=== 🔍 RAW SCORES DATA ===');
            console.log('holland.primary:', data.scores?.holland?.primary);
            console.log('archetype.name:', data.scores?.archetype?.name);
            console.log('dimensions keys:', data.scores?.dimensions ? Object.keys(data.scores.dimensions) : 'undefined');
            
            // Key diagnostic: Check what the helper function inputs are
            if (data.scores?.holland?.primary) {
                console.log('\n=== 🔧 DIAGNOSTIC INFO ===');
                console.log('Helper function will be called with:');
                console.log('- hollandPrimary:', data.scores.holland.primary);
                console.log('- archetype:', data.scores.archetype?.name);
                console.log('- dimensions:', data.scores.dimensions);
            }
            
        } else {
            console.log('❌ No results found for user');
            console.log('User results data:', JSON.stringify(resultsResponse.data, null, 2));
        }
        
    } catch (error) {
        console.error('❌ Error occurred:', error.response?.data || error.message);
        if (error.response?.status) {
            console.error('HTTP Status:', error.response.status);
        }
        console.error('Full error:', error.message);
    }
}

console.log('Debug script starting...');
testPremiumData().then(() => {
    console.log('✅ Debug script completed');
}).catch(err => {
    console.error('❌ Debug script failed:', err);
});
