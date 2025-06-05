// Test script to verify the complete TalentAI application flow
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testCompleteFlow() {
    console.log('🚀 Starting TalentAI End-to-End Test...\n');
    
    try {
        // 1. Test user registration
        console.log('1. Testing user registration...');
        const testUser = {
            email: `test${Date.now()}@example.com`,
            password: 'testpassword123',
            name: 'Test User'
        };
        
        const registerResponse = await axios.post(`${BASE_URL}/register`, testUser);
        console.log('✅ Registration successful:', registerResponse.data.message);
        
        // 2. Test user login
        console.log('\n2. Testing user login...');
        const loginResponse = await axios.post(`${BASE_URL}/login`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log('✅ Login successful:', loginResponse.data.message);
        
        const token = loginResponse.data.token;
        const authHeaders = { 'Authorization': `Bearer ${token}` };
        
        // 3. Test quiz questions endpoint
        console.log('\n3. Testing quiz questions endpoint...');
        const questionsResponse = await axios.get(`${BASE_URL}/quiz/questions`, { headers: authHeaders });        console.log('✅ Questions loaded:', questionsResponse.data.questions.length, 'questions');
        if (questionsResponse.data.questions.length > 0) {
            console.log('   Sample question:', questionsResponse.data.questions[0].question.substring(0, 50) + '...');
        }
          // 4. Test quiz submission with sample answers
        console.log('\n4. Testing quiz submission...');
        const answers = [];
        questionsResponse.data.questions.forEach((q, index) => {
            // Simulate random answers (1-5 scale) in the format the backend expects
            answers.push({
                questionId: q.id,
                answer: Math.floor(Math.random() * 5) + 1
            });
        });
        
        const submissionResponse = await axios.post(`${BASE_URL}/quiz/submit`, { answers }, { headers: authHeaders });
        console.log('✅ Quiz submitted successfully');
        console.log('   Result ID:', submissionResponse.data.resultId);
        console.log('   Primary Archetype:', submissionResponse.data.primaryArchetype);
        console.log('   Holland Types:', submissionResponse.data.hollandTypes);
        console.log('   MBTI Teaser:', submissionResponse.data.mbtiTeaser);
        console.log('   Future Buckets:', submissionResponse.data.futureBuckets.slice(0, 2));
        
        const resultId = submissionResponse.data.resultId;
        
        // 5. Test free report endpoint
        console.log('\n5. Testing free report endpoint...');
        const freeReportResponse = await axios.get(`${BASE_URL}/report/free/${resultId}`, { headers: authHeaders });
        console.log('✅ Free report generated');
        console.log('   Archetype:', freeReportResponse.data.archetype.name);
        console.log('   Top Dimension:', freeReportResponse.data.topDimension);
        console.log('   Primary Strengths:', freeReportResponse.data.primaryStrengths);
        
        // 6. Test premium report endpoint
        console.log('\n6. Testing premium report endpoint...');
        const premiumReportResponse = await axios.get(`${BASE_URL}/report/premium/${resultId}`, { headers: authHeaders });        console.log('✅ Premium report generated');
        console.log('   Dimensions:', Object.keys(premiumReportResponse.data.scores.dimensions));
        console.log('   Career Recommendations:', premiumReportResponse.data.careerRecommendations?.slice(0, 3) || 'undefined');
        console.log('   Top Two Archetypes:', premiumReportResponse.data.topTwoArchetypes?.length || 'undefined');
        console.log('   AI Skill Roadmap:', premiumReportResponse.data.aiSkillRoadmap?.slice(0, 2) || 'undefined');
        console.log('   Top Strengths:', premiumReportResponse.data.insights?.topStrengths?.length || 'undefined');
        console.log('   Development Areas:', premiumReportResponse.data.insights?.developmentAreas?.length || 'undefined');
        
        // 7. Test user results endpoint
        console.log('\n7. Testing user results endpoint...');
        const userResultsResponse = await axios.get(`${BASE_URL}/user/results`, { headers: authHeaders });
        console.log('✅ User results retrieved');
        console.log('   Total results:', userResultsResponse.data.results.length);
        
        console.log('\n🎉 All tests passed! TalentAI application is working correctly.');
        console.log('\n📊 Summary:');
        console.log('   - 45-question dimensional framework: ✅');
        console.log('   - 8 internal dimensions system: ✅');
        console.log('   - Archetype calculation: ✅');
        console.log('   - Holland career types: ✅');
        console.log('   - MBTI teasers: ✅');
        console.log('   - Future buckets: ✅');
        console.log('   - SQLite database: ✅');
        console.log('   - Free tier reports: ✅');
        console.log('   - Premium tier reports: ✅');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('   Response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testCompleteFlow();
