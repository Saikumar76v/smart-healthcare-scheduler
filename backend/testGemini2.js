require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const testGeminiKey = async () => {
    const apiKey = process.env.GEMINI_API_KEY;

    console.log('=== Gemini API Key Test ===');
    console.log('Key present:', !!apiKey);

    if (!apiKey) {
        console.error('ERROR: GEMINI_API_KEY not set');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        console.log('Testing API call...');

        const result = await model.generateContent('Say hello');
        const response = await result.response;
        const text = response.text();

        console.log('SUCCESS!');
        console.log('Response:', text);

    } catch (error) {
        console.error('FAILED!');
        console.error('Error:', error.message);
        console.error('Status:', error.status);

        if (error.message.includes('API_KEY_INVALID') || error.status === 400) {
            console.error('\nThe API key is INVALID or RESTRICTED.');
            console.error('Get a new key: https://makersuite.google.com/app/apikey');
        }
    }
};

testGeminiKey();
