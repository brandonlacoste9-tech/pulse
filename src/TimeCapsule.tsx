import { useState } from 'react'

interface TimeCapsuleEntry {
    id: string
    mood: string
    emoji: string
    note: string
    createdAt: number
    revealAt: number
    revealed: boolean
}

const MOODS = [
    { id: 'happy', emoji: '😊', label: 'Happy' },
    { id: 'sad', emoji: '😢', label: 'Sad' },
    { id: 'energetic', emoji: '⚡', label: 'Energetic' },
    { id: 'calm', emoji: '😌', label: 'Calm' },
    { id: 'angry', emoji: '😠', label: 'Angry' },
]

const DELAYS = [
    { label: '1 Week', days: 7 },
    { label: '1 Month', days: 30 },
    { label: '3 Months', days: 90 },
    { label: '1 Year', days: 365 },
]

export default function TimeCapsule() {
    const storageKey = 'pulse_capsules'
    const [capsules, setCapsules] = useState<TimeCapsuleEntry[]>(() => {
        return JSON.parse(localStorage.getItem(storageKey) || '[]')
    })
    const [selectedMood, setSelectedMood] = useState('')
    const [note, setNote] = useState('')
    const [delay, setDelay] = useState(30)
    const [creating, setCreating] = useState(false)
    const [justRevealed, setJustRevealed] = useState<string | null>(null)

    const create = () => {
        if (!selectedMood || !note.trim()) return
        const mood = MOODS.find(m => m.id === selectedMood)!
        const entry: TimeCapsuleEntry = {
            id: Date.now().toString(),
            mood: selectedMood,
            emoji: mood.emoji,
            note,
            createdAt: Date.now(),
            revealAt: Date.now() + delay * 86400000,
            revealed: false,
        }
        const updated = [...capsules, entry]
        setCapsules(updated)
        localStorage.setItem(storageKey, JSON.stringify(updated))
        setSelectedMood('')
        setNote('')
        setCreating(false)
    }

    const reveal = (id: string) => {
        const updated = capsules.map(c => c.id === id ? { ...c, revealed: true } : c)
        setCapsules(updated)
        localStorage.setItem(storageKey, JSON.stringify(updated))
        setJustRevealed(id)
        setTimeout(() => setJustRevealed(null), 3000)
    }

    const now = Date.now()
    const ready = capsules.filter(c => !c.revealed && c.revealAt <= now)
    const pending = capsules.filter(c => !c.revealed && c.revealAt > now)
    const revealed = capsules.filter(c => c.revealed)

    const timeLeft = (revealAt: number) => {
        const diff = revealAt - Date.now()
        const days = Math.floor(diff / 86400000)
        const hours = Math.floor((diff % 86400000) / 3600000)
        if (days > 0) return `${days}d ${hours}h`
        return `${hours}h`
    }

    return (
        <div className="capsule-section">
            <div className="capsule-header">
                <span>📅 Time Capsule Moods</span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                    Write to your future self. Reveal later.
                </p>
            </div>

            {!creating ? (
                <button className="capsule-create-btn" onClick={() => setCreating(true)}>
                    ✉️ Create Time Capsule
                </button>
            ) : (
                <div className="capsule-form">
                    <p style={{ marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        How are you feeling right now?
                    </p>
                    <div className="capsule-mood-row">
                        {MOODS.map(m => (
                            <button
                                key={m.id}
                                className={`capsule-mood-btn ${selectedMood === m.id ? 'selected' : ''}`}
                                onClick={() => setSelectedMood(m.id)}
                            >
                                {m.emoji}
                            </button>
                        ))}
                    </div>
                    <textarea
                        className="capsule-textarea"
                        placeholder="Write a message to your future self..."
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        rows={3}
                    />
                    <div className="capsule-delay-row">
                        {DELAYS.map(d => (
                            <button
                                key={d.days}
                                className={`capsule-delay-btn ${delay === d.days ? 'selected' : ''}`}
                                onClick={() => setDelay(d.days)}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                        <button className="capsule-submit-btn" onClick={create} disabled={!selectedMood || !note.trim()}>
                            🔒 Seal Capsule
                        </button>
                        <button className="capsule-cancel-btn" onClick={() => setCreating(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {ready.length > 0 && (
                <div className="capsule-list">
                    <div className="capsule-section-label ready">🎉 Ready to Reveal!</div>
                    {ready.map(c => (
                        <div key={c.id} className="capsule-item ready">
                            <span className="capsule-emoji">{c.emoji}</span>
                            <div className="capsule-meta">
                                <div>Past you ({new Date(c.createdAt).toLocaleDateString()}) left you a message</div>
                            </div>
                            <button className="capsule-reveal-btn" onClick={() => reveal(c.id)}>
                                {justRevealed === c.id ? '🎊 Revealed!' : 'Reveal'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {revealed.filter(c => justRevealed === c.id || revealed.indexOf(c) < 3).length > 0 && (
                <div className="capsule-list">
                    <div className="capsule-section-label">Revealed</div>
                    {revealed.slice(-3).reverse().map(c => (
                        <div key={c.id} className="capsule-item revealed">
                            <span className="capsule-emoji">{c.emoji}</span>
                            <div className="capsule-reveal-content">
                                <div className="capsule-reveal-date">
                                    {new Date(c.createdAt).toLocaleDateString()} → {new Date(c.revealAt).toLocaleDateString()}
                                </div>
                                <div className="capsule-reveal-note">"{c.note}"</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {pending.length > 0 && (
                <div className="capsule-list">
                    <div className="capsule-section-label">Sealed</div>
                    {pending.map(c => (
                        <div key={c.id} className="capsule-item pending">
                            <span className="capsule-emoji">🔒</span>
                            <div className="capsule-meta">
                                <div>Opens in <strong>{timeLeft(c.revealAt)}</strong></div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    Created {new Date(c.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
