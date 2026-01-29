const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    date: {
        type: Date,
        required: true,
    },
    timeSlot: {
        type: String,
        required: true, // Format "HH:mm"
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'approved', 'rejected'],
        default: 'pending',
    },
}, {
    timestamps: true,
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
