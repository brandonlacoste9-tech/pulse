import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'emotions.json');

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      if (!fs.existsSync(dataFilePath)) {
        return res.status(200).json([]);
      }
      
      const data = fs.readFileSync(dataFilePath, 'utf8');
      const jsonData = JSON.parse(data);
      
      res.status(200).json(jsonData.history || []);
    } catch (error) {
      console.error('Error reading history:', error);
      res.status(500).json({ error: 'Failed to read history' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
