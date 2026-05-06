import { useState } from "react";
import { Mail, Phone, MessageCircle } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import SideBar from "../../components/sideBar/sideBar";
import DashboardNavBar from "../../components/NavBar/DashboardNavBar";
import "./SupportPage.css";

export default function SupportPage() {
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: ""
  });
  const toast = useToast();

  const handleContactSubmit = (e) => {
    e.preventDefault();
    toast.success("Thank you for your message. We'll get back to you soon!");
    setContactForm({ subject: "", message: "" });
  };

  return (
    <div className="dash">
      <SideBar />

      <div className="main">
        <DashboardNavBar />

        <div className="support-content">
          <div className="support-header">
            <h1>Support & Contact</h1>
            <p>Get help with your account and ReMmogo features</p>
          </div>

          <div className="support-grid">
            {/* Contact Form */}
            <div className="support-card">
              <div className="support-card-header">
                <MessageCircle size={24} className="support-icon" />
                <h2>Send us a Message</h2>
              </div>
              <form onSubmit={handleContactSubmit} className="contact-form">
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    placeholder="What is this about?"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    rows={6}
                    placeholder="Describe your question or issue..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    required
                  />
                </div>
                <button type="submit" className="submit-btn">
                  <MessageCircle size={18} />
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="support-info">
              <div className="info-card">
                <div className="info-icon">
                  <Mail size={24} />
                </div>
                <div className="info-content">
                  <h3>Email Us</h3>
                  <p>For general inquiries and support</p>
                  <a href="mailto:support@remmogo.bw" className="info-link">
                    support@remmogo.bw
                  </a>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <Phone size={24} />
                </div>
                <div className="info-content">
                  <h3>Call Us</h3>
                  <p>Monday to Friday, 9am - 5pm CAT</p>
                  <a href="tel:+26712345678" className="info-link">
                    +267 12 345 678
                  </a>
                </div>
              </div>

              <div className="info-card highlight">
                <div className="info-icon">
                  <MessageCircle size={24} />
                </div>
                <div className="info-content">
                  <h3>Response Time</h3>
                  <p>We typically respond within 24 hours during business days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
