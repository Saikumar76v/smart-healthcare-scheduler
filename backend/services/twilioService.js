const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client;

if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
} else {
    console.warn('Twilio credentials missing. SMS service will be disabled.');
}

const sendSMS = async (to, body) => {
    if (!client) {
        console.log(`[SMS Simulation] To: ${to}, Message: ${body}`);
        return;
    }

    try {
        const message = await client.messages.create({
            body: body,
            from: fromPhoneNumber,
            to: to
        });
        console.log(`SMS sent to ${to}: ${message.sid}`);
    } catch (error) {
        console.error(`Failed to send SMS to ${to}:`, error.message);
        // Do not throw error to prevent crashing main application flow
    }
};

const notifyPatientBooking = async (phone, patientName, date, time) => {
    console.log(`[SMS] Attempting to notify patient booking - Phone: ${phone}, Patient: ${patientName}`);
    if (!phone) {
        console.warn('[SMS] Patient phone number missing - skipping notification');
        return;
    }
    const message = `Halo ${patientName}, Appointment booked successfully. Date: ${date} at ${time}. Status: Pending.`;
    await sendSMS(phone, message);
};

const notifyDoctorNewRequest = async (phone, patientName, date, time) => {
    console.log(`[SMS] Attempting to notify doctor new request - Phone: ${phone}, Patient: ${patientName}`);
    if (!phone) {
        console.warn('[SMS] Doctor phone number missing - skipping notification');
        return;
    }
    const message = `New appointment request received from ${patientName} for ${date} at ${time}.`;
    await sendSMS(phone, message);
};

const notifyApproval = async (phone, patientName, doctorName, date, time) => {
    console.log(`[SMS] Attempting to notify approval - Phone: ${phone}, Patient: ${patientName}, Doctor: ${doctorName}`);
    if (!phone) {
        console.warn('[SMS] Patient phone number missing - skipping approval notification');
        return;
    }
    const message = `Hello ${patientName}, Your appointment on ${date} at ${time} has been APPROVED by Dr. ${doctorName}.`;
    await sendSMS(phone, message);
};

const notifyRejection = async (phone, patientName, doctorName, date, time) => {
    console.log(`[SMS] Attempting to notify rejection - Phone: ${phone}, Patient: ${patientName}, Doctor: ${doctorName}`);
    if (!phone) {
        console.warn('[SMS] Patient phone number missing - skipping rejection notification');
        return;
    }
    const message = `Hello ${patientName}, Your appointment on ${date} at ${time} has been REJECTED by Dr. ${doctorName}.`;
    await sendSMS(phone, message);
};

const notifyCancellation = async (patientPhone, patientName, doctorPhone, doctorName, date, time) => {
    console.log(`[SMS] Notifying cancellation - Patient: ${patientName}, Doctor: ${doctorName}`);

    // Notify patient
    if (patientPhone) {
        const patientMessage = `Your appointment with Dr. ${doctorName} on ${date} at ${time} has been cancelled.`;
        await sendSMS(patientPhone, patientMessage);
    }

    // Notify doctor
    if (doctorPhone) {
        const doctorMessage = `Appointment with ${patientName} on ${date} at ${time} has been cancelled.`;
        await sendSMS(doctorPhone, doctorMessage);
    }
};

const notifyReschedule = async (patientPhone, patientName, doctorPhone, doctorName, oldDate, oldTime, newDate, newTime) => {
    console.log(`[SMS] Notifying reschedule - Patient: ${patientName}, Doctor: ${doctorName}`);

    // Notify patient
    if (patientPhone) {
        const patientMessage = `Your appointment with Dr. ${doctorName} has been rescheduled from ${oldDate} ${oldTime} to ${newDate} ${newTime}.`;
        await sendSMS(patientPhone, patientMessage);
    }

    // Notify doctor
    if (doctorPhone) {
        const doctorMessage = `Appointment with ${patientName} has been rescheduled from ${oldDate} ${oldTime} to ${newDate} ${newTime}.`;
        await sendSMS(doctorPhone, doctorMessage);
    }
};

module.exports = {
    sendSMS,
    notifyPatientBooking,
    notifyDoctorNewRequest,
    notifyApproval,
    notifyRejection,
    notifyCancellation,
    notifyReschedule
};
