import axios from 'axios';

const API_URL = 'http://localhost:9000/api/chat';

// Helper to configure authorization header
const getAuthHeaders = () => {
  const token = localStorage.getItem('techwiz_token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

/* =========================================================
   AI Chatbot Endpoints
   ========================================================= */

// Query AI
export const sendAIMessage = async (message, sessionId = '') => {
  const response = await axios.post(`${API_URL}/ai`, { message, sessionId }, getAuthHeaders());
  return response.data;
};

// Get user AI history
export const getAIHistory = async () => {
  const response = await axios.get(`${API_URL}/ai/history`, getAuthHeaders());
  return response.data;
};

/* =========================================================
   Live Chat Endpoints (User)
   ========================================================= */

// Get or create conversation for the logged-in user
export const getOrCreateConversation = async () => {
  const response = await axios.post(`${API_URL}/conversations`, {}, getAuthHeaders());
  return response.data;
};

// Get messages for a conversation
export const getMessages = async (conversationId) => {
  const response = await axios.get(`${API_URL}/conversations/${conversationId}/messages`, getAuthHeaders());
  return response.data;
};

// Send a message to a conversation
export const sendMessage = async (conversationId, message) => {
  const response = await axios.post(`${API_URL}/conversations/${conversationId}/messages`, { message }, getAuthHeaders());
  return response.data;
};

/* =========================================================
   Admin Chat Endpoints (Admin)
   ========================================================= */

// Get all non-archived conversations
export const getAdminConversations = async () => {
  const response = await axios.get(`${API_URL}/admin/conversations`, getAuthHeaders());
  return response.data;
};

// Change conversation status
export const updateConversationStatus = async (conversationId, status) => {
  const response = await axios.patch(`${API_URL}/admin/conversations/${conversationId}/status`, { status }, getAuthHeaders());
  return response.data;
};
