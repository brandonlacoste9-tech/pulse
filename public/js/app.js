// API base URL
const API_BASE = window.location.origin + '/api';

// User ID management
let userId = localStorage.getItem('pulseUserId');
if (!userId) {
  userId = generateUUID();
  localStorage.setItem('pulseUserId', userId);
}

// State
let canSubmit = true;
let countdownInterval = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  console.log('🫀 Pulse app initialized');
  
  // Set up emoji buttons
  setupEmojiButtons();
  
  // Check user's last submission
  checkLastSubmission();
  
  // Load global stats
  loadGlobalStats();
  
  // Load live emotions
  loadLiveEmotions();
  
  // Refresh data periodically
  setInterval(loadGlobalStats, 30000); // Every 30 seconds
  setInterval(loadLiveEmotions, 60000); // Every minute
});

// Generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Setup emoji button listeners
function setupEmojiButtons() {
  const emojiButtons = document.querySelectorAll('.emoji-btn');
  
  emojiButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const emoji = btn.dataset.emoji;
      submitEmotion(emoji);
    });
  });
}

// Check user's last submission
async function checkLastSubmission() {
  try {
    const response = await fetch(`${API_BASE}/emotion/last/${userId}`);
    const data = await response.json();
    
    if (data.canSubmit) {
      enableEmojis();
      hideRateLimitMessage();
    } else {
      disableEmojis();
      showRateLimitMessage(data);
      startCountdown(data.timeRemaining);
    }
  } catch (error) {
    console.error('Error checking last submission:', error);
  }
}

// Submit emotion
async function submitEmotion(emoji) {
  if (!canSubmit) {
    return;
  }

  // Get location if available
  const location = await getUserLocation();
  
  const payload = {
    userId,
    emoji,
    latitude: location.latitude,
    longitude: location.longitude,
    country: location.country,
    city: location.city
  };

  try {
    const response = await fetch(`${API_BASE}/emotion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      // Success!
      showSuccessMessage(emoji);
      disableEmojis();
      
      // Show rate limit message after 2 seconds
      setTimeout(() => {
        hideSuccessMessage();
        const timeRemaining = data.nextSubmissionTime - Date.now();
        showRateLimitMessage({
          lastSubmission: { emoji },
          timeRemaining,
          minutesRemaining: Math.ceil(timeRemaining / 60000)
        });
        startCountdown(timeRemaining);
      }, 2000);

      // Refresh stats
      loadGlobalStats();
      loadLiveEmotions();
    } else if (response.status === 429) {
      // Rate limited
      disableEmojis();
      showRateLimitMessage(data);
      startCountdown(data.timeRemaining);
    } else {
      alert('Error submitting emotion: ' + data.error);
    }
  } catch (error) {
    console.error('Error submitting emotion:', error);
    alert('Failed to submit emotion. Please try again.');
  }
}

// Get user location
async function getUserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({});
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.log('Location permission denied or unavailable');
        resolve({});
      },
      { timeout: 5000 }
    );
  });
}

// Show success message
function showSuccessMessage(emoji) {
  const successMessage = document.getElementById('successMessage');
  const successEmoji = document.getElementById('successEmoji');
  
  successEmoji.textContent = emoji;
  successMessage.style.display = 'block';
  
  hideRateLimitMessage();
}

// Hide success message
function hideSuccessMessage() {
  const successMessage = document.getElementById('successMessage');
  successMessage.style.display = 'none';
}

// Show rate limit message
function showRateLimitMessage(data) {
  const rateLimitMessage = document.getElementById('rateLimitMessage');
  const rateLimitText = document.getElementById('rateLimitText');
  const lastEmoji = document.getElementById('lastEmoji');
  
  if (data.lastSubmission) {
    lastEmoji.textContent = data.lastSubmission.emoji;
  }
  
  rateLimitText.textContent = `You can submit again in ${data.minutesRemaining} minute${data.minutesRemaining !== 1 ? 's' : ''}`;
  rateLimitMessage.style.display = 'block';
}

// Hide rate limit message
function hideRateLimitMessage() {
  const rateLimitMessage = document.getElementById('rateLimitMessage');
  rateLimitMessage.style.display = 'none';
}

// Start countdown
function startCountdown(timeRemaining) {
  const countdownEl = document.getElementById('countdown');
  
  // Clear existing interval
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  const updateCountdown = () => {
    const now = Date.now();
    const remaining = timeRemaining - (Date.now() - now);
    
    if (remaining <= 0) {
      clearInterval(countdownInterval);
      enableEmojis();
      hideRateLimitMessage();
      countdownEl.textContent = '';
      return;
    }

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Update immediately
  updateCountdown();
  
  // Update every second
  countdownInterval = setInterval(() => {
    timeRemaining -= 1000;
    
    if (timeRemaining <= 0) {
      clearInterval(countdownInterval);
      enableEmojis();
      hideRateLimitMessage();
      countdownEl.textContent = '';
      return;
    }

    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
}

// Enable emoji buttons
function enableEmojis() {
  canSubmit = true;
  const emojiButtons = document.querySelectorAll('.emoji-btn');
  emojiButtons.forEach(btn => {
    btn.disabled = false;
  });
}

// Disable emoji buttons
function disableEmojis() {
  canSubmit = false;
  const emojiButtons = document.querySelectorAll('.emoji-btn');
  emojiButtons.forEach(btn => {
    btn.disabled = true;
  });
}

// Load global stats
async function loadGlobalStats() {
  try {
    const response = await fetch(`${API_BASE}/emotions/global`);
    const data = await response.json();
    
    const globalStats = document.getElementById('globalStats');
    
    if (data.counts && data.counts.length > 0) {
      globalStats.innerHTML = data.counts.map(item => `
        <div class="stat-item">
          <span class="stat-emoji">${item.emoji}</span>
          <span class="stat-count">${item.count}</span>
        </div>
      `).join('');
    } else {
      globalStats.innerHTML = '<div class="stats-loading">No emotions shared in the last hour. Be the first!</div>';
    }
  } catch (error) {
    console.error('Error loading global stats:', error);
  }
}

// Load live emotions
async function loadLiveEmotions() {
  try {
    const response = await fetch(`${API_BASE}/emotions/recent?limit=100`);
    const data = await response.json();
    
    const liveEmotions = document.getElementById('liveEmotions');
    const totalCount = document.getElementById('totalCount');
    
    // Update total count
    const statsResponse = await fetch(`${API_BASE}/emotions/stats`);
    const statsData = await statsResponse.json();
    totalCount.querySelector('.count-number').textContent = statsData.total.toLocaleString();
    
    if (data.emotions && data.emotions.length > 0) {
      liveEmotions.innerHTML = data.emotions.map(emotion => `
        <div class="emotion-item" title="${emotion.city || emotion.country || 'Unknown location'}">
          ${emotion.emoji}
        </div>
      `).join('');
    } else {
      liveEmotions.innerHTML = '<div class="emotions-loading">No emotions shared yet. Be the first!</div>';
    }
  } catch (error) {
    console.error('Error loading live emotions:', error);
  }
}
