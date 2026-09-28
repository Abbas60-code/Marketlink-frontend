import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  RotateCcw,
  ShoppingBag,
  Zap,
  ArrowRight,
  Check,
  Copy,
  Trash2,
  Tag,
  Truck,
  ShieldCheck,
  Search,
  AlertCircle
} from 'lucide-react';
import { sendAIMessage } from '../../../services/chatService';
import './AIChatbotWidget.css';

const AI_SUGGESTIONS = [
  { id: 'organic', text: ' What fresh organic vegetables are in harvest this week?', label: 'Fresh Harvest' },
  { id: 'farmers', text: '‍ How can I view local verified farmers and their stall numbers?', label: 'Find Farmers' },
  { id: 'pickup', text: ' How does weekend market pickup work?', label: 'Pickup Info' },
  { id: 'preorder', text: ' Can I pre-order produce before cutoff hours?', label: 'Pre-Order Guide' },
  { id: 'deals', text: '️ What are today’s organic farm basket deals?', label: 'Today’s Deals' },
  { id: 'payment', text: ' How do I pay for my pre-ordered produce?', label: 'Payment Method' }
];

export default function AIChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chipsScrollRef = useRef(null);

  const handleChipsWheel = (e) => {
    if (chipsScrollRef.current && e.deltaY !== 0) {
      e.preventDefault();
      chipsScrollRef.current.scrollLeft += e.deltaY * 1.1;
    }
  };

  const scrollChips = (direction) => {
    if (chipsScrollRef.current) {
      chipsScrollRef.current.scrollBy({
        left: direction === 'left' ? -130 : 130,
        behavior: 'smooth'
      });
    }
  };

  // Initial messages
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Greetings! I am your **MarketLink AI Assistant** \n\nI can recommend seasonal organic produce, locate local farmer market stalls, explain pre-order pickup slots, and provide farm-fresh deals. How can I assist your healthy lifestyle today?',
      time: 'Just now',
      recommendations: [
        { name: 'Organic Farm Spinach', price: '$2.50 / kg', category: 'Vegetables', badge: 'Fresh Harvest' },
        { name: 'Honeycrisp Apples', price: '$3.80 / kg', category: 'Fruits', badge: 'Popular' }
      ]
    }
  ]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Tooltip auto fade after 9 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 9000);
    return () => clearTimeout(timer);
  }, []);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setShowTooltip(false);
    }
  };

  const formatCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Smart Context-Aware AI Knowledge Engine for MarketLink
  const generateBotReply = (query) => {
    const q = query.toLowerCase();

    if (q.includes('vegetable') || q.includes('harvest') || q.includes('spinach') || q.includes('organic') || q.includes('fresh')) {
      return {
        text: ' **Fresh Farm Produce in Harvest This Week:**\n\n• **Organic Baby Spinach & Kale:** Harvested daily at Green Valley Organic Farm.\n• **Hydroponic Tomatoes:** Ripe, juicy, and pesticide-free.\n• **Seasonal Root Vegetables:** Carrots, beetroot, and organic potatoes.\n\nBrowse our full catalog in the Products tab!',
        recommendations: [
          { name: 'Organic Baby Spinach', price: '$2.50 / kg', category: 'Leafy Greens', badge: 'Top Pick' },
          { name: 'Hydroponic Tomatoes', price: '$3.10 / kg', category: 'Vegetables', badge: 'Pesticide-Free' }
        ]
      };
    }

    if (q.includes('farmer') || q.includes('grower') || q.includes('stall') || q.includes('vendor')) {
      return {
        text: '‍ **Local Verified Growers Directory:**\n\n• You can browse all verified local farmers under the **Farmers** tab.\n• Each farmer profile lists their assigned Market Stall #, operating days, and specialties.\n• Switch to **Map View** on the Farmers page to see farm stall pins in real-time!',
        recommendations: []
      };
    }

    if (q.includes('pickup') || q.includes('slot') || q.includes('time') || q.includes('market')) {
      return {
        text: ' **Weekend Market Pickup Info:**\n\n1. Select your preferred local Farmers Market during checkout.\n2. Choose a convenient pickup date & time window (e.g. 08:00 AM - 10:00 AM).\n3. Use the integrated **Google Maps / OpenStreetMap** widget on your order card for live GPS directions to your pickup stall!',
        recommendations: []
      };
    }

    if (q.includes('pre-order') || q.includes('preorder') || q.includes('order') || q.includes('cutoff')) {
      return {
        text: ' **Pre-Ordering Guide:**\n\n• Pre-ordering guarantees your fresh harvest is reserved before farmers sell out at weekend markets.\n• Make sure to submit pre-orders before the farmer’s cutoff hours (typically 12–24 hours before pickup day).\n• You can modify or cancel pre-orders anytime before the cutoff window in your Profile!',
        recommendations: []
      };
    }

    if (q.includes('pay') || q.includes('payment') || q.includes('cash') || q.includes('card')) {
      return {
        text: ' **Payment Method:**\n\n• Pre-orders on MarketLink require **NO online advance payment**.\n• Payment is settled directly in-person with the grower at their stall when you inspect and collect your fresh basket (Cash or Card accepted).',
        recommendations: []
      };
    }

    if (q.includes('deal') || q.includes('discount') || q.includes('coupon') || q.includes('sale')) {
      return {
        text: '️ **Today’s Farm Basket Deals:**\n\n1. **Organic Berry Bundle:** 15% OFF when buying 2kg or more.\n2. **Weekly Harvest Box:** Pre-configured seasonal box with $5 savings.\n3. **Free Stall Pickup:** Zero delivery fees on all market pre-orders!',
        recommendations: [
          { name: 'Organic Berry Bundle', price: '$5.50 / kg', category: 'Fruits', badge: '15% OFF' }
        ]
      };
    }

    if (q.includes('ship') || q.includes('delivery') || q.includes('time') || q.includes('track')) {
      return {
        text: ' **Shipping & Delivery Information:**\n\n• **Standard Domestic Shipping:** 2 to 4 business days.\n• **Cost:** Completely FREE for all orders above $50.\n• **Express Overnight:** Available during checkout.\n• All shipments include instant tracking links sent via email and SMS.',
        recommendations: []
      };
    }

    if (q.includes('return') || q.includes('refund') || q.includes('exchange')) {
      return {
        text: '️ **Return & Guarantee Policy:**\n\n• We offer a **30-Day Hassle-Free Return Guarantee** on all unused items in original packaging.\n• Once received, refunds are processed to your original payment method within 3 business days.\n• Zero restocking fees!',
        recommendations: []
      };
    }

    if (q.includes('audio') || q.includes('headphone') || q.includes('speaker') || q.includes('sony') || q.includes('music')) {
      return {
        text: ' **Top Audio Picks:**\n\n1. **Sony WH-1000XM5** ($349.99) - Industry-leading active noise canceling.\n2. **Marshall Stanmore III Bluetooth Speaker** ($379.99) - Iconic vintage soundstage.',
        recommendations: [
          { name: 'Sony WH-1000XM5', price: '$349.99', category: 'Audio', badge: '4.9 ' },
          { name: 'Marshall Stanmore III', price: '$379.99', category: 'Audio', badge: 'Best Sound' }
        ]
      };
    }

    if (q.includes('hi') || q.includes('hello') || q.includes('hey') || q.includes('salam')) {
      return {
        text: 'Hello there!  I am ready to help you browse products, check tech specs, or apply coupon codes. What are you looking to buy today?',
        recommendations: []
      };
    }

    return {
      text: `I understand you're asking about "${query}". I've searched our store catalog:\n\n• You can find related products in the Trending & Categories sections on this page.\n• Need custom assistance? You can also tap the Admin Chat widget on the right side to speak directly with store staff! `,
      recommendations: []
    };
  };

  const handleSend = async (textToSend = null) => {
    const text = (typeof textToSend === 'string' ? textToSend : inputText).trim();
    if (!text) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      time: formatCurrentTime()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const result = await sendAIMessage(text);
      setIsTyping(false);

      if (result.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: result.response,
            recommendations: [],
            time: formatCurrentTime()
          }
        ]);
      } else {
        throw new Error(result.message || 'Unknown AI error');
      }
    } catch (err) {
      setIsTyping(false);

      // Determine friendly error message
      let errorText = '⚠️ Something went wrong. Please try again.';
      const errMsg = err?.response?.data?.message || err?.message || '';

      if (
        err?.response?.status === 503 ||
        errMsg.toLowerCase().includes('503') ||
        errMsg.toLowerCase().includes('high demand') ||
        errMsg.toLowerCase().includes('unavailable')
      ) {
        errorText = '⏳ AI abhi busy hai — high demand ki wajah se. Thodi der baad dobara try karein!';
      } else if (err?.response?.status === 401 || errMsg.toLowerCase().includes('unauthorized') || errMsg.toLowerCase().includes('token')) {
        errorText = '🔒 AI use karne ke liye pehle login karein.';
      } else if (errMsg) {
        errorText = `⚠️ ${errMsg}`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: errorText,
          recommendations: [],
          time: formatCurrentTime(),
          isError: true
        }
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: 'Chat history refreshed. How can I help you find the best products today? ',
        time: formatCurrentTime(),
        recommendations: []
      }
    ]);
  };

  const copyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="ai-chatbot-widget-root">
      {/* Floating Trigger on Bottom Left */}
      <div className="ai-floating-container">
        {!isOpen && showTooltip && (
          <div className="ai-teaser-tooltip" onClick={handleToggle}>
            <div className="ai-tooltip-sparkle">
              <Sparkles size={14} />
            </div>
            <div className="ai-tooltip-content">
              <span className="ai-tooltip-title">AI Shopping Assistant</span>
              <p className="ai-tooltip-desc">Ask me anything about products! </p>
            </div>
            <button
              className="ai-tooltip-close"
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              title="Close"
            >
              <X size={13} />
            </button>
            <div className="ai-tooltip-arrow" />
          </div>
        )}

        <button
          className={`ai-trigger-btn ${isOpen ? 'is-active' : ''}`}
          onClick={handleToggle}
          aria-label="AI Shopping Assistant"
          title="Open AI Chatbot"
        >
          <div className="ai-btn-glow" />
          {isOpen ? (
            <X size={26} color="#ffffff" className="ai-icon-spin" />
          ) : (
            <div className="ai-trigger-icon-wrap">
              <Bot size={30} color="#ffffff" strokeWidth={2.2} />
              <span className="ai-sparkle-badge">
                <Sparkles size={10} color="#ffffff" />
              </span>
            </div>
          )}
        </button>
      </div>

      {/* AI Chatbot Window Drawer */}
      {isOpen && (
        <div className="ai-chat-box">
          {/* Header */}
          <div className="ai-header">
            <div className="ai-header-left">
              <div className="ai-avatar-wrap">
                <div className="ai-avatar-core">
                  <Bot size={22} color="#ffffff" />
                </div>
                <span className="ai-status-pulse" />
              </div>
              <div className="ai-header-meta">
                <div className="ai-header-title-row">
                  <h4>eMart AI Assistant</h4>
                  <span className="ai-badge-pill">AI v2.4</span>
                </div>
                <p className="ai-header-status">
                  {isTyping ? (
                    <span className="ai-thinking-text">Thinking & searching store...</span>
                  ) : (
                    'Always Online • Instant Responses'
                  )}
                </p>
              </div>
            </div>

            <div className="ai-header-actions">
              <button
                className="ai-action-btn"
                title="Clear Chat History"
                onClick={handleClearChat}
              >
                <Trash2 size={16} />
              </button>
              <button
                className="ai-action-btn close"
                title="Close AI Assistant"
                onClick={handleToggle}
              >
                <X size={19} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="ai-body">
            {/* Quick Feature Banner */}
            <div className="ai-info-banner">
              <Sparkles size={13} />
              <span>Ask about product specs, price drops, discounts or order delivery.</span>
            </div>

            <div className="ai-messages-list">
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div
                    key={msg.id}
                    className={`ai-message-row ${isBot ? 'bot-row' : 'user-row'}`}
                  >
                    {isBot && (
                      <div className="ai-bot-mini-avatar">
                        <Bot size={15} color="#ffffff" />
                      </div>
                    )}
                    <div className={`ai-message-bubble ${isBot ? 'bot-bubble' : 'user-bubble'}`}>
                      <div className="ai-bubble-text">
                        {msg.text.split('\n').map((line, idx) => (
                          <p key={idx} className={line.trim() === '' ? 'empty-line' : ''}>
                            {line}
                          </p>
                        ))}
                      </div>

                      {/* Mini Product Cards Preview inside Bot Reply */}
                      {isBot && msg.recommendations && msg.recommendations.length > 0 && (
                        <div className="ai-recommendations-row">
                          {msg.recommendations.map((item, i) => (
                            <div key={i} className="ai-product-chip">
                              <div className="ai-chip-tag">{item.badge || item.category}</div>
                              <span className="ai-chip-name">{item.name}</span>
                              <span className="ai-chip-price">{item.price}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="ai-bubble-meta">
                        <span className="ai-msg-time">{msg.time}</span>
                        {isBot && (
                          <button
                            className="ai-copy-btn"
                            title="Copy reply"
                            onClick={() => copyText(msg.id, msg.text)}
                          >
                            {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="ai-message-row bot-row">
                  <div className="ai-bot-mini-avatar">
                    <Bot size={15} color="#ffffff" />
                  </div>
                  <div className="ai-message-bubble bot-bubble ai-typing-bubble">
                    <div className="ai-typing-dots">
                      <span className="ai-dot" />
                      <span className="ai-dot" />
                      <span className="ai-dot" />
                    </div>
                    <span className="ai-typing-label">AI is formulating recommendations...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Prompts */}
            <div className="ai-suggestions-container">
              <div className="ai-suggestions-header-row">
                <div className="ai-suggestions-title">
                  <Zap size={12} />
                  <span>Suggested prompts:</span>
                </div>
                <div className="ai-chips-arrows">
                  <button
                    className="ai-chip-arrow-btn"
                    onClick={() => scrollChips('left')}
                    title="Scroll left"
                    aria-label="Scroll left"
                  >
                    ‹
                  </button>
                  <button
                    className="ai-chip-arrow-btn"
                    onClick={() => scrollChips('right')}
                    title="Scroll right"
                    aria-label="Scroll right"
                  >
                    ›
                  </button>
                </div>
              </div>
              <div
                className="ai-chips-scroll"
                ref={chipsScrollRef}
                onWheel={handleChipsWheel}
              >
                {AI_SUGGESTIONS.map((s) => (
                  <button
                    key={s.id}
                    className="ai-prompt-chip-btn"
                    onClick={() => handleSend(s.text)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Input Bar */}
          <div className="ai-footer">
            <div className="ai-input-wrapper">
              <Search size={16} className="ai-input-icon" />
              <input
                ref={inputRef}
                type="text"
                className="ai-input-field"
                placeholder="Ask AI anything (e.g. deals, laptops, shoes)..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <button
              className={`ai-send-btn ${inputText.trim().length > 0 ? 'ready' : ''}`}
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              title="Send to AI"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
