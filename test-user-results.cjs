const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testUserResults() {
    console.log('🔍 Testing User Results functionality...\n');
    
    // Use the test user from our previous test
    const testEmail = `test${Date.now()}@example.com`;
    
    try {
        // 1. Register a test user
        console.log('1. Registering test user...');
        const registerResponse = await axios.post(`${BASE_URL}/register`, {
            email: testEmail,
            password: 'testpass123',
            name: 'Test User Results'
        });
        
        const token = registerResponse.data.token;
        const authHeaders = { Authorization: `Bearer ${token}` };
        console.log('✅ User registered successfully');
        
        // 2. Take a quiz
        console.log('2. Taking quiz...');
        const questionsResponse = await axios.get(`${BASE_URL}/quiz/questions`, { headers: authHeaders });
        
        const answers = [];
        questionsResponse.data.questions.forEach((q, index) => {
            answers.push({
                questionId: q.id,
                answer: Math.floor(Math.random() * 5) + 1
            });
        });
        
        const submissionResponse = await axios.post(`${BASE_URL}/quiz/submit`, { answers }, { headers: authHeaders });
        console.log('✅ Quiz completed, Result ID:', submissionResponse.data.resultId);
        
        // 3. Test user results endpoint
        console.log('3. Fetching user results...');
        const resultsResponse = await axios.get(`${BASE_URL}/user/results`, { headers: authHeaders });
        
        console.log('✅ User results retrieved:');
        console.log('   Total results:', resultsResponse.data.results.length);
        
        resultsResponse.data.results.forEach((result, index) => {
            console.log(`   Result ${index + 1}:`);
            console.log(`     ID: ${result.id}`);
            console.log(`     Archetype: ${result.dominantIntelligence}`);
            console.log(`     Holland Type: ${result.dominantHollandType}`);
            console.log(`     Completed: ${new Date(result.completedAt).toLocaleString()}`);
            console.log(`     Quiz Type: ${result.quizType}`);
        });
        
        // 4. Test that we can access a specific report
        if (resultsResponse.data.results.length > 0) {
            const resultId = resultsResponse.data.results[0].id;
            console.log('\n4. Testing report access...');
            
            const freeReportResponse = await axios.get(`${BASE_URL}/report/free/${resultId}`, { headers: authHeaders });
            console.log('✅ Free report accessible');
            console.log('   Archetype:', freeReportResponse.data.archetype.name);
            
            const premiumReportResponse = await axios.get(`${BASE_URL}/report/premium/${resultId}`, { headers: authHeaders });
            console.log('✅ Premium report accessible');
            console.log('   Dimensions available:', Object.keys(premiumReportResponse.data.dimensions).length);
        }
        
        console.log('\n🎉 All user results functionality tests passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.error || error.message);
    }
}

testUserResults();
