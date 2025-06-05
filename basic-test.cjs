console.log('Testing basic Node.js execution...');
const axios = require('axios');
console.log('Axios loaded successfully');

async function simpleTest() {
    try {
        console.log('Making request to:', 'http://localhost:3001/api/quiz/questions');
        const response = await axios.get('http://localhost:3001/api/quiz/questions');
        console.log('Response received:', response.status);
    } catch (error) {
        console.log('Expected error (need auth):', error.response?.status, error.response?.data?.error);
    }
}

simpleTest().then(() => console.log('Test completed'));
