import { useState, useEffect } from 'react'

const POLLS = [
    { question: "How is the world feeling TODAY?", options: ['Happy 😊', 'Sad 😢', 'Energetic ⚡', 'Calm 😌', 'Angry 😠'] },
    {
        question: "What's your biggest mood killer?", options: ['Work stress 💼', 'Bad weather 🌧️', 'Social media 📱', 'Bad sleep 😴', "Nothing, I'm great ✨"]
    },
    { question: "What lifts your mood fastest?", options: ['Music 🎵', 'Exercise 🏃', 'Food 🍕', 'Friends 🤝', 'Alone time 🌙'] },
    { question: "When are you happiest?", options: ['Morning ☀️', 'Afternoon 🌤️', 'Evening 🌆', 'Night 🌙', 'Depends on the day 🤷'] },
]

export default function DailyPoll() {
    const todayKey = new Date().toDateString()
    const pollIndex = new Date().getDate() % POLLS.length
    const poll = POLLS[pollIndex]

    const storageKey = `pulse_poll_${todayKey}`
    const storedVote = localStorage.getItem(storageKey)
    const storedVotes = JSON.parse(localStorage.getItem(`pulse_poll_votes_${pollIndex}`) || 'null')

    const [voted, setVoted] = useState<string | null>(storedVote)
    const [votes, setVotes] = useState<Record<string, number>>(() => {
        if (storedVotes) return storedVotes
        // Seed with realistic-ish numbers
        const seeded: Record<string, number> = {}
        poll.options.forEach((o, i) => {
            seeded[o] = Math.floor(300 + Math.random() * 1200 - i * 80)
        })
        return seeded
    })
    const [revealed, setRevealed] = useState(!!storedVote)
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        const tick = () => {
            const now = new Date()
            const midnight = new Date()
            midnight.setHours(24, 0, 0, 0)
            const diff = midnight.getTime() - now.getTime()
            const h = Math.floor(diff / 3600000)
            const m = Math.floor((diff % 3600000) / 60000)
            const s = Math.floor((diff % 60000) / 1000)
            setTimeLeft(`${h}h ${m}m ${s}s`)
        }
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [])

    const castVote = (option: string) => {
        if (voted) return
        const newVotes = { ...votes, [option]: (votes[option] || 0) + 1 }
        setVotes(newVotes)
        setVoted(option)
        setRevealed(true)
        localStorage.setItem(storageKey, option)
        localStorage.setItem(`pulse_poll_votes_${pollIndex}`, JSON.stringify(newVotes))
    }

    const total = Object.values(votes).reduce((a, b) => a + b, 0)

    return (
        <div className="daily-poll">
            <div className="poll-header">
                <span className="poll-badge">🗳️ DAILY POLL</span>
                <span className="poll-timer">Resets in {timeLeft}</span>
            </div>
            <h3 className="poll-question">{poll.question}</h3>

            <div className="poll-options">
                {poll.options.map((option) => {
                    const pct = total > 0 ? Math.round(((votes[option] || 0) / total) * 100) : 0
                    const isWinner = revealed && pct === Math.max(...Object.values(votes).map(v => Math.round((v / total) * 100)))
                    return (
                        <button
                            key={option}
                            className={`poll-option ${voted === option ? 'voted' : ''} ${isWinner && revealed ? 'winner' : ''}`}
                            onClick={() => castVote(option)}
                            disabled={!!voted}
                        >
                            <span className="poll-option-label">{option}</span>
                            {revealed && (
                                <>
                                    <div
                                        className="poll-bar"
                                        style={{ width: `${pct}%` }}
                                    />
                                    <span className="poll-pct">{pct}%</span>
                                </>
                            )}
                        </button>
                    )
                })}
            </div>

            {revealed && (
                <p className="poll-total">{total.toLocaleString()} people voted</p>
            )}
        </div>
    )
}
