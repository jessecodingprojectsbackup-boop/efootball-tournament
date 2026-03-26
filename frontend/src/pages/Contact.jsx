import { Link } from 'react-router-dom'
import { useApp } from '../App'

export default function Contact() {
  const { darkMode } = useApp()
  
  return (
    <div className="page-container">
      <div className="contact-hero">
        <div className="hero-icon">📞</div>
        <h1 className="hero-title">Admin Contact</h1>
        <p className="hero-subtitle">
          Reach the tournament organizer for support, updates, or questions
        </p>
      </div>

      <div className="contact-grid">
        {/* Left Card - Phone & WhatsApp */}
        <div className="contact-card phone-card">
          <div className="card-header">
            <div className="card-icon">📱</div>
            <h3>Tournament Organizer</h3>
            <div className="role-badge">Tournament Admin</div>
          </div>
          
          <div className="phone-list">
            <div className="phone-item">
              <span className="phone-label">Phone 1</span>
              <a href="tel:+233249404043" className="phone-number">+233 249 404 043</a>
            </div>
            <div className="phone-item">
              <span className="phone-label">Phone 2</span>
              <a href="tel:+233546662189" className="phone-number">+233 546 662 189</a>
            </div>
          </div>
          
          <button className="whatsapp-btn" onClick={() => window.open('https://wa.me/233249404043', '_blank')}>
            <span>💬</span>
            Message on WhatsApp
          </button>
          
          <div className="support-note">
            <span className="note-icon">ℹ️</span>
            Available for fixture questions, score corrections, and tournament support
          </div>
        </div>

        {/* Middle Card - Online Links */}
        <div className="contact-card online-card">
          <div className="card-header">
            <div className="card-icon">🔗</div>
            <h3>Connect Online</h3>
            <div className="role-badge">Social Links</div>
          </div>
          
          <div className="online-links">
            <a href="https://linktr.ee/shadowjx" target="_blank" rel="noopener noreferrer" className="link-card linktree">
              <div className="link-icon">🔗</div>
              <div className="link-content">
                <h4>Linktree</h4>
                <p>All social links &amp; updates</p>
              </div>
            </a>
            
            <a href="https://t.me/shadowjesse" target="_blank" rel="noopener noreferrer" className="link-card telegram">
              <div className="link-icon">✈️</div>
              <div className="link-content">
                <h4>Telegram</h4>
                <p>Fast messaging &amp; updates</p>
              </div>
            </a>
          </div>
        </div>

        {/* Right Card - QR Codes */}
        <div className="contact-card qr-card">
          <div className="card-header">
            <div className="card-icon">📱</div>
            <h3>Scan QR to Chat</h3>
            <div className="role-badge">Instant Connect</div>
          </div>
          
          <div className="qr-section">
            <div className="qr-block whatsapp">
              <div className="qr-container">
                <img 
                  src="https://quickchart.io/chart?cht=qr&chs=200x200&chl=https://wa.me/233249404043&choe=UTF-8" 
                  alt="WhatsApp QR Code" 
                  className="whatsapp-qr"
                />
                <div className="qr-label">WhatsApp</div>
              </div>
            </div>
            
            <div className="qr-block telegram">
              <div className="qr-container">
                <img 
                  src="https://quickchart.io/chart?cht=qr&chs=200x200&chl=https://t.me/shadowjesse&choe=UTF-8" 
                  alt="Telegram QR Code" 
                  className="telegram-qr"
                />
                <div className="qr-label">Telegram</div>
              </div>
            </div>
          </div>
          
          <div className="qr-info">
            <p>Scan QR codes for instant messaging access</p>
            <p><strong>Response time:</strong> Usually within 30 minutes</p>
          </div>
        </div>
      </div>
    </div>
  )
}

