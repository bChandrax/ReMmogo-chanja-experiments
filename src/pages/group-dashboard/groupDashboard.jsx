import { useState } from 'react';
import SideBar from '../../components/sideBar/sideBar';
import DashboardNavBar from '../../components/NavBar/DashboardNavBar';
import './grp-dash.css';

const GROUP = {
  name: 'Botho Savings Circle',
  description: 'A trusted circle of 8 friends saving together since 2022.',
  memberCount: 8,
  monthlyContribution: 1000,
  totalPool: 96000,
  interestTarget: 5000,
  year: 2026,
  signatories: ['Kabo Moeng', 'Selepe Tau'],
};

const MEMBERS = [
  { name: 'Kabo Moeng', role: 'Signatory', contributions: 4, interestRaised: 1200, loanBalance: 0, status: 'Good Standing' },
  { name: 'Selepe Tau', role: 'Signatory', contributions: 4, interestRaised: 900, loanBalance: 3200, status: 'Good Standing' },
  { name: 'Neo Sithole', role: 'Member', contributions: 3, interestRaised: 600, loanBalance: 0, status: 'Good Standing' },
  { name: 'Thabo Kerileng', role: 'Member', contributions: 2, interestRaised: 400, loanBalance: 5000, status: 'Loan Active' },
  { name: 'Lorato Dube', role: 'Member', contributions: 4, interestRaised: 800, loanBalance: 0, status: 'Good Standing' },
  { name: 'Mpho Rammala', role: 'Member', contributions: 4, interestRaised: 700, loanBalance: 0, status: 'Good Standing' },
  { name: 'Onalenna Jiya', role: 'Member', contributions: 3, interestRaised: 500, loanBalance: 0, status: 'Good Standing' },
  { name: 'Bame Motsepe', role: 'Member', contributions: 1, interestRaised: 200, loanBalance: 0, status: 'Behind' },
];

const PENDING_APPROVALS = [
  { type: 'Loan Request', member: 'Neo Sithole', amount: 3000, date: 'May 1, 2026', approvals: 1 },
  { type: 'Contribution', member: 'Onalenna Jiya', amount: 1000, date: 'May 2, 2026', approvals: 0 },
  { type: 'Loan Repayment', member: 'Selepe Tau', amount: 1640, date: 'Apr 30, 2026', approvals: 1 },
];

const STATUS_STYLE = {
  'Good Standing': { bg: '#e8f0e0', color: '#2c3e1f' },
  'Loan Active': { bg: '#fff8e0', color: '#a07800' },
  'Behind': { bg: '#fce8e8', color: '#c0392b' },
};

const TABS = ['Overview', 'Members', 'Approvals', 'Reports'];

