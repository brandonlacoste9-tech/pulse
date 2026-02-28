import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'emotions.json');

// Ensure data directory and file exist
const ensureDataFile = () => {
  const dataDir = path.join(process.cwd(), 'data');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify({ emotions: {}, history: [] }));
  }
};

// Read emotion data
const readData = () => {
  ensureDataFile();
  const data = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(data);
};

// Write emotion data
const writeData = (data) => {
  ensureDataFile();
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

// Get client IP
const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         'unknown';
};

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Return current emotion counts
    try {
      const data = readData();
      res.status(200).json(data.emotions);
    } catch (error) {
      console.error('Error reading data:', error);
      res.status(500).json({ error: 'Failed to read data' });
    }
  } else if (req.method === 'POST') {
    // Record a new emotion
    try {
      const { emoji } = req.body;
      
      if (!emoji) {
        return res.status(400).json({ error: 'Emoji is required' });
      }
      
      const data = readData();
      
      // Update current emotion counts
      if (!data.emotions[emoji]) {
        data.emotions[emoji] = 0;
      }
      data.emotions[emoji]++;
      
      // Add to history with timestamp and location info
      const timestamp = new Date().toISOString();
      const ip = getClientIp(req);
      
      data.history.push({
        emoji,
        timestamp,
        ip: ip.substring(0, 10) + '...', // Partial IP for privacy
      });
      
      // Keep only last 10000 entries in history
      if (data.history.length > 10000) {
        data.history = data.history.slice(-10000);
      }
      
      writeData(data);
      
      res.status(200).json({ success: true, totalVotes: data.emotions[emoji] });
    } catch (error) {
      console.error('Error recording emotion:', error);
      res.status(500).json({ error: 'Failed to record emotion' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
