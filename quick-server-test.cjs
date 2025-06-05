const axios = require('axios');

async function quickTest() {
    console.log('🔍 Quick server connectivity test...');
    
    try {
        const response = await axios.get('http://localhost:3001/api/quiz/questions');
        console.log('✅ Server is running and responding on port 3001');
        console.log('   Questions available:', response.data.questions.length);
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Server is not running on port 3001');
            console.log('   Please make sure you have run: node server.js');
            console.log('   From the backend directory');
        } else {
            console.log('❌ Server error:', error.response?.data?.error || error.message);
        }
    }
}

quickTest();
