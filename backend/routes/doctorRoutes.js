const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
router.get('/', async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' }).select('-password');
        console.log('Doctors fetched:', doctors);
        res.json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
