import { useState, useEffect, useRef } from 'react';
import SideBar from '../../components/sideBar/sideBar';
import DashboardNavBar from '../../components/NavBar/DashboardNavBar';
import { messagesAPI } from '../../services/api';
import { Send, Smile, Paperclip, Phone, Video, MoreVertical, Check, CheckCheck, ArrowLeft } from 'lucide-react';
import './MessagesPage.css';

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.conversationid);
      markAsRead(selectedConversation.conversationid);
      setShowMobileList(false);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const result = await messagesAPI.getAll();
      if (result.success && Array.isArray(result.data)) {
        setConversations(result.data);
      } else {
        setConversations([]);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const result = await messagesAPI.getMessages(conversationId);
      if (result.success) {
        setMessages(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const result = await messagesAPI.send(selectedConversation.conversationid, messageInput.trim());
      
      if (result.success) {
        setMessages(prev => [...prev, result.data]);
        setMessageInput('');
        setConversations(prev => prev.map(conv => 
          conv.conversationid === selectedConversation.conversationid
            ? { ...conv, lastmessage: messageInput.trim(), lastmessageat: new Date().toISOString() }
            : conv
        ).sort((a, b) => new Date(b.lastmessageat) - new Date(a.lastmessageat)));
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await messagesAPI.markAsRead(conversationId);
      setConversations(prev => prev.map(conv =>
        conv.conversationid === conversationId ? { ...conv, unreadcount: 0 } : conv
      ));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return formatTime(dateString);
    if (days === 1) return 'Yesterday';
    if (days < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="dash">
        <SideBar />
        <div className="main">
          <DashboardNavBar />
          <div className="mp-content">
            <div className="loading-state">Loading messages...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dash">
      <SideBar />
      <div className="main">
        <DashboardNavBar />
        <div className="mp-content">
          
          <div className={`mp-container ${selectedConversation && !showMobileList ? 'mp-container--chat-open' : ''}`}>
            
            {/* Conversations List */}
            <div className={`mp-conversations ${showMobileList ? 'mp-conversations--visible' : ''}`}>
              <div className="mp-header">
                <h2 className="mp-title">Messages</h2>
                <button className="mp-new-chat-btn" onClick={() => window.location.href = '/myGroups'}>
                  + New Chat
                </button>
              </div>
              
              <div className="mp-search-bar">
                <input type="text" placeholder="Search conversations..." />
              </div>
              
              <div className="mp-conversations-list">
                {!conversations || conversations.length === 0 ? (
                  <div className="mp-no-conversations">
                    <p>No conversations yet</p>
                    <span>Start a new chat to begin messaging</span>
                  </div>
                ) : (
                  Array.isArray(conversations) && conversations.map(conv => (
                    <div
                      key={conv.conversationid}
                      className={`mp-conversation-item ${selectedConversation?.conversationid === conv.conversationid ? 'mp-conversation-item--active' : ''}`}
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <div className="mp-avatar">
                        {conv.type === 'group' 
                          ? conv.name?.charAt(0).toUpperCase() 
                          : conv.lastmessagesender?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="mp-conversation-info">
                        <div className="mp-conversation-header">
                          <span className="mp-conversation-name">
                            {conv.name || conv.lastmessagesender || 'Unknown'}
                          </span>
                          <span className="mp-conversation-time">
                            {formatDate(conv.lastmessageat)}
                          </span>
                        </div>
                        <div className="mp-conversation-preview">
                          <span className={`mp-last-message ${conv.unreadcount > 0 ? 'mp-last-message--unread' : ''}`}>
                            {conv.lastmessage || 'No messages yet'}
                          </span>
                          {conv.unreadcount > 0 && (
                            <span className="mp-unread-badge">{conv.unreadcount}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            {selectedConversation ? (
              <div className={`mp-chat ${!showMobileList ? 'mp-chat--visible' : ''}`}>
                <div className="mp-chat-header">
                  <button className="mp-back-btn" onClick={() => setShowMobileList(true)}>
                    <ArrowLeft size={20} />
                  </button>
                  <div className="mp-chat-avatar">
                    {selectedConversation.type === 'group' 
                      ? selectedConversation.name?.charAt(0).toUpperCase() 
                      : selectedConversation.lastmessagesender?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="mp-chat-info">
                    <h3 className="mp-chat-name">
                      {selectedConversation.name || selectedConversation.lastmessagesender || 'Unknown'}
                    </h3>
                    <span className="mp-chat-members">
                      {selectedConversation.membercount || 1} {selectedConversation.membercount === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                  <div className="mp-chat-actions">
                    <button className="mp-action-btn"><Phone size={20} /></button>
                    <button className="mp-action-btn"><Video size={20} /></button>
                    <button className="mp-action-btn"><MoreVertical size={20} /></button>
                  </div>
                </div>

                <div className="mp-messages-container">
                  {messages.length === 0 ? (
                    <div className="mp-no-messages">
                      <p>No messages yet</p>
                      <span>Start the conversation!</span>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isOwn = msg.senderid === parseInt(localStorage.getItem('userId'));
                      const showSender = index === 0 || messages[index - 1].senderid !== msg.senderid;
                      
                      return (
                        <div
                          key={msg.messageid}
                          className={`mp-message ${isOwn ? 'mp-message--own' : ''}`}
                        >
                          {!isOwn && showSender && (
                            <div className="mp-message-sender">
                              {msg.senderfirstname} {msg.senderlastname}
                            </div>
                          )}
                          <div className="mp-message-bubble">
                            <p className="mp-message-content">{msg.content}</p>
                            <div className="mp-message-meta">
                              <span className="mp-message-time">{formatTime(msg.createdat)}</span>
                              {isOwn && (
                                <span className="mp-message-status">
                                  {msg.readcount > 0 ? (
                                    <CheckCheck size={14} className="mp-read-icon" />
                                  ) : (
                                    <Check size={14} />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="mp-input-area">
                  <button className="mp-attach-btn"><Paperclip size={20} /></button>
                  <div className="mp-input-wrapper">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <button className="mp-emoji-btn"><Smile size={20} /></button>
                  </div>
                  <button 
                    className={`mp-send-btn ${!messageInput.trim() ? 'mp-send-btn--disabled' : ''}`}
                    onClick={sendMessage}
                    disabled={sending || !messageInput.trim()}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mp-no-chat-selected">
                <div className="mp-empty-state-icon">💬</div>
                <h3>Welcome to Messages</h3>
                <p>Select a conversation to start chatting</p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
