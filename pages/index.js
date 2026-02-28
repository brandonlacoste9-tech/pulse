import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

// One hour in milliseconds
const ONE_HOUR_MS = 60 * 60 * 1000;

export default function Home() {
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [canVote, setCanVote] = useState(true);
  const [nextVoteTime, setNextVoteTime] = useState(null);
  const [globalData, setGlobalData] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const emojis = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '😡', label: 'Angry' },
    { emoji: '😰', label: 'Anxious' },
    { emoji: '😴', label: 'Tired' },
    { emoji: '😍', label: 'Loved' },
    { emoji: '🤔', label: 'Thoughtful' },
    { emoji: '😎', label: 'Cool' },
  ];

  useEffect(() => {
    checkVoteEligibility();
    fetchGlobalData();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchGlobalData, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkVoteEligibility = () => {
    const lastVoteTime = localStorage.getItem('lastVoteTime');
    if (lastVoteTime) {
      const timeSinceLastVote = Date.now() - parseInt(lastVoteTime);
      
      if (timeSinceLastVote < ONE_HOUR_MS) {
        setCanVote(false);
        const nextTime = parseInt(lastVoteTime) + ONE_HOUR_MS;
        setNextVoteTime(nextTime);
        
        // Set up a timer to re-enable voting
        const timeUntilNextVote = nextTime - Date.now();
        setTimeout(() => {
          setCanVote(true);
          setNextVoteTime(null);
          setSubmitted(false);
        }, timeUntilNextVote);
      }
    }
  };

  const fetchGlobalData = async () => {
    try {
      const response = await fetch('/api/emotions');
      const data = await response.json();
      setGlobalData(data);
    } catch (error) {
      console.error('Error fetching global data:', error);
    }
  };

  const handleEmojiClick = async (emoji) => {
    if (!canVote) return;
    
    setSelectedEmoji(emoji);
    
    try {
      const response = await fetch('/api/emotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emoji: emoji.emoji }),
      });
      
      if (response.ok) {
        localStorage.setItem('lastVoteTime', Date.now().toString());
        setCanVote(false);
        setSubmitted(true);
        const nextTime = Date.now() + ONE_HOUR_MS;
        setNextVoteTime(nextTime);
        
        // Refresh global data
        fetchGlobalData();
        
        // Set timer for next vote
        setTimeout(() => {
          setCanVote(true);
          setNextVoteTime(null);
          setSubmitted(false);
        }, ONE_HOUR_MS);
      }
    } catch (error) {
      console.error('Error submitting emotion:', error);
    }
  };

  const getTimeUntilNextVote = () => {
    if (!nextVoteTime) return '';
    
    const timeLeft = nextVoteTime - Date.now();
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const getTotalVotes = () => {
    return Object.values(globalData).reduce((sum, count) => sum + count, 0);
  };

  const getEmojiPercentage = (emoji) => {
    const total = getTotalVotes();
    if (total === 0) return 0;
    return ((globalData[emoji] || 0) / total * 100).toFixed(1);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>PULSE - Feel the World</title>
        <meta name="description" content="Share your emotion with the world" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          🫀 PULSE
        </h1>
        
        <p className={styles.subtitle}>
          Feel the world. One emoji, once per hour.
        </p>

        {submitted && (
          <div className={styles.successMessage}>
            ✨ Your emotion has been shared with the world!
          </div>
        )}

        {!canVote && !submitted && (
          <div className={styles.waitMessage}>
            ⏳ Next pulse in: {getTimeUntilNextVote()}
          </div>
        )}

        <div className={styles.emojiGrid}>
          {emojis.map((emojiObj) => (
            <button
              key={emojiObj.emoji}
              className={`${styles.emojiButton} ${!canVote ? styles.disabled : ''} ${selectedEmoji?.emoji === emojiObj.emoji ? styles.selected : ''}`}
              onClick={() => handleEmojiClick(emojiObj)}
              disabled={!canVote}
            >
              <span className={styles.emojiIcon}>{emojiObj.emoji}</span>
              <span className={styles.emojiLabel}>{emojiObj.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.globalStats}>
          <h2>🌍 Global Pulse</h2>
          <p className={styles.totalVotes}>{getTotalVotes()} pulses shared</p>
          
          <div className={styles.statsGrid}>
            {emojis.map((emojiObj) => {
              const count = globalData[emojiObj.emoji] || 0;
              const percentage = getEmojiPercentage(emojiObj.emoji);
              
              return count > 0 ? (
                <div key={emojiObj.emoji} className={styles.statItem}>
                  <span className={styles.statEmoji}>{emojiObj.emoji}</span>
                  <div className={styles.statBar}>
                    <div 
                      className={styles.statBarFill} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className={styles.statText}>
                    {percentage}% ({count})
                  </span>
                </div>
              ) : null;
            })}
          </div>
        </div>

        <footer className={styles.footer}>
          <p>A real-time global heat map of human emotion</p>
          <Link href="/history" className={styles.historyLink}>
            📜 View Historical Data
          </Link>
        </footer>
      </main>
    </div>
  );
}
