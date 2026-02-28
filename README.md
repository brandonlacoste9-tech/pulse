# 🫀 PULSE - Feel the World

> One emoji, once per hour. A real-time global heat map of human emotion.

## What is PULSE?

PULSE is a revolutionary emotion-tracking app that creates a living, breathing map of global human emotion. The concept is beautifully simple: once per hour, you tap ONE emoji to express how you feel. That's it.

These individual moments combine to create something extraordinary - a real-time visualization of humanity's emotional state, city by city, country by country.

## Why PULSE?

🫀 **Zero Friction** - Takes 1 second to participate. No forms, no profiles, just pure emotion.

📸 **Insanely Shareable** - "Look what the world felt at 3am on New Year's Eve"

🤖 **Anti-AI** - 100% raw human emotion when everyone's drowning in AI-generated content

🌐 **Universal Language** - Emojis need no translation

📺 **Living History** - An emotional archive of humanity

💰 **Clear Monetization** - Events, brands, researchers all want this data

## Features

- **Simple Emoji Selection** - Choose from 8 core emotions
- **Once-Per-Hour Limitation** - Ensures genuine, thoughtful responses
- **Real-Time Global Stats** - See what the world is feeling right now
- **Historical Archive** - Browse the emotional timeline of humanity
- **Beautiful UI** - Gradient design with smooth animations
- **Privacy-Conscious** - Only partial IP logging for general location

## Quick Start

### Prerequisites

- Node.js 14+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/brandonlacoste9-tech/pulse.git
cd pulse
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Frontend**: Next.js 16, React 19
- **Styling**: CSS Modules
- **Backend**: Next.js API Routes
- **Storage**: JSON file storage (easily upgradeable to database)
- **Deployment Ready**: Vercel, Netlify, or any Node.js host

## Project Structure

```
pulse/
├── pages/
│   ├── index.js          # Main emoji selection page
│   ├── history.js        # Historical data viewer
│   ├── _app.js          # Next.js app wrapper
│   └── api/
│       ├── emotions.js   # Emotion data API
│       └── history.js    # History data API
├── styles/
│   ├── globals.css       # Global styles
│   ├── Home.module.css   # Main page styles
│   └── History.module.css # History page styles
├── data/
│   └── emotions.json     # Emotion data storage
└── package.json
```

## API Endpoints

### GET /api/emotions
Returns current emotion counts:
```json
{
  "😊": 150,
  "😢": 45,
  "😡": 23
}
```

### POST /api/emotions
Submit a new emotion:
```json
{
  "emoji": "😊"
}
```

### GET /api/history
Returns historical emotion data with timestamps.

## Future Enhancements

- **Interactive Heat Map** - Geographic visualization with real maps
- **Time-lapse Videos** - Watch emotions shift over hours/days
- **Event Tracking** - Correlate emotions with world events
- **Advanced Analytics** - Trend analysis and predictions
- **Social Sharing** - Generate shareable emotion snapshots
- **Mobile Apps** - Native iOS and Android applications
- **Database Integration** - PostgreSQL or MongoDB for scalability
- **Real-time WebSockets** - Live updates without polling
- **Geolocation API** - Precise location tracking (with permission)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Acknowledgments

Built with ❤️ for humanity's emotional connection.

---

**PULSE** - Because every emotion matters.

