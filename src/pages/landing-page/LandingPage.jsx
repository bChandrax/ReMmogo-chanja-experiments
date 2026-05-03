import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Handshake, Users, Shield, Zap, Eye, TrendingUp,
  ArrowRight, Check, ChevronDown, Calendar, FileText,
  MessageCircle, Sparkles
} from 'lucide-react'
import './LandingPage.css'

import BSB from '../../assets/logos/BSB.jpg'
import BankOfBotswana from '../../assets/logos/Bank-of-Botswana-Official-Emblem.jpg'
import BITC from '../../assets/logos/botswana_investment_and_trade_centre_logo.jpg'
import FNB from '../../assets/logos/FNB.png'
import Images from '../../assets/logos/images.png'

/* ── NAVBAR ── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="nav-inner">
        <div className="nav-brand">
          <div className="nav-logo">
            <Handshake size={18} />
          </div>
          <span>Re-Mmogo</span>
        </div>
        <div className="nav-links">
          <a href="#home" className="nav-link active">Home</a>
          <a href="#why" className="nav-link">About Us</a>
          <a href="#preview" className="nav-link">Features</a>
          <a href="#faq" className="nav-link">FAQ</a>
        </div>
        <div className="nav-actions">
          <button className="btn-text" onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn-primary" onClick={() => navigate('/login')}>Get Started Free</button>
        </div>
      </div>
    </nav>
  )
}

/* ── HERO ── */
function Hero() {
  const navigate = useNavigate()
  const logos = [BSB, BankOfBotswana, BITC, FNB, Images]

  return (
    <section className="hero fade-in" id="home">
      <div className="hero-bg-pattern" />
      <div className="hero-content">
        <div className="hero-badge slide-up">
          <Sparkles size={12} />
          YOUR PERSONAL & COMMUNITY MOTSHELO HUB
        </div>
        <h1 className="hero-title slide-up" style={{ animationDelay: '0.1s' }}>
          One Dashboard to Manage <span className="text-muted">Your Entire Motshelo Family</span>
        </h1>
        <p className="hero-sub slide-up" style={{ animationDelay: '0.2s' }}>
          Track contributions, manage loans, approve payments, and grow your community savings group all in one secure platform.
        </p>
        <div className="hero-ctas slide-up" style={{ animationDelay: '0.3s' }}>
          <button className="btn-primary btn-lg" onClick={() => navigate('/login')}>
            Get Started Free
            <ArrowRight size={16} />
          </button>
          <button className="btn-outline btn-lg" onClick={() => navigate('/login')}>
            See How It Works
          </button>
        </div>
        <p className="hero-social-proof slide-up" style={{ animationDelay: '0.4s' }}>
          Trusted by Over <strong>2,500</strong> Communities
        </p>
      </div>
      <div className="logo-slider-container slide-up" style={{ animationDelay: '0.5s' }}>
        <div className="logo-slider">
          <div className="logo-track">
            {logos.map((logo, index) => (
              <img key={index} src={logo} alt={`Partner ${index + 1}`} />
            ))}
            {logos.map((logo, index) => (
              <img key={`dup-${index}`} src={logo} alt={`Partner ${index + 1}`} />
            ))}
            {logos.map((logo, index) => (
              <img key={`dup2-${index}`} src={logo} alt={`Partner ${index + 1}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── WHY RE-MMOGO ── */
function WhyReMmogo() {
  const stats = [
    {
      icon: <TrendingUp size={24} />,
      title: 'Reduced Paperwork',
      desc: 'Eliminate manual record-keeping and physical ledgers'
    },
    {
      icon: <Zap size={24} />,
      title: 'Faster Approvals',
      desc: 'Two-signatory approvals in minutes, not days'
    },
    {
      icon: <Eye size={24} />,
      title: 'Transparent Balances',
      desc: 'Real-time visibility into contributions and loans'
    },
    {
      icon: <Shield size={24} />,
      title: 'Secure Records',
      desc: 'Encrypted data and role-based access controls'
    }
  ]

  return (
    <section className="why-re-mmogo reveal-on-scroll" id="why">
      <div className="section-label">Why Re-Mmogo?</div>
      <h2 className="section-title">
        Preserving <span className="text-muted">Motshelo Tradition</span> with Digital Innovation
      </h2>
      <p className="section-subtitle">
        Re-Mmogo helps communities preserve the tradition of motshelo while making management faster, safer, and more transparent.
      </p>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="stat-card scale-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="stat-icon">{stat.icon}</div>
            <h3 className="stat-title">{stat.title}</h3>
            <p className="stat-desc">{stat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── TRUST & COMMUNITY ── */
function TrustCommunity() {
  const testimonials = [
    {
      quote: "We no longer lose track of payments or loans. Everything is clear and easy.",
      author: "Kagiso Molefe",
      role: "Kopano Savings Group, Gaborone"
    },
    {
      quote: "The two-signatory approval system has built incredible trust in our community.",
      author: "Naledi Dikgang",
      role: "Kopano Savings Group, Gaborone"
    },
    {
      quote: "As a community leader, I can now generate year-end reports with one click.",
      author: "Thabo Sithole",
      role: "Kopano Savings Group, Gaborone"
    }
  ]

  return (
    <section className="trust-community reveal-on-scroll" id="trust">
      <div className="section-label">Trusted by Botswana Communities</div>
      <h2 className="section-title">
        Built for <span className="text-muted">Botswana Communities</span>
      </h2>
      <p className="section-subtitle">
        Re-Mmogo is designed with Botswana's motshelo tradition at its heart.
      </p>

      <div className="testimonials-grid">
        {testimonials.map((testimonial, index) => (
          <div 
            key={index} 
            className="testimonial-card scale-in"
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            <div className="testimonial-icon"><MessageCircle size={20} /></div>
            <div className="testimonial-quote">"{testimonial.quote}"</div>
            <div className="testimonial-author">
              <div className="author-name">{testimonial.author}</div>
              <div className="author-role">{testimonial.role}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="community-logos fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="logo-item">
          <img src={BSB} alt="Botswana Savings Bank" />
        </div>
        <div className="logo-item">
          <img src={BankOfBotswana} alt="Bank of Botswana" />
        </div>
        <div className="logo-item">
          <img src={BITC} alt="Botswana Investment and Trade Centre" />
        </div>
      </div>
    </section>
  )
}

/* ── APP PREVIEW ── */
function AppPreview() {
  return (
    <section className="app-preview reveal-on-scroll" id="preview">
      <div className="section-label">App Preview</div>
      <h2 className="section-title">
        See Re-Mmogo in <span className="text-muted">Action</span>
      </h2>
      <p className="section-subtitle">
        Experience the intuitive interface designed specifically for motshelo management.
      </p>

      <div className="preview-cards-grid">
        <div className="preview-card scale-in" style={{ animationDelay: '0.1s' }}>
          <div className="preview-card-header">
            <div className="preview-card-icon">
              <TrendingUp size={20} />
            </div>
            <h3 className="preview-card-title">Dashboard</h3>
          </div>
          <div className="preview-card-content">
            <div className="dashboard-summary">
              <div className="summary-item">
                <span className="summary-label">Total Contributions</span>
                <span className="summary-value">P42,500.00</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Active Loans</span>
                <span className="summary-value">P18,250.00</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Pending Approvals</span>
                <span className="summary-value">3</span>
              </div>
            </div>
            
            {/* Animated Gauge Chart */}
            <div className="gauge-container">
              <svg className="gauge-svg" viewBox="0 0 200 110">
                {/* Background track */}
                <path
                  className="gauge-track-bg"
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#E8DDD4"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                {/* Animated fill */}
                <path
                  className="gauge-fill-animated"
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0F3D2E" />
                    <stop offset="100%" stopColor="#40916C" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="gauge-content">
                <div className="gauge-label">Available</div>
                <div className="gauge-value">P9,860.50</div>
                <div className="gauge-sub">≈ P318.72 per day</div>
              </div>
            </div>
          </div>
        </div>

        <div className="preview-card scale-in" style={{ animationDelay: '0.2s' }}>
          <div className="preview-card-header">
            <div className="preview-card-icon">
              <Users size={20} />
            </div>
            <h3 className="preview-card-title">Contribution Table</h3>
          </div>
          <div className="preview-card-content">
            <div className="table-header">
              <div className="table-col">Member</div>
              <div className="table-col">Jan '25</div>
              <div className="table-col">Feb '25</div>
              <div className="table-col">Mar '25</div>
              <div className="table-col">Status</div>
            </div>
            <div className="table-row">
              <div className="table-col">Kagiso Molefe</div>
              <div className="table-col">P1,000</div>
              <div className="table-col">P1,000</div>
              <div className="table-col">P1,000</div>
              <div className="table-col status-approved">Approved</div>
            </div>
            <div className="table-row">
              <div className="table-col">Naledi Dikgang</div>
              <div className="table-col">P1,000</div>
              <div className="table-col">P1,000</div>
              <div className="table-col">P1,000</div>
              <div className="table-col status-pending">Pending</div>
            </div>
            <div className="table-row">
              <div className="table-col">Thabo Sithole</div>
              <div className="table-col">P1,000</div>
              <div className="table-col">P1,000</div>
              <div className="table-col">P1,000</div>
              <div className="table-col status-rejected">Rejected</div>
            </div>
          </div>
        </div>

        <div className="preview-card scale-in" style={{ animationDelay: '0.3s' }}>
          <div className="preview-card-header">
            <div className="preview-card-icon">
              <Shield size={20} />
            </div>
            <h3 className="preview-card-title">Loan Approval</h3>
          </div>
          <div className="preview-card-content">
            <div className="loan-approval-modal">
              <div className="loan-header">
                <div className="loan-title">Loan Request</div>
                <div className="loan-amount">P5,000.00</div>
              </div>
              <div className="loan-details">
                <div className="detail-row">
                  <span className="detail-label">Borrower:</span>
                  <span className="detail-value">Kagiso Molefe</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Purpose:</span>
                  <span className="detail-value">Business expansion</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Repayment:</span>
                  <span className="detail-value">P500/month + 20% interest</span>
                </div>
              </div>
              <div className="loan-actions">
                <button className="btn-outline-sm">Reject</button>
                <button className="btn-primary-sm">Approve</button>
              </div>
            </div>
          </div>
        </div>

        <div className="preview-card scale-in" style={{ animationDelay: '0.4s' }}>
          <div className="preview-card-header">
            <div className="preview-card-icon">
              <Calendar size={20} />
            </div>
            <h3 className="preview-card-title">Reports</h3>
          </div>
          <div className="preview-card-content">
            <div className="reports-list">
              <div className="report-item">
                <div className="report-icon"><FileText size={16} /></div>
                <div className="report-title">Year-End Summary</div>
                <div className="report-date">2024</div>
              </div>
              <div className="report-item">
                <div className="report-icon"><TrendingUp size={16} /></div>
                <div className="report-title">Contribution Report</div>
                <div className="report-date">Jan-Mar '25</div>
              </div>
              <div className="report-item">
                <div className="report-icon"><Shield size={16} /></div>
                <div className="report-title">Loan Portfolio</div>
                <div className="report-date">Q1 '25</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── FAQ ── */
function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: "What is a motshelo?",
      answer: "A motshelo is a traditional Botswana community savings group where members contribute monthly and take turns receiving the pooled funds or accessing loans."
    },
    {
      question: "How are loans approved?",
      answer: "Loans require approval from two designated signatories within the group to ensure transparency and accountability."
    },
    {
      question: "Can members track their balances?",
      answer: "Yes, every member has real-time access to their contribution history, loan balances, and interest accrual."
    },
    {
      question: "Is payment proof supported?",
      answer: "Absolutely! Members can upload photos or documents as proof of payment, which signatories can review and approve."
    },
    {
      question: "Is the platform secure?",
      answer: "Yes, Re-Mmogo uses industry-standard encryption, secure authentication, and role-based access controls to protect your community's financial data."
    }
  ]

  return (
    <section className="faq reveal-on-scroll" id="faq">
      <div className="section-label">Frequently Asked Questions</div>
      <h2 className="section-title">
        Everything You Need to <span className="text-muted">Know</span>
      </h2>
      <p className="section-subtitle">
        Answers to common questions about Re-Mmogo and motshelo management.
      </p>

      <div className="faq-accordion">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`faq-item slide-up ${openIndex === index ? 'open' : ''}`}
            style={{ animationDelay: `${index * 0.08}s` }}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <div className="faq-question">
              <span>{faq.question}</span>
              <ChevronDown size={20} className={`faq-icon ${openIndex === index ? 'rotated' : ''}`} />
            </div>
            <div className="faq-answer">{faq.answer}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── FINAL CTA ── */
function FinalCTA() {
  const navigate = useNavigate()

  return (
    <section className="final-cta reveal-on-scroll">
      <div className="final-cta-content">
        <h2 className="final-cta-title slide-up">
          Start Managing Your <span className="text-muted">Motshelo Digitally</span>
        </h2>
        <p className="final-cta-subtitle slide-up" style={{ animationDelay: '0.1s' }}>
          Join thousands of Botswana communities preserving tradition through technology.
        </p>
        <div className="final-cta-buttons slide-up" style={{ animationDelay: '0.2s' }}>
          <button className="btn-primary btn-lg" onClick={() => navigate('/login')}>
            Create a Group
          </button>
          <button className="btn-outline btn-lg" onClick={() => navigate('/login')}>
            Get Started
          </button>
        </div>
      </div>
    </section>
  )
}

/* ── FOOTER ── */
function Footer() {
  return (
    <footer className="footer fade-in">
      <div className="footer-brand">
        <div className="footer-logo">Re-Mmogo</div>
        <p>Designing community financial tools through thoughtful layouts, refined features, and clarity that elevates everyday money management.</p>
      </div>
      <div className="footer-links">
        <a href="#home">Home</a>
        <a href="#why">About Us</a>
        <a href="#preview">Features</a>
        <a href="#faq">FAQ</a>
      </div>
      <div className="footer-logo-mark">
        <Handshake size={48} />
      </div>
    </footer>
  )
}

/* ── SCROLL REVEAL HOOK ── */
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    const elements = document.querySelectorAll('.reveal-on-scroll')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])
}

/* ── MAIN EXPORT ── */
export default function LandingPage() {
  useScrollReveal()

  return (
    <div className="landing-root">
      <Navbar />
      <Hero />
      <WhyReMmogo />
      <TrustCommunity />
      <AppPreview />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  )
}
