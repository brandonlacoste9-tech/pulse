import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/History.module.css';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history');
      const data = await response.json();
      setHistory(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching history:', error);
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>PULSE - History</title>
        <meta name="description" content="View emotional history" />
      </Head>

      <main className={styles.main}>
        <Link href="/" className={styles.backLink}>
          ← Back to Pulse
        </Link>

        <h1 className={styles.title}>
          📜 Emotional History
        </h1>
        
        <p className={styles.subtitle}>
          A living archive of humanity's emotions
        </p>

        {loading ? (
          <div className={styles.loading}>Loading history...</div>
        ) : history.length === 0 ? (
          <div className={styles.empty}>No emotional data yet. Be the first!</div>
        ) : (
          <div className={styles.timeline}>
            {history.slice().reverse().slice(0, 100).map((entry, index) => (
              <div key={index} className={styles.timelineItem}>
                <span className={styles.emoji}>{entry.emoji}</span>
                <span className={styles.time}>{formatTimestamp(entry.timestamp)}</span>
                <span className={styles.location}>{entry.ip}</span>
              </div>
            ))}
          </div>
        )}

        {history.length > 100 && (
          <p className={styles.note}>Showing most recent 100 pulses</p>
        )}
      </main>
    </div>
  );
}