export default function GroupDashboard() {
  const [tab, setTab] = useState('Overview');

  const totalContributions = MEMBERS.reduce((s, m) => s + m.contributions * 1000, 0);
  const totalInterest = MEMBERS.reduce((s, m) => s + m.interestRaised, 0);
  const totalLoans = MEMBERS.reduce((s, m) => s + m.loanBalance, 0);

  return (
    <div className="dash">
      <SideBar />
      <div className="main">
        <DashboardNavBar />
        <div className="gd-content">

          {/* Group header */}
          <div className="gd-group-header">
            <div className="gd-group-avatar">BS</div>
            <div className="gd-group-info">
              <h2 className="gd-group-name">{GROUP.name}</h2>
              <p className="gd-group-desc">{GROUP.description}</p>
              <div className="gd-signatories">
                Signatories: {GROUP.signatories.join(' · ')}
              </div>
            </div>
            <div className="gd-header-badge">
              <span className="gd-active-badge">Active</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="gd-tabs">
            {TABS.map((t) => (
              <button
                key={t}
                className={`gd-tab${tab === t ? ' gd-tab--active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t}
                {t === 'Approvals' && PENDING_APPROVALS.length > 0 && (
                  <span className="gd-tab-badge">{PENDING_APPROVALS.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* ===== Overview ===== */}
          {tab === 'Overview' && (
            <div className="gd-tab-content">
              <div className="gd-stats-grid">
                <div className="gd-stat-card">
                  <span className="gd-stat-label">Total Pool</span>
                  <span className="gd-stat-value">P{GROUP.totalPool.toLocaleString()}</span>
                  <span className="gd-stat-sub">{GROUP.memberCount} members × 12 months</span>
                </div>
                <div className="gd-stat-card">
                  <span className="gd-stat-label">Contributions Collected</span>
                  <span className="gd-stat-value">P{totalContributions.toLocaleString()}</span>
                  <span className="gd-stat-sub">So far this year</span>
                </div>
                <div className="gd-stat-card">
                  <span className="gd-stat-label">Interest Raised</span>
                  <span className="gd-stat-value">P{totalInterest.toLocaleString()}</span>
                  <span className="gd-stat-sub">Target: P{(GROUP.memberCount * GROUP.interestTarget).toLocaleString()}</span>
                </div>
                <div className="gd-stat-card">
                  <span className="gd-stat-label">Outstanding Loans</span>
                  <span className="gd-stat-value gd-loan-val">P{totalLoans.toLocaleString()}</span>
                  <span className="gd-stat-sub">20% interest/month applies</span>
                </div>
              </div>

              <div className="gd-panel">
                <div className="gd-panel-title">Group Rules</div>
                <ul className="gd-rules-list">
                  <li>Only members may borrow from the motshelo</li>
                  <li>Loans attract 20% interest on the outstanding balance each month</li>
                  <li>Each member must contribute P1,000 per month</li>
                  <li>Each member must raise P5,000 in interest by year end</li>
                  <li>Loan disbursement requires approval by both signatories</li>
                  <li>Payment recording and loan repayments require signatory approval to reflect</li>
                </ul>
              </div>
            </div>
          )}

          {/* ===== Members ===== */}
          {tab === 'Members' && (
            <div className="gd-tab-content">
              <div className="gd-panel">
                <div className="gd-panel-title">All Members ({MEMBERS.length})</div>
                <table className="gd-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Contributions</th>
                      <th>Interest Raised</th>
                      <th>Loan Balance</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MEMBERS.map((m, i) => (
                      <tr key={i}>
                        <td className="gd-member-name">
                          <span className="gd-member-avatar">{m.name.split(' ').map(w => w[0]).join('')}</span>
                          {m.name}
                        </td>
                        <td>{m.role}</td>
                        <td>P{(m.contributions * 1000).toLocaleString()} ({m.contributions}/4 mo)</td>
                        <td>P{m.interestRaised.toLocaleString()}</td>
                        <td className={m.loanBalance > 0 ? 'gd-loan-val' : ''}>
                          {m.loanBalance > 0 ? `P${m.loanBalance.toLocaleString()}` : '—'}
                        </td>
                        <td>
                          <span className="gd-status-badge" style={STATUS_STYLE[m.status]}>
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== Approvals ===== */}
          {tab === 'Approvals' && (
            <div className="gd-tab-content">
              <div className="gd-info-note">
                As a signatory, you can approve or reject pending loan requests, contributions, and repayments. Both signatories must approve for items to reflect.
              </div>
              <div className="gd-panel">
                <div className="gd-panel-title">Pending Approvals ({PENDING_APPROVALS.length})</div>
                {PENDING_APPROVALS.map((a, i) => (
                  <div key={i} className="gd-approval-row">
                    <div className="gd-approval-info">
                      <span className="gd-approval-type">{a.type}</span>
                      <span className="gd-approval-member">{a.member} · P{a.amount.toLocaleString()} · {a.date}</span>
                      <span className="gd-approval-approvals">{a.approvals}/2 approvals</span>
                    </div>
                    <div className="gd-approval-actions">
                      <button className="gd-btn-approve">Approve</button>
                      <button className="gd-btn-reject">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== Reports ===== */}
          {tab === 'Reports' && (
            <div className="gd-tab-content">
              <div className="gd-panel">
                <div className="gd-panel-title">Year-End Report Preview — {GROUP.year}</div>
                <table className="gd-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Total Contributed</th>
                      <th>Interest Raised</th>
                      <th>Loans Taken</th>
                      <th>Payout (Est.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MEMBERS.map((m, i) => {
                      const contributed = m.contributions * 1000;
                      const payout = contributed + m.interestRaised;
                      return (
                        <tr key={i}>
                          <td>{m.name}</td>
                          <td>P{contributed.toLocaleString()}</td>
                          <td>P{m.interestRaised.toLocaleString()}</td>
                          <td className={m.loanBalance > 0 ? 'gd-loan-val' : ''}>
                            {m.loanBalance > 0 ? `P${m.loanBalance.toLocaleString()}` : '—'}
                          </td>
                          <td className="gd-payout-val">P{payout.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="gd-report-note">
                  Payout = contributions + interest raised – outstanding loan balance. Final figures calculated at year end.
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}