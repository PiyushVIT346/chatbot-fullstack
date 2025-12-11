import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Plus, MessageSquare, Trash2, AlertCircle } from 'lucide-react';

// --- Configuration ---
// 1. strip trailing slash from env var if present
// 2. ensure /api is appended
const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE_URL = RAW_URL.replace(/\/$/, ''); 
const API_BASE = `${BASE_URL}/api`;

// --- Helpers ---
const groupSessionsByDate = (list) => {
  const groups = {};
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const isSameDay = (a, b) => 
    a.getFullYear() === b.getFullYear() && 
    a.getMonth() === b.getMonth() && 
    a.getDate() === b.getDate();

  list.forEach(s => {
    // Backend uses 'timestamp', fallback to created_at or now
    const dateStr = s.timestamp || s.created_at;
    const dt = dateStr ? new Date(dateStr) : new Date();
    
    let key = dt.toLocaleDateString();
    if (isSameDay(dt, today)) key = 'Today';
    else if (isSameDay(dt, yesterday)) key = 'Yesterday';
    else key = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });
  return groups;
};

const formatTimestamp = (ts) => {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
};

// --- Components ---
const ChatApp = () => {
  const [sessions, setSessions] = useState({});
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // 1. Load specific session details
  const loadSession = useCallback(async (sessionId) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/sessions/${sessionId}`);
      
      if (!res.ok) throw new Error("Failed to load session");
      
      const data = await res.json();
      
      // Handle Pydantic response structure (SessionWithMessages)
      if (data.messages) {
        setMessages(data.messages);
        // data itself is the session object in your schema
        setCurrentSession(data);
      } else {
        // Fallback for different schema structures
        setMessages([]);
        setCurrentSession(data);
      }
    } catch (err) {
      console.error('loadSession error', err);
      setError("Could not load chat history");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Fetch all sessions list
  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/sessions`);
      if (!res.ok) return; // Silent fail ok for sidebar
      const data = await res.json();
      
      // Backend returns a Dict directly now (grouped by date)
      // or a List depending on your specific implementation. 
      // The code below handles both:
      if (Array.isArray(data)) {
        setSessions(groupSessionsByDate(data));
      } else {
        // If backend already groups them (as per your FastAPI code)
        setSessions(data || {});
      }
    } catch (err) {
      console.error('fetchSessions error', err);
    }
  }, []);

  // 3. Get latest session (auto-create if DB empty)
  const fetchLatestSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/sessions/latest`);
      
      if (res.ok) {
        const data = await res.json();
        setCurrentSession(data);
        setMessages(data.messages || []);
      } else {
        // If 404 or fail, just reset
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('fetchLatestSession error', err);
      // Don't show error here, just let user create new chat
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchSessions();
    fetchLatestSession();
  }, [fetchSessions, fetchLatestSession]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const createNewSession = async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/sessions`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' } 
      });
      if (!res.ok) throw new Error("Failed to create chat");
      
      const data = await res.json();
      setCurrentSession(data);
      setMessages([]);
      fetchSessions();
    } catch (err) {
      console.error('createNewSession error', err);
      setError("Failed to create new chat");
    }
  };

  const deleteSession = async (sessionId, e) => {
    e?.stopPropagation();
    if (!window.confirm("Delete this chat?")) return;

    try {
      await fetch(`${API_BASE}/sessions/${sessionId}`, { method: 'DELETE' });
      
      // Refresh list
      await fetchSessions();
      
      // If we deleted the active session, load the latest one remaining
      if (currentSession?.id === sessionId) {
         fetchLatestSession();
      }
    } catch (err) {
      console.error('deleteSession error', err);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    // If no session exists, create one first
    let activeSessionId = currentSession?.id;
    if (!activeSessionId) {
       try {
         const res = await fetch(`${API_BASE}/sessions`, { method: 'POST' });
         const data = await res.json();
         activeSessionId = data.id;
         setCurrentSession(data);
         fetchSessions(); // Update sidebar
       } catch (err) {
         setError("Could not start chat");
         return;
       }
    }

    const text = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    // Optimistic UI update
    const tempUserMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: activeSessionId, message: text })
      });
      
      if (!res.ok) throw new Error("Server error");
      
      const data = await res.json();

      // Replace optimistic msg with real data from server
      setMessages(prev => {
        const cleanPrev = prev.slice(0, -1); // Remove temp message
        return [
          ...cleanPrev, 
          data.user_message, 
          data.ai_response
        ];
      });

      // Update sidebar title if it changed
      if (messages.length < 2) fetchSessions();

    } catch (err) {
      console.error('sendMessage error', err);
      setError("Failed to send message. Please try again.");
      // Keep user message but maybe mark as failed? For now, just leave it.
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <button onClick={createNewSession} style={styles.newChatButton}>
            <Plus size={16} /> <span>New Chat</span>
          </button>
        </div>
        <div style={styles.sessionsList}>
          {Object.entries(sessions).length === 0 && (
            <div style={{padding: '20px', color: '#6b7280', fontSize: '13px', textAlign:'center'}}>
              No history
            </div>
          )}
          {Object.entries(sessions).map(([date, list]) => (
            <div key={date} style={styles.dateGroup}>
              <h3 style={styles.dateHeader}>{date}</h3>
              <div style={styles.sessionsGroup}>
                {list.map(s => (
                  <div key={s.id} 
                    onClick={() => loadSession(s.id)} 
                    style={{ ...styles.sessionItem, ...(currentSession?.id === s.id ? styles.sessionItemActive : {}) }}
                  >
                    <div style={styles.sessionContent}>
                      <MessageSquare size={14} style={styles.sessionIcon} /> 
                      <span style={styles.sessionTitle}>{s.title || 'New Chat'}</span>
                    </div>
                    <button onClick={(e) => deleteSession(s.id, e)} style={styles.deleteButton} className="delete-btn">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={styles.mainArea}>
        {error && (
            <div style={styles.errorBanner}>
                <AlertCircle size={16} /> {error}
            </div>
        )}

        <div style={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateContent}>
                <MessageSquare size={48} style={styles.emptyStateIcon} />
                <h3>How can I help you today?</h3>
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
                <div key={i} style={{ ...styles.messageWrapper, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ ...styles.messageBubble, ...(m.role === 'user' ? styles.userBubble : styles.aiBubble) }}>
                    <p style={styles.messageText}>{m.content}</p>
                    <span style={styles.messageTime}>{formatTimestamp(m.timestamp)}</span>
                  </div>
                </div>
              ))
          )}

          {isLoading && messages.length > 0 && (
            <div style={styles.messageWrapper}>
                <div style={styles.loadingBubble}>
                    <div style={styles.loadingDots}>
                        <div style={{ ...styles.dot, animationDelay: '0s' }} />
                        <div style={{ ...styles.dot, animationDelay: '0.12s' }} />
                        <div style={{ ...styles.dot, animationDelay: '0.24s' }} />
                    </div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={styles.inputArea}>
          <div style={styles.inputContainer}>
            <div style={styles.inputWrapper}>
              <input 
                type="text" 
                value={inputMessage} 
                onChange={(e) => setInputMessage(e.target.value)} 
                onKeyPress={handleKeyPress} 
                placeholder={isLoading ? "AI is thinking..." : "Type your message..."}
                disabled={isLoading} 
                style={styles.input} 
                autoFocus
              />
              <button 
                onClick={sendMessage} 
                disabled={!inputMessage.trim() || isLoading} 
                style={{ ...styles.sendButton, opacity: (!inputMessage.trim() || isLoading) ? 0.5 : 1 }}
              >
                <Send size={16} />
              </button>
            </div>
            <div style={styles.footerText}>
                Powered by Gemini • Deployed on Render
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#111827', color: '#f3f4f6', fontFamily: 'system-ui, -apple-system, sans-serif' },
  sidebar: { width: '260px', backgroundColor: '#1f2937', borderRight: '1px solid #374151', display: 'flex', flexDirection: 'column' },
  sidebarHeader: { padding: '12px', borderBottom: '1px solid #374151' },
  newChatButton: { width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 },
  sessionsList: { flex: 1, overflowY: 'auto', padding: '12px' },
  dateGroup: { marginBottom: '16px' },
  dateHeader: { fontSize: '11px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  sessionsGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  sessionItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s', color: '#d1d5db' },
  sessionItemActive: { backgroundColor: '#374151', color: '#fff' },
  sessionContent: { display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 },
  sessionIcon: { flexShrink: 0, opacity: 0.7 },
  sessionTitle: { fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  deleteButton: { padding: '6px', backgroundColor: 'transparent', color: '#9ca3af', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex' },
  mainArea: { flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' },
  errorBanner: { backgroundColor: '#7f1d1d', color: '#fecaca', padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' },
  messagesContainer: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
  emptyState: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' },
  emptyStateContent: { textAlign: 'center' },
  emptyStateIcon: { margin: '0 auto 16px', opacity: 0.5 },
  messageWrapper: { display: 'flex', width: '100%' },
  messageBubble: { maxWidth: '80%', borderRadius: '12px', padding: '12px 16px', lineHeight: '1.5', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
  userBubble: { backgroundColor: '#2563eb', color: 'white', borderBottomRightRadius: '2px' },
  aiBubble: { backgroundColor: '#374151', color: '#f3f4f6', borderBottomLeftRadius: '2px' },
  messageText: { whiteSpace: 'pre-wrap', margin: 0, fontSize: '15px' },
  messageTime: { fontSize: '11px', opacity: 0.7, marginTop: '4px', display: 'block', textAlign: 'right' },
  loadingBubble: { backgroundColor: '#374151', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center' },
  loadingDots: { display: 'flex', gap: '4px' },
  dot: { width: '6px', height: '6px', backgroundColor: '#9ca3af', borderRadius: '50%', animation: 'bounce 1s infinite' },
  inputArea: { borderTop: '1px solid #374151', padding: '20px', backgroundColor: '#111827' },
  inputContainer: { maxWidth: '800px', margin: '0 auto' },
  inputWrapper: { display: 'flex', gap: '10px', backgroundColor: '#1f2937', padding: '8px', borderRadius: '12px', border: '1px solid #374151' },
  input: { flex: 1, padding: '8px 12px', backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '15px', outline: 'none' },
  sendButton: { padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' },
  footerText: { textAlign: 'center', color: '#4b5563', fontSize: '12px', marginTop: '10px' }
};

// Add keyframes
try {
  const styleSheet = document.styleSheets[0];
  const keyframes = `@keyframes bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.6 } 40% { transform: translateY(-4px); opacity: 1 } }`;
  if (styleSheet && !Array.from(styleSheet.cssRules).some(r => r.name === 'bounce')) {
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
  }
} catch (e) {}

export default ChatApp;