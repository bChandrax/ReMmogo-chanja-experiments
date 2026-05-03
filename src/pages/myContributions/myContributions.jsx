import { useState } from 'react';
import SideBar from '../../components/sideBar/sideBar';
import DashboardNavBar from '../../components/NavBar/DashboardNavBar';
import './myContributions.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CONTRIBUTIONS = [
  {
    group: 'Botho Savings Circle',
    year: 2026,
    target: 12000,
    monthly: 1000,
    records: [
      { month: 'Jan 2026', amount: 1000, status: 'Approved', date: 'Jan 3, 2026' },
      { month: 'Feb 2026', amount: 1000, status: 'Approved', date: 'Feb 4, 2026' },
      { month: 'Mar 2026', amount: 1000, status: 'Approved', date: 'Mar 3, 2026' },
      { month: 'Apr 2026', amount: 1000, status: 'Pending Approval', date: 'Apr 2, 2026' },
      { month: 'May 2026', amount: 0, status: 'Not Paid', date: '-' },
    ],
  },
  {
    group: 'Kgotso Family Group',
    year: 2026,
    target: 12000,
    monthly: 1000,
    records: [
      { month: 'Jan 2026', amount: 1000, status: 'Approved', date: 'Jan 5, 2026' },
      { month: 'Feb 2026', amount: 1000, status: 'Approved', date: 'Feb 6, 2026' },
      { month: 'Mar 2026', amount: 1000, status: 'Approved', date: 'Mar 5, 2026' },
      { month: 'Apr 2026', amount: 1000, status: 'Approved', date: 'Apr 4, 2026' },
      { month: 'May 2026', amount: 0, status: 'Not Paid', date: '-' },
    ],
  },
];

const STATUS_STYLE = {
  'Approved': { bg: '#e8f0e0', color: '#2c3e1f' },
  'Pending Approval': { bg: '#fff8e0', color: '#a07800' },
  'Not Paid': { bg: '#fce8e8', color: '#c0392b' },
};

export default function myContributions() {
  const [selected, setSelected] = useState(0);
  const [showRecord, setShowRecord] = useState(false);
  const [recForm, setRecForm] = useState({ group: '', month: '', proof: '' });

  const contrib = CONTRIBUTIONS[selected];
  const paid = contrib.records.filter((r) => r.status === 'Approved').reduce((s, r) => s + r.amount, 0);
  const pct = Math.round((paid / contrib.target) * 100);

  const totalAllGroups = CONTRIBUTIONS.reduce(
    (s, c) => s + c.records.filter((r) => r.status === 'Approved').reduce((a, r) => a + r.amount, 0),
    0
  );

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
              <span className="mc-summary-value">{CONTRIBUTIONS.length}</span>
              <span className="mc-summary-label">Groups</span>
            </div>
            <div className="mc-summary-divider" />
            <div className="mc-summary-item">
              <span className="mc-summary-value">P{(CONTRIBUTIONS.length * 12000).toLocaleString()}</span>
              <span className="mc-summary-label">Year-End Target</span>
            </div>
          </div>

          <div className="mc-body">
            {/* Group tabs */}
            <div className="mc-group-tabs">
              {CONTRIBUTIONS.map((c, i) => (
                <button
                  key={i}
                  className={`mc-group-tab${selected === i ? ' mc-group-tab--active' : ''}`}
                  onClick={() => setSelected(i)}
                >
                  {c.group}
                </button>
              ))}
            </div>

            {/* Progress panel */}
            <div className="mc-panel">
              <div className="mc-panel-header">
                <span className="mc-panel-title">{contrib.group} — {contrib.year}</span>
                <span className="mc-pct-badge">{pct}% of year target</span>
              </div>

              {/* Month grid */}
              <div className="mc-month-grid">
                {MONTHS.map((m, i) => {
                  const rec = contrib.records.find((r) => r.month.startsWith(m));
                  const st = rec ? rec.status : 'Not Paid';
                  const style = STATUS_STYLE[st] || STATUS_STYLE['Not Paid'];
                  return (
                    <div key={m} className="mc-month-cell" style={{ background: style.bg }}>
                      <span className="mc-month-name">{m}</span>
                      <span className="mc-month-status" style={{ color: style.color }}>
                        {st === 'Approved' ? '✓' : st === 'Pending Approval' ? '…' : '–'}
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
                <span className="mc-prog-text">P{paid.toLocaleString()} / P{contrib.target.toLocaleString()}</span>
              </div>

              {/* Legend */}
              <div className="mc-legend">
                {Object.entries(STATUS_STYLE).map(([label, s]) => (
                  <div key={label} className="mc-legend-item">
                    <span className="mc-legend-dot" style={{ background: s.bg, border: `1px solid ${s.color}` }} />
                    <span style={{ color: '#888' }}>{label}</span>
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
                  {contrib.records.map((r, i) => (
                    <tr key={i}>
                      <td>{r.month}</td>
                      <td>{r.date}</td>
                      <td>{r.amount > 0 ? `P${r.amount.toLocaleString()}` : '—'}</td>
                      <td>
                        <span className="mc-status-badge" style={STATUS_STYLE[r.status]}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
              <select value={recForm.group} onChange={(e) => setRecForm({ ...recForm, group: e.target.value })}>
                <option value="">Select group</option>
                {CONTRIBUTIONS.map((c, i) => <option key={i}>{c.group}</option>)}
              </select>
              <label>Month</label>
              <select value={recForm.month} onChange={(e) => setRecForm({ ...recForm, month: e.target.value })}>
                <option value="">Select month</option>
                {MONTHS.map((m) => <option key={m}>{m} 2026</option>)}
              </select>
              <label>Amount (P)</label>
              <input type="number" value="1000" readOnly />
              <label>Proof of Payment (optional)</label>
              <input type="text" placeholder="Paste reference number or upload link" value={recForm.proof}
                onChange={(e) => setRecForm({ ...recForm, proof: e.target.value })} />
              <button className="mc-modal-submit" onClick={() => setShowRecord(false)}>Submit Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}