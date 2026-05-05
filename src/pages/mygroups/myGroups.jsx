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

  useEffect(() => {
    fetchMyGroups();
  }, []);

  const fetchMyGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await groupsAPI.getAll();
      
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
          role: 'Member',
          status: group.isactive ? 'Active' : 'Inactive',
          colorIndex: index % 4,
          signatory: false,
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
                  ? "You are not a member of any groups yet" 
                  : `You are a member of ${groups.length} motshelo group${groups.length !== 1 ? 's' : ''}`}
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
                  <Link to={`/GrpDash?id=${group.groupid}`} key={group.groupid}>
                    <GroupCard {...group} colorIndex={group.colorIndex} />
                  </Link>
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
    </div>
  );
}
