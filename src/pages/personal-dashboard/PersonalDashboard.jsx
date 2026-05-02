import { useState, lazy } from "react";
import SideBar from "../../components/sideBar/sideBar";
import "../../pages/personal-dashboard/PersonalDashboard.css"
import DashboardNavBar from "../../components/NavBar/DashboardNavBar";

export const BILL_CARDS = [
  { label: "Total Contributions This Year", amount: "+$12,480.00", change: "6.4%", iconBg: "#2c3e1f" },
  { label: "Current Loan Balance", amount: "P4,800.00", change: "3.1%", iconBg: "#9db88a" },
  { label: "Interest Paid", amount: "+$3,750.00", change: "1.9%", iconBg: "#b5c9a0" },
  { label: "Available Borrowing Limit", amount: "P8,000.00", change: "0.8%", iconBg: "#c8d5be" },
];

const ALLOC_ROWS = [
  { label: "Software & Subscriptions", pct: "54.3%", amount: "$410.00" },
  { label: "Transportation & Travel", pct: "29.6%", amount: "$720.00" },
  { label: "Office & Rent", pct: "16.1%", amount: "$1,180.00" },
];

const TRANSACTIONS = [
  { name: "Blue Bottle Coffee", cat: "Food & Beverage", amount: "− $18.50", date: "Mar 5", iconBg: "#e8f0e0" },
  { name: "Amazon Web Services", cat: "Business Tools", amount: "− $142.00", date: "Mar 5", iconBg: "#e0eaf5" },
  { name: "Uber Ride", cat: "Transportation", amount: "− $26.40", date: "Mar 4", iconBg: "#fdf0e0" },
  { name: "WeWork Monthly Desk", cat: "Office Space", amount: "− $350.00", date: "Mar 3", iconBg: "#ede8f5" },
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
              <span className="panel-title">Bills & Payments</span>
              <span className="see-all">See All ›</span>
            </div>
            <div className="bills-grid">
              {BILL_CARDS.map((card) => (
                <div key={card.label} className="bill-card">
                  <div className="bill-icon" style={{ background: card.iconBg }} />
                  <div className="bill-label">{card.label}</div>
                  <div className="bill-amount">{card.amount}</div>
                  <div className="bill-change">↑ {card.change} vs last month</div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Budget Health */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">My Monthly Contribution Status</span>
              <button className="btn">March 2026 ▾</button>
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
                <div className="gauge-avail">Available</div>
                <div className="gauge-amount">$9,860.50</div>
                <div className="gauge-daily">(≈ $318.72 per day)</div>
              </div>
            </div>
          </div>

          {/* Spending Allocation */}
          <div className="panel">
            
            <div className="panel-header">
              <span className="panel-title">My Loan Section</span>
              <span className="see-all">See All ›</span>
            </div>

            <div className="alloc-total">Total Budget</div>

            <div>
              <span className="alloc-amount">$14,200.00</span>
              <span className="alloc-change">↑ 4.2% vs last month</span>
            </div>

            <div className="alloc-bar">
              <div className="bar-seg1" />
              <div className="bar-seg2" />
              <div className="bar-seg3" />
            </div>

            <div className="bar-legend">
              {[["#2c3e1f", "Spent So Far"], ["#9db88a", "Upcoming Commitments"], ["#d5dece", "Still Available"]].map(([color, label]) => (
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

          {/* Recent Transactions */}
          <div className="panel">

            <div className="txn-header">
              <span className="panel-title">My Activity</span>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>$842.15</span>
                <span className="txn-since"> Since Monday</span>
              </div>
            </div>

            {TRANSACTIONS.map((t) => (
              <div key={t.name} className="txn-row">
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