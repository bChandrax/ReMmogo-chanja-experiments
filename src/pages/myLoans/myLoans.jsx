import { useState } from 'react';
import SideBar from '../../components/sideBar/sideBar';
import './myLoans.css';
import DashboardNavBar from '../../components/NavBar/DashboardNavBar';

const LOANS = [
  {
    id: 'LN-001',
    group: 'Botho Savings Circle',
    principal: 5000,
    balance: 3200,
    monthlyInterest: 640,
    disbursedDate: 'Jan 15, 2026',
    dueDate: 'Jul 15, 2026',
    status: 'Active',
    approvals: 2,
    payments: [
      { month: 'Feb 2026', amount: 1640, status: 'Approved' },
      { month: 'Mar 2026', amount: 1640, status: 'Approved' },
      { month: 'Apr 2026', amount: 1640, status: 'Pending' },
    ],
  },
  {
    id: 'LN-002',
    group: 'Kgotso Family Group',
    principal: 3000,
    balance: 0,
    monthlyInterest: 0,
    disbursedDate: 'Oct 5, 2025',
    dueDate: 'Apr 5, 2026',
    status: 'Settled',
    approvals: 2,
    payments: [
      { month: 'Nov 2025', amount: 1060, status: 'Approved' },
      { month: 'Dec 2025', amount: 1060, status: 'Approved' },
      { month: 'Jan 2026', amount: 880, status: 'Approved' },
    ],
  },
];

const STATUS_COLOR = {
  Active: { bg: '#e8f0e0', color: '#2c3e1f' },
  Settled: { bg: '#f0f0f0', color: '#888' },
  Pending: { bg: '#fff8e0', color: '#a07800' },
};

