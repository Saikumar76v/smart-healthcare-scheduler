const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Doctor = require('./models/Doctor');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding...');

        // 1. Clear existing test users to avoid duplicates
        await User.deleteMany({ email: { $in: ['admin@example.com', 'doctor@test.com', 'patient@test.com'] } });

        console.log('Creating Admin...');
        await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin'
        });

        console.log('Creating Doctor...');
        const doctorUser = await User.create({
            name: 'Dr. Smith',
            email: 'doctor@test.com',
            password: 'doctor123',
            role: 'doctor',
            phone: '1234567890'
        });

        // Create Doctor Profile
        await Doctor.create({
            userId: doctorUser._id,
            specialization: 'Cardiology',
            workingHours: {
                startTime: '09:00',
                endTime: '17:00'
            },
            slotDuration: 30
        });

        console.log('Creating Patient...');
        await User.create({
            name: 'John Doe',
            email: 'patient@test.com',
            password: 'patient123',
            role: 'patient',
            phone: '0987654321'
        });

        console.log('✅ Seeding complete!');
        console.log('\nCredentials:');
        console.log('- Admin: admin@example.com / admin123');
        console.log('- Doctor: doctor@test.com / doctor123');
        console.log('- Patient: patient@test.com / patient123');

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedData();
