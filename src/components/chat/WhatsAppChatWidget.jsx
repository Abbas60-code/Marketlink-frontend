import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Paperclip,
  Smile,
  Mic,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  Lock,
  ChevronDown,
  Sparkles,
  ShoppingBag,
  HelpCircle,
  Clock,
  Image as ImageIcon,
  FileText,
  MessageCircleMore,
  Headset,
  MessagesSquare
} from 'lucide-react';
import './WhatsAppChatWidget.css';

// Quick Starter Suggestions
const QUICK_SUGGESTIONS = [
  { id: 'track', label: ' Track My Order', text: 'Hi! Could you help me track my recent order?' },
  { id: 'discount', label: ' Any Discount Code?', text: 'Do you have any active coupon codes or special offers?' },
  { id: 'shipping', label: ' Shipping Policy', text: 'What are the delivery times and shipping costs?' },
  { id: 'human', label: ' Connect to Admin', text: 'I need to speak directly with the store administrator.' }
];

const EMOJI_LIST = ['', '', '️', '', '', '', '', '', '', '', '️', ''];

export default function WhatsAppChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [showTooltip, setShowTooltip] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initial messages
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'admin',
      text: 'Salam & Welcome to our Store! ',
      time: '12:00 PM',
      status: 'read'
    },
    {
      id: 2,
      sender: 'admin',
      text: 'I am your dedicated store Admin. How can I assist you with your shopping or order today?',
      time: '12:01 PM',
      status: 'read'
    }
  ]);

  // Scroll to bottom whenever messages update or admin is typing
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Auto-hide teaser tooltip after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleChat = () => {
    if (!isOpen) {
      setUnreadCount(0);
      setShowTooltip(false);
    }
    setIsOpen((prev) => !prev);
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
    setShowDropdown(false);
  };

  const formatCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper to send message (Simulating Socket emit)
  const handleSendMessage = (textToSend = null) => {
    const text = (typeof textToSend === 'string' ? textToSend : inputText).trim();
    if (!text) return;

    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      time: formatCurrentTime(),
      status: 'sent' // will update to 'read' like WhatsApp
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setShowEmojiPicker(false);
    setShowAttachMenu(false);

    // Update status to delivered then read
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'read' } : m))
      );
    }, 800);

    /*
      =========================================================
      [SOCKET READY ARCHITECTURE]
      When connecting to real backend Socket.io:
      socket.emit('client_message', {
        userId: 'current_user_id',
        message: text,
        timestamp: new Date().toISOString()
      });
      =========================================================
    */

    // Simulate Admin Typing and Response
    setTimeout(() => {
      setIsTyping(true);
    }, 1200);

    setTimeout(() => {
      setIsTyping(false);
      const reply = generateAdminResponse(text);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'admin',
          text: reply,
          time: formatCurrentTime(),
          status: 'read'
        }
      ]);
    }, 2800);
  };

  // Intelligent Admin Mock Responses
  const generateAdminResponse = (userText) => {
    const lower = userText.toLowerCase();
    if (lower.includes('order') || lower.includes('track')) {
      return 'You can check your current orders under your Profile page! Or drop your Order ID here, and I will track it directly for you. ';
    }
    if (lower.includes('discount') || lower.includes('coupon') || lower.includes('code') || lower.includes('offer')) {
      return ' Use promo code "WELCOME10" at checkout for 10% off your entire order today!';
    }
    if (lower.includes('shipping') || lower.includes('delivery')) {
      return 'We offer Free Express Shipping on orders over $50! Standard delivery takes 2-4 business days nationwide. ';
    }
    if (lower.includes('price') || lower.includes('cost')) {
      return 'All product prices displayed on the store are inclusive of taxes. Let me know if you need assistance with bulk pricing!';
    }
    if (lower.includes('hi') || lower.includes('hello') || lower.includes('salam')) {
      return 'Hello there!  How is your day going? Which product caught your eye?';
    }
    return 'Thank you for your message!  I have received your request and will assist you right away. Feel free to ask anything else!';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const addEmoji = (emoji) => {
    setInputText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'admin',
        text: 'Chat history cleared. How can I help you again? ',
        time: formatCurrentTime(),
        status: 'read'
      }
    ]);
    setShowDropdown(false);
  };

  return (
    <div className="whatsapp-widget-root">
      {/* Floating Trigger Button in Right Corner */}
      <div className="whatsapp-floating-container">
        {/* Teaser Bubble (when closed) */}
        {!isOpen && showTooltip && (
          <div className="whatsapp-teaser-tooltip" onClick={handleToggleChat}>
            <div className="teaser-content">
              <span className="teaser-admin-title">Customer Support</span>
              <p className="teaser-text">Chat with Admin! </p>
            </div>
            <button
              className="teaser-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              title="Dismiss"
            >
              <X size={13} />
            </button>
            <div className="teaser-arrow" />
          </div>
        )}

        <button
          className={`whatsapp-trigger-btn ${isOpen ? 'is-active' : ''}`}
          onClick={handleToggleChat}
          aria-label="Support Chat"
          title="Chat with Admin"
        >
          <div className="whatsapp-btn-ripple" />
          {isOpen ? (
            <X size={26} color="#ffffff" className="trigger-icon-spin" />
          ) : (
            <>
              <MessageCircleMore size={30} color="#ffffff" strokeWidth={2.2} />
              {unreadCount > 0 && (
                <span className="whatsapp-unread-badge">{unreadCount}</span>
              )}
            </>
          )}
        </button>
      </div>

      {/* WhatsApp Chat Popup Box */}
      {isOpen && (
        <div className="whatsapp-chat-box">
          {/* Header */}
          <div className="whatsapp-header">
            <div className="whatsapp-header-left">
              <div className="whatsapp-avatar-wrap">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                  alt="Admin Avatar"
                  className="whatsapp-avatar-img"
                />
                <span className="whatsapp-online-dot" />
              </div>
              <div className="whatsapp-header-info">
                <div className="whatsapp-header-title-row">
                  <h4>Admin Support</h4>
                  <span className="verified-check"></span>
                </div>
                <p className="whatsapp-header-status">
                  {isTyping ? (
                    <span className="typing-status">typing...</span>
                  ) : (
                    'online'
                  )}
                </p>
              </div>
            </div>

            <div className="whatsapp-header-actions">
              <button
                className="header-action-btn"
                title="Voice Call (Admin)"
                onClick={() => alert('Starting secure voice line with Admin...')}
              >
                <Phone size={18} />
              </button>
              <button
                className="header-action-btn"
                title="Video Call (Admin)"
                onClick={() => alert('Admin video call requires camera permissions.')}
              >
                <Video size={19} />
              </button>
              <div className="header-more-wrapper">
                <button
                  className="header-action-btn"
                  title="More Options"
                  onClick={() => setShowDropdown((prev) => !prev)}
                >
                  <MoreVertical size={18} />
                </button>
                {showDropdown && (
                  <div className="whatsapp-dropdown-menu">
                    <button onClick={handleClearChat}>Clear chat</button>
                    <button onClick={() => setShowDropdown(false)}>Contact Info</button>
                    <button onClick={() => setShowDropdown(false)}>Mute notifications</button>
                  </div>
                )}
              </div>
              <button
                className="header-action-btn close"
                title="Close chat"
                onClick={handleToggleChat}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Chat Messages Body with WhatsApp Doodle Wallpaper */}
          <div className="whatsapp-body">
            {/* Encryption Notice */}
            <div className="whatsapp-encryption-pill">
              <Lock size={11} />
              <span>
                Messages are end-to-end encrypted. You are chatting directly with store Admin.
              </span>
            </div>

            {/* Date Separator */}
            <div className="whatsapp-date-divider">
              <span>TODAY</span>
            </div>

            {/* Messages */}
            <div className="whatsapp-messages-container">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`whatsapp-bubble-row ${isUser ? 'user-row' : 'admin-row'}`}
                  >
                    <div className={`whatsapp-bubble ${isUser ? 'user-bubble' : 'admin-bubble'}`}>
                      <p className="bubble-text">{msg.text}</p>
                      <div className="bubble-meta">
                        <span className="bubble-time">{msg.time}</span>
                        {isUser && (
                          <span className="bubble-ticks">
                            <CheckCheck size={14} className="double-tick-blue" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="whatsapp-bubble-row admin-row">
                  <div className="whatsapp-bubble admin-bubble typing-bubble">
                    <div className="whatsapp-typing-indicator">
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Emoji Picker Popover */}
          {showEmojiPicker && (
            <div className="whatsapp-emoji-tray">
              {EMOJI_LIST.map((emoji, index) => (
                <button
                  key={index}
                  className="emoji-item-btn"
                  onClick={() => addEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Attachment Menu Popover */}
          {showAttachMenu && (
            <div className="whatsapp-attach-tray">
              <button
                className="attach-item-btn photos"
                onClick={() => {
                  setShowAttachMenu(false);
                  alert('Photo upload simulation: Selected image attachment.');
                }}
              >
                <div className="attach-icon-circle purple">
                  <ImageIcon size={17} />
                </div>
                <span>Photos & Videos</span>
              </button>
              <button
                className="attach-item-btn docs"
                onClick={() => {
                  setShowAttachMenu(false);
                  alert('Document picker: Invoices or order slips.');
                }}
              >
                <div className="attach-icon-circle blue">
                  <FileText size={17} />
                </div>
                <span>Document</span>
              </button>
              <button
                className="attach-item-btn order"
                onClick={() => {
                  setShowAttachMenu(false);
                  handleSendMessage('Here is my recent Order Slip / Cart question.');
                }}
              >
                <div className="attach-icon-circle green">
                  <ShoppingBag size={17} />
                </div>
                <span>Product Query</span>
              </button>
            </div>
          )}

          {/* WhatsApp Footer Input Bar */}
          <div className="whatsapp-footer">
            <button
              className={`footer-icon-btn ${showEmojiPicker ? 'active' : ''}`}
              onClick={() => {
                setShowEmojiPicker((prev) => !prev);
                setShowAttachMenu(false);
              }}
              title="Emoji"
            >
              <Smile size={21} />
            </button>

            <button
              className={`footer-icon-btn ${showAttachMenu ? 'active' : ''}`}
              onClick={() => {
                setShowAttachMenu((prev) => !prev);
                setShowEmojiPicker(false);
              }}
              title="Attach File / Image"
            >
              <Paperclip size={20} />
            </button>

            <div className="whatsapp-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                className="whatsapp-input-field"
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
              />
            </div>

            {inputText.trim().length > 0 ? (
              <button
                className="whatsapp-send-btn"
                onClick={() => handleSendMessage()}
                title="Send Message"
              >
                <Send size={18} />
              </button>
            ) : (
              <button
                className="whatsapp-mic-btn"
                title="Hold to record voice note"
                onClick={() => alert('Hold or click to record voice note for Admin.')}
              >
                <Mic size={20} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
