import { useState } from 'react'

interface ShareModalProps {
  onClose: () => void
}

const SHARE_OPTIONS = [
  { id: 'copy', label: 'Copy Link', icon: '🔗' },
  { id: 'twitter', label: 'Twitter/X', icon: '🐦' },
  { id: 'facebook', label: 'Facebook', icon: '📘' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { id: 'telegram', label: 'Telegram', icon: '✈️' },
  { id: 'email', label: 'Email', icon: '📧' },
]

export default function ShareModal({ onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  
  const shareUrl = window.location.origin + window.location.pathname
  const shareText = "Check out PULSE - a mood sharing app! Share your feelings with the world 🌍"

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShare = (id: string) => {
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedText = encodeURIComponent(shareText)
    
    switch (id) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`, '_blank')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank')
        break
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, '_blank')
        break
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, '_blank')
        break
      case 'email':
        window.open(`mailto:?subject=${encodedText}&body=${encodedText}%0A%0A${encodedUrl}`, '_blank')
        break
      case 'copy':
        handleCopy()
        return
    }
    onClose()
  }

  // Native share if available
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PULSE - Share Your Mood',
          text: shareText,
          url: shareUrl,
        })
        onClose()
      } catch (err) {
        // User cancelled, do nothing
      }
    }
  }

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={e => e.stopPropagation()}>
        <button className="share-modal-close" onClick={onClose}>✕</button>
        
        <h3>📤 Share with Friends</h3>
        <p className="share-subtitle">Invite friends to join PULSE!</p>
        
        {/* Native share button for mobile */}
        {navigator.share && (
          <button className="share-native-btn" onClick={handleNativeShare}>
            <span>📱</span>
            <span>Share using device</span>
          </button>
        )}
        
        <div className="share-divider">
          <span>or</span>
        </div>
        
        <div className="share-options">
          {SHARE_OPTIONS.map(option => (
            <button 
              key={option.id}
              className="share-option"
              onClick={() => handleShare(option.id)}
            >
              <span className="share-icon">{option.icon}</span>
              <span className="share-label">
                {option.id === 'copy' && copied ? 'Copied!' : option.label}
              </span>
            </button>
          ))}
        </div>
        
        <div className="share-preview">
          <p>🔗 {shareUrl}</p>
        </div>
      </div>
    </div>
  )
}
