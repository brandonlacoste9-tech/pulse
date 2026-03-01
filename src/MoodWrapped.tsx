interface MoodEntry {
    id: string
    mood: string
    emoji: string
    timestamp: number
    city: string
    streak?: number
}

const MOOD_COLORS: Record<string, string> = {
    happy: '#fbbf24',
    energetic: '#f472b6',
    calm: '#34d399',
    sad: '#60a5fa',
    angry: '#f87171',
}

const INSIGHTS: Record<string, string[]> = {
    happy: [
        "You spread sunshine wherever you go ☀️",
        "Your joy is your superpower",
        "The happiest version of you shows up consistently",
    ],
    sad: [
        "You feel deeply — that takes courage 💙",
        "Your sensitivity is your strength",
        "Even on hard days, you showed up",
    ],
    energetic: [
        "You're a force of nature ⚡",
        "Your energy is contagious",
        "You live life at full intensity",
    ],
    calm: [
        "You're the anchor in every storm 🌿",
        "Peace follows you everywhere",
        "Your stillness is rare and powerful",
    ],
    angry: [
        "Your passion burns bright 🔥",
        "Intense emotions mean you care deeply",
        "You feel everything at full volume",
    ],
}

interface WrappedProps {
    entries: MoodEntry[]
    streak: number
    onClose: () => void
}

export default function MoodWrapped({ entries, streak, onClose }: WrappedProps) {
    if (entries.length < 3) {
        return (
            <div className="wrapped-overlay" onClick={onClose}>
                <div className="wrapped-modal" onClick={e => e.stopPropagation()}>
                    <button className="wrapped-close" onClick={onClose}>✕</button>
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📊</div>
                        <h3>Not enough data yet!</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
                            Log at least 3 moods to unlock your Mood Wrapped.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Calculate stats
    const moodCounts: Record<string, number> = {}
    entries.forEach(e => { moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1 })
    const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]
    const topMoodPct = Math.round((topMood[1] / entries.length) * 100)

    const citySet = new Set(entries.map(e => e.city))
    const cities = Array.from(citySet)

    const moodValues: Record<string, number> = { happy: 4, energetic: 5, calm: 3, sad: 1, angry: 0 }
    const avgScore = entries.reduce((acc, e) => acc + (moodValues[e.mood] || 2), 0) / entries.length
    const overallVibe = avgScore >= 4 ? '🌟 Radiant' : avgScore >= 3 ? '😊 Positive' : avgScore >= 2 ? '🌤️ Mixed' : '🌧️ Cloudy'

    const positiveCount = entries.filter(e => ['happy', 'energetic', 'calm'].includes(e.mood)).length
    const positivityScore = Math.round((positiveCount / entries.length) * 100)

    const moods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])

    const insight = INSIGHTS[topMood[0]]
    const insightText = insight[Math.floor(Math.random() * insight.length)]

    return (
        <div className="wrapped-overlay" onClick={onClose}>
            <div className="wrapped-modal" onClick={e => e.stopPropagation()}>
                <button className="wrapped-close" onClick={onClose}>✕</button>

                <div className="wrapped-header">
                    <div className="wrapped-title">🎁 Your Mood Wrapped</div>
                    <div className="wrapped-subtitle">Last {entries.length} check-ins</div>
                </div>

                <div className="wrapped-stat-grid">
                    <div className="wrapped-stat big" style={{ background: `${MOOD_COLORS[topMood[0]]}22`, borderColor: MOOD_COLORS[topMood[0]] }}>
                        <div className="ws-label">Top Mood</div>
                        <div className="ws-value">{topMood[0].charAt(0).toUpperCase() + topMood[0].slice(1)}</div>
                        <div className="ws-sub">{topMoodPct}% of the time</div>
                    </div>
                    <div className="wrapped-stat" style={{ background: 'rgba(251,191,36,0.1)', borderColor: '#fbbf24' }}>
                        <div className="ws-label">🔥 Streak</div>
                        <div className="ws-value">{streak}</div>
                        <div className="ws-sub">days in a row</div>
                    </div>
                    <div className="wrapped-stat" style={{ background: 'rgba(52,211,153,0.1)', borderColor: '#34d399' }}>
                        <div className="ws-label">✨ Positivity</div>
                        <div className="ws-value">{positivityScore}%</div>
                        <div className="ws-sub">of check-ins</div>
                    </div>
                    <div className="wrapped-stat" style={{ background: 'rgba(139,92,246,0.1)', borderColor: '#8b5cf6' }}>
                        <div className="ws-label">🌍 Cities</div>
                        <div className="ws-value">{cities.length}</div>
                        <div className="ws-sub">around the world</div>
                    </div>
                </div>

                <div className="wrapped-vibe">
                    <span className="vibe-label">Overall Vibe:</span>
                    <span className="vibe-value">{overallVibe}</span>
                </div>

                <div className="wrapped-breakdown">
                    {moods.map(([mood, count]) => (
                        <div key={mood} className="wb-row">
                            <span className="wb-mood">{mood.charAt(0).toUpperCase() + mood.slice(1)}</span>
                            <div className="wb-bar-track">
                                <div
                                    className="wb-bar-fill"
                                    style={{
                                        width: `${(count / entries.length) * 100}%`,
                                        background: MOOD_COLORS[mood],
                                    }}
                                />
                            </div>
                            <span className="wb-count">{count}x</span>
                        </div>
                    ))}
                </div>

                <div className="wrapped-insight">
                    <div className="wi-label">💜 Your vibe says...</div>
                    <div className="wi-text">"{insightText}"</div>
                </div>

                <button className="wrapped-share-btn" onClick={() => {
                    const text = `🎁 My Pulse Mood Wrapped:\n\n📊 Top mood: ${topMood[0]} (${topMoodPct}%)\n🔥 Streak: ${streak} days\n✨ Positivity: ${positivityScore}%\n\n"${insightText}"\n\npulse.app`
                    if (navigator.share) navigator.share({ text })
                    else navigator.clipboard.writeText(text)
                }}>
                    📤 Share My Wrapped
                </button>
            </div>
        </div>
    )
}
