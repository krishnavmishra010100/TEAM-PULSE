require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./auth.routes');
const orgRoutes = require('./org.routes');
const updateRoutes = require('./update.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug Middleware
app.use((req, res, next) => {
  console.log(` Incoming Request: ${req.method} ${req.url}`);
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    console.log('   Body Received:', req.body && Object.keys(req.body).length > 0 ? req.body : '[EMPTY/UNDEFINED BODY]');
  }
  next();
});

// Root Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'TeamPulse API is up and running!',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/updates', updateRoutes);

// 404 Fallback for unhandled endpoints
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Global Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});