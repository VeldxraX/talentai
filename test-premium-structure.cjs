const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testPremiumReportStructure() {
    console.log('🔍 Testing Premium Report Structure...\n');
    
    const testEmail = `test${Date.now()}@example.com`;
    
    try {
        // Register and get a result
        const registerResponse = await axios.post(`${BASE_URL}/register`, {
            email: testEmail,
            password: 'testpass123',
            name: 'Test Premium Structure'
        });
        
        const token = registerResponse.data.token;
        const authHeaders = { Authorization: `Bearer ${token}` };
        
        // Take quiz
        const questionsResponse = await axios.get(`${BASE_URL}/quiz/questions`, { headers: authHeaders });
        const answers = questionsResponse.data.questions.map(q => ({
            questionId: q.id,
            answer: Math.floor(Math.random() * 5) + 1
        }));
        
        const submissionResponse = await axios.post(`${BASE_URL}/quiz/submit`, { answers }, { headers: authHeaders });
        const resultId = submissionResponse.data.resultId;
        
        // Test premium report structure
        const premiumReportResponse = await axios.get(`${BASE_URL}/report/premium/${resultId}`, { headers: authHeaders });
        
        console.log('✅ Premium Report Response Structure:');
        console.log('   Keys in response:', Object.keys(premiumReportResponse.data));
        
        // Check each expected field
        const data = premiumReportResponse.data;
        
        console.log('\n📊 Report Data Analysis:');
        console.log('   - dimensions:', data.dimensions ? `✅ (${Object.keys(data.dimensions).length} dimensions)` : '❌ Missing');
        console.log('   - topTwoArchetypes:', data.topTwoArchetypes ? `✅ (${data.topTwoArchetypes.length} archetypes)` : '❌ Missing');
        console.log('   - careerRecommendations:', data.careerRecommendations ? `✅ (${data.careerRecommendations.length} recommendations)` : '❌ Missing');
        console.log('   - aiSkillRoadmap:', data.aiSkillRoadmap ? `✅ (${data.aiSkillRoadmap.length} roadmap items)` : '❌ Missing');
        console.log('   - topFutureBuckets:', data.topFutureBuckets ? `✅ (${data.topFutureBuckets.length} future buckets)` : '❌ Missing');
        
        // Test individual components
        if (data.topTwoArchetypes && data.topTwoArchetypes.length > 0) {
            console.log('\n🎯 Top Two Archetypes:');
            data.topTwoArchetypes.forEach((archetype, index) => {
                console.log(`   ${index + 1}. ${archetype.name} (Score: ${archetype.score})`);
            });
        }
        
        if (data.careerRecommendations && data.careerRecommendations.length > 0) {
            console.log('\n💼 Career Recommendations:');
            data.careerRecommendations.slice(0, 3).forEach((career, index) => {
                console.log(`   ${index + 1}. ${career.title} - $${career.salary}`);
            });
        }
        
        console.log('\n🎉 Premium report structure test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.error || error.message);
        if (error.response?.data) {
            console.log('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testPremiumReportStructure();
