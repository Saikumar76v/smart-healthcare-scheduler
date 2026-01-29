const mongoose = require('mongoose');

const doctorSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    specialization: {
        type: String,
        required: true,
    },
    workingHours: {
        startTime: {
            type: String,
            required: true, // Format: "HH:mm" e.g., "09:00"
        },
        endTime: {
            type: String,
            required: true, // Format: "HH:mm" e.g., "17:00"
        },
    },
    slotDuration: {
        type: Number,
        default: 30, // in minutes
    },
}, {
    timestamps: true,
});

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
