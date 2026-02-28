const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const {
  saveEmotion,
  getLastSubmission,
  getRecentEmotions,
  getEmotionStats,
  getGlobalEmotionCounts
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Constants
const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds

// Allowed emojis
const ALLOWED_EMOJIS = [
  '😊', '😢', '😠', '😰', '😍', '🤔', 
  '😴', '🤗', '🎉', '💪', '🙏', '❤️'
];

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Submit emotion
app.post('/api/emotion', (req, res) => {
  const { userId, emoji, latitude, longitude, country, city } = req.body;

  // Validate emoji
  if (!emoji || !ALLOWED_EMOJIS.includes(emoji)) {
    return res.status(400).json({ 
      error: 'Invalid emoji',
      allowedEmojis: ALLOWED_EMOJIS
    });
  }

  // Validate or generate user ID
  const finalUserId = userId || uuidv4();

  // Check rate limiting
  getLastSubmission(finalUserId, (err, lastSubmission) => {
    if (err) {
      console.error('Error checking last submission:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const now = Date.now();
    
    if (lastSubmission) {
      const timeSinceLastSubmission = now - lastSubmission.timestamp;
      
      if (timeSinceLastSubmission < ONE_HOUR) {
        const timeRemaining = ONE_HOUR - timeSinceLastSubmission;
        const minutesRemaining = Math.ceil(timeRemaining / (60 * 1000));
        
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          message: `You can submit again in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}`,
          nextSubmissionTime: lastSubmission.timestamp + ONE_HOUR,
          timeRemaining: timeRemaining
        });
      }
    }

    // Save the emotion
    saveEmotion(
      finalUserId,
      emoji,
      latitude || null,
      longitude || null,
      country || null,
      city || null,
      (err, result) => {
        if (err) {
          console.error('Error saving emotion:', err);
          return res.status(500).json({ error: 'Failed to save emotion' });
        }

        res.json({
          success: true,
          userId: finalUserId,
          emoji: emoji,
          timestamp: result.timestamp,
          nextSubmissionTime: result.timestamp + ONE_HOUR
        });
      }
    );
  });
});

// Get user's last submission
app.get('/api/emotion/last/:userId', (req, res) => {
  const { userId } = req.params;

  getLastSubmission(userId, (err, submission) => {
    if (err) {
      console.error('Error getting last submission:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!submission) {
      return res.json({ canSubmit: true, lastSubmission: null });
    }

    const now = Date.now();
    const timeSinceLastSubmission = now - submission.timestamp;
    const canSubmit = timeSinceLastSubmission >= ONE_HOUR;
    const timeRemaining = canSubmit ? 0 : ONE_HOUR - timeSinceLastSubmission;
    const minutesRemaining = Math.ceil(timeRemaining / (60 * 1000));

    res.json({
      canSubmit,
      lastSubmission: submission,
      timeRemaining,
      minutesRemaining,
      nextSubmissionTime: submission.timestamp + ONE_HOUR
    });
  });
});

// Get recent emotions for heat map
app.get('/api/emotions/recent', (req, res) => {
  const limit = parseInt(req.query.limit) || 1000;
  
  getRecentEmotions(limit, (err, emotions) => {
    if (err) {
      console.error('Error getting recent emotions:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ 
      emotions,
      count: emotions.length,
      timestamp: Date.now()
    });
  });
});

// Get emotion statistics
app.get('/api/emotions/stats', (req, res) => {
  getEmotionStats((err, data) => {
    if (err) {
      console.error('Error getting emotion stats:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({
      ...data,
      timestamp: Date.now()
    });
  });
});

// Get global emotion counts (last hour)
app.get('/api/emotions/global', (req, res) => {
  getGlobalEmotionCounts((err, counts) => {
    if (err) {
      console.error('Error getting global emotion counts:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({
      counts,
      timestamp: Date.now()
    });
  });
});

// Serve frontend for all other routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🫀 Pulse server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
