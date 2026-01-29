const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const {
    sendSMS,
    notifyPatientBooking,
    notifyDoctorNewRequest,
    notifyApproval,
    notifyRejection
} = require('../services/twilioService');

// @desc    Book an appointment
// @route   POST /api/appointments/book
// @access  Private
router.post('/book', protect, async (req, res) => {
    const { doctorId, date, timeSlot } = req.body;

    try {
        const appointmentDate = new Date(date);

        const existingAppointment = await Appointment.findOne({
            doctorId,
            date: appointmentDate,
            timeSlot,
            status: { $ne: 'cancelled' }
        });

        if (existingAppointment) {
            res.status(400).json({ message: 'Time slot already booked' });
            return;
        }

        const appointment = await Appointment.create({
            doctorId,
            patientId: req.user._id,
            date: appointmentDate,
            timeSlot,
            status: 'pending'
        });

        // Send SMS to Patient
        // Send SMS Notifications
        const dateStr = appointmentDate.toLocaleDateString();
        const doctor = await User.findById(doctorId);

        // 1. Notify Patient
        if (req.user.phone) {
            await notifyPatientBooking(req.user.phone, req.user.name, dateStr, timeSlot);
        }

        // 2. Notify Doctor
        if (doctor && doctor.phone) {
            await notifyDoctorNewRequest(doctor.phone, req.user.name, dateStr, timeSlot);
        }

        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get logged in user appointments
// @route   GET /api/appointments/my
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.user._id })
            .populate('doctorId', 'name email');

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get logged in doctor appointments
// @route   GET /api/appointments/doctor
// @access  Private (Doctor only)
router.get('/doctor', protect, async (req, res) => {
    try {
        if (req.user.role !== 'doctor') {
            res.status(403).json({ message: 'Access denied. Doctors only.' });
            return;
        }

        // Since doctor is just a user with role 'doctor', we query by doctorId being the user's ID
        const appointments = await Appointment.find({ doctorId: req.user._id })
            .populate('patientId', 'name email');

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update appointment status
// @route   PATCH /api/appointments/:id/status
// @access  Private (Doctor only)
router.patch('/:id/status', protect, async (req, res) => {
    const { status } = req.body;

    try {
        if (req.user.role !== 'doctor') {
            res.status(403).json({ message: 'Access denied. Doctors only.' });
            return;
        }

        if (!['confirmed', 'cancelled', 'completed', 'approved', 'rejected'].includes(status)) {
            res.status(400).json({ message: 'Invalid status' });
            return;
        }

        // Check if the appointment belongs to the logged-in doctor
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            res.status(404).json({ message: 'Appointment not found' });
            return;
        }

        if (appointment.doctorId.toString() !== req.user._id.toString()) {
            res.status(401).json({ message: 'Not authorized to update this appointment' });
            return;
        }

        appointment.status = status;
        await appointment.save();

        // Send SMS on Approval/Rejection
        // Send SMS on Approval/Rejection
        const patient = await User.findById(appointment.patientId);
        const dateStr = new Date(appointment.date).toLocaleDateString();

        if (patient && patient.phone) {
            if (status === 'approved') {
                await notifyApproval(patient.phone, patient.name, req.user.name, dateStr, appointment.timeSlot);
            } else if (status === 'rejected') {
                await notifyRejection(patient.phone, patient.name, req.user.name, dateStr, appointment.timeSlot);
            }
        }

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get appointments for a doctor (Public View - e.g. for booking)
// @route   GET /api/appointments/doctor/:doctorId
// @access  Public
router.get('/doctor/:doctorId', async (req, res) => {
    try {
        const appointments = await Appointment.find({
            doctorId: req.params.doctorId,
            status: { $ne: 'cancelled' }
        }).populate('patientId', 'name email');
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Cancel appointment
// @route   DELETE /api/appointments/cancel/:appointmentId
// @access  Private
router.delete('/cancel/:appointmentId', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.appointmentId);

        if (!appointment) {
            res.status(404).json({ message: 'Appointment not found' });
            return;
        }

        if (appointment.patientId.toString() !== req.user._id.toString()) {
            res.status(401).json({ message: 'Not authorized to cancel this appointment' });
            return;
        }

        appointment.status = 'cancelled';
        await appointment.save();

        if (req.user.phone) {
            sendSMS(req.user.phone, "Smart Scheduler: Your appointment has been cancelled successfully.");
        }

        res.json({ message: 'Appointment cancelled' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Approve appointment
// @route   PUT /api/appointments/:id/approve
// @access  Private (Doctor only)
router.put('/:id/approve', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Only doctor can approve
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ message: 'Only doctors can approve appointments' });
        }

        appointment.status = 'approved';
        await appointment.save();

        // Send SMS via Twilio after approval
        const patient = await User.findById(appointment.patientId);
        if (patient && patient.phone) {
            await sendSMS(
                patient.phone,
                `Your appointment has been approved by the doctor. Date: ${appointment.date}, Time: ${appointment.timeSlot}`
            );
        }

        res.json({
            message: 'Appointment approved successfully',
            appointment,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
