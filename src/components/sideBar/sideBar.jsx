import { useState } from "react";
import { Handshake, Settings, Info, Home, GroupIcon, MessageCircle, Banknote, Coins } from "lucide-react";
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
        <Link to="/pdash"            className={`nav-item ${location.pathname === "/dashboard"         ? "nav-item-active" : ""}`}><Home size={18} />Dashboard</Link>
        <Link to="/myGroups"         className={`nav-item ${location.pathname === "/my-groups"         ? "nav-item-active" : ""}`}><GroupIcon size={18} />My Groups</Link>
        <Link to="/myContributions"  className={`nav-item ${location.pathname === "/my-contributions"  ? "nav-item-active" : ""}`}><Coins size={18} />My Contributions</Link>
        <Link to="/myLoans"          className={`nav-item ${location.pathname === "/my-loans"          ? "nav-item-active" : ""}`}><Banknote size={18} />My Loans</Link>
        <Link to="/messages"    className={`nav-item ${location.pathname === "/messages"     ? "nav-item-active" : ""}`}><MessageCircle size={18} />Messages</Link>

        <div className="nav-divider" />

        <Link to="/support"  className="nav-item"><Info size={18} /> More Info</Link>
        <Link to="/settings" className="nav-item"><Settings size={18} /> Settings</Link>
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