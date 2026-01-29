const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { analyzeSymptoms } = require('../services/aiService');
const User = require('../models/User');

// @desc    Analyze symptoms using AI
// @route   POST /api/ai/symptom-check
// @access  Private
router.post('/symptom-check', protect, async (req, res) => {
    const { symptoms } = req.body;

    if (!symptoms || symptoms.trim() === '') {
        return res.status(400).json({ message: 'Symptoms are required' });
    }

    try {
        const analysis = await analyzeSymptoms(symptoms);
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get AI-recommended doctors based on symptoms
// @route   POST /api/ai/recommend-doctor
// @access  Private
router.post('/recommend-doctor', protect, async (req, res) => {
    const { symptoms } = req.body;

    if (!symptoms || symptoms.trim() === '') {
        return res.status(400).json({ message: 'Symptoms are required' });
    }

    try {
        // 1. Get AI analysis
        const analysis = await analyzeSymptoms(symptoms);

        // 2. Find doctors matching the specialization
        // Note: We need to add specialization field to User model or use a flexible search
        const doctors = await User.find({
            role: 'doctor'
        }).select('name email phone');

        res.json({
            analysis,
            recommendedDoctors: doctors,
            message: `Found ${doctors.length} doctors. AI suggests: ${analysis.specialization}`
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
