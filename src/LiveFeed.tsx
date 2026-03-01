import { useState, useEffect, useRef } from 'react'

const CITIES = [
    'New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Berlin',
    'Singapore', 'Mumbai', 'São Paulo', 'Cape Town', 'Seoul', 'Toronto',
    'Dubai', 'Amsterdam', 'Bangkok', 'Mexico City', 'Lagos', 'Istanbul',
    'Buenos Aires', 'Cairo', 'Nairobi', 'Stockholm', 'Barcelona', 'Osaka',
]

const MOODS = [
    { id: 'happy', emoji: '😊', label: 'Happy', color: '#fbbf24' },
    { id: 'sad', emoji: '😢', label: 'Sad', color: '#60a5fa' },
    { id: 'energetic', emoji: '⚡', label: 'Energetic', color: '#f472b6' },
    { id: 'calm', emoji: '😌', label: 'Calm', color: '#34d399' },
    { id: 'angry', emoji: '😠', label: 'Angry', color: '#f87171' },
]

interface FeedItem {
    id: number
    city: string
    mood: { id: string; emoji: string; label: string; color: string }
    time: string
}

function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

function generateFeedItem(id: number): FeedItem {
    const now = new Date()
    const secAgo = Math.floor(Math.random() * 59)
    now.setSeconds(now.getSeconds() - secAgo)
    return {
        id,
        city: randomItem(CITIES),
        mood: randomItem(MOODS),
        time: secAgo === 0 ? 'just now' : `${secAgo}s ago`,
    }
}

export default function LiveFeed() {
    const [items, setItems] = useState<FeedItem[]>(() =>
        Array.from({ length: 8 }, (_, i) => generateFeedItem(i))
    )
    const counterRef = useRef(100)

    useEffect(() => {
        const interval = setInterval(() => {
            const newItem = generateFeedItem(counterRef.current++)
            setItems(prev => [newItem, ...prev.slice(0, 9)])
        }, 2400)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="live-feed">
            <div className="live-feed-header">
                <span className="live-dot" />
                <span className="live-label">LIVE GLOBAL FEED</span>
                <span className="live-count">{(8349 + counterRef.current).toLocaleString()} moods today</span>
            </div>
            <div className="live-feed-list">
                {items.map((item, i) => (
                    <div
                        key={item.id}
                        className="live-feed-item"
                        style={{
                            opacity: 1 - i * 0.08,
                            borderLeft: `3px solid ${item.mood.color}`,
                            animationDelay: `${i * 0.05}s`,
                        }}
                    >
                        <span className="lf-emoji">{item.mood.emoji}</span>
                        <span className="lf-text">
                            Someone in <strong>{item.city}</strong> feels{' '}
                            <span style={{ color: item.mood.color }}>{item.mood.label}</span>
                        </span>
                        <span className="lf-time">{item.time}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
