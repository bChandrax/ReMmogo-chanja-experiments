import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SideBar from '../../components/sideBar/sideBar';
import './ExplorePage.css';
import DashboardNavBar from '../../components/NavBar/DashboardNavBar';
import GroupCard from '../../components/GroupCard/GroupCard';
import { groupsAPI, membersAPI } from '../../services/api';

export default function ExplorePage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [joinGroup, setJoinGroup] = useState(null);
  const [joinMessage, setJoinMessage] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await groupsAPI.getAll();
      
      if (response.success && response.data) {
        // Transform backend data to match component props
        const transformedGroups = response.data.map((group, index) => ({
          groupid: group.groupid,
          groupName: group.groupname,
          description: group.description || 'A motshelo savings group',
          memberCount: group.membercount || 1,
          monthlyContribution: group.monthlycontribution || 1000,
          totalPool: (group.monthlycontribution || 1000) * (group.membercount || 1) * 12,
          interestTarget: 5000,
          interestRaised: Math.floor(Math.random() * 4000) + 500,
          role: 'Open',
          status: group.isactive ? 'Active' : 'Inactive',
          colorIndex: index % 4,
          signatory: false,
          open: group.isactive && (group.membercount || 0) < 12, // Open if under 12 members
          location: 'Botswana', // Could be added to backend schema
        }));
        
        setGroups(transformedGroups);
      } else {
        setError('Failed to load groups');
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const filtered = groups.filter(
    (g) =>
      g.groupName.toLowerCase().includes(search.toLowerCase()) ||
      g.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleJoinRequest = async () => {
    if (!joinGroup) return;
    
    try {
      setJoining(true);
      
      // Get current user from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to join a group');
        window.location.href = '/login';
        return;
      }
      
      // Send join request to backend
      const response = await membersAPI.create(joinGroup.groupid, {
        message: joinMessage || null,
      });
      
      if (response.success) {
        alert('Join request sent successfully! The signatories will review your request.');
        setJoinGroup(null);
        setJoinMessage('');
      } else {
        alert(response.error || 'Failed to send join request');
      }
    } catch (err) {
      console.error('Error joining group:', err);
      alert('Failed to send join request. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="dash">
        <SideBar />
        <div className="main">
          <DashboardNavBar />
          <div className="ep-content">
            <div className="loading-state">Loading groups...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash">
        <SideBar />
        <div className="main">
          <DashboardNavBar />
          <div className="ep-content">
            <div className="error-state">
              <h3>Oops! Something went wrong</h3>
              <p>{error}</p>
              <button onClick={fetchGroups} className="ep-retry-btn">Try Again</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <Link to="/myGroups" className="ep-back-link">← My Groups</Link>
              <Link to="/createGroup" className="ep-create-btn">+ Create a Group</Link>
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
          {filtered.length > 0 ? (
            <div className="ep-groups-grid">
              {filtered.map((g, i) => (
                <div key={g.groupid} className="ep-card-wrap">
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
          ) : (
            <div className="ep-empty">
              No groups match your search. <Link to="/createGroup">Start your own →</Link>
            </div>
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
              <textarea
                placeholder="Introduce yourself or explain why you'd like to join…"
                rows={3}
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
              />
              <button 
                className="ep-modal-submit" 
                onClick={handleJoinRequest}
                disabled={joining}
              >
                {joining ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
