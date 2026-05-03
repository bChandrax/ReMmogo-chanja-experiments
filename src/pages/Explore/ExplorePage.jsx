import { useState } from 'react';
import { Link } from 'react-router-dom';
import SideBar from '../../components/sideBar/sideBar';
import './ExplorePage.css';
import DashboardNavBar from '../../components/NavBar/DashboardNavBar';
import GroupCard from '../../components/GroupCard/GroupCard';

const OPEN_GROUPS = [
  {
    groupName: 'Pula Savings Collective',
    description: 'Open to professionals in Gaborone. Strong track record since 2021.',
    memberCount: 10,
    monthlyContribution: 1000,
    totalPool: 120000,
    interestTarget: 5000,
    interestRaised: 4100,
    role: 'Open',
    status: 'Active',
    colorIndex: 0,
    signatory: false,
    open: true,
    location: 'Gaborone',
  },
  {
    groupName: 'Molapo Community Fund',
    description: 'Neighbourhood group open to Molapo residents. 2 spots available.',
    memberCount: 9,
    monthlyContribution: 1000,
    totalPool: 108000,
    interestTarget: 5000,
    interestRaised: 2700,
    role: 'Open',
    status: 'Active',
    colorIndex: 1,
    signatory: false,
    open: true,
    location: 'Molapo, Gaborone',
  },
  {
    groupName: 'Serowe Solidarity Group',
    description: 'Motshelo for residents of Serowe and surrounds. Monthly meetings.',
    memberCount: 7,
    monthlyContribution: 1000,
    totalPool: 84000,
    interestTarget: 5000,
    interestRaised: 1200,
    role: 'Open',
    status: 'Active',
    colorIndex: 2,
    signatory: false,
    open: true,
    location: 'Serowe',
  },
  {
    groupName: 'Tlotlo Wealth Circle',
    description: 'Focused on long-term savings and peer accountability.',
    memberCount: 11,
    monthlyContribution: 1000,
    totalPool: 132000,
    interestTarget: 5000,
    interestRaised: 4900,
    role: 'Open',
    status: 'Active',
    colorIndex: 3,
    signatory: false,
    open: false,
    location: 'Francistown',
  },
];

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [joinGroup, setJoinGroup] = useState(null);

  const filtered = OPEN_GROUPS.filter(
    (g) =>
      g.groupName.toLowerCase().includes(search.toLowerCase()) ||
      g.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dash">
      <SideBar />
      <div className="main">
        <DashboardNavBar />
        <div className="ep-content">

          {/* Header */}
          <div className="ep-page-header">
            <div>
              <h2 className="ep-page-title">Explore Groups</h2>
              <p className="ep-page-sub">Discover motshelo groups accepting new members</p>
            </div>
            <div className="ep-header-actions">
              <Link to="/my-groups" className="ep-back-link">← My Groups</Link>
              <Link to="/create-group" className="ep-create-btn">+ Create a Group</Link>
            </div>
          </div>

          {/* Search */}
          <div className="ep-search-bar">
            <span className="ep-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by group name or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ep-search-input"
            />
          </div>

          {/* Info banner */}
          <div className="ep-info-banner">
            <span>ℹ</span>
            <span>Every motshelo group requires a P1,000 monthly contribution. Loans attract 20% interest per month. Each member must raise P5,000 in interest by year end.</span>
          </div>

          {/* Section label */}
          <div className="ep-section-label">
            {filtered.length} group{filtered.length !== 1 ? 's' : ''} found
          </div>

          {/* Cards grid */}
          <div className="ep-groups-grid">
            {filtered.map((g, i) => (
              <div key={i} className="ep-card-wrap">
                <GroupCard {...g} colorIndex={i} />
                <div className="ep-card-meta">
                  <span className="ep-location">📍 {g.location}</span>
                  {g.open ? (
                    <button className="ep-join-btn" onClick={() => setJoinGroup(g)}>
                      Request to Join
                    </button>
                  ) : (
                    <span className="ep-closed-badge">Full</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="ep-empty">No groups match your search. <Link to="/create-group">Start your own →</Link></div>
          )}

        </div>
      </div>

      {/* Join request modal */}
      {joinGroup && (
        <div className="ep-modal-overlay" onClick={() => setJoinGroup(null)}>
          <div className="ep-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ep-modal-header">
              <span>Request to Join</span>
              <button className="ep-modal-close" onClick={() => setJoinGroup(null)}>✕</button>
            </div>
            <div className="ep-modal-body">
              <div className="ep-modal-group-name">{joinGroup.groupName}</div>
              <p className="ep-modal-note">
                Your request will be reviewed by the group signatories. If approved, you'll be enrolled and expected to contribute P1,000 on the 1st of each month.
              </p>
              <label>Message to signatories (optional)</label>
              <textarea placeholder="Introduce yourself or explain why you'd like to join…" rows={3} />
              <button className="ep-modal-submit" onClick={() => setJoinGroup(null)}>Send Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}