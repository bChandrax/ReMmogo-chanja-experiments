import './GroupCard.css';

const GROUP_COLORS = [
  { bg: '#2c3e1f', light: '#e8f0e0' },
  { bg: '#3b5e1a', light: '#deecd0' },
  { bg: '#4a7a24', light: '#d4e8c2' },
  { bg: '#1e2d12', light: '#eaf2e0' },
];

export default function GroupCard({
  groupName = 'Botho Savings Circle',
  description = 'A community savings group focused on mutual growth.',
  memberCount = 8,
  monthlyContribution = 1000,
  totalPool = 48000,
  interestTarget = 5000,
  interestRaised = 3200,
  role = 'Member',
  status = 'Active',
  colorIndex = 0,
  signatory = false,
  onClick,
}) {
  const color = GROUP_COLORS[colorIndex % GROUP_COLORS.length];
  const progressPct = Math.min((interestRaised / interestTarget) * 100, 100);
  const initials = groupName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="GroupCard" onClick={onClick}>
      <div className="gc-thumbnail" style={{ background: color.bg }}>
        <span className="gc-initials">{initials}</span>
        <span className={`gc-status-badge gc-status-${status.toLowerCase()}`}>{status}</span>
      </div>

      <div className="gc-body">
        <div className="gc-header-row">
          <h3 className="gc-name">{groupName}</h3>
          {signatory && <span className="gc-signatory-tag">Signatory</span>}
        </div>

        <p className="gc-description">{description}</p>

        <div className="gc-stats">
          <div className="gc-stat">
            <span className="gc-stat-value">{memberCount}</span>
            <span className="gc-stat-label">Members</span>
          </div>
          <div className="gc-stat-divider" />
          <div className="gc-stat">
            <span className="gc-stat-value">P{monthlyContribution.toLocaleString()}</span>
            <span className="gc-stat-label">Monthly</span>
          </div>
          <div className="gc-stat-divider" />
          <div className="gc-stat">
            <span className="gc-stat-value">P{totalPool.toLocaleString()}</span>
            <span className="gc-stat-label">Pool</span>
          </div>
        </div>

        <div className="gc-progress-section">
          <div className="gc-progress-header">
            <span className="gc-progress-label">Interest Target</span>
            <span className="gc-progress-value">
              P{interestRaised.toLocaleString()} / P{interestTarget.toLocaleString()}
            </span>
          </div>
          <div className="gc-progress-bar">
            <div
              className="gc-progress-fill"
              style={{ width: `${progressPct}%`, background: color.bg }}
            />
          </div>
        </div>

        <div className="gc-footer">
          <span className="gc-role-tag" style={{ background: color.light, color: color.bg }}>
            {role}
          </span>
          <span className="gc-view-link">View Group →</span>
        </div>
      </div>
    </div>
  );
}