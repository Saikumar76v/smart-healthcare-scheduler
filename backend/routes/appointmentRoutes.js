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
    notifyRejection,
    notifyCancellation,
    notifyReschedule
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

        // Send SMS Notifications
        console.log('[BOOKING] Starting SMS notifications...');
        console.log('[BOOKING] Patient phone:', req.user.phone);
        console.log('[BOOKING] Doctor ID:', doctorId);

        const dateStr = appointmentDate.toLocaleDateString();
        const doctor = await User.findById(doctorId);

        console.log('[BOOKING] Doctor found:', doctor ? doctor.name : 'NOT FOUND');
        console.log('[BOOKING] Doctor phone:', doctor?.phone);

        // 1. Notify Patient
        if (req.user.phone) {
            console.log('[BOOKING] Calling notifyPatientBooking...');
            await notifyPatientBooking(req.user.phone, req.user.name, dateStr, timeSlot);
        } else {
            console.warn('[BOOKING] Patient phone missing - SMS not sent');
        }

        // 2. Notify Doctor
        if (doctor && doctor.phone) {
            console.log('[BOOKING] Calling notifyDoctorNewRequest...');
            await notifyDoctorNewRequest(doctor.phone, req.user.name, dateStr, timeSlot);
        } else {
            console.warn('[BOOKING] Doctor phone missing - SMS not sent');
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
        console.log('[APPROVAL] Starting SMS notification...');
        console.log('[APPROVAL] Appointment ID:', req.params.id);

        const patient = await User.findById(appointment.patientId);

        console.log('[APPROVAL] Patient found:', patient ? patient.name : 'NOT FOUND');
        console.log('[APPROVAL] Patient phone:', patient?.phone);

        if (patient && patient.phone) {
            console.log('[APPROVAL] Calling sendSMS...');
            await sendSMS(
                patient.phone,
                `Your appointment has been approved by the doctor. Date: ${appointment.date}, Time: ${appointment.timeSlot}`
            );
        } else {
            console.warn('[APPROVAL] Patient or phone missing - SMS not sent');
        }

        res.json({
            message: 'Appointment approved successfully',
            appointment,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private (Patient or Admin)
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Only patient who booked or admin can cancel
        if (appointment.patientId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
        }

        appointment.status = 'cancelled';
        await appointment.save();

        // Send SMS notifications
        const patient = await User.findById(appointment.patientId);
        const doctor = await User.findById(appointment.doctorId);
        const dateStr = new Date(appointment.date).toLocaleDateString();

        await notifyCancellation(
            patient?.phone,
            patient?.name,
            doctor?.phone,
            doctor?.name,
            dateStr,
            appointment.timeSlot
        );

        res.json({
            message: 'Appointment cancelled successfully',
            appointment
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private (Patient or Admin)
router.put('/:id/reschedule', protect, async (req, res) => {
    const { newDate, newTimeSlot } = req.body;

    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Only patient who booked or admin can reschedule
        if (appointment.patientId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to reschedule this appointment' });
        }

        const newAppointmentDate = new Date(newDate);

        // Check for conflicts at new time
        const conflict = await Appointment.findOne({
            doctorId: appointment.doctorId,
            date: newAppointmentDate,
            timeSlot: newTimeSlot,
            status: { $ne: 'cancelled' },
            _id: { $ne: appointment._id }
        });

        if (conflict) {
            return res.status(400).json({ message: 'New time slot already booked. Choose another time.' });
        }

        // Store old details for SMS
        const oldDateStr = new Date(appointment.date).toLocaleDateString();
        const oldTimeSlot = appointment.timeSlot;

        // Update appointment
        appointment.date = newAppointmentDate;
        appointment.timeSlot = newTimeSlot;
        await appointment.save();

        // Send SMS notifications
        const patient = await User.findById(appointment.patientId);
        const doctor = await User.findById(appointment.doctorId);
        const newDateStr = newAppointmentDate.toLocaleDateString();

        await notifyReschedule(
            patient?.phone,
            patient?.name,
            doctor?.phone,
            doctor?.name,
            oldDateStr,
            oldTimeSlot,
            newDateStr,
            newTimeSlot
        );

        res.json({
            message: 'Appointment rescheduled successfully',
            appointment
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Suggest available time slot
// @route   GET /api/appointments/suggest-slot/:doctorId
// @access  Private
router.get('/suggest-slot/:doctorId', protect, async (req, res) => {
    const { doctorId } = req.params;
    const daysToSearch = parseInt(req.query.daysToSearch) || 7;

    try {
        const availableSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"];
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate.getTime() + daysToSearch * 24 * 60 * 60 * 1000);

        // Find all booked non-cancelled appointments in date range
        const bookedAppointments = await Appointment.find({
            doctorId,
            date: { $gte: startDate, $lte: endDate },
            status: { $ne: 'cancelled' }
        });

        // Try each day
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const currentDate = new Date(d);

            // Skip past dates
            if (currentDate < new Date()) continue;

            const dateStr = currentDate.toISOString().split('T')[0];

            // Check each time slot
            for (const slot of availableSlots) {
                const isBooked = bookedAppointments.some(apt =>
                    new Date(apt.date).toISOString().split('T')[0] === dateStr &&
                    apt.timeSlot === slot
                );

                if (!isBooked) {
                    // Found available slot
                    const alternativeSlots = availableSlots.filter((s, idx) =>
                        idx > availableSlots.indexOf(slot) && idx < availableSlots.indexOf(slot) + 3
                    );

                    return res.json({
                        suggestedDate: dateStr,
                        suggestedTimeSlot: slot,
                        reason: 'Earliest available slot',
                        alternativeSlots
                    });
                }
            }
        }

        res.json({
            suggestedDate: null,
            suggestedTimeSlot: null,
            reason: 'No available slots in the next ' + daysToSearch + ' days',
            alternativeSlots: []
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get doctor calendar (booked slots grouped by date)
// @route   GET /api/appointments/calendar/:doctorId
// @access  Private
router.get('/calendar/:doctorId', protect, async (req, res) => {
    const { doctorId } = req.params;
    const daysAhead = parseInt(req.query.days) || 30;

    try {
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate.getTime() + daysAhead * 24 * 60 * 60 * 1000);

        const appointments = await Appointment.find({
            doctorId,
            date: { $gte: startDate, $lte: endDate }
        }).populate('patientId', 'name email phone');

        // Group by date
        const calendar = {};
        appointments.forEach(apt => {
            const dateKey = new Date(apt.date).toISOString().split('T')[0];
            if (!calendar[dateKey]) {
                calendar[dateKey] = [];
            }
            calendar[dateKey].push({
                _id: apt._id,
                timeSlot: apt.timeSlot,
                patientName: apt.patientId?.name || 'Unknown',
                patientEmail: apt.patientId?.email,
                status: apt.status
            });
        });

        res.json(calendar);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
