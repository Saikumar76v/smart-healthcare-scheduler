const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { sendSMS } = require('../services/twilioService');

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
    const timestamp = new Date().toLocaleString();
    console.log(`\n[REMINDER JOB] Started at ${timestamp}`);
    console.log('[REMINDER JOB] Checking for upcoming appointments...');

    try {
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

        // Find ONLY approved appointments happening within the next hour
        const upcomingAppointments = await Appointment.find({
            status: 'approved',  // Only approved appointments
            date: {
                $gte: now,
                $lte: oneHourLater
            }
        }).populate('patientId', 'name phone')
            .populate('doctorId', 'name');

        if (upcomingAppointments.length === 0) {
            console.log('[REMINDER JOB] No upcoming appointments found.');
            console.log('[REMINDER JOB] ✓ Check complete\n');
            return;
        }

        console.log(`[REMINDER JOB] Found ${upcomingAppointments.length} upcoming appointment(s)`);

        for (const appointment of upcomingAppointments) {
            const patient = appointment.patientId;
            const doctor = appointment.doctorId;

            if (!patient || !patient.phone) {
                console.warn(`[REMINDER JOB] ⚠️  Skipping appointment ${appointment._id} - Patient phone missing`);
                continue;
            }

            const dateStr = new Date(appointment.date).toLocaleDateString();
            const message = `Reminder: Your appointment with Dr. ${doctor?.name || 'Unknown'} is at ${appointment.timeSlot} on ${dateStr}.`;

            console.log(`[REMINDER] Sending SMS to ${patient.name} (${patient.phone})`);
            console.log(`[REMINDER] Message: "${message}"`);

            await sendSMS(patient.phone, message);

            console.log(`[REMINDER] ✓ SMS sent to ${patient.name}`);
        }

        console.log(`[REMINDER JOB] ✓ Completed - ${upcomingAppointments.length} reminder(s) sent\n`);

    } catch (error) {
        console.error('[REMINDER JOB] ✗ Error:', error.message);
        console.error('[REMINDER JOB] Stack:', error.stack);
    }
});

console.log('═══════════════════════════════════════════════════════');
console.log('📅 Appointment Reminder Cron Job Started');
console.log('⏰ Schedule: Every 5 minutes');
console.log('📋 Criteria: Approved appointments within next 1 hour');
console.log('═══════════════════════════════════════════════════════\n');
