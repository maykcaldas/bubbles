require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const messagesRoutes = require('./routes/messages');

const app = express();
const port = process.env.PORT || 8080; // Cloud Run uses 8080 by default

// Middleware
app.use(cors());
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

// Routes
app.use('/api/messages', messagesRoutes(pool));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 