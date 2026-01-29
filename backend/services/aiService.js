// Mock AI Service - Works without API keys
// Uses keyword-based symptom analysis

const mockAnalyzeSymptoms = (symptomsText) => {
    const symptoms = symptomsText.toLowerCase();

    // Define symptom patterns and their corresponding specializations
    const patterns = [
        {
            keywords: ['chest pain', 'heart', 'palpitation', 'shortness of breath'],
            specialization: 'Cardiology',
            urgency: 'High',
            advice: 'Chest pain requires immediate medical attention. Please consult a cardiologist as soon as possible.'
        },
        {
            keywords: ['headache', 'migraine', 'dizziness', 'vertigo'],
            specialization: 'Neurology',
            urgency: 'Medium',
            advice: 'Persistent headaches should be evaluated by a neurologist to rule out serious conditions.'
        },
        {
            keywords: ['fever', 'cough', 'cold', 'flu', 'throat'],
            specialization: 'General Medicine',
            urgency: 'Low',
            advice: 'Common cold and flu symptoms can be managed with rest and hydration. Consult a doctor if symptoms persist beyond 3-4 days.'
        },
        {
            keywords: ['skin', 'rash', 'acne', 'allergy', 'itching'],
            specialization: 'Dermatology',
            urgency: 'Low',
            advice: 'Skin conditions should be examined by a dermatologist for proper diagnosis and treatment.'
        },
        {
            keywords: ['stomach', 'abdomen', 'nausea', 'vomiting', 'diarrhea'],
            specialization: 'Gastroenterology',
            urgency: 'Medium',
            advice: 'Digestive issues may indicate various conditions. Please consult a gastroenterologist for proper evaluation.'
        },
        {
            keywords: ['bone', 'joint', 'arthritis', 'back pain', 'muscle'],
            specialization: 'Orthopedics',
            urgency: 'Medium',
            advice: 'Bone and joint problems should be evaluated by an orthopedic specialist for proper treatment.'
        },
        {
            keywords: ['eye', 'vision', 'blurry', 'sight'],
            specialization: 'Ophthalmology',
            urgency: 'Medium',
            advice: 'Vision problems require examination by an ophthalmologist to prevent complications.'
        },
        {
            keywords: ['ear', 'hearing', 'nose', 'throat'],
            specialization: 'ENT (Ear, Nose, Throat)',
            urgency: 'Low',
            advice: 'ENT issues should be checked by a specialist for appropriate treatment.'
        }
    ];

    // Find matching pattern
    for (const pattern of patterns) {
        const hasMatch = pattern.keywords.some(keyword => symptoms.includes(keyword));
        if (hasMatch) {
            return pattern;
        }
    }

    // Default fallback
    return {
        specialization: 'General Medicine',
        urgency: 'Medium',
        advice: 'Please consult a general physician for a comprehensive evaluation of your symptoms.'
    };
};

const analyzeSymptoms = async (symptomsText) => {
    if (!symptomsText || symptomsText.trim() === '') {
        throw new Error('Symptoms text is required');
    }

    console.log('[MOCK AI] Analyzing symptoms:', symptomsText.substring(0, 50) + '...');

    try {
        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const analysis = mockAnalyzeSymptoms(symptomsText);

        console.log('[MOCK AI] Analysis complete:', analysis.specialization);

        return {
            specialization: analysis.specialization,
            urgency: analysis.urgency,
            suggestedAdvice: analysis.advice,
            provider: 'mock-ai'
        };

    } catch (error) {
        console.error('[MOCK AI] Analysis Error:', error.message);

        // Return fallback response
        return {
            specialization: 'General Medicine',
            urgency: 'Medium',
            suggestedAdvice: 'Please consult a healthcare professional for proper diagnosis.',
            error: true,
            errorMessage: error.message
        };
    }
};

module.exports = { analyzeSymptoms };
