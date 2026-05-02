import { lazy } from "react";
import { useState } from "react";
import { Handshake } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard" },
  { label: "Explore Groups" },
  { label: "My Groups" },
  { label: "My Contributions"},
  { label: "My Loans" },
  { label: "Payment Proofs" },
  { label: "My Statements" },
  { label: "Notifications" },
];

const BOTTOM_NAV = ["History", "Support", "Settings"];

export default function SideBar() {
  const [activeNav, setActiveNav] = useState("Dashboard");

  return (
    <aside className="sidebar">

      <div className="logo">
        <div className="logo-icon">
          <Handshake size={18} />
        </div>
        <span className="logo-text">ReMmogo</span>
        <span className="logo-k">K</span>
      </div>

      <nav className="nav">
        {NAV_ITEMS.map(({ label }) => (
          <div
            key={label}
            className={`nav-item ${activeNav === label ? "nav-item-active" : ""}`}
            onClick={() => setActiveNav(label)}
          >
            {label}
          </div>
        ))}

        <div className="nav-divider" />

        {BOTTOM_NAV.map((label) => (
          <div key={label} className="nav-item">
            {label}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="user-row">
          <div className="user-avatar">HP</div>
          <div className="user-info">
            <p>Hello Parvez</p>
            <span>Hello Parvez</span>
          </div>
        </div>
      </div>

    </aside>
  );
}