import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Bell, Lock, CreditCard, Shield, Eye, EyeOff, Save, Check } from "lucide-react";
import SideBar from "../../components/sideBar/sideBar";
import DashboardNavBar from "../../components/NavBar/DashboardNavBar";
import { useAuth } from "../../context/AuthContext";
import "./SettingsPage.css";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Profile form state
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="dash">
      <SideBar />
      
      <div className="main">
        <DashboardNavBar />
        
        <div className="settings-content">
          <div className="settings-header">
            <div>
              <h1>Settings</h1>
              <p>Manage your account settings and preferences</p>
            </div>
            <button className={`save-btn ${saved ? 'saved' : ''}`} onClick={handleSave}>
              {saved ? <Check size={18} /> : <Save size={18} />}
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>

          <div className="settings-body">
            {/* Settings Tabs */}
            <div className="settings-tabs">
              <button 
                className={`settings-tab ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <User size={18} />
                Profile
              </button>
              <button 
                className={`settings-tab ${activeTab === "notifications" ? "active" : ""}`}
                onClick={() => setActiveTab("notifications")}
              >
                <Bell size={18} />
                Notifications
              </button>
              <button 
                className={`settings-tab ${activeTab === "security" ? "active" : ""}`}
                onClick={() => setActiveTab("security")}
              >
                <Lock size={18} />
                Security
              </button>
              <button 
                className={`settings-tab ${activeTab === "payment" ? "active" : ""}`}
                onClick={() => setActiveTab("payment")}
              >
                <CreditCard size={18} />
                Payment
              </button>
              <button 
                className={`settings-tab ${activeTab === "privacy" ? "active" : ""}`}
                onClick={() => setActiveTab("privacy")}
              >
                <Shield size={18} />
                Privacy
              </button>
            </div>

            {/* Settings Content */}
            <div className="settings-panel">
              {activeTab === "profile" && (
                <div className="settings-section">
                  <div className="section-header">
                    <h2>Profile Information</h2>
                    <p className="section-desc">Update your personal information and profile details</p>
                  </div>

                  <div className="profile-header">
                    <div className="profile-avatar">
                      {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0) || ''}
                    </div>
                    <div className="profile-actions">
                      <button className="btn-outline-sm">Change Photo</button>
                      <button className="btn-text-sm">Remove</button>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>First Name</label>
                      <div className="input-field">
                        <div className="input-icon-wrapper"><User size={18} /></div>
                        <input 
                          className="inner-form-input" 
                          type="text" 
                          value={profile.firstName}
                          onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <div className="input-field">
                        <div className="input-icon-wrapper"><User size={18} /></div>
                        <input 
                          className="inner-form-input" 
                          type="text" 
                          value={profile.lastName}
                          onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <div className="input-field">
                        <div className="input-icon-wrapper"><Mail size={18} /></div>
                        <input 
                          className="inner-form-input" 
                          type="email" 
                          value={profile.email}
                          onChange={(e) => setProfile({...profile, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <div className="input-field">
                        <div className="input-icon-wrapper"><Phone size={18} /></div>
                        <input 
                          className="inner-form-input" 
                          type="tel" 
                          value={profile.phone}
                          onChange={(e) => setProfile({...profile, phone: e.target.value})}
                          placeholder="+267 00 000 000"
                        />
                      </div>
                    </div>
                    <div className="form-group full-width">
                      <label>Location</label>
                      <div className="input-field">
                        <div className="input-icon-wrapper"><MapPin size={18} /></div>
                        <input 
                          className="inner-form-input" 
                          type="text" 
                          value={profile.location}
                          onChange={(e) => setProfile({...profile, location: e.target.value})}
                          placeholder="City, Botswana"
                        />
                      </div>
                    </div>
                    <div className="form-group full-width">
                      <label>Bio</label>
                      <textarea
                        className="form-input"
                        rows={4}
                        placeholder="Tell us about yourself..."
                        value={profile.bio}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="settings-section">
                  <div className="section-header">
                    <h2>Notification Preferences</h2>
                    <p className="section-desc">Choose how you want to receive notifications</p>
                  </div>

                  <div className="notification-groups">
                    <div className="notification-group">
                      <h3>Group Notifications</h3>
                      <div className="notification-item">
                        <div className="notification-info">
                          <span className="notification-title">New Messages</span>
                          <span className="notification-desc">Get notified when someone messages in your groups</span>
                        </div>
                        <label className="toggle">
                          <input type="checkbox" defaultChecked />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                      <div className="notification-item">
                        <div className="notification-info">
                          <span className="notification-title">Contribution Reminders</span>
                          <span className="notification-desc">Receive reminders when contributions are due</span>
                        </div>
                        <label className="toggle">
                          <input type="checkbox" defaultChecked />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                      <div className="notification-item">
                        <div className="notification-info">
                          <span className="notification-title">Loan Approvals</span>
                          <span className="notification-desc">Get notified when loans are approved or rejected</span>
                        </div>
                        <label className="toggle">
                          <input type="checkbox" defaultChecked />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>

                    <div className="notification-group">
                      <h3>System Notifications</h3>
                      <div className="notification-item">
                        <div className="notification-info">
                          <span className="notification-title">Security Alerts</span>
                          <span className="notification-desc">Get notified about important security updates</span>
                        </div>
                        <label className="toggle">
                          <input type="checkbox" defaultChecked />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                      <div className="notification-item">
                        <div className="notification-info">
                          <span className="notification-title">Monthly Statements</span>
                          <span className="notification-desc">Receive monthly summary of your activities</span>
                        </div>
                        <label className="toggle">
                          <input type="checkbox" defaultChecked />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                      <div className="notification-item">
                        <div className="notification-info">
                          <span className="notification-title">Marketing Emails</span>
                          <span className="notification-desc">Receive updates about new features and promotions</span>
                        </div>
                        <label className="toggle">
                          <input type="checkbox" />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="settings-section">
                  <div className="section-header">
                    <h2>Security Settings</h2>
                    <p className="section-desc">Manage your password and security preferences</p>
                  </div>

                  {/* User Account Information */}
                  <div className="security-section">
                    <h3>Account Information</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Full Name</label>
                        <div className="input-field">
                          <div className="input-icon-wrapper"><User size={18} /></div>
                          <input 
                            type="text" 
                            value={`${profile.firstName} ${profile.lastName}`.trim() || 'Not set'} 
                            readOnly 
                            className="read-only-field"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-field">
                          <div className="input-icon-wrapper"><Mail size={18} /></div>
                          <input 
                            type="email" 
                            value={profile.email || 'Not set'} 
                            readOnly 
                            className="read-only-field"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="security-section">
                    <h3>Change Password</h3>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label>Current Password</label>
                        <div className="input-field">
                          <div className="input-icon-wrapper"><Lock size={18} /></div>
                          <input type={showPassword ? "text" : "password"} placeholder="Enter current password" />
                          <button
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div className="form-group full-width">
                        <label>New Password</label>
                        <div className="input-field">
                          <div className="input-icon-wrapper"><Lock size={18} /></div>
                          <input type="password" placeholder="Enter new password" />
                        </div>
                      </div>
                      <div className="form-group full-width">
                        <label>Confirm New Password</label>
                        <div className="input-field">
                          <div className="input-icon-wrapper"><Lock size={18} /></div>
                          <input type="password" placeholder="Confirm new password" />
                        </div>
                      </div>
                    </div>
                    <button className="btn-primary">Update Password</button>
                  </div>

                  <div className="security-section">
                    <h3>Two-Factor Authentication</h3>
                    <p className="security-desc">Add an extra layer of security to your account</p>
                    <div className="two-factor-status">
                      <div className="status-info">
                        <Shield size={20} className="status-icon" />
                        <div>
                          <span className="status-title">Two-Factor Authentication</span>
                          <span className="status-desc">Currently disabled</span>
                        </div>
                      </div>
                      <button className="btn-outline">Enable 2FA</button>
                    </div>
                  </div>

                  <div className="security-section">
                    <h3>Active Sessions</h3>
                    <div className="session-item">
                      <div className="session-info">
                        <div className="session-icon"><Bell size={18} /></div>
                        <div>
                          <span className="session-title">Chrome on Windows</span>
                          <span className="session-desc">Gaborone, Botswana • Current session</span>
                        </div>
                      </div>
                      <span className="session-badge current">Current</span>
                    </div>
                    <div className="session-item">
                      <div className="session-info">
                        <div className="session-icon"><Bell size={18} /></div>
                        <div>
                          <span className="session-title">Safari on iPhone</span>
                          <span className="session-desc">Gaborone, Botswana • 2 days ago</span>
                        </div>
                      </div>
                      <button className="btn-text-sm danger">Revoke</button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "payment" && (
                <div className="settings-section">
                  <div className="section-header">
                    <h2>Payment Methods</h2>
                    <p className="section-desc">Manage your linked bank accounts and payment methods</p>
                  </div>

                  <div className="payment-methods">
                    <div className="payment-card">
                      <div className="card-header">
                        <div className="card-bank">
                          <div className="bank-icon">FN</div>
                          <div>
                            <span className="card-bank-name">First National Bank</span>
                            <span className="card-number">•••• •••• •••• 4521</span>
                          </div>
                        </div>
                        <span className="card-badge primary">Primary</span>
                      </div>
                      <div className="card-footer">
                        <span className="card-holder">HELLO PARVEZ</span>
                        <span className="card-expires">Expires 12/27</span>
                      </div>
                    </div>

                    <div className="payment-card">
                      <div className="card-header">
                        <div className="card-bank">
                          <div className="bank-icon" style={{ background: "#1a4d8f" }}>BS</div>
                          <div>
                            <span className="card-bank-name">Botswana Savings Bank</span>
                            <span className="card-number">•••• •••• •••• 8932</span>
                          </div>
                        </div>
                      </div>
                      <div className="card-footer">
                        <span className="card-holder">HELLO PARVEZ</span>
                        <span className="card-expires">Expires 08/26</span>
                      </div>
                    </div>

                    <button className="add-payment-btn">
                      <CreditCard size={18} />
                      Add Payment Method
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <div className="settings-section">
                  <div className="section-header">
                    <h2>Privacy Settings</h2>
                    <p className="section-desc">Control who can see your information and activities</p>
                  </div>

                  <div className="privacy-group">
                    <h3>Profile Visibility</h3>
                    <div className="privacy-item">
                      <div className="privacy-info">
                        <span className="privacy-title">Profile Visibility</span>
                        <span className="privacy-desc">Who can see your profile information</span>
                      </div>
                      <select className="privacy-select" defaultValue="groups">
                        <option value="public">Public</option>
                        <option value="groups">Group Members Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                    <div className="privacy-item">
                      <div className="privacy-info">
                        <span className="privacy-title">Activity Status</span>
                        <span className="privacy-desc">Show when you're active on the platform</span>
                      </div>
                      <label className="toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="privacy-group">
                    <h3>Data & Privacy</h3>
                    <div className="privacy-item">
                      <div className="privacy-info">
                        <span className="privacy-title">Download My Data</span>
                        <span className="privacy-desc">Get a copy of all your data</span>
                      </div>
                      <button className="btn-outline-sm">Download</button>
                    </div>
                    <div className="privacy-item">
                      <div className="privacy-info">
                        <span className="privacy-title">Delete Account</span>
                        <span className="privacy-desc">Permanently delete your account and data</span>
                      </div>
                      <button className="btn-text-sm danger">Delete Account</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
