import { useState, useEffect } from 'react';
import SideBar from '../../components/sideBar/sideBar';
import { useToast } from '../../context/ToastContext';
import DashboardNavBar from '../../components/NavBar/DashboardNavBar';
import { contributionsAPI, groupsAPI } from '../../services/api';
import './myContributions.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CURRENT_YEAR = 2026;

const STATUS_STYLE = {
  'paid': { bg: '#e8f0e0', color: '#2c3e1f', label: 'Approved' },
  'pending': { bg: '#fff8e0', color: '#a07800', label: 'Pending Approval' },
  'not_paid': { bg: '#fce8e8', color: '#c0392b', label: 'Not Paid' },
};

export default function MyContributions() {
  const [groups, setGroups] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRecord, setShowRecord] = useState(false);
  const [recForm, setRecForm] = useState({ groupid: '', month: '', proof: '' });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user's groups (only groups they are a member of)
      const groupsRes = await groupsAPI.getMine();
      if (groupsRes.success && groupsRes.data) {
        setGroups(groupsRes.data);

        // Fetch contributions for the first group
        if (groupsRes.data.length > 0) {
          const contribRes = await contributionsAPI.getAll(groupsRes.data[0].groupid);
          if (contribRes.success && contribRes.data) {
            setContributions(contribRes.data);
          }
        }
      } else {
        setError('Failed to load groups');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupChange = async (index) => {
    setSelectedGroupIndex(index);
    const group = groups[index];
    
    if (group) {
      try {
        const contribRes = await contributionsAPI.getAll(group.groupid);
        if (contribRes.success && contribRes.data) {
          setContributions(contribRes.data);
        }
      } catch (err) {
        console.error('Error fetching contributions:', err);
      }
    }
  };

  const handleRecordPayment = async () => {
    if (!recForm.groupid || !recForm.month) {
      toast.error('Please select a group and month');
      return;
    }

    try {
      setSubmitting(true);

      const response = await contributionsAPI.create({
        groupid: recForm.groupid,
        contributionmonth: recForm.month,
        amountpaid: 1000,
        status: 'pending',
        proofofpayment: recForm.proof || null,
      });

      if (response.success) {
        toast.success('Payment submitted for approval');
        setShowRecord(false);
        setRecForm({ groupid: '', month: '', proof: '' });
        fetchData();
      } else {
        toast.error(response.error || 'Failed to submit payment');
      }
    } catch (err) {
      toast.error('Failed to submit payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="dash">
        <SideBar />
        <div className="main">
          <DashboardNavBar />
          <div className="mc-content">
            <div className="loading-state">Loading contributions...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash">
        <SideBar />
        <div className="main">
          <DashboardNavBar />
          <div className="mc-content">
            <div className="error-state">
              <h3>Oops! Something went wrong</h3>
              <p>{error}</p>
              <button onClick={fetchData} className="mc-retry-btn">Try Again</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedGroup = groups[selectedGroupIndex];
  
  // Organize contributions by month
  const contributionsByMonth = {};
  MONTHS.forEach((month, index) => {
    const monthStr = `${month} ${CURRENT_YEAR}`;
    const record = contributions.find(c => c.contributionmonth === monthStr);
    contributionsByMonth[month] = record || {
      month: monthStr,
      amountpaid: 0,
      status: 'not_paid',
      updatedat: null,
    };
  });

  const paidCount = contributions.filter(c => c.status === 'paid').length;
  const paidAmount = contributions.filter(c => c.status === 'paid').reduce((sum, c) => sum + parseFloat(c.amountpaid || 0), 0);
  const targetAmount = 12000; // 12 months × P1000
  const pct = Math.round((paidCount / 12) * 100);

  const totalAllGroups = paidAmount;

  return (
    <div className="dash">
      <SideBar />
      <div className="main">
        <DashboardNavBar />
        <div className="mc-content">

          {/* Header */}
          <div className="mc-page-header">
            <div>
              <h2 className="mc-page-title">My Contributions</h2>
              <p className="mc-page-sub">Monthly contribution records across all your motshelo groups</p>
            </div>
            <button className="mc-record-btn" onClick={() => setShowRecord(true)}>
              + Record Payment
            </button>
          </div>

          {/* Summary */}
          <div className="mc-summary-strip">
            <div className="mc-summary-item">
              <span className="mc-summary-value">P{totalAllGroups.toLocaleString()}</span>
              <span className="mc-summary-label">Total Paid (All Groups)</span>
            </div>
            <div className="mc-summary-divider" />
            <div className="mc-summary-item">
              <span className="mc-summary-value">P1,000</span>
              <span className="mc-summary-label">Monthly Rate</span>
            </div>
            <div className="mc-summary-divider" />
            <div className="mc-summary-item">
              <span className="mc-summary-value">{groups.length}</span>
              <span className="mc-summary-label">Groups</span>
            </div>
            <div className="mc-summary-divider" />
            <div className="mc-summary-item">
              <span className="mc-summary-value">P{targetAmount.toLocaleString()}</span>
              <span className="mc-summary-label">Year-End Target</span>
            </div>
          </div>

          <div className="mc-body">
            {/* Group tabs */}
            {groups.length > 0 ? (
              <div className="mc-group-tabs">
                {groups.map((g, i) => (
                  <button
                    key={g.groupid}
                    className={`mc-group-tab${selectedGroupIndex === i ? ' mc-group-tab--active' : ''}`}
                    onClick={() => handleGroupChange(i)}
                  >
                    {g.groupname}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mc-no-groups">
                <p>You are not a member of any groups yet</p>
                <a href="/explore" className="mc-explore-link">Browse Groups →</a>
              </div>
            )}

            {selectedGroup && (
              <>
                {/* Progress panel */}
                <div className="mc-panel">
                  <div className="mc-panel-header">
                    <span className="mc-panel-title">{selectedGroup.groupname} — {CURRENT_YEAR}</span>
                    <span className="mc-pct-badge">{pct}% of year target</span>
                  </div>

                  {/* Month grid */}
                  <div className="mc-month-grid">
                    {MONTHS.map((m) => {
                      const rec = contributionsByMonth[m];
                      const status = rec.status || 'not_paid';
                      const style = STATUS_STYLE[status] || STATUS_STYLE['not_paid'];
                      return (
                        <div key={m} className="mc-month-cell" style={{ background: style.bg }}>
                          <span className="mc-month-name">{m}</span>
                          <span className="mc-month-status" style={{ color: style.color }}>
                            {status === 'paid' ? '✓' : status === 'pending' ? '…' : '–'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress bar */}
                  <div className="mc-prog-row">
                    <div className="mc-prog-bar">
                      <div className="mc-prog-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="mc-prog-text">P{paidAmount.toLocaleString()} / P{targetAmount.toLocaleString()}</span>
                  </div>

                  {/* Legend */}
                  <div className="mc-legend">
                    {Object.entries(STATUS_STYLE).map(([key, s]) => (
                      <div key={key} className="mc-legend-item">
                        <span className="mc-legend-dot" style={{ background: s.bg, border: `1px solid ${s.color}` }} />
                        <span style={{ color: '#888' }}>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Table */}
                <div className="mc-panel">
                  <div className="mc-panel-title" style={{ marginBottom: 10 }}>Payment History</div>
                  <table className="mc-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Date Recorded</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contributions.length > 0 ? (
                        contributions.map((r, i) => (
                          <tr key={r.contributionid || i}>
                            <td>{r.contributionmonth}</td>
                            <td>{r.updatedat ? new Date(r.updatedat).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                            <td>{r.amountpaid > 0 ? `P${r.amountpaid.toLocaleString()}` : '—'}</td>
                            <td>
                              <span className="mc-status-badge" style={STATUS_STYLE[r.status]}>
                                {STATUS_STYLE[r.status]?.label || r.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="mc-empty-cell">No contributions recorded yet</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div className="mc-info-note">
              <span>ℹ</span> Payments are initiated by you and must be approved by both signatories to reflect as paid. You may attach proof of payment when recording.
            </div>
          </div>

        </div>
      </div>

      {/* Record modal */}
      {showRecord && (
        <div className="mc-modal-overlay" onClick={() => setShowRecord(false)}>
          <div className="mc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mc-modal-header">
              <span>Record a Payment</span>
              <button className="mc-modal-close" onClick={() => setShowRecord(false)}>✕</button>
            </div>
            <div className="mc-modal-body">
              <p className="mc-modal-note">Your payment will be submitted for signatory approval. Attach proof of payment for faster processing.</p>
              <label>Group</label>
              <select 
                value={recForm.groupid} 
                onChange={(e) => setRecForm({ ...recForm, groupid: e.target.value })}
              >
                <option value="">Select group</option>
                {groups.map((g) => (
                  <option key={g.groupid} value={g.groupid}>{g.groupname}</option>
                ))}
              </select>
              <label>Month</label>
              <select 
                value={recForm.month} 
                onChange={(e) => setRecForm({ ...recForm, month: e.target.value })}
              >
                <option value="">Select month</option>
                {MONTHS.map((m) => (
                  <option key={m} value={`${m} ${CURRENT_YEAR}`}>{m} {CURRENT_YEAR}</option>
                ))}
              </select>
              <label>Amount (P)</label>
              <input type="number" value="1000" readOnly />
              <label>Proof of Payment (optional)</label>
              <input 
                type="text" 
                placeholder="Paste reference number or upload link" 
                value={recForm.proof}
                onChange={(e) => setRecForm({ ...recForm, proof: e.target.value })} 
              />
              <button 
                className="mc-modal-submit" 
                onClick={handleRecordPayment}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}