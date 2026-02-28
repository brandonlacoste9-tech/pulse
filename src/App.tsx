import { useState, useEffect, useRef, useCallback } from 'react'
import Globe from 'react-globe.gl'
import * as THREE from 'three'
import './App.css'
import Confetti from './Confetti'
import MoodChart from './MoodChart'
import ShareModal from './ShareModal'

interface MoodEntry {
  id: string
  mood: string
  emoji: string
  note: string
  timestamp: number
  city: string
  lat: number
  lng: number
}

interface Dare {
  id: string
  text: string
  from: string
  accepted: boolean
  completed: boolean
}

interface CityScore {
  city: string
  score: number
  mood: string
  entries: number
}

const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Happy', color: '#fbbf24' },
  { id: 'sad', emoji: '😢', label: 'Sad', color: '#60a5fa' },
  { id: 'energetic', emoji: '⚡', label: 'Energetic', color: '#f472b6' },
  { id: 'calm', emoji: '😌', label: 'Calm', color: '#34d399' },
  { id: 'angry', emoji: '😠', label: 'Angry', color: '#f87171' },
]

const DARES = [
  "Take a 5-minute walk outside",
  "Drink a glass of water mindfully",
  "Text someone you haven't spoken to in a while",
  "Write down 3 things you're grateful for",
  "Do 10 jumping jacks",
  "Listen to your favorite song",
  "Take 5 deep breaths",
  "Compliment a stranger",
  "Eat something healthy",
  "Step away from screens for 10 minutes"
]

