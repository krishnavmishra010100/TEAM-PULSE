require('dotenv').config();
const express = require('express');
const authRoutes = require('./auth.routes');
const orgRoutes = require('./org.routes'); // 1️⃣ Import routes FIRST

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/org', orgRoutes); // 2️⃣ Use routes SECOND

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});