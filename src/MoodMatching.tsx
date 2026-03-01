import { useState } from 'react'

const MOODS = [
    { id: 'happy', emoji: '😊', label: 'Happy', color: '#fbbf24' },
    { id: 'sad', emoji: '😢', label: 'Sad', color: '#60a5fa' },
    { id: 'energetic', emoji: '⚡', label: 'Energetic', color: '#f472b6' },
    { id: 'calm', emoji: '😌', label: 'Calm', color: '#34d399' },
    { id: 'angry', emoji: '😠', label: 'Angry', color: '#f87171' },
]

const MATCH_MESSAGES: Record<string, string[]> = {
    happy: [
        "You're both riding the same wave ☀️",
        "Double sunshine energy found! 🌟",
        "Happy souls attract each other 💛",
    ],
    sad: [
        "You're not alone in this 💙",
        "Two gentle hearts found each other 🌧️",
        "Sometimes knowing someone else understands is everything",
    ],
    energetic: [
        "Found your twin flame energy ⚡",
        "Two forces of nature, same frequency 🚀",
        "The universe knew you needed this match 🔥",
    ],
    calm: [
        "You've found your peace partner 🍃",
        "Still waters run deep — and you've both found them 🌿",
        "Serenity recognizes serenity 🧘",
    ],
    angry: [
        "Two fires. One frequency. 🔥",
        "Your passion found its match ⚡",
        "Strong emotions, even stronger connection 💥",
    ],
}

const SUPPORT_MESSAGES = [
    "Sending you good energy right now 💜",
    "Someone out there is rooting for you ⭐",
    "You're not alone in this feeling 🤗",
    "Whatever you're going through, you're seen 🌟",
    "Hang in there. The wave always passes 🌊",
    "Your feelings are valid. Always. 💙",
]

interface MatchingProps {
    currentMood: string
}

export default function MoodMatching({ currentMood }: MatchingProps) {
    const [matched, setMatched] = useState(false)
    const [matchCity, setMatchCity] = useState('')
    const [matchMessage, setMatchMessage] = useState('')
    const [sentMessage, setSentMessage] = useState(false)

    const CITIES = ['Tokyo', 'London', 'São Paulo', 'Lagos', 'Seoul', 'Toronto', 'Berlin', 'Cairo', 'Mumbai', 'Sydney']

    const findMatch = () => {
        setTimeout(() => {
            const city = CITIES[Math.floor(Math.random() * CITIES.length)]
            const mood = MOODS.find(m => m.id === currentMood)
            if (!mood) return
            const messages = MATCH_MESSAGES[currentMood] || MATCH_MESSAGES.calm
            setMatchCity(city)
            setMatchMessage(messages[Math.floor(Math.random() * messages.length)])
            setMatched(true)
        }, 1500)
    }

    const sendSupport = () => {
        setSentMessage(true)
    }

    const mood = MOODS.find(m => m.id === currentMood)

    if (!currentMood) {
        return (
            <div className="matching-empty">
                <p>Log a mood first to find your match 🤝</p>
            </div>
        )
    }

    return (
        <div className="mood-matching">
            <div className="matching-header">
                <span className="matching-badge">🤝 MOOD MATCHING</span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>
                    Find someone feeling exactly like you, right now
                </p>
            </div>

            {!matched ? (
                <button className="matching-find-btn" onClick={findMatch} style={{ borderColor: mood?.color }}>
                    <span style={{ fontSize: '2rem' }}>{mood?.emoji}</span>
                    <span>Find my {currentMood} match</span>
                    <span className="matching-pulse" style={{ background: mood?.color }} />
                </button>
            ) : (
                <div className="match-result" style={{ borderColor: mood?.color }}>
                    <div className="match-found-badge">✅ Match Found!</div>
                    <div className="match-emoji">{mood?.emoji}</div>
                    <div className="match-city">
                        Someone in <strong>{matchCity}</strong> is also feeling{' '}
                        <span style={{ color: mood?.color }}>{currentMood}</span>
                    </div>
                    <div className="match-msg">"{matchMessage}"</div>

                    {!sentMessage ? (
                        <button
                            className="match-support-btn"
                            onClick={sendSupport}
                            style={{ background: mood?.color }}
                        >
                            💌 Send Anonymous Support
                        </button>
                    ) : (
                        <div className="match-sent">
                            💜 Your support was sent anonymously
                        </div>
                    )}

                    <div className="match-quote">
                        {SUPPORT_MESSAGES[Math.floor(Math.random() * SUPPORT_MESSAGES.length)]}
                    </div>
                </div>
            )}
        </div>
    )
}
