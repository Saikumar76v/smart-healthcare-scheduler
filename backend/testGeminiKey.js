require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const testGeminiKey = async () => {
    const apiKey = process.env.GEMINI_API_KEY;

    console.log('=== Gemini API Key Test ===');
    console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');

    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY is not set in .env file');
        process.exit(1);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        console.log('\n✅ API key format is valid');
        console.log('🧪 Testing API call with simple prompt...\n');

        const result = await model.generateContent('Say "Hello, API key is working!"');
        const response = await result.response;
        const text = response.text();

        console.log('✅ SUCCESS! API Response:');
        console.log(text);
        console.log('\n✅ Gemini API key is valid and working!');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ FAILED! Gemini API Error:');
        console.error('Error Code:', error.status || error.code);
        console.error('Error Message:', error.message);

        if (error.message.includes('API_KEY_INVALID')) {
            console.error('\n🔑 The API key is INVALID.');
            console.error('👉 Please get a new key from: https://makersuite.google.com/app/apikey');
        } else if (error.message.includes('billing')) {
            console.error('\n💳 Billing might not be enabled for this API key.');
            console.error('👉 Enable billing at: https://console.cloud.google.com/billing');
        } else if (error.message.includes('quota')) {
            console.error('\n📊 API quota exceeded or rate limit hit.');
        }

        process.exit(1);
    }
};

testGeminiKey();
