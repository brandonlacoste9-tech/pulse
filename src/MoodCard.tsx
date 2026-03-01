import { useRef } from 'react'
import html2canvas from 'html2canvas'

interface MoodCardProps {
    mood: string
    emoji: string
    note: string
    streak: number
    city: string
    onClose: () => void
}

const MOOD_GRADIENTS: Record<string, string> = {
    happy: 'linear-gradient(135deg, #f59e0b, #fbbf24, #fcd34d)',
    sad: 'linear-gradient(135deg, #3b82f6, #60a5fa, #93c5fd)',
    energetic: 'linear-gradient(135deg, #ec4899, #f472b6, #f9a8d4)',
    calm: 'linear-gradient(135deg, #10b981, #34d399, #6ee7b7)',
    angry: 'linear-gradient(135deg, #ef4444, #f87171, #fca5a5)',
}

const MOOD_QUOTES: Record<string, string[]> = {
    happy: [
        "Happiness is contagious. Spread it everywhere 🌟",
        "Your joy is someone else's sunshine ☀️",
        "Good vibes only. Always. 💛",
    ],
    sad: [
        "It's okay not to be okay. Even oceans have storms 🌊",
        "Every storm runs out of rain 💙",
        "Feeling deeply is a superpower 🦋",
    ],
    energetic: [
        "You're unstoppable right now. Use it ⚡",
        "Channel that energy into something massive 🚀",
        "The world can't keep up with you today 🔥",
    ],
    calm: [
        "Peace is power. You've found it 🍃",
        "Still waters run deep 🌿",
        "You're exactly where you need to be 🧘",
    ],
    angry: [
        "Your fire is valid. Channel it wisely 🔥",
        "Anger is just passion without direction 💥",
        "Feel it. Name it. Release it. You're stronger ⚡",
    ],
}

export default function MoodCard({ mood, emoji, note, streak, city, onClose }: MoodCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const gradient = MOOD_GRADIENTS[mood] || MOOD_GRADIENTS.calm
    const quotes = MOOD_QUOTES[mood] || MOOD_QUOTES.calm
    const quote = quotes[Math.floor(Math.random() * quotes.length)]
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

    const downloadCard = async () => {
        if (!cardRef.current) return
        const canvas = await html2canvas(cardRef.current, {
            backgroundColor: null,
            scale: 2,
            useCORS: true,
        })
        const link = document.createElement('a')
        link.download = `pulse-mood-${mood}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
    }

    return (
        <div className="mood-card-overlay" onClick={onClose}>
            <div className="mood-card-wrapper" onClick={e => e.stopPropagation()}>
                {/* The actual shareable card */}
                <div
                    ref={cardRef}
                    className="mood-card-visual"
                    style={{ background: gradient }}
                >
                    <div className="mc-header">
                        <span className="mc-logo">PULSE</span>
                        <span className="mc-time">{time} · {city}</span>
                    </div>

                    <div className="mc-emoji">{emoji}</div>

                    <div className="mc-mood-label">{mood.toUpperCase()}</div>

                    {note && <div className="mc-note">"{note}"</div>}

                    <div className="mc-quote">{quote}</div>

                    <div className="mc-footer">
                        <div className="mc-streak">🔥 {streak} day streak</div>
                        <div className="mc-date">{date}</div>
                    </div>

                    <div className="mc-watermark">pulse.app · share your world</div>
                </div>

                <div className="mood-card-actions">
                    <button className="mc-btn mc-btn-download" onClick={downloadCard}>
                        📥 Save Image
                    </button>
                    <button className="mc-btn mc-btn-share" onClick={() => {
                        const text = `I'm feeling ${mood} right now ${emoji} ${streak > 0 ? `(${streak} day streak! 🔥)` : ''}\n\n"${quote}"\n\nTrack your mood at pulse.app`
                        if (navigator.share) {
                            navigator.share({ text })
                        } else {
                            navigator.clipboard.writeText(text)
                        }
                    }}>
                        📤 Share
                    </button>
                    <button className="mc-btn mc-btn-close" onClick={onClose}>✕</button>
                </div>
            </div>
        </div>
    )
}
