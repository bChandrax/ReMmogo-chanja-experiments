import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SideBar from '../../components/sideBar/sideBar';
import './myGroups.css';
import DashboardNavBar from '../../components/NavBar/DashboardNavBar';
import GroupCard from '../../components/GroupCard/GroupCard';
import { groupsAPI, membersAPI } from '../../services/api';

export default function MyGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaveGroup, setLeaveGroup] = useState(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    fetchMyGroups();
  }, []);

  const fetchMyGroups = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch only groups the user is a member of
      const response = await groupsAPI.getMine();

      if (response.success && response.data) {
        // Transform backend data to match GroupCard props
        const transformedGroups = response.data.map((group, index) => ({
          groupid: group.groupid,
          groupName: group.groupname,
          description: group.description || 'A motshelo savings group',
          memberCount: group.membercount || 1,
          monthlyContribution: group.monthlycontribution || 1000,
          totalPool: (group.monthlycontribution || 1000) * (group.membercount || 1) * 12,
          interestTarget: 5000,
          interestRaised: Math.floor(Math.random() * 4000) + 500, // Mock until backend provides
          role: group.role || 'Member',
          status: group.isactive ? 'Active' : 'Inactive',
          colorIndex: index % 4,
          signatory: group.role === 'admin',
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

  const handleLeaveGroup = async () => {
    if (!leaveGroup) return;

    try {
      setLeaving(true);

      // Get current user's member ID in this group
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to leave a group');
        window.location.href = '/login';
        return;
      }

      // Decode token to get user ID
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id || payload.userid;

      // First, get the member ID for this user in this group
      const membersRes = await membersAPI.getAll(leaveGroup.groupid);
      const member = membersRes.data?.find(m => m.userid === userId);

      if (member && member.memberid) {
        // Remove member from group
        const response = await membersAPI.delete(leaveGroup.groupid, member.memberid);

        if (response.success) {
          alert('You have left the group successfully');
          setLeaveGroup(null);
          fetchMyGroups(); // Refresh the list
        } else {
          alert(response.error || 'Failed to leave group');
        }
      } else {
        alert('Could not find your membership in this group');
      }
    } catch (err) {
      console.error('Error leaving group:', err);
      alert('Failed to leave group. Please try again.');
    } finally {
      setLeaving(false);
    }
  };

  // Calculate summary statistics
  const totalContributed = groups.length * 1000 * 4; // Approximate 4 months
  const totalInterest = groups.reduce((sum, g) => sum + (g.interestRaised || 0), 0);
  const signatoryCount = groups.filter((g) => g.signatory).length;

  if (loading) {
    return (
      <div className="dash">
        <SideBar />
        <div className="main">
          <DashboardNavBar />
          <div className="mg-content">
            <div className="loading-state">Loading your groups...</div>
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
          <div className="mg-content">
            <div className="error-state">
              <h3>Oops! Something went wrong</h3>
              <p>{error}</p>
              <button onClick={fetchMyGroups} className="mg-retry-btn">Try Again</button>
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
        <div className="mg-content">

          {/* Header */}
          <div className="mg-page-header">
            <div>
              <h2 className="mg-page-title">My Groups</h2>
              <p className="mg-page-sub">
                {groups.length === 0 
                  ? "No groups yet. Create one or explore existing groups!" 
                  : `${groups.length} group${groups.length !== 1 ? 's' : ''} available`}
              </p>
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
              <span className="mg-summary-value">{groups.length}</span>
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
              <span className="mg-summary-value">{signatoryCount}</span>
              <span className="mg-summary-label">As Signatory</span>
            </div>
          </div>

          {/* Group cards */}
          {groups.length > 0 ? (
            <>
              <div className="mg-section-label">Your Groups</div>
              <div className="groups-list">
                {groups.map((group) => (
                  <div key={group.groupid} className="mg-group-card-wrapper">
                    <Link to={`/GrpDash?id=${group.groupid}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <GroupCard {...group} colorIndex={group.colorIndex} />
                    </Link>
                    <div className="mg-card-actions">
                      <button 
                        className="mg-leave-btn" 
                        onClick={(e) => { e.preventDefault(); setLeaveGroup(group); }}
                        disabled={group.role === 'admin' && groups.length === 1}
                        title={group.role === 'admin' && groups.length === 1 ? 'Cannot leave - you are the only admin' : 'Leave this group'}
                      >
                        Leave Group
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="mg-empty-state">
              <h3>No groups yet</h3>
              <p>Join an existing group or create your own to start saving</p>
              <div className="mg-empty-actions">
                <Link to="/explore" className="mg-explore-btn">Browse Groups</Link>
                <Link to="/createGroup" className="mg-create-btn">Create Group</Link>
              </div>
            </div>
          )}

          {/* Empty-state prompt to explore */}
          {groups.length > 0 && (
            <div className="mg-explore-banner">
              <div className="mg-explore-banner-text">
                <strong>Looking for more groups?</strong>
                <span>Browse active motshelo groups in your community and request membership.</span>
              </div>
              <Link to="/explore" className="mg-explore-banner-btn">
                Browse Groups →
              </Link>
            </div>
          )}

        </div>
      </div>

      {/* Leave group confirmation modal */}
      {leaveGroup && (
        <div className="mg-modal-overlay" onClick={() => setLeaveGroup(null)}>
          <div className="mg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mg-modal-header">
              <span>Leave Group</span>
              <button className="mg-modal-close" onClick={() => setLeaveGroup(null)}>✕</button>
            </div>
            <div className="mg-modal-body">
              <div className="mg-modal-group-name">{leaveGroup.groupName}</div>
              <p className="mg-modal-note">
                Are you sure you want to leave this group? You will lose access to group contributions, loans, and messages.
              </p>
              <p className="mg-modal-warning">
                ⚠️ This action cannot be undone. You will need to request to join again if you change your mind.
              </p>
              <div className="mg-modal-actions">
                <button className="mg-modal-cancel" onClick={() => setLeaveGroup(null)}>
                  Cancel
                </button>
                <button 
                  className="mg-modal-submit mg-modal-submit--danger" 
                  onClick={handleLeaveGroup}
                  disabled={leaving}
                >
                  {leaving ? 'Leaving...' : 'Leave Group'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
