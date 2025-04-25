require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const messagesRoutes = require('./routes/messages');

const app = express();
const port = process.env.PORT || 8080; // Cloud Run uses 8080 by default

// Log environment variables (without sensitive data)
console.log('Environment variables loaded:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('PORT:', process.env.PORT);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://bubbles-buaa0fpr6-maykcaldas-projects.vercel.app',
    'https://bubbles-client.vercel.app'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false // Required for Cloud SQL
  }
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Successfully connected to the database');
    release();
  }
});

// Routes
app.use('/api/messages', messagesRoutes(pool));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 