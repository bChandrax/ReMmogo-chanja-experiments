import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check, Handshake } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import "./LoginPage.css"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, register } = useAuth()

  const [showSignUp, setShowSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")
  const [signUpName, setSignUpName] = useState("")
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")

  async function handleSignIn(e) {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await login(signInEmail, signInPassword)

      if (!result.success) {
        // Handle specific error types
        if (result.status === 0) {
          setError("Unable to connect to server. Please ensure the backend is running.")
        } else if (result.status === 401) {
          setError("Invalid email or password. Please try again.")
        } else if (result.status === 403) {
          setError("Account is inactive. Please contact support.")
        } else if (result.status === 500) {
          setError("Server error. Please try again later.")
        } else {
          setError(result.error || "Login failed. Please check your credentials.")
        }
        return
      }

      navigate("/pdash")
    } catch (err) {
      console.error("Login error:", err)
      setError(err.message || "Login failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSignUp(e) {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const [firstName, ...lastNames] = signUpName.split(" ")
      const result = await register({
        firstName,
        lastName: lastNames.join(" ") || "User",
        email: signUpEmail,
        password: signUpPassword,
      })

      if (!result.success) {
        // Handle specific error types
        if (result.status === 0) {
          setError("Unable to connect to server. Please ensure the backend is running.")
        } else if (result.status === 400) {
          if (result.error?.includes('already exists')) {
            setError("An account with this email already exists. Please login instead.")
          } else if (result.error?.includes('Password')) {
            setError(result.error)
          } else {
            setError("Invalid registration details. Please check your information.")
          }
        } else if (result.status === 500) {
          setError("Server error. Please try again later.")
        } else {
          setError(result.error || "Registration failed. Please try again.")
        }
        return
      }

      navigate("/pdash")
    } catch (err) {
      console.error("Registration error:", err)
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
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
                <span className="login-phone-topbar-dot" />
              </div>

              {/* fingerprint scanner */}
              <div className="login-fingerprint">
                <div className="login-fingerprint-scan-line" />
                <svg viewBox="0 0 100 140" className="login-fingerprint-svg">
                  <path d="M50,20 Q70,20 70,40 L70,50" stroke="rgba(255,255,255,0.3)" strokeWidth="3" fill="none" />
                  <path d="M50,25 Q65,25 65,40 L65,50" stroke="rgba(255,255,255,0.3)" strokeWidth="3" fill="none" />
                  <path d="M50,15 Q30,15 30,40 L30,50" stroke="rgba(255,255,255,0.3)" strokeWidth="3" fill="none" />
                  <path d="M50,18 Q35,18 35,40 L35,50" stroke="rgba(255,255,255,0.3)" strokeWidth="3" fill="none" />
                  <circle cx="50" cy="70" r="20" stroke="rgba(255,255,255,0.3)" strokeWidth="3" fill="none" />
                  <circle cx="50" cy="70" r="14" stroke="rgba(255,255,255,0.3)" strokeWidth="3" fill="none" />
                  <circle cx="50" cy="70" r="8" stroke="rgba(255,255,255,0.3)" strokeWidth="3" fill="none" />
                </svg>
              </div>

              {/* progress bar */}
              <div className="login-progress">
                <div className="login-progress-bar" />
                <span className="login-progress-text">Please tap your finger</span>
              </div>
            </div>
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
            style={{ transform: showSignUp ? "translateX(-100%)" : "translateX(0)" }}
          >
            {/* ── SIGN IN FORM ── */}
            <div className="login-form">
              <div className="login-logo">
                <div className="login-logo-icon">
                  <Handshake size={16} />
                </div>
                Re-Mmogo
              </div>

              <h1 className="login-heading">Hello,<br />Welcome Back</h1>
              <p className="login-subtitle">Hey, welcome back to your special place</p>

              {error && <div className="login-error-message">{error}</div>}

              <form onSubmit={handleSignIn}>
                <div className="login-field">
                  <div className="login-input-wrapper">
                    <Mail size={18} className="login-input-icon" />
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
                    <Lock size={18} className="login-input-icon" />
                    <input
                      className="login-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={signInPassword}
                      onChange={e => setSignInPassword(e.target.value)}
                      required
                    />
                    <button type="button" className="login-toggle-password" onClick={() => setShowPassword(v => !v)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="login-options-row">
                  <label className="login-remember">
                    <input type="checkbox" defaultChecked /> Remember me
                  </label>
                  <button type="button" className="login-forgot-link">Forgot Password?</button>
                </div>

                <button type="submit" className="login-submit-button" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In"} <ArrowRight size={16} />
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
                <div className="login-logo-icon">
                  <Handshake size={16} />
                </div>
                Re-Mmogo
              </div>

              <h1 className="login-heading">Create<br />Your Account</h1>
              <p className="login-subtitle">Join Re-Mmogo and start managing your motshelo</p>

              {error && <div className="login-error-message">{error}</div>}

              <form onSubmit={handleSignUp}>
                <div className="login-field">
                  <div className="login-input-wrapper">
                    <User size={18} className="login-input-icon" />
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
                    <Mail size={18} className="login-input-icon" />
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
                    <Lock size={18} className="login-input-icon" />
                    <input
                      className="login-input"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Password"
                      value={signUpPassword}
                      onChange={e => setSignUpPassword(e.target.value)}
                      required
                    />
                    <button type="button" className="login-toggle-password" onClick={() => setShowConfirmPassword(v => !v)}>
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="login-submit-button" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"} <ArrowRight size={16} />
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
