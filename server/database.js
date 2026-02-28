const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize database
const db = new sqlite3.Database(path.join(__dirname, 'pulse.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Initialize database synchronously
db.serialize(() => {
  // Create emotions table
  db.run(`
    CREATE TABLE IF NOT EXISTS emotions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      emoji TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      country TEXT,
      city TEXT,
      timestamp INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating emotions table:', err.message);
    } else {
      console.log('Emotions table ready.');
    }
  });

  // Create index on timestamp for faster queries
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_timestamp ON emotions(timestamp DESC)
  `);

  // Create index on user_id for rate limiting
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_user_id_timestamp ON emotions(user_id, timestamp DESC)
  `);
});

// Save emotion submission
function saveEmotion(userId, emoji, latitude, longitude, country, city, callback) {
  const timestamp = Date.now();
  const sql = `
    INSERT INTO emotions (user_id, emoji, latitude, longitude, country, city, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(sql, [userId, emoji, latitude, longitude, country, city, timestamp], function(err) {
    if (err) {
      callback(err);
    } else {
      callback(null, { id: this.lastID, timestamp });
    }
  });
}

// Get last submission time for a user
function getLastSubmission(userId, callback) {
  const sql = `
    SELECT timestamp, emoji
    FROM emotions
    WHERE user_id = ?
    ORDER BY timestamp DESC
    LIMIT 1
  `;
  
  db.get(sql, [userId], (err, row) => {
    callback(err, row);
  });
}

// Get recent emotions for heat map (last 24 hours)
function getRecentEmotions(limit = 1000, callback) {
  const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
  const sql = `
    SELECT emoji, latitude, longitude, country, city, timestamp
    FROM emotions
    WHERE timestamp > ?
    ORDER BY timestamp DESC
    LIMIT ?
  `;
  
  db.all(sql, [twentyFourHoursAgo, limit], (err, rows) => {
    callback(err, rows);
  });
}

// Get emotion statistics
function getEmotionStats(callback) {
  const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
  const sql = `
    SELECT 
      emoji,
      COUNT(*) as count,
      country
    FROM emotions
    WHERE timestamp > ?
    GROUP BY emoji, country
    ORDER BY count DESC
  `;
  
  db.all(sql, [twentyFourHoursAgo], (err, rows) => {
    if (err) {
      callback(err);
      return;
    }
    
    // Also get total count
    db.get(`SELECT COUNT(*) as total FROM emotions WHERE timestamp > ?`, 
      [twentyFourHoursAgo], 
      (err2, totalRow) => {
        callback(err2, { stats: rows, total: totalRow ? totalRow.total : 0 });
      }
    );
  });
}

// Get global emotion counts (for the last hour)
function getGlobalEmotionCounts(callback) {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  const sql = `
    SELECT 
      emoji,
      COUNT(*) as count
    FROM emotions
    WHERE timestamp > ?
    GROUP BY emoji
    ORDER BY count DESC
  `;
  
  db.all(sql, [oneHourAgo], (err, rows) => {
    callback(err, rows);
  });
}

module.exports = {
  db,
  saveEmotion,
  getLastSubmission,
  getRecentEmotions,
  getEmotionStats,
  getGlobalEmotionCounts
};
