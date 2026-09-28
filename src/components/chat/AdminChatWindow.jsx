import React, { useState, useEffect, useRef } from 'react';
import { Send, User, X } from 'lucide-react';
import { getOrCreateConversation, getMessages, sendMessage } from '../../services/chatService';
import { connectSocket } from './socketClient';
import { useAuth } from '../../context/AuthContext.jsx';
import './AdminChatWindow.css';

export default function AdminChatWindow({ onClose }) {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState(null);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      initChat();
    }
    return () => {
      if (socket && conversation) {
        socket.emit('leave_conversation', conversation._id);
      }
    };
  }, [isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initChat = async () => {
    try {
      const convRes = await getOrCreateConversation();
      if (convRes.success) {
        setConversation(convRes.conversation);
        const convId = convRes.conversation._id;
        
        // Fetch existing messages
        const msgRes = await getMessages(convId);
        if (msgRes.success) {
          setMessages(msgRes.messages);
        }

        // Init socket
        const s = connectSocket();
        if (s) {
          setSocket(s);
          s.emit('join_conversation', convId);

          // Remove any previous listener before adding new one to prevent duplicates
          s.off('new_message');
          s.on('new_message', (newMsg) => {
            setMessages((prev) => {
              // Prevent duplicate if message already exists by _id
              if (newMsg._id && prev.some(m => m._id === newMsg._id)) return prev;
              return [...prev, newMsg];
            });
          });
        }
      }
    } catch (err) {
      console.error('Failed to init live chat:', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !conversation) return;

    const msg = input.trim();
    setInput('');

    try {
      await sendMessage(conversation._id, msg);
      // We don't manually append to state here because Socket.IO will broadcast it back to us via 'new_message'
    } catch (err) {
      console.error('Failed to send msg:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-chat-window">
        <div className="chat-header admin-theme">
          <div className="header-left">
            <div className="header-icon"><User size={16} /></div>
            <div>
              <h3>Live Admin Support</h3>
              <span>We're here to help</span>
            </div>
          </div>
          <button onClick={onClose} className="close-btn"><X size={18} /></button>
        </div>
        <div className="chat-messages empty-state">
          <p>Please log in to chat with our support team.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-chat-window">
      <div className="chat-header admin-theme">
        <div className="header-left">
          <div className="header-icon"><User size={16} /></div>
          <div>
            <h3>Live Admin Support</h3>
            <span>Online</span>
          </div>
        </div>
        <button onClick={onClose} className="close-btn"><X size={18} /></button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => {
          const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id;
          return (
            <div key={idx} className={`message-row ${isMe ? 'user-row' : 'admin-row'}`}>
              <div className={`message-bubble ${isMe ? 'user-bubble' : 'admin-bubble'}`}>
                {msg.message}
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="empty-chat-msg">
            <p>Send a message to start chatting with our team!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-area">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit" disabled={!input.trim()}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
