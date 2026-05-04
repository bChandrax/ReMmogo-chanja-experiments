import { useState } from "react";
import { Search, Send, Paperclip, MoreVertical, Star, Archive, ChevronLeft, Users, FileText, MessageCircle } from "lucide-react";
import SideBar from "../../components/sideBar/sideBar";
import DashboardNavBar from "../../components/NavBar/DashboardNavBar";
import "./MessagesPage.css";

const CONVERSATIONS = [
  {
    id: 1,
    group: "Botho Savings Circle",
    sender: "Kagiso Molefe",
    message: "Hi everyone, just a reminder that contributions are due this Friday.",
    time: "10:32 AM",
    unread: true,
    avatar: "KM",
    avatarBg: "#c8d9b0"
  },
  {
    id: 2,
    group: "Kgotso Family Group",
    sender: "Naledi Dikgang",
    message: "The loan request has been approved. Please review the terms.",
    time: "Yesterday",
    unread: true,
    avatar: "ND",
    avatarBg: "#b5c9a0"
  },
  {
    id: 3,
    group: "Thuto Investment Club",
    sender: "Thabo Sithole",
    message: "Great news! Our interest target has been exceeded this quarter.",
    time: "Apr 28",
    unread: false,
    avatar: "TS",
    avatarBg: "#d5dece"
  },
  {
    id: 4,
    group: "Botho Savings Circle",
    sender: "Mpho Ramaphosa",
    message: "Can we schedule a meeting to discuss the new member applications?",
    time: "Apr 26",
    unread: false,
    avatar: "MR",
    avatarBg: "#c8d5be"
  },
  {
    id: 5,
    group: "System Notifications",
    sender: "ReMmogo",
    message: "Your monthly statement is now available for download.",
    time: "Apr 25",
    unread: false,
    avatar: "RM",
    avatarBg: "#2c3e1f"
  }
];

const MESSAGES = [
  {
    id: 1,
    sender: "Kagiso Molefe",
    avatar: "KM",
    avatarBg: "#c8d9b0",
    message: "Hi everyone, just a reminder that contributions are due this Friday. Please make sure to upload your proof of payment.",
    time: "10:32 AM",
    isOwn: false
  },
  {
    id: 2,
    sender: "You",
    avatar: "HP",
    avatarBg: "#2c3e1f",
    message: "Thanks for the reminder Kagiso! I'll make the payment today.",
    time: "10:45 AM",
    isOwn: true
  },
  {
    id: 3,
    sender: "Mpho Ramaphosa",
    avatar: "MR",
    avatarBg: "#c8d5be",
    message: "Same here, will do it this afternoon.",
    time: "11:02 AM",
    isOwn: false
  },
  {
    id: 4,
    sender: "You",
    avatar: "HP",
    avatarBg: "#2c3e1f",
    message: "I've just uploaded the proof of payment. Please confirm when you see it.",
    time: "11:15 AM",
    isOwn: true,
    attachment: "payment_receipt.pdf"
  },
  {
    id: 5,
    sender: "Kagiso Molefe",
    avatar: "KM",
    avatarBg: "#c8d9b0",
    message: "Perfect! I can see it now. Thank you for being prompt with your contributions.",
    time: "11:20 AM",
    isOwn: false
  }
];

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(CONVERSATIONS[0]);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(MESSAGES);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      sender: "You",
      avatar: "HP",
      avatarBg: "#2c3e1f",
      message: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  const filteredConversations = CONVERSATIONS.filter(conv =>
    conv.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.sender.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dash">
      <SideBar />
      
      <div className="main">
        <DashboardNavBar />
        
        <div className="messages-content">
          {/* Conversations List */}
          <div className="conversations-panel">
            <div className="conversations-header">
              <div>
                <h2>Messages</h2>
                <p>Stay connected with your groups</p>
              </div>
            </div>

            <div className="conversations-search">
              <Search size={18} />
              <input
                className="convo-search"
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="conversations-tabs">
              <button className="tab active">All</button>
              <button className="tab">Unread</button>
              <button className="tab">Groups</button>
            </div>

            <div className="conversations-list">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''} ${conv.unread ? 'unread' : ''}`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="conversation-avatar" style={{ background: conv.avatarBg }}>
                    {conv.avatar}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-top">
                      <span className="conversation-group">{conv.group}</span>
                      <span className="conversation-time">{conv.time}</span>
                    </div>
                    <div className="conversation-middle">
                      <span className="conversation-sender">{conv.sender}:</span>
                    </div>
                    <div className="conversation-message">
                      {conv.unread && <span className="unread-dot" />}
                      <span className={conv.unread ? 'unread-text' : ''}>{conv.message}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="chat-panel">
            {selectedConversation ? (
              <>
                <div className="chat-header">
                  <div className="chat-header-left">
                    <div className="chat-avatar" style={{ background: selectedConversation.avatarBg }}>
                      {selectedConversation.avatar}
                    </div>
                    <div className="chat-info">
                      <h3>{selectedConversation.group}</h3>
                      <span className="chat-status">
                        <Users size={12} />
                        8 members
                      </span>
                    </div>
                  </div>
                  <div className="chat-header-actions">
                    <button className="header-btn" title="Files">
                      <FileText size={18} />
                    </button>
                    <button className="header-btn" title="More">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>

                <div className="chat-messages">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`chat-message ${msg.isOwn ? 'own' : ''}`}>
                      {!msg.isOwn && (
                        <div className="message-avatar" style={{ background: msg.avatarBg }}>
                          {msg.avatar}
                        </div>
                      )}
                      <div className="message-content">
                        {!msg.isOwn && <span className="message-sender">{msg.sender}</span>}
                        <div className="message-bubble">
                          <p>{msg.message}</p>
                          {msg.attachment && (
                            <div className="message-attachment">
                              <Paperclip size={14} />
                              <span>{msg.attachment}</span>
                            </div>
                          )}
                        </div>
                        <span className="message-time">{msg.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <form className="chat-input-form" onSubmit={handleSendMessage}>
                  <button type="button" className="attach-btn" title="Attach file">
                    <Paperclip size={20} />
                  </button>
                  <input
                    className="msg-box"
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="send-btn" title="Send message">
                    <Send size={20} />
                  </button>
                </form>
              </>
            ) : (
              <div className="no-conversation">
                <div className="no-conversation-icon">
                  <MessageCircle size={64} />
                </div>
                <h3>Select a conversation</h3>
                <p>Choose a group or conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
