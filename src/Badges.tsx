const BADGE_DEFS = [
    {
        id: 'first_pulse',
        emoji: '🌱',
        name: 'First Pulse',
        desc: 'Logged your very first mood',
        condition: (entries: number, _streak: number, _cities: number) => entries >= 1,
        rarity: 'common',
    },
    {
        id: 'seven_streak',
        emoji: '🔥',
        name: 'Week Warrior',
        desc: '7-day streak achieved',
        condition: (_e: number, streak: number) => streak >= 7,
        rarity: 'rare',
    },
    {
        id: 'thirty_streak',
        emoji: '💎',
        name: 'Diamond Streak',
        desc: '30-day streak — legendary',
        condition: (_e: number, streak: number) => streak >= 30,
        rarity: 'legendary',
    },
    {
        id: 'globe_trotter',
        emoji: '🌍',
        name: 'Globe Trotter',
        desc: 'Moods logged from 5+ cities',
        condition: (_e: number, _s: number, cities: number) => cities >= 5,
        rarity: 'rare',
    },
    {
        id: 'all_moods',
        emoji: '🎭',
        name: 'Full Spectrum',
        desc: 'Experienced all 5 moods',
        condition: (_e: number, _s: number, _c: number, moodSet: Set<string>) => moodSet.size >= 5,
        rarity: 'rare',
    },
    {
        id: 'ten_entries',
        emoji: '⭐',
        name: 'Rising Star',
        desc: 'Logged 10 moods',
        condition: (entries: number) => entries >= 10,
        rarity: 'common',
    },
    {
        id: 'fifty_entries',
        emoji: '🚀',
        name: 'Pulse Pioneer',
        desc: 'Logged 50 moods',
        condition: (entries: number) => entries >= 50,
        rarity: 'epic',
    },
    {
        id: 'happy_vibes',
        emoji: '☀️',
        name: 'Sunshine Soul',
        desc: 'Logged happy mood 10+ times',
        condition: (_e: number, _s: number, _c: number, _m: Set<string>, happyCount: number) => happyCount >= 10,
        rarity: 'common',
    },
]

const RARITY_COLORS: Record<string, string> = {
    common: '#9ca3af',
    rare: '#60a5fa',
    epic: '#a855f7',
    legendary: '#fbbf24',
}

interface BadgesProps {
    entries: { mood: string; city: string }[]
    streak: number
}

export default function Badges({ entries, streak }: BadgesProps) {
    const entryCount = entries.length
    const citySet = new Set(entries.map(e => e.city))
    const moodSet = new Set(entries.map(e => e.mood))
    const happyCount = entries.filter(e => e.mood === 'happy').length

    const earned = BADGE_DEFS.filter(b =>
        b.condition(entryCount, streak, citySet.size, moodSet, happyCount)
    )
    const locked = BADGE_DEFS.filter(b =>
        !b.condition(entryCount, streak, citySet.size, moodSet, happyCount)
    )

    return (
        <div className="badges-section">
            <div className="badges-header">
                <span>🏅 Achievements</span>
                <span className="badges-count">{earned.length}/{BADGE_DEFS.length} unlocked</span>
            </div>

            {earned.length > 0 && (
                <div className="badges-grid">
                    {earned.map(badge => (
                        <div
                            key={badge.id}
                            className="badge-item earned"
                            style={{ borderColor: RARITY_COLORS[badge.rarity] }}
                            title={badge.desc}
                        >
                            <div className="badge-emoji">{badge.emoji}</div>
                            <div className="badge-name">{badge.name}</div>
                            <div className="badge-rarity" style={{ color: RARITY_COLORS[badge.rarity] }}>
                                {badge.rarity}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {locked.length > 0 && (
                <>
                    <div className="badges-locked-label">Locked</div>
                    <div className="badges-grid">
                        {locked.map(badge => (
                            <div key={badge.id} className="badge-item locked" title={badge.desc}>
                                <div className="badge-emoji locked-emoji">🔒</div>
                                <div className="badge-name locked-text">{badge.name}</div>
                                <div className="badge-desc">{badge.desc}</div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
