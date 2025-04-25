const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Submit a new message
  router.post('/', async (req, res) => {
    try {
      const { content } = req.body;
      
      // Validate message
      if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Message cannot be empty' });
      }
      
      if (content.length > 280) {
        return res.status(400).json({ error: 'Message is too long (max 280 characters)' });
      }

      const result = await pool.query(
        'INSERT INTO messages (content) VALUES ($1) RETURNING *',
        [content.trim()]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error submitting message:', error);
      res.status(500).json({ error: 'Failed to submit message' });
    }
  });

  // Get random messages for bubbles
  router.get('/random', async (req, res) => {
    try {
      const limit = 10;
      const result = await pool.query(
        'SELECT * FROM messages ORDER BY RANDOM() LIMIT $1',
        [limit]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching random messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  return router;
}; 