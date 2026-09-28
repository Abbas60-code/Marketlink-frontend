import React, { useState, useRef, useEffect } from 'react';
import {
  Search, CheckCheck, Send, Paperclip, Smile, MoreVertical,
  Phone, Video, Filter, Lock, ShoppingBag, Bell, MessageSquare
} from 'lucide-react';
import { getAdminConversations, getMessages, sendMessage, updateConversationStatus } from '../../services/chatService';
import { connectSocket } from '../chat/socketClient';
import './AdminChatManager.css';

const EMOJI_LIST = ['', '', '️', '', '', '', '', ''];

export default function AdminChatManager() {
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'unread', 'read'
  const [replyText, setReplyText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [socket, setSocket] = useState(null);

  const messagesEndRef = useRef(null);

  // Load conversations and connect socket on mount
  useEffect(() => {
    loadConversations();
    const s = connectSocket();
    if (s) {
      setSocket(s);
      
      // Listen for updates across all conversations
      s.on('conversation_update', (data) => {
        // data: { conversationId, lastMessage, adminUnreadCount }
        setConversations(prev => prev.map(c => {
          if (c._id === data.conversationId) {
            return {
              ...c,
              lastMessage: data.lastMessage,
              lastMessageAt: new Date(),
              adminUnreadCount: c._id === selectedConvId ? 0 : data.adminUnreadCount
            };
          }
          return c;
        }).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)));

        if (data.conversationId === selectedConvId) {
           // We are currently in this conversation, messages will be handled by 'new_message' listener
        } else {
           // Maybe play a sound or show notification
        }
      });
    }

    return () => {
       if (s) {
         s.off('conversation_update');
         if (selectedConvId) s.emit('leave_conversation', selectedConvId);
       }
    };
  }, []); // [] means run once

  const loadConversations = async () => {
    try {
      const res = await getAdminConversations();
      if (res.success) {
        setConversations(res.conversations);
      }
    } catch (err) {
      console.error('Failed to load convs:', err);
    }
  };

  const selectedConv = conversations.find((c) => c._id === selectedConvId);

  // When a conversation is selected, join its room and load messages
  useEffect(() => {
    if (selectedConvId) {
      loadMessages(selectedConvId);
      
      if (socket) {
        socket.emit('join_conversation', selectedConvId);
        
        socket.on('new_message', (newMsg) => {
          setMessages(prev => [...prev, newMsg]);
          // Mark read locally
          setConversations(prev => prev.map(c => 
            c._id === selectedConvId ? { ...c, adminUnreadCount: 0 } : c
          ));
        });
      }
    }
    
    return () => {
       if (socket && selectedConvId) {
         socket.emit('leave_conversation', selectedConvId);
         socket.off('new_message');
       }
    };
  }, [selectedConvId, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async (convId) => {
    try {
      const res = await getMessages(convId);
      if (res.success) {
        setMessages(res.messages);
        // Clean unread instantly in UI since getMessages marks them read in backend
        setConversations(prev => prev.map(c => 
          c._id === convId ? { ...c, adminUnreadCount: 0 } : c
        ));
      }
    } catch (err) {
      console.error('Failed to load msgs:', err);
    }
  };

  const handleSelectConv = (conv) => {
    setSelectedConvId(conv._id);
    setShowEmojiPicker(false);
    setShowOptionsMenu(false);
  };

  const handleSendReply = async () => {
    const text = replyText.trim();
    if (!text || !selectedConv) return;
    setReplyText('');
    setShowEmojiPicker(false);

    try {
      await sendMessage(selectedConvId, text);
      // Socket will broadcast it back to us
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const handleArchiveChat = async () => {
    if (!selectedConv) return;
    try {
      await updateConversationStatus(selectedConvId, 'archived');
      setConversations(prev => prev.filter(c => c._id !== selectedConvId));
      setSelectedConvId(null);
      setShowOptionsMenu(false);
    } catch (err) {
      console.error('Error archiving:', err);
    }
  };

  // Filters
  const filteredUsers = conversations.filter((c) => {
    const q = searchQuery ? searchQuery.toLowerCase() : '';
    const matchSearch =
      !q ||
      (c.userId?.name || '').toLowerCase().includes(q) ||
      (c.userId?.email || '').toLowerCase().includes(q);

    if (!matchSearch) return false;
    if (activeFilter === 'unread') return c.adminUnreadCount > 0;
    if (activeFilter === 'read') return c.adminUnreadCount === 0;
    return true;
  });

  const totalUnreadCount = conversations.reduce((acc, c) => acc + (c.adminUnreadCount > 0 ? 1 : 0), 0);

  return (
    <div className="admin-chat-layout">
      <div className="admin-chat-container">
        {/* LEFT PANEL */}
        <aside className="chat-left-sidebar">
          <div className="sidebar-top-bar">
            <div className="admin-profile-snippet">
              <div className="admin-avatar-box">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                  alt="Admin Avatar"
                />
                <span className="admin-live-dot" />
              </div>
              <div>
                <h4>Admin Helpdesk</h4>
                <span>Live Socket Connected</span>
              </div>
            </div>
            <div className="sidebar-icons">
              <button
                className="icon-circle-btn"
                onClick={() => alert(`You have ${totalUnreadCount} unread chats.`)}
              >
                <Bell size={16} />
                {totalUnreadCount > 0 && <span className="red-pulse-dot" />}
              </button>
            </div>
          </div>

          <div className="chat-search-wrap">
            <div className="chat-search-input-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>×</button>
              )}
            </div>
          </div>

          <div className="chat-filter-tabs">
            <button
              className={`filter-tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All <span>{conversations.length}</span>
            </button>
            <button
              className={`filter-tab-btn ${activeFilter === 'unread' ? 'active' : ''}`}
              onClick={() => setActiveFilter('unread')}
            >
              Unread {totalUnreadCount > 0 && <span className="tab-count unread">{totalUnreadCount}</span>}
            </button>
            <button
              className={`filter-tab-btn ${activeFilter === 'read' ? 'active' : ''}`}
              onClick={() => setActiveFilter('read')}
            >
              Read
            </button>
          </div>

          <div className="users-scroll-list">
            {filteredUsers.length === 0 ? (
              <div className="empty-users-state">
                <Filter size={24} />
                <p>No active conversations yet.</p>
              </div>
            ) : (
              filteredUsers.map((c) => {
                const isSelected = selectedConvId === c._id;
                const activeTime = new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div
                    key={c._id}
                    className={`user-list-item ${isSelected ? 'selected' : ''} ${c.adminUnreadCount > 0 ? 'has-unread' : ''}`}
                    onClick={() => handleSelectConv(c)}
                  >
                    <div className="user-item-avatar-wrap">
                       {/* using placeholder avatar if none provided */}
                      <img src={c.userId?.profileImage?.url || 'https://via.placeholder.com/44'} alt={c.userId?.name} />
                      <span className="user-online-badge" /> 
                    </div>
                    <div className="user-item-content">
                      <div className="user-item-row-top">
                        <span className="user-item-name">{c.userId?.name || 'Unknown User'}</span>
                        <span className={`user-item-time ${c.adminUnreadCount > 0 ? 'unread-time' : ''}`}>
                          {activeTime}
                        </span>
                      </div>
                      <div className="user-item-row-bottom">
                        <p className="user-item-last-msg">
                          {c.adminUnreadCount === 0 && <CheckCheck size={14} className="msg-check-icon" />}
                          {c.lastMessage.substring(0, 30) || 'Started a conversation'}
                        </p>
                        {c.adminUnreadCount > 0 && (
                          <span className="user-unread-badge">{c.adminUnreadCount}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <main className="chat-conversation-panel">
          {selectedConv ? (
            <>
              <div className="conversation-header">
                <div className="conv-header-user">
                  <div className="conv-avatar-box">
                    <img src={selectedConv.userId?.profileImage?.url || 'https://via.placeholder.com/44'} alt={selectedConv.userId?.name} />
                    <span className="conv-online-dot" />
                  </div>
                  <div className="conv-user-details">
                    <h4>{selectedConv.userId?.name}</h4>
                    <span className="conv-status-text status-online">{selectedConv.userId?.email}</span>
                  </div>
                </div>

                <div className="conv-header-actions">
                  <span className="order-pill-badge" title="Customer Chat">
                    <ShoppingBag size={13} />
                    Active Support
                  </span>
                  
                  <div className="conv-dropdown-wrapper">
                    <button
                      className="conv-action-btn"
                      onClick={() => setShowOptionsMenu((prev) => !prev)}
                    >
                      <MoreVertical size={17} />
                    </button>
                    {showOptionsMenu && (
                      <div className="conv-menu-dropdown">
                        <button onClick={handleArchiveChat}>Archive Conversation</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="conversation-body">
                <div className="conv-encryption-badge">
                  <Lock size={12} />
                  <span>Messages are secured with real-time Socket.IO encryption</span>
                </div>

                <div className="conv-messages-scroll">
                  {messages.map((msg) => {
                    const isAdmin = msg.senderRole === 'admin';
                    const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={msg._id} className={`conv-bubble-row ${isAdmin ? 'admin-row' : 'user-row'}`}>
                        <div className={`conv-bubble ${isAdmin ? 'admin-bubble' : 'user-bubble'}`}>
                          <p className="conv-bubble-text">{msg.message}</p>
                          <div className="conv-bubble-meta">
                            <span className="conv-bubble-time">{time}</span>
                            {isAdmin && <CheckCheck size={14} className={msg.isRead ? "conv-double-blue" : ""} />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {showEmojiPicker && (
                <div className="conv-emoji-popover">
                  {EMOJI_LIST.map((emoji, index) => (
                    <button
                      key={index}
                      className="conv-emoji-btn"
                      onClick={() => setReplyText((prev) => prev + emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <div className="conversation-footer">
                <button
                  className={`conv-tool-btn ${showEmojiPicker ? 'active' : ''}`}
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                >
                  <Smile size={20} />
                </button>
                <div className="conv-input-wrap">
                  <input
                    type="text"
                    placeholder={`Reply to ${selectedConv.userId?.name}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <button
                  className={`conv-send-btn ${replyText.trim().length > 0 ? 'active' : ''}`}
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                >
                  <Send size={17} />
                </button>
              </div>
            </>
          ) : (
            <div className="conv-empty-selection">
              <div className="empty-illustration">
                <MessageSquare size={48} color="#008069" />
              </div>
              <h3>MarketLink Admin Support</h3>
              <p>Select a customer conversation from the left panel to begin replying.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
