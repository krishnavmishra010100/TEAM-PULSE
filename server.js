require('dotenv').config();
const express = require('express');
const authRoutes = require('./auth.routes');
const orgRoutes = require('./org.routes');
const updateRoutes = require('./update.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Debug log: verify router loading
console.log('Update routes object:', updateRoutes);

// Debug middleware: log every incoming request
app.use((req, res, next) => {
  console.log(` Incoming Request: ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/updates', updateRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});