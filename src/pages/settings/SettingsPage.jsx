import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Bell, Lock, CreditCard, Shield, Eye, EyeOff, Save, Check } from "lucide-react";
import SideBar from "../../components/sideBar/sideBar";
import DashboardNavBar from "../../components/NavBar/DashboardNavBar";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import "./SettingsPage.css";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Profile state
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    nationalId: '',
    bio: ''
  });

  // Notification preferences (stored in localStorage for now)
  const [notifications, setNotifications] = useState({
    newMessages: true,
    contributionReminders: true,
    loanApprovals: true,
    securityAlerts: true,
    monthlyStatements: true,
    marketingEmails: false
  });

  // Password state
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        nationalId: user.nationalId || '',
        bio: ''
      });
    }
  }, [user]);

  // Load notification preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notificationPreferences');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  }, []);

  const handleProfileSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
        nationalID: profile.nationalId
      });

      if (response.success) {
        updateUser(response.user);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(response.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Unable to save changes');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    if (passwords.new !== passwords.confirm) {
      setError('New passwords do not match');
      return;
    }

    if (passwords.new.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.updatePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new
      });

      if (response.success) {
        setSaved(true);
        setPasswords({ current: '', new: '', confirm: '' });
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(response.error || 'Failed to update password');
      }
    } catch (err) {
      setError('Unable to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem('notificationPreferences', JSON.stringify(updated));
  };

  // Display name for payment cards
  const cardHolderName = user
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim().toUpperCase()
    : 'ACCOUNT HOLDER';

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
            <button 
              className={`save-btn ${saved ? 'saved' : ''}`} 
              onClick={activeTab === 'security' ? handlePasswordSave : handleProfileSave}
              disabled={loading}
            >
              {saved ? <Check size={18} /> : <Save size={18} />}
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>

          {error && (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          )}

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
                      {(profile.firstName?.[0] || 'U') + (profile.lastName?.[0] || 'S')}
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
                          disabled
                          style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
                        />
                      </div>
                      <small style={{ color: '#888', marginTop: '4px' }}>Email cannot be changed</small>
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <div className="input-field">
                        <div className="input-icon-wrapper"><Phone size={18} /></div>
                        <input 
                          className="inner-form-input" 
                          type="tel" 
                          value={profile.phoneNumber}
                          onChange={(e) => setProfile({...profile, phoneNumber: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="form-group full-width">
                      <label>Location</label>
                      <div className="input-field">
                        <div className="input-icon-wrapper"><MapPin size={18} /></div>
                        <input className="inner-form-input" type="text" defaultValue="Gaborone, Botswana" />
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
                          <input 
                            type="checkbox" 
                            checked={notifications.newMessages}
                            onChange={() => handleNotificationChange('newMessages')}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                      <div className="notification-item">
                        <div className="notification-info">
                          <span className="notification-title">Contribution Reminders</span>
                          <span className="notification-desc">Receive reminders when contributions are due</span>
                        </div>
                        <label className="toggle">
                          <input 
                            type="checkbox" 
                            checked={notifications.contributionReminders}
                            onChange={() => handleNotificationChange('contributionReminders')}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                      <div className="notification-item">
                        <div className="notification-info">
                          <span className="notification-title">Loan Approvals</span>
                          <span className="notification-desc">Get notified when loans are approved or rejected</span>
                        </div>
                        <label className="toggle">
                          <input 
                            type="checkbox" 
                            checked={notifications.loanApprovals}
                            onChange={() => handleNotificationChange('loanApprovals')}
                          />
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
                          <input 
                            type="checkbox" 
                            checked={notifications.securityAlerts}
                            onChange={() => handleNotificationChange('securityAlerts')}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                      <div className="notification-item">
                        <div className="notification-info">
                          <span className="notification-title">Monthly Statements</span>
                          <span className="notification-desc">Receive monthly summary of your activities</span>
                        </div>
                        <label className="toggle">
                          <input 
                            type="checkbox" 
                            checked={notifications.monthlyStatements}
                            onChange={() => handleNotificationChange('monthlyStatements')}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                      <div className="notification-item">
                        <div className="notification-info">
                          <span className="notification-title">Marketing Emails</span>
                          <span className="notification-desc">Receive updates about new features and promotions</span>
                        </div>
                        <label className="toggle">
                          <input 
                            type="checkbox" 
                            checked={notifications.marketingEmails}
                            onChange={() => handleNotificationChange('marketingEmails')}
                          />
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

                  <div className="security-section">
                    <h3>Change Password</h3>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label>Current Password</label>
                        <div className="input-field">
                          <div className="input-icon-wrapper"><Lock size={18} /></div>
                          <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Enter current password" 
                            value={passwords.current}
                            onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                          />
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
                          <input 
                            type="password" 
                            placeholder="Enter new password" 
                            value={passwords.new}
                            onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="form-group full-width">
                        <label>Confirm New Password</label>
                        <div className="input-field">
                          <div className="input-icon-wrapper"><Lock size={18} /></div>
                          <input 
                            type="password" 
                            placeholder="Confirm new password" 
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                    <button className="btn-primary" onClick={handlePasswordSave} disabled={loading}>
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
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
                        <span className="card-holder">{cardHolderName}</span>
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
                        <span className="card-holder">{cardHolderName}</span>
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
