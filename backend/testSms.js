require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Usage: node testSms.js <to_phone_number>
// Example: node testSms.js +1234567890
const toPhoneNumber = process.argv[2];

if (!toPhoneNumber) {
    console.error('Please provide a recipient phone number.');
    console.error('Usage: node testSms.js <to_phone_number>');
    process.exit(1);
}

if (!accountSid || !authToken || !fromPhoneNumber) {
    console.error('Missing Twilio credentials in .env file.');
    console.log('TWILIO_ACCOUNT_SID:', accountSid ? 'Set' : 'Missing');
    console.log('TWILIO_AUTH_TOKEN:', authToken ? 'Set' : 'Missing');
    console.log('TWILIO_PHONE_NUMBER:', fromPhoneNumber ? 'Set' : 'Missing');
    process.exit(1);
}

console.log('Attempting to send test SMS...');
console.log(`From: ${fromPhoneNumber}`);
console.log(`To: ${toPhoneNumber}`);

const client = twilio(accountSid, authToken);

client.messages
    .create({
        body: '✅ Smart Healthcare Scheduler Test SMS Working!',
        from: fromPhoneNumber,
        to: toPhoneNumber
    })
    .then(message => {
        console.log(`SUCCESS! SMS sent. SID: ${message.sid}`);
    })
    .catch(error => {
        console.error('FAILED to send SMS.');
        console.error('Error Code:', error.code);
        console.error('Message:', error.message);
        if (error.moreInfo) console.error('More Info:', error.moreInfo);
    });
