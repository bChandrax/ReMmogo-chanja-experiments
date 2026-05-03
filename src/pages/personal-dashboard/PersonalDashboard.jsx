import { useState } from "react";
import { Link } from "react-router-dom";
import SideBar from "../../components/sideBar/sideBar";
import "../../pages/personal-dashboard/PersonalDashboard.css"
import DashboardNavBar from "../../components/NavBar/DashboardNavBar";

export const BILL_CARDS = [
  { label: "Total Contributions This Year", amount: "P12,000.00", change: "4 months paid", iconBg: "#2c3e1f" },
  { label: "Current Loan Balance", amount: "P3,200.00", change: "20% interest/month", iconBg: "#9db88a" },
  { label: "Interest Raised", amount: "P5,300.00", change: "↑ across all groups", iconBg: "#b5c9a0" },
  { label: "Available Borrowing Limit", amount: "P8,000.00", change: "Based on contributions", iconBg: "#c8d5be" },
];

const ALLOC_ROWS = [
  { label: "Botho Savings Circle", pct: "50%", amount: "P6,000" },
  { label: "Kgotso Family Group", pct: "33%", amount: "P4,000" },
  { label: "Thuto Investment Club", pct: "17%", amount: "P2,000" },
];

const TRANSACTIONS = [
  { name: "Botho Savings Circle", cat: "Monthly Contribution — Apr 2026", amount: "− P1,000", date: "Apr 2", iconBg: "#e8f0e0" },
  { name: "Kgotso Family Group", cat: "Monthly Contribution — Apr 2026", amount: "− P1,000", date: "Apr 4", iconBg: "#deecd0" },
  { name: "Loan Repayment", cat: "Botho Savings Circle — Partial", amount: "− P1,640", date: "Apr 3", iconBg: "#fdf0e0" },
  { name: "Thuto Investment Club", cat: "Monthly Contribution — Apr 2026", amount: "− P1,000", date: "Mar 31", iconBg: "#d4e8c2" },
];

export default function PersonalDashboard() {
  return (
    <div className="dash">

      <SideBar />

      <div className="main">

        <DashboardNavBar />

        <div className="content">

          {/* Bills & Payments */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Financial Overview</span>
              <Link to="/my-groups" className="see-all">See All ›</Link>
            </div>
            <div className="bills-grid">
              {BILL_CARDS.map((card) => (
                <div key={card.label} className="bill-card">
                  <div className="bill-icon" style={{ background: card.iconBg }} />
                  <div className="bill-label">{card.label}</div>
                  <div className="bill-amount">{card.amount}</div>
                  <div className="bill-change">{card.change}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Contribution Status */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">My Monthly Contribution Status</span>
              <button className="btn">May 2026 ▾</button>
            </div>
            <div className="budget-legend">
              {[["#2c3e1f", "Paid"], ["#9db88a", "Pending Approval"], ["#d5dece", "Not Paid"]].map(([color, label]) => (
                <div key={label} className="legend-item">
                  <div className="legend-dot" style={{ background: color }} />
                  {label}
                </div>
              ))}
            </div>
            <div className="gauge-wrap">
              <svg width="200" height="120" viewBox="0 0 200 120">
                <path d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke="#d5dece" strokeWidth="22" strokeLinecap="round"/>
                <path d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke="#9db88a" strokeWidth="22" strokeLinecap="round" strokeDasharray="251.3" strokeDashoffset="50"/>
                <path d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke="#2c3e1f" strokeWidth="22" strokeLinecap="round" strokeDasharray="251.3" strokeDashoffset="155"/>
              </svg>
              <div className="gauge-label">
                <div className="gauge-avail">Total Paid</div>
                <div className="gauge-amount">P3,000</div>
                <div className="gauge-daily">3 groups this month</div>
              </div>
            </div>
          </div>

          {/* My Loan Section */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">My Loan Section</span>
              <Link to="/my-loans" className="see-all">See All ›</Link>
            </div>

            <div className="alloc-total">Total Outstanding Loans</div>

            <div>
              <span className="alloc-amount">P3,200.00</span>
              <span className="alloc-change">↑ 20% interest/month</span>
            </div>

            <div className="alloc-bar">
              <div className="bar-seg1" />
              <div className="bar-seg2" />
              <div className="bar-seg3" />
            </div>

            <div className="bar-legend">
              {[["#2c3e1f", "Principal Paid"], ["#9db88a", "Interest Accrued"], ["#d5dece", "Remaining Balance"]].map(([color, label]) => (
                <div key={label} className="bar-leg-item">
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                  {label}
                </div>
              ))}
            </div>

            <table className="alloc-table">
              <tbody>
                {ALLOC_ROWS.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td>{row.pct}</td>
                    <td>{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>

          {/* Recent Activity */}
          <div className="panel">

            <div className="txn-header">
              <span className="panel-title">My Activity</span>
              <div style={{ textAlign: "right" }}>
                <Link to="/create-group" className="create-group-link">+ New Group</Link>
              </div>
            </div>

            {TRANSACTIONS.map((t) => (
              <div key={t.name + t.cat} className="txn-row">
                <div className="txn-icon" style={{ background: t.iconBg }} />
                <div className="txn-info">
                  <div className="txn-name">{t.name}</div>
                  <div className="txn-cat">{t.cat}</div>
                </div>
                <div className="txn-right">
                  <div className="txn-amount">{t.amount}</div>
                  <div className="txn-date">{t.date}</div>
                </div>
              </div>
            ))}

          </div>

        </div>
      </div>
    </div>
  );
}