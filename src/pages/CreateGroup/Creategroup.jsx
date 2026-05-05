import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SideBar from '../../components/sideBar/sideBar';
import DashboardNavBar from '../../components/NavBar/DashboardNavBar';
import { groupsAPI } from '../../services/api';
import './CreateGroup.css';

const STEPS = ['Group Details', 'Rules & Settings', 'Signatories', 'Review'];

export default function CreateGroup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    description: '',
    location: '',
    startMonth: '',
    monthlyContribution: 1000,
    interestTarget: 5000,
    maxMembers: 12,
    signatory1: '',
    signatory2: '',
    isOpen: true,
  });
  const [submitted, setSubmitted] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    try {
      setCreating(true);
      setError(null);

      // Prepare data for backend
      // Build safe start/end dates — appending '-01' ensures a valid date string
      // when the browser gives us "YYYY-MM" from <input type="month">
      const startBase = form.startMonth
        ? new Date(form.startMonth + '-01')
        : new Date();
      startBase.setDate(1);
      startBase.setHours(0, 0, 0, 0);

      const endBase = new Date(startBase);
      endBase.setFullYear(endBase.getFullYear() + 1);

      const groupData = {
        groupname: form.name,
        description: form.description || null,
        monthlycontribution: form.monthlyContribution,
        requiredinterest: form.interestTarget,
        loaninterestrate: 20, // 20% monthly interest
        yearstartdate: startBase.toISOString(),
        yearenddate: endBase.toISOString(),
        maxmembers: form.maxMembers,
        isactive: true,
        isopen: form.isOpen,
        location: form.location || null,
        signatories: [form.signatory1, form.signatory2],
      };

      const response = await groupsAPI.create(groupData);

      if (response.success) {
        setSubmitted(true);
      } else {
        setError(response.error || 'Failed to create group');
      }
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Failed to create group. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (submitted) {
    return (
      <div className="dash">
        <SideBar />
        <div className="main">
          <DashboardNavBar />
          <div className="cg-content cg-success-wrap">
            <div className="cg-success-card">
              <div className="cg-success-icon">✓</div>
              <h2 className="cg-success-title">Group Created!</h2>
              <p className="cg-success-sub">
                <strong>{form.name || 'Your group'}</strong> has been registered. You can now invite members and start recording contributions.
              </p>
              <div className="cg-success-actions">
                <Link to="/myGroups" className="cg-success-btn-primary">View My Groups</Link>
                <button className="cg-success-btn-secondary" onClick={() => setSubmitted(false)}>
                  Create Another
                </button>
              </div>
            </div>
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
        <div className="cg-content">

          {/* Header */}
          <div className="cg-page-header">
            <div>
              <h2 className="cg-page-title">Create a Motshelo Group</h2>
              <p className="cg-page-sub">Register a new savings group and start managing contributions</p>
            </div>
            <Link to="/pdash" className="cg-back-link">← Back to Dashboard</Link>
          </div>

          {/* Stepper */}
          <div className="cg-stepper">
            {STEPS.map((s, i) => (
              <div key={s} className={`cg-step${i === step ? ' cg-step--active' : ''}${i < step ? ' cg-step--done' : ''}`}>
                <div className="cg-step-circle">{i < step ? '✓' : i + 1}</div>
                <span className="cg-step-label">{s}</span>
                {i < STEPS.length - 1 && <div className="cg-step-line" />}
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="cg-form-card">

            {error && (
              <div className="cg-error-banner">
                <span>⚠</span> {error}
                <button onClick={() => setError(null)}>✕</button>
              </div>
            )}

            {/* Step 0: Group Details */}
            {step === 0 && (
              <div className="cg-step-content">
                <div className="cg-step-title">Group Details</div>
                <div className="cg-field-grid">
                  <div className="cg-field cg-field--full">
                    <label>Group Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Botho Savings Circle"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                    />
                  </div>
                  <div className="cg-field cg-field--full">
                    <label>Description</label>
                    <textarea
                      rows={3}
                      placeholder="Briefly describe the purpose and values of this group"
                      value={form.description}
                      onChange={(e) => update('description', e.target.value)}
                    />
                  </div>
                  <div className="cg-field">
                    <label>Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Gaborone"
                      value={form.location}
                      onChange={(e) => update('location', e.target.value)}
                    />
                  </div>
                  <div className="cg-field">
                    <label>Start Month</label>
                    <input
                      type="month"
                      value={form.startMonth}
                      onChange={(e) => update('startMonth', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Rules & Settings */}
            {step === 1 && (
              <div className="cg-step-content">
                <div className="cg-step-title">Rules & Settings</div>
                <div className="cg-info-note">
                  The following default rules apply to all Re-Mmogo groups as per the motshelo standard. You may adjust member limits.
                </div>
                <div className="cg-rules-display">
                  <div className="cg-rule-row"><span className="cg-rule-icon">💰</span><span>Monthly contribution: <strong>P1,000 per member</strong></span></div>
                  <div className="cg-rule-row"><span className="cg-rule-icon">📈</span><span>Loan interest: <strong>20% on outstanding balance per month</strong></span></div>
                  <div className="cg-rule-row"><span className="cg-rule-icon">🎯</span><span>Interest target: <strong>P5,000 per member per year</strong></span></div>
                  <div className="cg-rule-row"><span className="cg-rule-icon">✅</span><span>Loan disbursement: <strong>Requires approval of both signatories</strong></span></div>
                  <div className="cg-rule-row"><span className="cg-rule-icon">🔐</span><span>Payments: <strong>Member initiates, signatories approve</strong></span></div>
                </div>
                <div className="cg-field-grid">
                  <div className="cg-field">
                    <label>Maximum Members</label>
                    <input
                      type="number"
                      min={3}
                      max={20}
                      value={form.maxMembers}
                      onChange={(e) => update('maxMembers', +e.target.value)}
                    />
                    <span className="cg-field-hint">Minimum 3, maximum 20</span>
                  </div>
                  <div className="cg-field">
                    <label>Open for Requests</label>
                    <select value={form.isOpen ? 'yes' : 'no'} onChange={(e) => update('isOpen', e.target.value === 'yes')}>
                      <option value="yes">Yes — anyone can request to join</option>
                      <option value="no">No — invite only</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Signatories */}
            {step === 2 && (
              <div className="cg-step-content">
                <div className="cg-step-title">Assign Signatories</div>
                <div className="cg-info-note">
                  Two signatories are required for every motshelo group. They are responsible for approving loan disbursements and payment confirmations.
                </div>
                <div className="cg-field-grid">
                  <div className="cg-field">
                    <label>Signatory 1 (Full Name) *</label>
                    <input
                      type="text"
                      placeholder="Full name of first signatory"
                      value={form.signatory1}
                      onChange={(e) => update('signatory1', e.target.value)}
                    />
                  </div>
                  <div className="cg-field">
                    <label>Signatory 2 (Full Name) *</label>
                    <input
                      type="text"
                      placeholder="Full name of second signatory"
                      value={form.signatory2}
                      onChange={(e) => update('signatory2', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="cg-step-content">
                <div className="cg-step-title">Review & Create</div>
                <div className="cg-review-grid">
                  <div className="cg-review-row"><span>Group Name</span><strong>{form.name || '—'}</strong></div>
                  <div className="cg-review-row"><span>Description</span><strong>{form.description || '—'}</strong></div>
                  <div className="cg-review-row"><span>Location</span><strong>{form.location || '—'}</strong></div>
                  <div className="cg-review-row"><span>Start Month</span><strong>{form.startMonth || '—'}</strong></div>
                  <div className="cg-review-row"><span>Monthly Contribution</span><strong>P1,000</strong></div>
                  <div className="cg-review-row"><span>Interest Target</span><strong>P5,000 / member</strong></div>
                  <div className="cg-review-row"><span>Max Members</span><strong>{form.maxMembers}</strong></div>
                  <div className="cg-review-row"><span>Open for Requests</span><strong>{form.isOpen ? 'Yes' : 'No'}</strong></div>
                  <div className="cg-review-row"><span>Signatory 1</span><strong>{form.signatory1 || '—'}</strong></div>
                  <div className="cg-review-row"><span>Signatory 2</span><strong>{form.signatory2 || '—'}</strong></div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="cg-form-nav">
              {step > 0 && (
                <button className="cg-btn-back" onClick={() => setStep((s) => s - 1)} disabled={creating}>
                  ← Back
                </button>
              )}
              <div className="cg-nav-spacer" />
              {step < STEPS.length - 1 ? (
                <button className="cg-btn-next" onClick={() => setStep((s) => s + 1)} disabled={creating}>
                  Next →
                </button>
              ) : (
                <button 
                  className="cg-btn-submit" 
                  onClick={handleSubmit}
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create Group'}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}