const CITIES = [
  { name: "New York", lat: 40.7128, lng: -74.0060 },
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
  { name: "Paris", lat: 48.8566, lng: 2.3522 },
  { name: "Sydney", lat: -33.8688, lng: 151.2093 },
  { name: "Berlin", lat: 52.5200, lng: 13.4050 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
  { name: "São Paulo", lat: -23.5505, lng: -46.6333 },
  { name: "Cape Town", lat: -33.9249, lng: 18.4241 },
]

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [selectedMood, setSelectedMood] = useState('')
  const [moodNote, setMoodNote] = useState('')
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [dares, setDares] = useState<Dare[]>([])
  const [streak, setStreak] = useState(0)
  const [cityScores, setCityScores] = useState<CityScore[]>([])
  const [dareToken, setDareToken] = useState('')
  const [showNotification, setShowNotification] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const globeRef = useRef<any>(null)

  useEffect(() => {
    const savedEntries = localStorage.getItem('pulse_entries')
    const savedDares = localStorage.getItem('pulse_dares')
    const savedStreak = localStorage.getItem('pulse_streak')
    const savedLastEntry = localStorage.getItem('pulse_last_entry')
    
    if (savedEntries) {
      const parsed = JSON.parse(savedEntries)
      setEntries(parsed)
      calculateCityScores(parsed)
    }
    
    if (savedDares) setDares(JSON.parse(savedDares))
    
    if (savedStreak) {
      const streak = parseInt(savedStreak)
      const lastEntry = savedLastEntry ? parseInt(savedLastEntry) : 0
      const today = new Date().setHours(0,0,0,0)
      const lastDate = new Date(lastEntry).setHours(0,0,0,0)
      
      if (today - lastDate <= 86400000 * 2) {
        setStreak(streak)
      } else {
        setStreak(0)
      }
    }

    const hash = window.location.hash
    if (hash.startsWith('#dare=')) {
      const token = hash.replace('#dare=', '')
      setDareToken(token)
      setCurrentView('dare')
    } else if (hash === '#view=globe') {
      setCurrentView('globe')
    }
  }, [])

  const calculateCityScores = useCallback((entryData: MoodEntry[]) => {
    const scores = new Map<string, { score: number; entries: number; moods: string[] }>()
    
    entryData.forEach(entry => {
      const current = scores.get(entry.city) || { score: 0, entries: 0, moods: [] }
      const moodValue = entry.mood === 'happy' || entry.mood === 'energetic' || entry.mood === 'calm' ? 10 : 5
      current.score += moodValue
      current.entries += 1
      current.moods.push(entry.mood)
      scores.set(entry.city, current)
    })

    const sorted = Array.from(scores.entries())
      .map(([city, data]) => ({
        city,
        score: data.score,
        entries: data.entries,
        mood: data.moods[data.moods.length - 1] || 'calm'
      }))
      .sort((a, b) => b.score - a.score)
    
    setCityScores(sorted)
  }, [])

  const saveEntry = () => {
    if (!selectedMood) {
      showNotificationMsg('Please select a mood first!')
      return
    }

    const city = CITIES[Math.floor(Math.random() * CITIES.length)]
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      mood: selectedMood,
      emoji: MOODS.find(m => m.id === selectedMood)?.emoji || '😐',
      note: moodNote,
      timestamp: Date.now(),
      city: city.name,
      lat: city.lat,
      lng: city.lng
    }

    const updatedEntries = [...entries, newEntry]
    setEntries(updatedEntries)
    localStorage.setItem('pulse_entries', JSON.stringify(updatedEntries))
    
    const today = new Date().setHours(0,0,0,0)
    const lastEntry = localStorage.getItem('pulse_last_entry')
    const lastDate = lastEntry ? new Date(parseInt(lastEntry)).setHours(0,0,0,0) : 0
    
    if (today !== lastDate) {
      const newStreak = today - lastDate <= 86400000 * 2 ? streak + 1 : 1
      setStreak(newStreak)
      localStorage.setItem('pulse_streak', newStreak.toString())
      localStorage.setItem('pulse_last_entry', Date.now().toString())
    }

    calculateCityScores(updatedEntries)
    showNotificationMsg('Mood shared successfully! 🎉')
    setMoodNote('')
    setSelectedMood('')
  }

  const generateDare = () => {
    const randomDare = DARES[Math.floor(Math.random() * DARES.length)]
    const token = Math.random().toString(36).substring(2, 15)
    const newDare: Dare = {
      id: token,
      text: randomDare,
      from: 'Anonymous',
      accepted: false,
      completed: false
    }
    
    const updatedDares = [...dares, newDare]
    setDares(updatedDares)
    localStorage.setItem('pulse_dares', JSON.stringify(updatedDares))
    
    setDareToken(token)
    window.location.hash = `dare=${token}`
    showNotificationMsg('Blind dare created! Share the link!')
  }

  const acceptDare = (token: string) => {
    const updated = dares.map(d => d.id === token ? { ...d, accepted: true } : d)
    setDares(updated)
    localStorage.setItem('pulse_dares', JSON.stringify(updated))
    showNotificationMsg('Dare accepted! Good luck! 💪')
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  const showNotificationMsg = (msg: string) => {
    setShowNotification(msg)
    setTimeout(() => setShowNotification(''), 3000)
  }

  const copyShareLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#dare=${dareToken}`
    navigator.clipboard.writeText(url)
    showNotificationMsg('Link copied to clipboard!')
  }

  const globeData = entries.map(entry => ({
    lat: entry.lat,
    lng: entry.lng,
    size: 0.5,
    color: MOODS.find(m => m.id === entry.mood)?.color || '#ffffff',
    mood: entry.mood
  }))

  return (
    <div className="pulse-container">
      <div className="pulse-bg" />
      
      {showNotification && (
        <div className="notification">{showNotification}</div>
      )}
      
      {showConfetti && <Confetti />}
      
      {showShareModal && (
        <ShareModal onClose={() => setShowShareModal(false)} />
      )}
      
      <div className="content">
        <header>
          <h1 className="logo">PULSE</h1>
          <p className="tagline">Share your mood with the world</p>
        </header>

        <nav>
          <button className={currentView === 'home' ? 'active' : ''} onClick={() => setCurrentView('home')}>
            Share Mood
          </button>
          <button className={currentView === 'dare' ? 'active' : ''} onClick={() => setCurrentView('dare')}>
            Blind Dare
          </button>
          <button className={currentView === 'globe' ? 'active' : ''} onClick={() => setCurrentView('globe')}>
            World Mood
          </button>
          <button className={currentView === 'cities' ? 'active' : ''} onClick={() => setCurrentView('cities')}>
            City Wars
          </button>
          <button className={currentView === 'streak' ? 'active' : ''} onClick={() => setCurrentView('streak')}>
            Streak ({streak})
          </button>
          <button onClick={() => setShowShareModal(true)}>
            📤 Share
          </button>
        </nav>

        {currentView === 'home' && (
          <div className="card">
            <h2>How are you feeling right now?</h2>
            <div className="mood-grid">
              {MOODS.map(mood => (
                <button
                  key={mood.id}
                  className={`mood-btn mood-${mood.id} ${selectedMood === mood.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMood(mood.id)}
                >
                  <span style={{ fontSize: '2rem' }}>{mood.emoji}</span>
                  <span className="mood-label">{mood.label}</span>
                </button>
              ))}
            </div>
            
            <div className="share-section">
              <textarea
                placeholder="Want to share more about how you feel? (optional)"
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
              />
              <button className="btn-primary" onClick={saveEntry}>
                Share Your Mood
              </button>
            </div>

            {entries.length > 0 && (
              <>
                <div style={{ marginTop: '30px' }}>
                  <h3>Mood Trend</h3>
                  <MoodChart entries={entries} />
                </div>
                <div style={{ marginTop: '30px' }}>
                  <h3>Your Recent Moods</h3>
                  {entries.slice(-5).reverse().map(entry => (
                    <div key={entry.id} style={{ 
                      padding: '10px', 
                      margin: '10px 0', 
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '8px'
                    }}>
                      <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>{entry.emoji}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {new Date(entry.timestamp).toLocaleDateString()} - {entry.city}
                      </span>
                      {entry.note && <p style={{ marginTop: '5px', fontSize: '0.9rem' }}>{entry.note}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {currentView === 'dare' && (
          <div className="card">
            <h2>🎲 Blind Dare</h2>
            
            {!dareToken ? (
              <>
                <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                  Generate a random self-care dare and share it with friends anonymously!
                </p>
                <button className="btn-primary" onClick={generateDare}>
                  Generate Dare
                </button>
              </>
            ) : (
              <div className="dare-card">
                <h3>Your Dare:</h3>
                <p style={{ fontSize: '1.2rem', margin: '20px 0' }}>
                  {dares.find(d => d.id === dareToken)?.text || DARES[0]}
                </p>
                
                <div className="dare-token">
                  Token: {dareToken}
                </div>
                
                <button className="btn-primary" onClick={copyShareLink} style={{ marginBottom: '10px' }}>
                  Copy Share Link
                </button>
                
                <button 
                  className="btn-primary"
                  onClick={() => acceptDare(dareToken)}
                  style={{ background: 'var(--success)', marginTop: '10px' }}
                >
                  Accept Dare
                </button>
              </div>
            )}

            {dares.filter(d => d.accepted).length > 0 && (
              <div style={{ marginTop: '30px' }}>
                <h3>Accepted Dares</h3>
                {dares.filter(d => d.accepted).map(dare => (
                  <div key={dare.id} style={{
                    padding: '15px',
                    margin: '10px 0',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid var(--success)'
                  }}>
                    ✅ {dare.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'globe' && (
          <div className="card">
            <h2>🌍 World Mood Globe</h2>
            <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
              See how people are feeling around the world in real-time
            </p>
            <div className="globe-container">
              <Globe
                ref={globeRef}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
                pointsData={globeData}
                pointAltitude={0.1}
                pointRadius={0.5}
                pointColor={(d: any) => d.color}
                atmosphereColor="var(--accent-primary)"
                atmosphereAltitude={0.1}
              />
            </div>
          </div>
        )}

        {currentView === 'cities' && (
          <div className="card">
            <h2>🏆 City Wars Leaderboard</h2>
            <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
              Which city has the best vibes? Compete for the top spot!
            </p>
            
            <ul className="leaderboard">
              {cityScores.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No entries yet. Be the first to share your mood!
                </p>
              ) : (
                cityScores.map((city, index) => (
                  <li key={city.city} className="leaderboard-item">
                    <span className="rank">#{index + 1}</span>
                    <div className="city-info">
                      <div className="city-name">{city.city}</div>
                      <div className="city-mood">
                        Latest: {MOODS.find(m => m.id === city.mood)?.emoji || '😐'} • {city.entries} entries
                      </div>
                    </div>
                    <span className="city-score">{city.score} pts</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}

        {currentView === 'streak' && (
          <div className="card">
            <h2>🔥 Your Streak</h2>
            <div className="streak-display">
              <div className="streak-number">{streak}</div>
              <div className="streak-label">day{streak !== 1 ? 's' : ''} in a row</div>
              
              <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '15px' }}>Why streaks matter:</h3>
                <ul style={{ textAlign: 'left', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>Build emotional awareness habits</li>
                  <li>Track your mood patterns over time</li>
                  <li>Earn achievements (coming soon!)</li>
                  <li>Unlock special features at 7, 30, and 100 days</li>
                </ul>
              </div>

              {streak === 0 && (
                <button className="btn-primary" onClick={() => setCurrentView('home')} style={{ marginTop: '20px' }}>
                  Start Your Streak Now
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <footer className="donation-footer">
        <div className="donation-content">
          <p className="donation-text">
            Made with <span className="heart">❤️</span> for the community
          </p>
          <p className="donation-subtitle">
            Help keep PULSE alive and ad-free
          </p>
          <a 
            href="https://donate.stripe.com/aFa00ieNT09DgguepP1Fe0f" 
            target="_blank" 
            rel="noopener noreferrer"
            className="donation-btn"
          >
            <span className="coffee-icon">☕</span>
            <span>Buy me a coffee</span>
          </a>
          <p className="donation-note">Every contribution helps 💜</p>
        </div>
      </footer>
    </div>
  )
}

export default App
