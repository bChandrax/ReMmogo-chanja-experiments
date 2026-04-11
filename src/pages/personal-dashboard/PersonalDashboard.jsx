import  { useState } from "react";
import styles from "./PersonalDashboard.module.css";

const NAV_ITEMS = [
  { label: "Dashboard", active: true },
  { label: "Transactions" },
  { label: "Invoices & Bills" },
  { label: "Investments" },
  { label: "Reports" },
];

const BOTTOM_NAV = ["History", "Support", "Settings"];

export const BILL_CARDS = [
  { label: "Business Revenue", amount: "+$12,480.00", change: "6.4%", iconBg: "#2c3e1f" },
  { label: "Membership Plans", amount: "+$1,240.00", change: "3.1%", iconBg: "#9db88a" },
  { label: "Consulting Income", amount: "+$3,750.00", change: "1.9%", iconBg: "#b5c9a0" },
  { label: "Miscellaneous Income", amount: "+$420.00", change: "0.8%", iconBg: "#c8d5be" },
];

const ALLOC_ROWS = [
  { label: "Software & Subscriptions", pct: "54.3%", amount: "$410.00" },
  { label: "Transportation & Travel", pct: "29.6%", amount: "$720.00" },
  { label: "Office & Rent", pct: "16.1%", amount: "$1,180.00" },
];

const TRANSACTIONS = [
  { name: "Blue Bottle Coffee", cat: "Food & Beverage", amount: "− $18.50", date: "Mar 5", iconBg: "#e8f0e0", iconColor: "#3b6d11" },
  { name: "Amazon Web Services", cat: "Business Tools", amount: "− $142.00", date: "Mar 5", iconBg: "#e0eaf5", iconColor: "#185fa5" },
  { name: "Uber Ride", cat: "Transportation", amount: "− $26.40", date: "Mar 4", iconBg: "#fdf0e0", iconColor: "#854f0b" },
  { name: "WeWork Monthly Desk", cat: "Office Space", amount: "− $350.00", date: "Mar 3", iconBg: "#ede8f5", iconColor: "#533ab7" },
];

export default function PersonalDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");

  return (
    <div className={styles.dash}>
      {/* Sidebar */}
      

      {/* Main */}
      <div className={styles.main}>
        {/* Topbar */}
        <div className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <h1>Welcome back, Aarav</h1>
            <p>Here's a real-time snapshot of your financial health across accounts and obligations</p>
          </div>
          <div className={styles.searchBox}>🔍 Search transactions, vendors...</div>
          <button className={styles.btn}>+ Add Account</button>
          <button className={styles.btn}>+ Liabilities</button>
        </div>

        {/* Content Grid */}
        <div className={styles.content}>
          {/* Bills & Payments */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Bills & Payments</span>
              <span className={styles.seeAll}>See All ›</span>
            </div>
            <div className={styles.billsGrid}>
              {BILL_CARDS.map((card) => (
                <div key={card.label} className={styles.billCard}>
                  <div className={styles.billIcon} style={{ background: card.iconBg }} />
                  <div className={styles.billLabel}>{card.label}</div>
                  <div className={styles.billAmount}>{card.amount}</div>
                  <div className={styles.billChange}>↑ {card.change} vs last month</div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Budget Health */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Monthly Budget Health</span>
              <button className={styles.btn}>March 2026 ▾</button>
            </div>
            <div className={styles.budgetLegend}>
              {[["#2c3e1f","Planned Spending"],["#9db88a","Actual Spending"],["#d5dece","Remaining Funds"]].map(([color, label]) => (
                <div key={label} className={styles.legendItem}>
                  <div className={styles.legendDot} style={{ background: color }} />
                  {label}
                </div>
              ))}
            </div>
            <div className={styles.gaugeWrap}>
              <svg width="200" height="120" viewBox="0 0 200 120">
                <path d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke="#d5dece" strokeWidth="22" strokeLinecap="round"/>
                <path d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke="#9db88a" strokeWidth="22" strokeLinecap="round" strokeDasharray="251.3" strokeDashoffset="50"/>
                <path d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke="#2c3e1f" strokeWidth="22" strokeLinecap="round" strokeDasharray="251.3" strokeDashoffset="155"/>
              </svg>
              <div className={styles.gaugeLabel}>
                <div className={styles.gaugeAvail}>Available</div>
                <div className={styles.gaugeAmount}>$9,860.50</div>
                <div className={styles.gaugeDaily}>(≈ $318.72 per day)</div>
              </div>
            </div>
          </div>

          {/* Spending Allocation */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Spending Allocation</span>
              <span className={styles.seeAll}>See All ›</span>
            </div>
            <div className={styles.allocTotal}>Total Budget</div>
            <div>
              <span className={styles.allocAmount}>$14,200.00</span>
              <span className={styles.allocChange}>↑ 4.2% vs last month</span>
            </div>
            <div className={styles.allocBar}>
              <div className={styles.barSeg1} />
              <div className={styles.barSeg2} />
              <div className={styles.barSeg3} />
            </div>
            <div className={styles.barLegend}>
              {[["#2c3e1f","Spent So Far"],["#9db88a","Upcoming Commitments"],["#d5dece","Still Available"]].map(([color, label]) => (
                <div key={label} className={styles.barLegItem}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background: color }} />
                  {label}
                </div>
              ))}
            </div>
            <table className={styles.allocTable}>
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
          <div className={styles.panel}>
            <div className={styles.txnHeader}>
              <span className={styles.panelTitle}>Recent Transactions</span>
              <div style={{ textAlign:"right" }}>
                <span style={{ fontSize:14, fontWeight:500 }}>$842.15</span>
                <span className={styles.txnSince}> Since Monday</span>
              </div>
            </div>
            {TRANSACTIONS.map((t) => (
              <div key={t.name} className={styles.txnRow}>
                <div className={styles.txnIcon} style={{ background: t.iconBg }} />
                <div className={styles.txnInfo}>
                  <div className={styles.txnName}>{t.name}</div>
                  <div className={styles.txnCat}>{t.cat}</div>
                </div>
                <div className={styles.txnRight}>
                  <div className={styles.txnAmount}>{t.amount}</div>
                  <div className={styles.txnDate}>{t.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}