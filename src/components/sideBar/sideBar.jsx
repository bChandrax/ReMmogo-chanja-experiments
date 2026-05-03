import { useState } from "react";
import { Handshake } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function SideBar() {
  const location = useLocation();

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
        <Link to="/pdash"            className={`nav-item ${location.pathname === "/dashboard"         ? "nav-item-active" : ""}`}>Dashboard</Link>
        <Link to="/exploreGroups"    className={`nav-item ${location.pathname === "/explore-groups"    ? "nav-item-active" : ""}`}>Explore Groups</Link>
        <Link to="/myGroups"         className={`nav-item ${location.pathname === "/my-groups"         ? "nav-item-active" : ""}`}>My Groups</Link>
        <Link to="/myContributions"  className={`nav-item ${location.pathname === "/my-contributions"  ? "nav-item-active" : ""}`}>My Contributions</Link>
        <Link to="/myLoans"          className={`nav-item ${location.pathname === "/my-loans"          ? "nav-item-active" : ""}`}>My Loans</Link>
        <Link to="/paymentProofs"    className={`nav-item ${location.pathname === "/payment-proofs"    ? "nav-item-active" : ""}`}>Payment Proofs</Link>
        <Link to="/myStatements"     className={`nav-item ${location.pathname === "/my-statements"     ? "nav-item-active" : ""}`}>My Statements</Link>
        <Link to="/notifications"    className={`nav-item ${location.pathname === "/notifications"     ? "nav-item-active" : ""}`}>Notifications</Link>

        <div className="nav-divider" />

        <Link to="/history"  className="nav-item">History</Link>
        <Link to="/support"  className="nav-item">Support</Link>
        <Link to="/settings" className="nav-item">Settings</Link>

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