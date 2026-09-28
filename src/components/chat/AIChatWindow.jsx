import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, X, Loader2 } from 'lucide-react';
import { sendAIMessage, getAIHistory } from '../../services/chatService';
import './AIChatWindow.css';

// Helper to get auth token — matches AuthContext localStorage key
const getToken = () => localStorage.getItem('techwiz_token');

export default function AIChatWindow({ onClose, onSwitchToAdmin }) {
  const [messages, setMessages] = useState([
    { type: 'ai', text: 'Hello! I am MarketLink AI. Ask me anything about our products, farmers, orders, or how to use the platform!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (getToken()) {
      loadHistory();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const res = await getAIHistory();
      if (res.success && res.history.length > 0) {
        const formatted = res.history.reverse().flatMap(h => [
          { type: 'user', text: h.userMessage },
          { type: 'ai', text: h.aiResponse }
        ]);
        setMessages(formatted);
      }
    } catch (_) {}
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!getToken()) {
      setMessages(prev => [...prev, 
        { type: 'user', text: input.trim() },
        { type: 'ai', text: 'Please login/register to chat with AI. This lets us save your conversation history and give you personalised answers!' }
      ]);
      setInput('');
      return;
    }

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const res = await sendAIMessage(userMsg, sessionId);
      if (res.success) {
        setMessages(prev => [...prev, { type: 'ai', text: res.response }]);
      } else {
        setMessages(prev => [...prev, { type: 'ai', text: res.message || 'Something went wrong. Please try again!' }]);
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Sorry, AI service is temporarily unavailable. Please try again later!';
      setMessages(prev => [...prev, { type: 'ai', text: errMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-chat-window">
      <div className="chat-header ai-theme">
        <div className="header-left">
          <div className="header-icon"><Sparkles size={16} /></div>
          <div>
            <h3>MarketLink AI</h3>
            <span>Smart Shopping Assistant</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {onSwitchToAdmin && (
            <button 
              onClick={onSwitchToAdmin} 
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Talk to Admin
            </button>
          )}
          <button onClick={onClose} className="close-btn"><X size={18} /></button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-row ${msg.type}-row`}>
            {msg.type === 'ai' && <div className="avatar-mini-ai"><Sparkles size={12} /></div>}
            <div className={`message-bubble ${msg.type}-bubble`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-row ai-row">
            <div className="avatar-mini-ai"><Sparkles size={12} /></div>
            <div className="message-bubble ai-bubble typing">
              <Loader2 className="spinner-icon" size={14} /> AI is thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about products, farmers, orders..."
          disabled={isLoading}
        />
        <button type="submit" disabled={!input.trim() || isLoading}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
