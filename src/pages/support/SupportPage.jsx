import { useState } from "react";
import { HelpCircle, Mail, Phone, MessageCircle, ChevronDown, Book, FileText, Video, Users, Search, ExternalLink, Send } from "lucide-react";
import SideBar from "../../components/sideBar/sideBar";
import DashboardNavBar from "../../components/NavBar/DashboardNavBar";
import "./SupportPage.css";

const FAQS = [
  {
    category: "Getting Started",
    icon: Book,
    faqs: [
      {
        question: "What is a motshelo?",
        answer: "A motshelo is a traditional Botswana community savings group where members contribute money monthly. Each month, one member receives the pooled funds or members can access loans from the collective pool. It's a beautiful tradition of mutual support and financial solidarity."
      },
      {
        question: "How do I create a new group?",
        answer: "To create a group, go to 'My Groups' and click 'New Group'. Fill in the group details including name, contribution amount, and meeting frequency. You can then invite members via email or SMS. As the creator, you'll be the initial signatory."
      },
      {
        question: "How do I invite members to my group?",
        answer: "Once your group is created, go to the group page and click 'Invite Members'. You can send invitations via email, SMS, or share a unique group link. Members can request to join or be directly added based on your group settings."
      }
    ]
  },
  {
    category: "Contributions & Payments",
    icon: FileText,
    faqs: [
      {
        question: "How do I make a contribution?",
        answer: "Go to your group's page and click 'Make Contribution'. You can upload proof of payment via bank transfer, mobile money, or cash. The signatories will review and approve your submission."
      },
      {
        question: "What happens if I miss a contribution?",
        answer: "Missing contributions may affect your standing in the group. Some groups charge late fees or interest on missed payments. Check your group's specific rules. You can usually make up missed contributions in subsequent months."
      },
      {
        question: "Can I contribute extra amounts?",
        answer: "Yes! Many members choose to contribute additional amounts beyond the required monthly contribution. Extra contributions can help you earn more interest and increase your borrowing limit."
      }
    ]
  },
  {
    category: "Loans & Borrowing",
    icon: Video,
    faqs: [
      {
        question: "How much can I borrow?",
        answer: "Your borrowing limit is typically based on your total contributions and the group's rules. Most groups allow members to borrow 2-3 times their contribution amount. Interest rates are set by each group, commonly around 20% per month."
      },
      {
        question: "How are loans approved?",
        answer: "Loans require approval from the group's signatories (usually 2). When you request a loan, signatories receive a notification and can review your request. Once both approve, the funds are released to you."
      },
      {
        question: "What happens if I default on a loan?",
        answer: "Defaulting on a loan affects your credit within the group and may result in penalties. The group may use your contributions to recover the outstanding amount. In severe cases, membership may be terminated."
      }
    ]
  },
  {
    category: "Account & Security",
    icon: Users,
    faqs: [
      {
        question: "Is my data secure?",
        answer: "Yes! ReMmogo uses industry-standard encryption for all data transmission and storage. We employ role-based access controls so members only see information relevant to them. All actions are logged for accountability."
      },
      {
        question: "Can I be a member of multiple groups?",
        answer: "Absolutely! Many members participate in multiple motshelo groups - family, friends, colleagues, or community groups. You can manage all your groups from a single dashboard."
      },
      {
        question: "How do I change my password?",
        answer: "Go to Settings > Security to change your password. For added security, we recommend enabling two-factor authentication (2FA) which adds an extra layer of protection to your account."
      }
    ]
  }
];

const CONTACT_OPTIONS = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help via email",
    contact: "support@re-mmogo.bw",
    action: "Send Email"
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Call us directly",
    contact: "+267 390 1234",
    action: "Call Now"
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat with our team",
    contact: "Available 9AM - 5PM",
    action: "Start Chat"
  }
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: ""
  });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for your message. We'll get back to you soon!");
    setContactForm({ subject: "", message: "" });
  };

  return (
    <div className="dash">
      <SideBar />
      
      <div className="main">
        <DashboardNavBar />
        
        <div className="support-content">
          {/* Hero Section */}
          <div className="support-hero">
            <div className="support-hero-content">
              <div className="hero-icon-wrapper">
                <HelpCircle size={56} />
              </div>
              <h1>How can we help you?</h1>
              <p>Find answers to common questions or get in touch with our support team</p>
              
              <div className="support-search">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search for help articles, FAQs, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="support-quick-links">
            <div className="quick-link-card">
              <div className="quick-link-icon">
                <Book size={24} />
              </div>
              <h3>Documentation</h3>
              <p>Comprehensive guides and tutorials</p>
              <button className="link-btn">
                View Docs <ExternalLink size={14} />
              </button>
            </div>
            <div className="quick-link-card">
              <div className="quick-link-icon">
                <Video size={24} />
              </div>
              <h3>Video Tutorials</h3>
              <p>Watch step-by-step guides</p>
              <button className="link-btn">
                Watch Videos <ExternalLink size={14} />
              </button>
            </div>
            <div className="quick-link-card">
              <div className="quick-link-icon">
                <Users size={24} />
              </div>
              <h3>Community Forum</h3>
              <p>Connect with other users</p>
              <button className="link-btn">
                Join Forum <ExternalLink size={14} />
              </button>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="faq-section">
            <div className="section-header">
              <h2>Frequently Asked Questions</h2>
              <p>Find answers to common questions about ReMmogo</p>
            </div>

            {FAQS.map((category, catIndex) => (
              <div key={catIndex} className="faq-category">
                <div className="faq-category-header">
                  <div className="faq-category-icon">
                    <category.icon size={20} />
                  </div>
                  <h3>{category.category}</h3>
                </div>
                <div className="faq-list">
                  {category.faqs.map((faq, faqIndex) => (
                    <div
                      key={faqIndex}
                      className={`faq-item ${openFaq === `${catIndex}-${faqIndex}` ? 'open' : ''}`}
                      onClick={() => setOpenFaq(openFaq === `${catIndex}-${faqIndex}` ? null : `${catIndex}-${faqIndex}`)}
                    >
                      <div className="faq-question">
                        <span>{faq.question}</span>
                        <ChevronDown size={20} className={`faq-icon ${openFaq === `${catIndex}-${faqIndex}` ? 'rotated' : ''}`} />
                      </div>
                      <div className="faq-answer">
                        {faq.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="contact-section">
            <div className="section-header">
              <h2>Still need help?</h2>
              <p>Our support team is here to assist you</p>
            </div>

            <div className="contact-options">
              {CONTACT_OPTIONS.map((option, index) => (
                <div key={index} className="contact-card">
                  <div className="contact-icon">
                    <option.icon size={24} />
                  </div>
                  <h3>{option.title}</h3>
                  <p className="contact-desc">{option.description}</p>
                  <p className="contact-value">{option.contact}</p>
                  <button className="contact-btn">{option.action}</button>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="contact-form-container">
              <h3>Send us a message</h3>
              <form onSubmit={handleContactSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Your Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <select 
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="feature">Feature Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea 
                    rows={5}
                    placeholder="Describe your question or issue..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    required
                  />
                </div>
                <button type="submit" className="submit-btn">
                  Send Message
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
