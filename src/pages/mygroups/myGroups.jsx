import { useState } from 'react';
import { Link } from 'react-router-dom';
import SideBar from '../../components/sideBar/sideBar';
import './myGroups.css';
import DashboardNavBar from '../../components/NavBar/DashboardNavBar';
import GroupCard from '../../components/GroupCard/GroupCard';

const MY_GROUPS = [
  {
    groupName: 'Botho Savings Circle',
    description: 'A trusted circle of friends saving together since 2022.',
    memberCount: 8,
    monthlyContribution: 1000,
    totalPool: 96000,
    interestTarget: 5000,
    interestRaised: 3800,
    role: 'Signatory',
    status: 'Active',
    colorIndex: 0,
    signatory: true,
  },
  {
    groupName: 'Kgotso Family Group',
    description: 'Extended family motshelo for year-end payouts.',
    memberCount: 12,
    monthlyContribution: 1000,
    totalPool: 144000,
    interestTarget: 5000,
    interestRaised: 2100,
    role: 'Member',
    status: 'Active',
    colorIndex: 1,
    signatory: false,
  },
  {
    groupName: 'Thuto Investment Club',
    description: 'Colleagues pooling resources for mutual financial growth.',
    memberCount: 6,
    monthlyContribution: 1000,
    totalPool: 72000,
    interestTarget: 5000,
    interestRaised: 4950,
    role: 'Member',
    status: 'Active',
    colorIndex: 2,
    signatory: false,
  },
];

export default function MyGroups() {
  const totalContributed = MY_GROUPS.length * 1000 * 4;
  const totalInterest = MY_GROUPS.reduce((s, g) => s + g.interestRaised, 0);

  return (
    <div className="dash">
      <SideBar />

      <div className="main">
        <DashboardNavBar />
        <div className="mg-content">

          {/* Header */}
          <div className="mg-page-header">
            <div>
              <h2 className="mg-page-title">My Groups</h2>
              <p className="mg-page-sub">You are a member of {MY_GROUPS.length} motshelo group{MY_GROUPS.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="mg-header-actions">
              <Link to="/explore" className="mg-explore-link">
                🔍 Explore Groups
              </Link>
              <Link to="/createGroup" className="mg-create-btn">
                + New Group
              </Link>
            </div>
          </div>

          {/* Summary strip */}
          <div className="mg-summary-strip">
            <div className="mg-summary-item">
              <span className="mg-summary-value">{MY_GROUPS.length}</span>
              <span className="mg-summary-label">Active Groups</span>
            </div>
            <div className="mg-summary-divider" />
            <div className="mg-summary-item">
              <span className="mg-summary-value">P{totalContributed.toLocaleString()}</span>
              <span className="mg-summary-label">Total Contributed</span>
            </div>
            <div className="mg-summary-divider" />
            <div className="mg-summary-item">
              <span className="mg-summary-value">P{totalInterest.toLocaleString()}</span>
              <span className="mg-summary-label">Interest Raised</span>
            </div>
            <div className="mg-summary-divider" />
            <div className="mg-summary-item">
              <span className="mg-summary-value">
                {MY_GROUPS.filter((g) => g.signatory).length}
              </span>
              <span className="mg-summary-label">As Signatory</span>
            </div>
          </div>

          {/* Group cards */}
          <div className="mg-section-label">Your Groups</div>
          <div className="groups-list">
            {MY_GROUPS.map((g, i) => (
              <GroupCard key={i} {...g} colorIndex={i} />
            ))}
          </div>

          {/* Empty-state prompt to explore */}
          <div className="mg-explore-banner">
            <div className="mg-explore-banner-text">
              <strong>Looking for a group to join?</strong>
              <span>Browse active motshelo groups in your community and request membership.</span>
            </div>
            <Link to="/explore" className="mg-explore-banner-btn">
              Browse Groups →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}