export default function MyLoans() {
  const [selected, setSelected] = useState(0);
  const [showRequest, setShowRequest] = useState(false);
  const [reqForm, setReqForm] = useState({ group: '', amount: '', purpose: '' });

  const active = LOANS.filter((l) => l.status === 'Active');
  const totalOwed = active.reduce((s, l) => s + l.balance, 0);
  const totalInterest = active.reduce((s, l) => s + l.monthlyInterest, 0);

  const loan = LOANS[selected];
  const paid = loan.principal - loan.balance;
  const pct = Math.round((paid / loan.principal) * 100);

  return (
    <div className="dash">
      <SideBar />
      <div className="main">
        <DashboardNavBar />
        <div className="ml-content">

          {/* Header */}
          <div className="ml-page-header">
            <div>
              <h2 className="ml-page-title">My Loans</h2>
              <p className="ml-page-sub">Track your motshelo loan balances and repayment history</p>
            </div>
            <button className="ml-request-btn" onClick={() => setShowRequest(true)}>
              + Request Loan
            </button>
          </div>

          {/* Summary */}
          <div className="ml-summary-strip">
            <div className="ml-summary-item">
              <span className="ml-summary-value">{active.length}</span>
              <span className="ml-summary-label">Active Loans</span>
            </div>
            <div className="ml-summary-divider" />
            <div className="ml-summary-item">
              <span className="ml-summary-value">P{totalOwed.toLocaleString()}</span>
              <span className="ml-summary-label">Total Outstanding</span>
            </div>
            <div className="ml-summary-divider" />
            <div className="ml-summary-item">
              <span className="ml-summary-value">P{totalInterest.toLocaleString()}</span>
              <span className="ml-summary-label">Monthly Interest</span>
            </div>
            <div className="ml-summary-divider" />
            <div className="ml-summary-item">
              <span className="ml-summary-value">20%</span>
              <span className="ml-summary-label">Interest Rate / Mo</span>
            </div>
          </div>

          <div className="ml-body">
            {/* Loan list */}
            <div className="ml-list">
              <div className="ml-section-label">All Loans</div>
              {LOANS.map((l, i) => (
                <div
                  key={l.id}
                  className={`ml-loan-item${selected === i ? ' ml-loan-item--active' : ''}`}
                  onClick={() => setSelected(i)}
                >
                  <div className="ml-loan-item-top">
                    <span className="ml-loan-id">{l.id}</span>
                    <span
                      className="ml-loan-status"
                      style={STATUS_COLOR[l.status]}
                    >
                      {l.status}
                    </span>
                  </div>
                  <div className="ml-loan-group">{l.group}</div>
                  <div className="ml-loan-item-amounts">
                    <span>Principal: P{l.principal.toLocaleString()}</span>
                    <span className="ml-balance">Balance: P{l.balance.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Loan detail */}
            <div className="ml-detail">
              <div className="ml-detail-header">
                <div>
                  <div className="ml-detail-id">{loan.id} — {loan.group}</div>
                  <div className="ml-detail-dates">
                    Disbursed {loan.disbursedDate} &nbsp;·&nbsp; Due {loan.dueDate}
                  </div>
                </div>
                <span className="ml-loan-status" style={STATUS_COLOR[loan.status]}>
                  {loan.status}
                </span>
              </div>

              {/* Repayment progress */}
              <div className="ml-detail-panel">
                <div className="ml-detail-panel-title">Repayment Progress</div>
                <div className="ml-repay-grid">
                  <div className="ml-repay-stat">
                    <span className="ml-repay-val">P{loan.principal.toLocaleString()}</span>
                    <span className="ml-repay-lbl">Principal</span>
                  </div>
                  <div className="ml-repay-stat">
                    <span className="ml-repay-val">P{paid.toLocaleString()}</span>
                    <span className="ml-repay-lbl">Paid</span>
                  </div>
                  <div className="ml-repay-stat">
                    <span className="ml-repay-val ml-balance">P{loan.balance.toLocaleString()}</span>
                    <span className="ml-repay-lbl">Remaining</span>
                  </div>
                  <div className="ml-repay-stat">
                    <span className="ml-repay-val">P{loan.monthlyInterest.toLocaleString()}</span>
                    <span className="ml-repay-lbl">Monthly Interest</span>
                  </div>
                </div>
                <div className="ml-prog-bar-wrap">
                  <div className="ml-prog-bar">
                    <div className="ml-prog-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="ml-prog-pct">{pct}% repaid</span>
                </div>
              </div>

              {/* Payment history */}
              <div className="ml-detail-panel">
                <div className="ml-detail-panel-title">Payment History</div>
                {loan.payments.length === 0 && (
                  <p className="ml-empty">No payments recorded yet.</p>
                )}
                <table className="ml-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loan.payments.map((p, i) => (
                      <tr key={i}>
                        <td>{p.month}</td>
                        <td>P{p.amount.toLocaleString()}</td>
                        <td>
                          <span
                            className="ml-loan-status"
                            style={STATUS_COLOR[p.status] || STATUS_COLOR['Pending']}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {loan.status === 'Active' && (
                <div className="ml-info-note">
                  <span>⚠</span> Interest of 20% is charged on outstanding balance each month. Repayments must be approved by 2 signatories to reflect.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Request loan modal */}
      {showRequest && (
        <div className="ml-modal-overlay" onClick={() => setShowRequest(false)}>
          <div className="ml-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ml-modal-header">
              <span>Request a Loan</span>
              <button className="ml-modal-close" onClick={() => setShowRequest(false)}>✕</button>
            </div>
            <div className="ml-modal-body">
              <p className="ml-modal-note">Loans are charged 20% interest on outstanding balance per month. Both signatories must approve before disbursement.</p>
              <label>Group</label>
              <select value={reqForm.group} onChange={(e) => setReqForm({ ...reqForm, group: e.target.value })}>
                <option value="">Select a group</option>
                <option>Botho Savings Circle</option>
                <option>Kgotso Family Group</option>
                <option>Thuto Investment Club</option>
              </select>
              <label>Loan Amount (P)</label>
              <input
                type="number"
                placeholder="e.g. 3000"
                value={reqForm.amount}
                onChange={(e) => setReqForm({ ...reqForm, amount: e.target.value })}
              />
              <label>Purpose</label>
              <input
                type="text"
                placeholder="Brief description"
                value={reqForm.purpose}
                onChange={(e) => setReqForm({ ...reqForm, purpose: e.target.value })}
              />
              <button className="ml-modal-submit" onClick={() => setShowRequest(false)}>
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}