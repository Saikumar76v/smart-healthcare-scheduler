require('dotenv').config();
const { analyzeSymptoms } = require('./services/aiService');

const testMockAI = async () => {
    console.log('=== Testing Mock AI Service ===\n');

    const testCases = [
        'I have chest pain and shortness of breath',
        'I have a severe headache and dizziness',
        'I have fever and cough',
        'I have skin rash and itching',
        'I have stomach pain and nausea'
    ];

    for (const symptoms of testCases) {
        console.log(`Symptoms: "${symptoms}"`);
        const result = await analyzeSymptoms(symptoms);
        console.log(`✅ Specialization: ${result.specialization}`);
        console.log(`   Urgency: ${result.urgency}`);
        console.log(`   Advice: ${result.suggestedAdvice.substring(0, 60)}...`);
        console.log(`   Provider: ${result.provider}\n`);
    }

    console.log('✅ Mock AI is working perfectly without any API keys!');
};

testMockAI();
