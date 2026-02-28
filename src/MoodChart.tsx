import { useMemo } from 'react'

interface MoodEntry {
  id: string
  mood: string
  emoji: string
  timestamp: number
}

interface MoodChartProps {
  entries: MoodEntry[]
}

const MOOD_VALUES: Record<string, number> = {
  happy: 4,
  energetic: 5,
  calm: 3,
  sad: 1,
  angry: 0
}

const MOOD_COLORS: Record<string, string> = {
  happy: '#fbbf24',
  energetic: '#f472b6',
  calm: '#34d399',
  sad: '#60a5fa',
  angry: '#f87171'
}

export default function MoodChart({ entries }: MoodChartProps) {
  const chartData = useMemo(() => {
    // Get last 14 entries
    return entries.slice(-14).map(e => ({
      mood: e.mood,
      emoji: e.emoji,
      value: MOOD_VALUES[e.mood] || 2,
      color: MOOD_COLORS[e.mood] || '#888',
      date: new Date(e.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }))
  }, [entries])

  if (chartData.length < 2) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: 'var(--text-secondary)',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '12px'
      }}>
        Keep sharing your mood to see your trend! 📈
      </div>
    )
  }

  const maxValue = 5
  const barWidth = Math.min(40, 100 / chartData.length)

  return (
    <div className="mood-chart">
      <div className="chart-bars">
        {chartData.map((data, i) => (
          <div key={i} className="chart-bar-wrapper">
            <div 
              className="chart-bar"
              style={{
                height: `${(data.value / maxValue) * 100}%`,
                backgroundColor: data.color,
                width: `${barWidth}px`
              }}
              title={`${data.date}: ${data.mood}`}
            >
              <span className="chart-emoji">{data.emoji}</span>
            </div>
            <span className="chart-label">{data.date.split(' ')[1]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
