const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected for cleanup'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

const User = require('./models/User');

const cleanupOldUsers = async () => {
    try {
        console.log('Starting user cleanup...');

        // Delete all non-admin users
        const result = await User.deleteMany({ role: { $ne: 'admin' } });
        console.log(`Deleted ${result.deletedCount} users (kept admin users)`);

        // Keep admin for testing
        console.log('\nRemaining users:');
        const remainingUsers = await User.find({});
        remainingUsers.forEach(user => {
            console.log(`- ${user.email} (${user.role})`);
        });

        console.log('\n✅ Cleanup complete!');
        console.log('\nYou can now register fresh accounts:');
        console.log('Doctor: doctor@test.com / doctor123');
        console.log('Patient: patient@test.com / patient123');

        process.exit(0);
    } catch (error) {
        console.error('Cleanup error:', error);
        process.exit(1);
    }
};

cleanupOldUsers();
