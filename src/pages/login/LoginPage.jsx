import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check } from "lucide-react"
import "./LoginPage.css"

export default function LoginPage() {
  const navigate = useNavigate()
  const [showSignUp, setShowSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")
  const [signUpName, setSignUpName] = useState("")
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")

  function handleSignIn(e) {
    e.preventDefault()
    navigate("/personal-dashboard")
  }

  function handleSignUp(e) {
    e.preventDefault()
    navigate("/personal-dashboard")
  }

  return (
    <div className="login-page">
      <button className="login-back-button" onClick={() => navigate("/")}>
        ← Back to home
      </button>

      <div className="login-card">

        {/* ─── ILLUSTRATION PANEL (left side, slides right on signup) ─── */}
        <div className={`login-illustration ${showSignUp ? "login-illustration--shifted" : ""}`}>
          {/* clouds */}
          <div className="login-cloud login-cloud--1" />
          <div className="login-cloud login-cloud--2" />
          <div className="login-cloud login-cloud--3" />
          <div className="login-cloud login-cloud--4" />

          {/* phone mockup */}
          <div className="login-phone">
            <div className="login-phone-notch" />
            <div className="login-phone-screen">
              <div className="login-phone-topbar">
                <span className="login-phone-topbar-line" />
                <span className="login-phone-topbar-menu" />
              </div>
              <div className="login-fingerprint">
                <span className="login-fingerprint-ring login-fingerprint-ring--outer" />
                <span className="login-fingerprint-ring login-fingerprint-ring--middle" />
                <span className="login-fingerprint-ring login-fingerprint-ring--inner" />
                <span className="login-fingerprint-dot" />
              </div>
              <div className="login-phone-progress-bar">
                <div className="login-phone-progress-bar-fill" />
              </div>
              <span className="login-phone-label">Please tap your finger</span>
            </div>
          </div>

          {/* person illustration */}
          <div className="login-person">
            <div className="login-person-head" />
            <div className="login-person-body" />
            <div className="login-person-arm" />
            <div className="login-person-leg login-person-leg--left" />
            <div className="login-person-leg login-person-leg--right" />
            <div className="login-person-bag" />
          </div>

          {/* checkmark badge */}
          <div className="login-check-badge">
            <Check size={24} />
          </div>

          {/* padlock icon */}
          <div className="login-padlock">
            <div className="login-padlock-shackle" />
            <div className="login-padlock-body">
              <div className="login-padlock-keyhole" />
            </div>
          </div>
        </div>

        {/* ─── FORM PANEL (right side, slider with both forms) ─── */}
        <div className="login-form-panel">
          <div
            className="login-form-slider"
            style={{ transform: showSignUp ? "translateX(-50%)" : "translateX(0)" }}
          >
            {/* ── SIGN IN FORM ── */}
            <div className="login-form">
              <div className="login-logo">
                <span className="login-logo-dot" />
                FinanceUs
              </div>

              <h1 className="login-heading">Hello,<br />Welcome Back</h1>
              <p className="login-subtitle">Hey, welcome back to your special place</p>

              <form onSubmit={handleSignIn}>
                <div className="login-field">
                  <div className="login-input-wrapper">
                    <Mail size={16} className="login-input-icon" />
                    <input
                      className="login-input"
                      type="email"
                      placeholder="Email address"
                      value={signInEmail}
                      onChange={e => setSignInEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="login-field">
                  <div className="login-input-wrapper">
                    <Lock size={16} className="login-input-icon" />
                    <input
                      className="login-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={signInPassword}
                      onChange={e => setSignInPassword(e.target.value)}
                      required
                    />
                    <button type="button" className="login-toggle-password" onClick={() => setShowPassword(v => !v)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="login-options-row">
                  <label className="login-remember">
                    <input type="checkbox" defaultChecked /> Remember me
                  </label>
                  <button type="button" className="login-forgot-link">Forgot Password?</button>
                </div>

                <button type="submit" className="login-submit-button">
                  Sign In <ArrowRight size={16} />
                </button>
              </form>

              <p className="login-toggle-text">
                Don't have an account?{" "}
                <button onClick={() => setShowSignUp(true)}>Sign Up</button>
              </p>
            </div>

            {/* ── SIGN UP FORM ── */}
            <div className="login-form">
              <div className="login-logo">
                <span className="login-logo-dot" />
                FinanceUs
              </div>

              <h1 className="login-heading">Create<br />Your Account</h1>
              <p className="login-subtitle">Join FinanceUs and take control of your finances</p>

              <form onSubmit={handleSignUp}>
                <div className="login-field">
                  <div className="login-input-wrapper">
                    <User size={16} className="login-input-icon" />
                    <input
                      className="login-input"
                      type="text"
                      placeholder="Full name"
                      value={signUpName}
                      onChange={e => setSignUpName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="login-field">
                  <div className="login-input-wrapper">
                    <Mail size={16} className="login-input-icon" />
                    <input
                      className="login-input"
                      type="email"
                      placeholder="Email address"
                      value={signUpEmail}
                      onChange={e => setSignUpEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="login-field">
                  <div className="login-input-wrapper">
                    <Lock size={16} className="login-input-icon" />
                    <input
                      className="login-input"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Password"
                      value={signUpPassword}
                      onChange={e => setSignUpPassword(e.target.value)}
                      required
                    />
                    <button type="button" className="login-toggle-password" onClick={() => setShowConfirmPassword(v => !v)}>
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="login-submit-button">
                  Create Account <ArrowRight size={16} />
                </button>
              </form>

              <p className="login-toggle-text">
                Already have an account?{" "}
                <button onClick={() => setShowSignUp(false)}>Sign In</button>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
