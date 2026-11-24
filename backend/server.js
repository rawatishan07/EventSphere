const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./database/db');

// Route modules
const eventsRouter = require('./routes/events');
const bookingsRouter = require('./routes/bookings');
const venuesRouter = require('./routes/venues');
const usersRouter = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString().substring(11, 19);
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Mount API routes
app.use('/api/events', eventsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/venues', venuesRouter);
app.use('/api/users', usersRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'EventSphere – Event & Ticket Booking System',
    timestamp: new Date().toISOString(),
    dbms: 'MySQL 8.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    detail: err.message
  });
});

// Start server and initialize database
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`  🎪 EventSphere Backend API Server is running!`);
      console.log(`     URL: http://localhost:${PORT}`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to start EventSphere server:', err);
    process.exit(1);
  }
}

startServer();

