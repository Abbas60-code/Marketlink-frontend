import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare, Sparkles, X, User } from 'lucide-react';
import AIChatWindow from './AIChatWindow.jsx';
import AdminChatWindow from './AdminChatWindow.jsx';
import './ChatLauncher.css';

export default function ChatLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeWindow, setActiveWindow] = useState('none'); // 'none', 'ai', 'admin'
  const [showOptions, setShowOptions] = useState(false);

  const toggleLauncher = () => {
    if (isOpen) {
      setIsOpen(false);
      setShowOptions(false);
      setActiveWindow('none');
    } else {
      setIsOpen(true);
      setShowOptions(true);
    }
  };

  const handleSelectAI = () => {
    setShowOptions(false);
    setActiveWindow('ai');
  };

  const handleSelectAdmin = () => {
    // Only allow admin chat if logged in? We will handle auth inside the window
    setShowOptions(false);
    setActiveWindow('admin');
  };

  return createPortal(
    <>
      <div className="chat-launcher-root">
        {/* Launcher Button */}
        <button 
          className={`launcher-btn ${isOpen ? 'is-open' : ''}`} 
          onClick={toggleLauncher}
        >
          {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
          {!isOpen && <div className="launcher-pulse"></div>}
        </button>

        {/* Options Menu popup */}
        {showOptions && (
          <div className="chat-options-menu">
            <h4>How can we help?</h4>
            <button className="option-btn ai-btn" onClick={handleSelectAI}>
              <div className="option-icon ai"><Sparkles size={18} /></div>
              <div className="option-text">
                <strong>MarketLink AI</strong>
                <span>Instant answers & produce guide</span>
              </div>
            </button>
            <button className="option-btn admin-btn" onClick={handleSelectAdmin}>
              <div className="option-icon admin"><User size={18} /></div>
              <div className="option-text">
                <strong>Live Admin Support</strong>
                <span>Chat with our team</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Actual Chat Windows */}
      {activeWindow === 'ai' && (
        <AIChatWindow 
          onClose={toggleLauncher} 
          onSwitchToAdmin={() => setActiveWindow('admin')}
        />
      )}
      {activeWindow === 'admin' && (
        <AdminChatWindow onClose={toggleLauncher} />
      )}
    </>,
    document.body
  );
}
