const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

// Connect Database
// Connect Database
connectDB();

const User = require('./models/User');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Admin user seeded successfully');
    }
  } catch (error) {
    console.error('Admin seeding failed:', error.message);
  }
};

seedAdmin();

const app = express();

// Middleware
app.use(express.json());

// Production Ready CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,              // Production Frontend
  'http://localhost:5173',               // Local Development
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.send('Smart Healthcare API is running...');
});

// Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// Start appointment reminder cron job
require('./jobs/reminderJob');
