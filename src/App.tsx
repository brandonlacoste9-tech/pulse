import { useState, useEffect, useRef, useCallback } from 'react'
import Globe from 'react-globe.gl'
import './App.css'
import Confetti from './Confetti'
import MoodChart from './MoodChart'
import ShareModal from './ShareModal'
import MoodCard from './MoodCard'
import LiveFeed from './LiveFeed'
import DailyPoll from './DailyPoll'
import MoodWrapped from './MoodWrapped'
import MoodMatching from './MoodMatching'
import Badges from './Badges'
import TimeCapsule from './TimeCapsule'

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
  "Step away from screens for 10 minutes",
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
  { name: "Seoul", lat: 37.5665, lng: 126.9780 },
  { name: "Toronto", lat: 43.6532, lng: -79.3832 },
  { name: "Dubai", lat: 25.2048, lng: 55.2708 },
  { name: "Lagos", lat: 6.5244, lng: 3.3792 },
  { name: "Buenos Aires", lat: -34.6037, lng: -58.3816 },
]

const VIEWS = [
  { id: 'home', label: '😊 Mood', icon: '😊' },
  { id: 'globe', label: '🌍 Globe', icon: '🌍' },
  { id: 'dare', label: '🎲 Dare', icon: '🎲' },
  { id: 'cities', label: '🏆 Cities', icon: '🏆' },
  { id: 'poll', label: '🗳️ Poll', icon: '🗳️' },
  { id: 'streak', label: '🔥 Streak', icon: '🔥' },
  { id: 'capsule', label: '📅 Capsule', icon: '📅' },
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
  const [showMoodCard, setShowMoodCard] = useState(false)
  const [showWrapped, setShowWrapped] = useState(false)
  const [lastEntry, setLastEntry] = useState<MoodEntry | null>(null)
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
      const s = parseInt(savedStreak)
      const last = savedLastEntry ? parseInt(savedLastEntry) : 0
      const today = new Date().setHours(0, 0, 0, 0)
      const lastDate = new Date(last).setHours(0, 0, 0, 0)
      if (today - lastDate <= 86400000 * 2) setStreak(s)
      else setStreak(0)
    }

    const hash = window.location.hash
    if (hash.startsWith('#dare=')) {
      setDareToken(hash.replace('#dare=', ''))
      setCurrentView('dare')
    } else if (hash === '#view=globe') {
      setCurrentView('globe')
    }
  }, [])

  const calculateCityScores = useCallback((entryData: MoodEntry[]) => {
    const scores = new Map<string, { score: number; entries: number; moods: string[] }>()
    entryData.forEach(entry => {
      const current = scores.get(entry.city) || { score: 0, entries: 0, moods: [] }
      const moodValue = ['happy', 'energetic', 'calm'].includes(entry.mood) ? 10 : 5
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
        mood: data.moods[data.moods.length - 1] || 'calm',
      }))
      .sort((a, b) => b.score - a.score)
    setCityScores(sorted)
  }, [])

  const saveEntry = () => {
    if (!selectedMood) {
      showMsg('Please select a mood first!')
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
      lng: city.lng,
    }
    const updated = [...entries, newEntry]
    setEntries(updated)
    setLastEntry(newEntry)
    localStorage.setItem('pulse_entries', JSON.stringify(updated))

    const today = new Date().setHours(0, 0, 0, 0)
    const lastSaved = localStorage.getItem('pulse_last_entry')
    const lastDate = lastSaved ? new Date(parseInt(lastSaved)).setHours(0, 0, 0, 0) : 0
    if (today !== lastDate) {
      const newStreak = today - lastDate <= 86400000 * 2 ? streak + 1 : 1
      setStreak(newStreak)
      localStorage.setItem('pulse_streak', newStreak.toString())
      localStorage.setItem('pulse_last_entry', Date.now().toString())
    }

    calculateCityScores(updated)
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
    setTimeout(() => setShowMoodCard(true), 500)
    setMoodNote('')
    setSelectedMood('')
  }

  const generateDare = () => {
    const randomDare = DARES[Math.floor(Math.random() * DARES.length)]
    const token = Math.random().toString(36).substring(2, 15)
    const newDare: Dare = { id: token, text: randomDare, from: 'Anonymous', accepted: false, completed: false }
    const updated = [...dares, newDare]
    setDares(updated)
    localStorage.setItem('pulse_dares', JSON.stringify(updated))
    setDareToken(token)
    window.location.hash = `dare=${token}`
    showMsg('Blind dare created! Share the link!')
  }

  const acceptDare = (token: string) => {
    const updated = dares.map(d => d.id === token ? { ...d, accepted: true } : d)
    setDares(updated)
    localStorage.setItem('pulse_dares', JSON.stringify(updated))
    showMsg('Dare accepted! Good luck! 💪')
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  const showMsg = (msg: string) => {
    setShowNotification(msg)
    setTimeout(() => setShowNotification(''), 3000)
  }

  const copyShareLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#dare=${dareToken}`
    navigator.clipboard.writeText(url)
    showMsg('Link copied to clipboard!')
  }

  const globeData = entries.map(entry => ({
    lat: entry.lat,
    lng: entry.lng,
    size: 0.5,
    color: MOODS.find(m => m.id === entry.mood)?.color || '#ffffff',
    mood: entry.mood,
  }))

  const currentMoodObj = lastEntry ? MOODS.find(m => m.id === lastEntry.mood) : null

  return (
    <div className="pulse-container">
      <div className="pulse-bg" />

      {showNotification && <div className="notification">{showNotification}</div>}
      {showConfetti && <Confetti />}

      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}

      {showMoodCard && lastEntry && currentMoodObj && (
        <MoodCard
          mood={lastEntry.mood}
          emoji={currentMoodObj.emoji}
          note={lastEntry.note}
          streak={streak}
          city={lastEntry.city}
          onClose={() => setShowMoodCard(false)}
        />
      )}

      {showWrapped && (
        <MoodWrapped
          entries={entries}
          streak={streak}
          onClose={() => setShowWrapped(false)}
        />
      )}

      <div className="content">
        <header>
          <h1 className="logo">PULSE</h1>
          <p className="tagline">Share your mood with the world</p>
          <div className="header-actions">
            <button className="header-btn" onClick={() => setShowWrapped(true)}>
              🎁 Mood Wrapped
            </button>
            <button className="header-btn" onClick={() => setShowShareModal(true)}>
              📤 Share App
            </button>
          </div>
        </header>

        {/* Live Feed ticker always visible */}
        <LiveFeed />

        <nav>
          {VIEWS.map(v => (
            <button
              key={v.id}
              className={currentView === v.id ? 'active' : ''}
              onClick={() => setCurrentView(v.id)}
            >
              {v.label}
            </button>
          ))}
        </nav>

        {/* HOME — Check In */}
        {currentView === 'home' && (
          <div className="card">
            <h2>How are you feeling right now?</h2>
            <div className="mood-grid">
              {MOODS.map(mood => (
                <button
                  key={mood.id}
                  className={`mood-btn mood-${mood.id} ${selectedMood === mood.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMood(mood.id)}
                  style={selectedMood === mood.id ? { boxShadow: `0 0 30px ${mood.color}66` } : {}}
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
                onChange={e => setMoodNote(e.target.value)}
              />
              <button className="btn-primary" onClick={saveEntry}>
                Share Your Mood ✨
              </button>
            </div>

            {/* Mood Matching */}
            {lastEntry && (
              <div style={{ marginTop: '25px' }}>
                <MoodMatching currentMood={lastEntry.mood} />
              </div>
            )}

            {entries.length > 0 && (
              <>
                <div style={{ marginTop: '30px' }}>
                  <h3>Mood Trend</h3>
                  <MoodChart entries={entries} />
                </div>
                <div style={{ marginTop: '30px' }}>
                  <h3>Recent Moods</h3>
                  {entries.slice(-5).reverse().map(entry => (
                    <div key={entry.id} className="recent-entry">
                      <span style={{ fontSize: '1.5rem' }}>{entry.emoji}</span>
                      <div className="recent-entry-info">
                        <span className="recent-entry-city">{entry.city}</span>
                        <span className="recent-entry-date">{new Date(entry.timestamp).toLocaleDateString()}</span>
                      </div>
                      {entry.note && <p className="recent-entry-note">"{entry.note}"</p>}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Badges section */}
            <div style={{ marginTop: '30px' }}>
              <Badges entries={entries} streak={streak} />
            </div>
          </div>
        )}

        {/* GLOBE */}
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
            {entries.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '20px' }}>
                Log your first mood to appear on the globe!
              </p>
            )}
          </div>
        )}

        {/* DARE */}
        {currentView === 'dare' && (
          <div className="card">
            <h2>🎲 Blind Dare</h2>

            {!dareToken ? (
              <>
                <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                  Generate a random self-care dare and share it with friends anonymously!
                </p>
                <button className="btn-primary" onClick={generateDare}>
                  Generate Dare 🎲
                </button>
              </>
            ) : (
              <div className="dare-card">
                <h3>Your Dare:</h3>
                <p style={{ fontSize: '1.2rem', margin: '20px 0' }}>
                  {dares.find(d => d.id === dareToken)?.text || DARES[0]}
                </p>
                <div className="dare-token">Token: {dareToken}</div>
                <button className="btn-primary" onClick={copyShareLink} style={{ marginBottom: '10px' }}>
                  Copy Share Link
                </button>
                <button
                  className="btn-primary"
                  onClick={() => acceptDare(dareToken)}
                  style={{ background: 'var(--success)', marginTop: '10px' }}
                >
                  Accept Dare 💪
                </button>
              </div>
            )}

            {dares.filter(d => d.accepted).length > 0 && (
              <div style={{ marginTop: '30px' }}>
                <h3>Accepted Dares</h3>
                {dares.filter(d => d.accepted).map(dare => (
                  <div key={dare.id} className="dare-accepted">
                    ✅ {dare.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CITIES */}
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
                  <li key={city.city} className={`leaderboard-item ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}`}>
                    <span className="rank">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                    <div className="city-info">
                      <div className="city-name">{city.city}</div>
                      <div className="city-mood">
                        Latest: {MOODS.find(m => m.id === city.mood)?.emoji || '😐'} · {city.entries} entries
                      </div>
                    </div>
                    <span className="city-score">{city.score} pts</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}

        {/* DAILY POLL */}
        {currentView === 'poll' && (
          <div className="card">
            <DailyPoll />
          </div>
        )}

        {/* STREAK */}
        {currentView === 'streak' && (
          <div className="card">
            <h2>🔥 Your Streak</h2>
            <div className="streak-display">
              <div className="streak-number">{streak}</div>
              <div className="streak-label">day{streak !== 1 ? 's' : ''} in a row</div>

              <div className="streak-milestones">
                {[
                  { days: 7, emoji: '⭐', label: 'Week Warrior' },
                  { days: 30, emoji: '💎', label: 'Diamond' },
                  { days: 100, emoji: '👑', label: 'Legend' },
                ].map(m => (
                  <div key={m.days} className={`milestone ${streak >= m.days ? 'unlocked' : ''}`}>
                    <span className="milestone-emoji">{m.emoji}</span>
                    <span className="milestone-label">{m.label}</span>
                    <span className="milestone-days">{m.days}d</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '15px' }}>Why streaks matter:</h3>
                <ul style={{ textAlign: 'left', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  <li>Build emotional awareness habits</li>
                  <li>Track your mood patterns over time</li>
                  <li>Earn badges at 7, 30, and 100 days</li>
                  <li>Your streak = your commitment to yourself 💜</li>
                </ul>
              </div>

              {streak === 0 && (
                <button className="btn-primary" onClick={() => setCurrentView('home')} style={{ marginTop: '20px' }}>
                  Start Your Streak Now 🚀
                </button>
              )}
            </div>

            {/* Time Capsule in streak view */}
            <div style={{ marginTop: '30px' }}>
              <TimeCapsule />
            </div>
          </div>
        )}

        {/* CAPSULE standalone */}
        {currentView === 'capsule' && (
          <div className="card">
            <h2>📅 Time Capsule</h2>
            <TimeCapsule />
          </div>
        )}
      </div>

      <footer className="donation-footer">
        <div className="donation-content">
          <p className="donation-text">Made with <span className="heart">❤️</span> for the community</p>
          <p className="donation-subtitle">Help keep PULSE alive and ad-free</p>
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
