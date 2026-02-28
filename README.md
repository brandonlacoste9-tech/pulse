# 🫀 Pulse - Feel the World

> One emoji per hour. The world's emotional heartbeat in real-time.

## 🌍 What is Pulse?

Pulse is a revolutionary app that creates a global heat map of human emotion. Once per hour, users tap ONE emoji to express how they feel. That's it. Simple, powerful, universal.

### Why Pulse Goes Viral in 2026:

- 🫀 **1 Second to Participate** - Zero friction = massive adoption
- 📸 **Insanely Shareable** - "Look what the world felt at 3am on New Year's"
- 🤖 **Anti-AI** - 100% raw human emotion when everyone's drowning in AI slop
- 🌐 **Universal Language** - Emojis need no translation
- 📺 **Living History** - Becomes an emotional archive of humanity
- 💰 **Clear Monetization** - Events, brands, researchers want this data

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/brandonlacoste9-tech/pulse.git
cd pulse

# Install dependencies
npm install

# Start the server
npm start
```

The app will be available at `http://localhost:3000`

### Development

```bash
# Run in development mode
npm run dev
```

## 📁 Project Structure

```
pulse/
├── server/
│   ├── server.js      # Express server and API routes
│   ├── database.js    # SQLite database configuration
│   └── pulse.db       # SQLite database file (auto-generated)
├── public/
│   ├── index.html     # Main HTML file
│   ├── css/
│   │   └── style.css  # Styles
│   └── js/
│       └── app.js     # Frontend JavaScript
├── package.json
└── README.md
```

## 🎯 Features

### Core Functionality

- **One-Tap Emotion Sharing** - Select from 12 carefully chosen emojis
- **Hourly Rate Limiting** - Users can submit one emotion per hour
- **Real-Time Global Stats** - See what the world is feeling right now
- **Live Emotional Feed** - View the last 100 emotions shared
- **24-Hour Archive** - All emotions from the past day
- **Location Awareness** - Optional geolocation for mapping (city/country)
- **User Persistence** - Each user gets a unique ID stored locally
- **Beautiful UI** - Modern, responsive design with gradient animations

### Available Emojis

😊 Happy | 😢 Sad | 😠 Angry | 😰 Anxious | 😍 Love | 🤔 Thinking
😴 Tired | 🤗 Grateful | 🎉 Excited | 💪 Motivated | 🙏 Peaceful | ❤️ Loving

## 🛠️ API Endpoints

### POST `/api/emotion`
Submit a new emotion

**Request Body:**
```json
{
  "userId": "uuid-string",
  "emoji": "😊",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "country": "USA",
  "city": "New York"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "uuid-string",
  "emoji": "😊",
  "timestamp": 1234567890,
  "nextSubmissionTime": 1234571490
}
```

### GET `/api/emotion/last/:userId`
Check user's last submission and rate limit status

**Response:**
```json
{
  "canSubmit": false,
  "lastSubmission": {
    "timestamp": 1234567890,
    "emoji": "😊"
  },
  "timeRemaining": 3500000,
  "minutesRemaining": 58,
  "nextSubmissionTime": 1234571490
}
```

### GET `/api/emotions/recent?limit=100`
Get recent emotions (last 24 hours)

**Response:**
```json
{
  "emotions": [
    {
      "emoji": "😊",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "country": "USA",
      "city": "New York",
      "timestamp": 1234567890
    }
  ],
  "count": 1,
  "timestamp": 1234567890
}
```

### GET `/api/emotions/stats`
Get aggregated emotion statistics

**Response:**
```json
{
  "stats": [
    {
      "emoji": "😊",
      "count": 150,
      "country": "USA"
    }
  ],
  "total": 1500,
  "timestamp": 1234567890
}
```

### GET `/api/emotions/global`
Get global emotion counts (last hour)

**Response:**
```json
{
  "counts": [
    {
      "emoji": "😊",
      "count": 50
    }
  ],
  "timestamp": 1234567890
}
```

### GET `/api/health`
Health check endpoint

## 💾 Database Schema

### emotions table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| user_id | TEXT | Unique user identifier |
| emoji | TEXT | Submitted emoji |
| latitude | REAL | User latitude (optional) |
| longitude | REAL | User longitude (optional) |
| country | TEXT | User country (optional) |
| city | TEXT | User city (optional) |
| timestamp | INTEGER | Unix timestamp in milliseconds |
| created_at | DATETIME | Record creation time |

## 🎨 Design Philosophy

1. **Minimal Friction** - One tap, that's it
2. **Beautiful** - Gradient animations, smooth transitions
3. **Universal** - Works on any device, any language
4. **Fast** - Instant feedback, real-time updates
5. **Human** - No AI, just real emotions from real people

## 🔐 Privacy

- No personal information collected
- Location data is optional
- User IDs are randomly generated and stored locally
- No tracking or analytics

## 🚢 Deployment

### Environment Variables

- `PORT` - Server port (default: 3000)

### Deployment Platforms

This app can be deployed to:
- Heroku
- Vercel
- Railway
- DigitalOcean App Platform
- AWS Elastic Beanstalk
- Google Cloud Run
- Any Node.js hosting service

### Example: Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-pulse-app

# Deploy
git push heroku main

# Open app
heroku open
```

## 📈 Future Enhancements

- [ ] Heat map visualization with actual map integration
- [ ] Country/city-based filtering
- [ ] Historical snapshots ("What the world felt on...")
- [ ] Social sharing with custom images
- [ ] Push notifications for global emotional shifts
- [ ] WebSocket support for truly real-time updates
- [ ] Data export and API for researchers
- [ ] Premium features (extended history, analytics)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC License - see LICENSE file for details

## 🙏 Acknowledgments

Built with:
- Express.js - Fast, unopinionated web framework
- SQLite3 - Lightweight database
- Vanilla JavaScript - No framework needed
- Love and emojis ❤️

---

**🫀 Pulse - The World's Emotional Heartbeat**

*One tap per hour. Make it count.*
