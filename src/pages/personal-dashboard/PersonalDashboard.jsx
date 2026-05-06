import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import SideBar from "../../components/sideBar/sideBar";
import DashboardNavBar from "../../components/NavBar/DashboardNavBar";
import { contributionsAPI, loansAPI, groupsAPI, reportsAPI } from "../../services/api";
import "./PersonalDashboard.css";

const COLORS = ["#2c3e1f", "#9db88a", "#d5dece"];

export default function PersonalDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalContributions: 0,
    totalLoanBalance: 0,
    totalInterestRaised: 0,
    borrowingLimit: 0,
  });
  
  const [groups, setGroups] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [contributionProgress, setContributionProgress] = useState({
    paid: 0,
    pending: 0,
    notPaid: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user's groups
      const groupsRes = await groupsAPI.getAll();
      if (groupsRes.success) {
        setGroups(groupsRes.data || []);
      }

      // Fetch contributions
      const contribRes = await contributionsAPI.getAll();
      if (contribRes.success) {
        const contribData = contribRes.data || [];
        setContributions(contribData);

        // Calculate contribution progress
        const paid = contribData.filter((c) => c.status === "paid").length;
        const pending = contribData.filter((c) => c.status === "pending").length;
        const notPaid = contribData.filter((c) => c.status === "not_paid" || !c.status).length;
        setContributionProgress({ paid, pending, notPaid });
      }

      // Fetch loans
      const loansRes = await loansAPI.getAll();
      if (loansRes.success) {
        const loansData = loansRes.data || [];
        setLoans(loansData);
      }

      // Calculate totals from actual data
      const totalContrib = contributions.reduce((sum, c) => sum + (c.amountpaid || 0), 0);
      const totalLoanBal = loans.reduce((sum, l) => sum + (l.outstandingbalance || 0), 0);

      // Mock interest raised (should come from backend report endpoint)
      const totalInterest = totalContrib * 0.15; // Approximate 15% return

      // Borrowing limit based on contributions (typically 80% of total contributed)
      const borrowLimit = totalContrib * 0.8;

      setDashboardData({
        totalContributions: totalContrib,
        totalLoanBalance: totalLoanBal,
        totalInterestRaised: totalInterest,
        borrowingLimit: borrowLimit,
      });

      // Build transactions from contributions and loans
      const txns = [];

      contributions.forEach((c) => {
        if (c.amountpaid > 0) {
          txns.push({
            name: c.groupname || "Unknown Group",
            category: `Monthly Contribution — ${c.contributionmonth}`,
            amount: -c.amountpaid,
            date: c.updatedat ? new Date(c.updatedat).toLocaleDateString("en-GB", { month: "short", day: "numeric" }) : "Unknown",
            type: "contribution",
          });
        }
      });

      loans.forEach((l) => {
        if (l.status === "active") {
          txns.push({
            name: l.groupname || "Unknown Group",
            category: "Loan Disbursed",
            amount: l.principalamount,
            date: l.createdat ? new Date(l.createdat).toLocaleDateString("en-GB", { month: "short", day: "numeric" }) : "Unknown",
            type: "loan",
          });
        }
      });

      // Sort by date (most recent first)
      txns.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(txns.slice(0, 10)); // Show last 10 transactions
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare pie chart data for contribution allocation
  const allocationData = groups.slice(0, 3).map((g) => ({
    name: g.groupname,
    value: g.monthlycontribution || 1000,
  }));

  if (loading) {
    return (
      <div className="dash">
        <SideBar />
        <div className="main">
          <DashboardNavBar />
          <div className="content">
            <div className="loading-state">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  const billCards = [
    {
      label: "Total Contributions This Year",
      amount: `P${dashboardData.totalContributions.toLocaleString("en-BW")}`,
      change: `${contributions.filter((c) => c.status === "paid").length} months paid`,
      iconBg: "#2c3e1f",
    },
    {
      label: "Current Loan Balance",
      amount: `P${dashboardData.totalLoanBalance.toLocaleString("en-BW")}`,
      change: "20% interest/month",
      iconBg: "#9db88a",
    },
    {
      label: "Interest Raised",
      amount: `P${Math.round(dashboardData.totalInterestRaised).toLocaleString("en-BW")}`,
      change: "↑ across all groups",
      iconBg: "#b5c9a0",
    },
    {
      label: "Available Borrowing Limit",
      amount: `P${Math.round(dashboardData.borrowingLimit).toLocaleString("en-BW")}`,
      change: "Based on contributions",
      iconBg: "#c8d5be",
    },
  ];

  const totalGauge = contributionProgress.paid + contributionProgress.pending + contributionProgress.notPaid;
  const paidAngle = totalGauge > 0 ? (contributionProgress.paid / totalGauge) * 251.3 : 0;
  const pendingAngle = totalGauge > 0 ? (contributionProgress.pending / totalGauge) * 251.3 : 0;

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
              <Link to="/myGroups" className="see-all">See All ›</Link>
            </div>
            <div className="bills-grid">
              {billCards.map((card) => (
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
              {[
                ["#2c3e1f", "Paid"],
                ["#9db88a", "Pending Approval"],
                ["#d5dece", "Not Paid"],
              ].map(([color, label]) => (
                <div key={label} className="legend-item">
                  <div className="legend-dot" style={{ background: color }} />
                  {label}
                </div>
              ))}
            </div>
            <div className="gauge-wrap">
              <svg width="200" height="120" viewBox="0 0 200 120">
                <path
                  d="M20,100 A80,80 0 0,1 180,100"
                  fill="none"
                  stroke="#d5dece"
                  strokeWidth="22"
                  strokeLinecap="round"
                />
                <path
                  d="M20,100 A80,80 0 0,1 180,100"
                  fill="none"
                  stroke="#9db88a"
                  strokeWidth="22"
                  strokeLinecap="round"
                  strokeDasharray="251.3"
                  strokeDashoffset={251.3 - paidAngle}
                />
                <path
                  d="M20,100 A80,80 0 0,1 180,100"
                  fill="none"
                  stroke="#2c3e1f"
                  strokeWidth="22"
                  strokeLinecap="round"
                  strokeDasharray="251.3"
                  strokeDashoffset={251.3 - paidAngle - pendingAngle}
                />
              </svg>
              <div className="gauge-label">
                <div className="gauge-avail">Total Paid</div>
                <div className="gauge-amount">P{(contributionProgress.paid * 1000).toLocaleString()}</div>
                <div className="gauge-daily">{groups.length} groups this month</div>
              </div>
            </div>
          </div>

          {/* My Loan Section */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">My Loan Section</span>
              <Link to="/myLoans" className="see-all">See All ›</Link>
            </div>

            <div className="alloc-total">Total Outstanding Loans</div>

            <div>
              <span className="alloc-amount">P{dashboardData.totalLoanBalance.toLocaleString("en-BW")}</span>
              <span className="alloc-change">↑ 20% interest/month</span>
            </div>

            {loans.length > 0 ? (
              <>
                <div className="alloc-bar">
                  <div
                    className="bar-seg1"
                    style={{ width: `${(loans.filter((l) => l.status === "paid").length / loans.length) * 100}%` }}
                  />
                  <div
                    className="bar-seg2"
                    style={{ width: `${(loans.filter((l) => l.status === "active").length / loans.length) * 100}%` }}
                  />
                  <div
                    className="bar-seg3"
                    style={{
                      width: `${(loans.filter((l) => l.status === "pending").length / loans.length) * 100}%`,
                    }}
                  />
                </div>

                <div className="bar-legend">
                  {[
                    ["#2c3e1f", "Principal Paid"],
                    ["#9db88a", "Interest Accrued"],
                    ["#d5dece", "Remaining Balance"],
                  ].map(([color, label]) => (
                    <div key={label} className="bar-leg-item">
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                      {label}
                    </div>
                  ))}
                </div>

                <table className="alloc-table">
                  <tbody>
                    {loans.slice(0, 3).map((loan) => (
                      <tr key={loan.loanid}>
                        <td>{loan.groupname || "Unknown Group"}</td>
                        <td>{loan.status === "active" ? "Active" : loan.status}</td>
                        <td>P{(loan.outstandingbalance || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <div className="empty-state">No active loans</div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="panel">
            <div className="txn-header">
              <span className="panel-title">My Activity</span>
            </div>

            {transactions.length > 0 ? (
              transactions.map((t, idx) => (
                <div key={idx} className="txn-row">
                  <div
                    className="txn-icon"
                    style={{ background: t.type === "loan" ? "#fdf0e0" : "#e8f0e0" }}
                  />
                  <div className="txn-info">
                    <div className="txn-name">{t.name}</div>
                    <div className="txn-cat">{t.category}</div>
                  </div>
                  <div className="txn-right">
                    <div className={`txn-amount ${t.amount > 0 ? "txn-positive" : ""}`}>
                      {t.amount > 0 ? "+" : ""}P{Math.abs(t.amount).toLocaleString()}
                    </div>
                    <div className="txn-date">{t.date}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No recent activity</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
