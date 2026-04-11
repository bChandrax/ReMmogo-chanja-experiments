import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3, TrendingUp, PieChart, Eye, ArrowRight,
  Shield, Bell, Repeat, Users, Zap, Lock,
  DollarSign, Activity, Wallet, ChevronRight, Check
} from 'lucide-react'
import './LandingPage.css'

/*NAV*/
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="nav-inner">
        <div className="nav-brand">
          <div className="nav-logo">
            <DollarSign size={18} />
          </div>
          <span>FinanceUs</span>
        </div>
        <div className="nav-links">
          <a href="#home" className="nav-link active">Home</a>
          <a href="#features" className="nav-link">Product</a>
          <a href="#solutions" className="nav-link">Solutions</a>
          <a href="#pricing" className="nav-link">Pricing</a>
        </div>
        <div className="nav-actions">
          <button className="btn-text" onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn-primary" onClick={() => navigate('/login')}>Get Started Free</button>
        </div>
      </div>
    </nav>
  )
}

/* ── HERO ─ */
function Hero() {
  const navigate = useNavigate()
  return (
    <section className="hero" id="home">
      <div className="hero-bg-pattern" />
      <div className="hero-content">
        <div className="hero-badge">
          <Zap size={12} />
          YOUR PERSONAL &amp; BUSINESS FINANCE HUB
        </div>
        <h1 className="hero-title">
          One Dashboard to Manage <span className="text-muted">Your Entire Financial Life</span>
        </h1>
        <p className="hero-sub">
          Track spending, manage bills, monitor income, and plan your budget with complete clarity.
          FinanceUs gives individuals and growing businesses real-time visibility into their financial health.
        </p>
        <div className="hero-ctas">
          <button className="btn-primary btn-lg" onClick={() => navigate('/login')}>
            Get Started Free
            <ArrowRight size={16} />
          </button>
          <button className="btn-outline btn-lg">
            See How It Works
          </button>
        </div>
        <p className="hero-social-proof">
          Over <strong>2,500+</strong> professionals and growing businesses trust FinanceUs
        </p>
        <div className="hero-logos">
          {['Brooks', 'Sennheiser', 'U-NEXT', 'Eastman', 'SonarQube', 'Komatsu', 'Polaroid'].map(n => (
            <span key={n} className="hero-logo-item">{n}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── DASHBOARD PREVIEW ── */
function DashboardPreview() {
  return (
    <section className="dashboard-preview">
      <div className="preview-card">
        {/* Sidebar */}
        <div className="preview-sidebar">
          <div className="preview-sidebar-brand">
            <div className="preview-logo-small"><DollarSign size={12} /></div>
            <span>FinanceUs</span>
          </div>
          <div className="preview-nav-items">
            {['Dashboard', 'Transactions', 'Invoices &amp; Bills', 'Investments', 'Reports'].map((item, i) => (
              <div key={item} className={`preview-nav-item ${i === 0 ? 'preview-nav-active' : ''}`}>
                {item}
              </div>
            ))}
          </div>
          <div className="preview-sidebar-bottom">
            <div className="preview-nav-item">History</div>
            <div className="preview-nav-item">Support</div>
            <div className="preview-nav-item">Settings</div>
          </div>
        </div>

        {/* Main content */}
        <div className="preview-main">
          <div className="preview-header">
            <div>
              <div className="preview-greeting">Welcome back, Aarav</div>
              <div className="preview-subtitle">Here's your real-time snapshot of financial health</div>
            </div>
            <div className="preview-header-actions">
              <button className="preview-btn-sm">+ Add Account</button>
            </div>
          </div>

          {/* Bills & Payments */}
          <div className="preview-section-title">Bills &amp; Payments</div>
          <div className="preview-cards-grid">
            <div className="preview-mini-card">
              <div className="preview-mini-icon"><DollarSign size={14} /></div>
              <div className="preview-mini-label">Business Revenue</div>
              <div className="preview-mini-value">+$12,480.00</div>
              <div className="preview-mini-change positive">↑ 6.4% vs last month</div>
            </div>
            <div className="preview-mini-card">
              <div className="preview-mini-icon"><TrendingUp size={14} /></div>
              <div className="preview-mini-label">Membership Plans</div>
              <div className="preview-mini-value">+$1,240.00</div>
              <div className="preview-mini-change positive">↑ 3.1% vs last month</div>
            </div>
            <div className="preview-mini-card">
              <div className="preview-mini-icon"><Activity size={14} /></div>
              <div className="preview-mini-label">Consulting Income</div>
              <div className="preview-mini-value">+$3,750.00</div>
              <div className="preview-mini-change positive">↑ 1.9% vs last month</div>
            </div>
            <div className="preview-mini-card">
              <div className="preview-mini-icon"><Wallet size={14} /></div>
              <div className="preview-mini-label">Miscellaneous Income</div>
              <div className="preview-mini-value">+$420.00</div>
              <div className="preview-mini-change positive">↑ 0.8% vs last month</div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="preview-bottom-row">
            <div className="preview-bottom-left">
              <div className="preview-section-title">Spending Allocation</div>
              <div className="preview-budget-total">Total Budget <strong>$14,200.00</strong></div>
              <div className="preview-progress-bar">
                <div className="preview-progress-fill" style={{ width: '54%' }} />
              </div>
              <div className="preview-spending-list">
                {[
                  { label: 'Software & Subscriptions', pct: '54.3%', amount: '$410.00' },
                  { label: 'Transportation & Travel', pct: '29.6%', amount: '$720.00' },
                  { label: 'Office & Rent', pct: '16.1%', amount: '$1,180.00' },
                ].map(item => (
                  <div key={item.label} className="preview-spending-row">
                    <span>{item.label}</span>
                    <span className="preview-spending-pct">{item.pct}</span>
                    <span className="preview-spending-amt">{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="preview-bottom-right">
              <div className="preview-section-title">Recent Transactions</div>
              <div className="preview-tx-header">
                <span>$842.15</span>
                <span className="preview-tx-period">Since Monday</span>
              </div>
              {[
                { name: 'Blue Bottle Coffee', cat: 'Food & Beverage', amount: '-$18.50', date: 'Mar 5' },
                { name: 'Amazon Web Services', cat: 'Business Tools', amount: '-$142.00', date: 'Mar 5' },
                { name: 'Uber Ride', cat: 'Transportation', amount: '-$26.40', date: 'Mar 4' },
                { name: 'WeWork Monthly Desk', cat: 'Office Space', amount: '-$350.00', date: 'Mar 3' },
              ].map(tx => (
                <div key={tx.name} className="preview-tx-row">
                  <div>
                    <div className="preview-tx-name">{tx.name}</div>
                    <div className="preview-tx-cat">{tx.cat}</div>
                  </div>
                  <div className="preview-tx-right">
                    <div className="preview-tx-amount">{tx.amount}</div>
                    <div className="preview-tx-date">{tx.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── STATS ── */
function Stats() {
  const stats = [
    { value: '20K', label: 'Active Users Managing\nFinances Daily' },
    { value: '150%', label: 'Average Increase in\nFinancial Visibility' },
    { value: '300M+', label: 'Transactions Processed\nSecurely' },
    { value: '100%', label: 'Data Encryption &amp;\nSecurity Compliance' },
  ]
  return (
    <section className="stats">
      {stats.map(s => (
        <div key={s.value} className="stat-item">
          <div className="stat-value">{s.value}</div>
          <div className="stat-label">{s.label.split('\n').map((l, i) => <span key={i}>{l}<br /></span>)}</div>
        </div>
      ))}
    </section>
  )
}

/* ── FEATURES OVERVIEW ── */
function FeaturesOverview() {
  return (
    <section className="features-overview" id="features">
      <div className="section-label">Features</div>
      <h2 className="section-title">
        Everything You Need <span className="text-muted">to Manage Your Finances</span>
      </h2>
      <div className="features-top-row">
        {[
          { icon: <BarChart3 size={20} />, title: 'Financial Visibility', desc: 'Get a complete overview of your financial activity' },
          { icon: <PieChart size={20} />, title: 'Smart Budgeting', desc: 'Plan, track, and adjust your budget' },
          { icon: <TrendingUp size={20} />, title: 'Growth Insights', desc: 'Understand financial trends and uncover opportunities' },
        ].map(f => (
          <div key={f.title} className="feature-pill">
            <div className="feature-pill-icon">{f.icon}</div>
            <div className="feature-pill-title">{f.title}</div>
            <div className="feature-pill-desc">{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── BENTO FEATURES ── */
function BentoFeatures() {
  return (
    <section className="bento-features">
      <div className="bento-card bento-wide">
        <div className="bento-icon"><BarChart3 size={20} /></div>
        <h3>Expense Tracking</h3>
        <p>Automatically track and categorize every expense across your accounts, helping you understand spending patterns, reduce unnecessary costs, and maintain full control over your cash flow.</p>
      </div>
      <div className="bento-card bento-tall">
        <div className="bento-icon"><TrendingUp size={20} /></div>
        <h3>Income Monitoring</h3>
        <p>Monitor all income streams in one place from business revenue to recurring payments so you always know where your money is coming from and how your earnings are evolving over time.</p>
      </div>
      <div className="bento-card bento-image">
        <div className="bento-image-overlay">
          <div className="bento-chip"><Check size={14} /> Cash Flow Insights</div>
          <div className="bento-chip"><Check size={14} /> Expense Monitoring</div>
          <div className="bento-chip"><Check size={14} /> Budget Planning</div>
        </div>
      </div>
    </section>
  )
}

/* ── DARK SECTION: Financial Health ── */
function FinancialHealth() {
  return (
    <section className="dark-section" id="solutions">
      <h2 className="dark-section-title">
        See Your Financial Health <span className="text-muted">at a Glance</span>
      </h2>

      <div className="dark-grid">
        {/* Budget Health Card */}
        <div className="dark-card dark-card-wide">
          <div className="dark-card-header">
            <span className="dark-card-label">Monthly Budget Health</span>
            <span className="dark-card-badge">March 2026</span>
          </div>
          <div className="budget-gauge">
            <div className="gauge-track">
              <div className="gauge-fill" style={{ width: '65%' }} />
            </div>
            <div className="gauge-center">
              <div className="gauge-label">Available</div>
              <div className="gauge-value">$9,860.50</div>
              <div className="gauge-sub">≈ $318.72 per day</div>
            </div>
          </div>
        </div>

        {/* Income Streams Card */}
        <div className="dark-card">
          <div className="dark-card-header">
            <div className="dark-avatars">
              <div className="dark-avatar" />
              <div className="dark-avatar" />
              <div className="dark-avatar" />
            </div>
            <span className="dark-card-label">Miscellaneous Income</span>
          </div>
          <div className="income-cards">
            <div className="income-mini-card">
              <div className="income-mini-icon"><DollarSign size={12} /></div>
              <div className="income-mini-value">+$420.00</div>
              <div className="income-mini-change positive">↑ 0.8% vs last month</div>
            </div>
            <div className="income-mini-card">
              <div className="income-mini-icon"><TrendingUp size={12} /></div>
              <div className="income-mini-value">+$1,240.00</div>
              <div className="income-mini-change positive">↑ 3.1% vs last month</div>
            </div>
          </div>
          <div className="dark-card-label" style={{ marginTop: 16 }}>Income Streams</div>
          <div className="dark-card-sub">Break down your earnings by source to see what drives your financial growth</div>
        </div>

        {/* Small feature cards */}
        {[
          { icon: <BarChart3 size={16} />, title: 'Spending Insights', desc: 'Identify where your money goes and optimize your spending habits' },
          { icon: <Repeat size={16} />, title: 'Transaction History', desc: 'Review all your financial activity in one organized timeline' },
          { icon: <Bell size={16} />, title: 'Smart Alerts', desc: 'Get notified about unusual activity, upcoming bills, and budget limits' },
        ].map(c => (
          <div key={c.title} className="dark-card dark-card-small">
            <div className="bento-icon small">{c.icon}</div>
            <div className="dark-card-title-small">{c.title}</div>
            <div className="dark-card-sub">{c.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── CONTROL SECTION ── */
function ControlSection() {
  return (
    <section className="control-section">
      <h2 className="section-title">
        Stay in Control of <span className="text-muted">Every Financial Decision</span>
      </h2>
      <p className="section-subtitle">
        Make smarter decisions with complete visibility into your income, expenses, and financial patterns.
      </p>

      <div className="control-grid">
        <div className="control-card">
          <div className="bento-icon"><Eye size={20} /></div>
          <h3>Expense Clarity</h3>
          <p>Gain a deeper understanding of where your money is going with detailed expense breakdowns that help you identify waste, optimize spending, and improve financial discipline.</p>
        </div>
        <div className="control-card control-card-image">
          <div className="control-image-badge top">
            <div className="control-image-label">Monthly Spending Trend</div>
            <div className="control-image-value">12.33%</div>
          </div>
          <div className="control-image-badge bottom">
            <div className="control-image-label">Available Budget</div>
            <div className="control-image-value">$5,860 <span className="control-image-unit">/year</span></div>
            <div className="control-image-tag">Mortgage</div>
          </div>
        </div>
        <div className="control-card">
          <div className="bento-icon"><Shield size={20} /></div>
          <h3>Financial Control</h3>
          <p>Take full control of your financial operations by managing cash flow, planning ahead, and ensuring every decision is backed by accurate, real-time data.</p>
        </div>
      </div>
    </section>
  )
}

/* ── CTA SECTION ── */
function CTASection() {
  const navigate = useNavigate()
  return (
    <section className="cta-section">
      <div className="cta-content">
        <h2 className="cta-title">
          Take Control of Your <span className="text-muted">Finances</span> with Confidence
        </h2>
        <p className="cta-sub">
          Start managing your income, expenses, and financial goals in one powerful dashboard
          designed to give you clarity, control, and real-time insights.
        </p>
        <button className="btn-white" onClick={() => navigate('/login')}>
          Get Started Free
        </button>
      </div>
      <div className="cta-image">
        <div className="cta-float-card card-1">
          <div className="cta-float-label">Net Profit</div>
          <div className="cta-float-value">+$3,750</div>
        </div>
        <div className="cta-float-card card-2">
          <div className="cta-float-label">Daily Spend Limit</div>
          <div className="cta-float-value">$386 <span className="cta-float-unit">/day</span></div>
          <div className="cta-float-tag">Current budget</div>
        </div>
        <div className="cta-chip"><Check size={14} /> Real-Time Tracking</div>
        <div className="cta-chip"><Check size={14} /> Financial Insights</div>
      </div>
    </section>
  )
}

/* ── FOOTER ── */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <div className="footer-logo">FinanceUs</div>
        <p>Designing financial tools through thoughtful layouts, refined features, and clarity that elevates everyday money management.</p>
      </div>
      <div className="footer-links">
        <a href="#home">Home</a>
        <a href="#features">Product</a>
        <a href="#solutions">Solutions</a>
        <a href="#pricing">Pricing</a>
      </div>
      <div className="footer-logo-mark">
        <DollarSign size={48} />
      </div>
    </footer>
  )
}

/* ── MAIN EXPORT ── */
export default function LandingPage() {
  return (
    <div className="landing-root">
      <Navbar />
      <Hero />
      <DashboardPreview />
      <Stats />
      <FeaturesOverview />
      <BentoFeatures />
      <FinancialHealth />
      <ControlSection />
      <CTASection />
      <Footer />
    </div>
  )
}
