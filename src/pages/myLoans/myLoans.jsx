import { useState, useEffect } from 'react';
import SideBar from '../../components/sideBar/sideBar';
import { useToast } from '../../context/ToastContext';
import './myLoans.css';
import DashboardNavBar from '../../components/NavBar/DashboardNavBar';
import { loansAPI, groupsAPI } from '../../services/api';

const STATUS_COLOR = {
  active: { bg: '#e8f0e0', color: '#2c3e1f', label: 'Active' },
  settled: { bg: '#f0f0f0', color: '#888', label: 'Settled' },
  pending: { bg: '#fff8e0', color: '#a07800', label: 'Pending' },
  rejected: { bg: '#fce8e8', color: '#c0392b', label: 'Rejected' },
};

export default function MyLoans() {
  const [groups, setGroups] = useState([]);
  const [loans, setLoans] = useState([]);
  const [selectedLoanIndex, setSelectedLoanIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRequest, setShowRequest] = useState(false);
  const [reqForm, setReqForm] = useState({ groupid: '', amount: '', purpose: '' });
  const [requesting, setRequesting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user's groups (only groups they are a member of)
      const groupsRes = await groupsAPI.getMine();
      if (groupsRes.success && groupsRes.data) {
        setGroups(groupsRes.data);

        // Fetch loans for all user's groups
        const loansPromises = groupsRes.data.map(g => loansAPI.getAll(g.groupid));
        const loansResults = await Promise.all(loansPromises);
        
        // Combine all loans from all groups
        const allLoans = loansResults
          .filter(res => res.success && res.data)
          .flatMap(res => res.data);
        
        setLoans(allLoans);

        // Select first active loan by default, or first loan
        const activeIndex = allLoans.findIndex(l => l.status === 'disbursed');
        setSelectedLoanIndex(activeIndex >= 0 ? activeIndex : (allLoans.length > 0 ? 0 : null));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestLoan = async () => {
    if (!reqForm.groupid || !reqForm.amount) {
      toast.error('Please select a group and enter an amount');
      return;
    }

    try {
      setRequesting(true);

      const response = await loansAPI.create({
        groupid: reqForm.groupid,
        principalamount: parseFloat(reqForm.amount),
        purpose: reqForm.purpose || null,
        status: 'pending',
        interestrate: 20,
      });

      if (response.success) {
        toast.success('Loan request submitted for approval');
        setShowRequest(false);
        setReqForm({ groupid: '', amount: '', purpose: '' });
        fetchData();
      } else {
        toast.error(response.error || 'Failed to submit loan request');
      }
    } catch (err) {
      toast.error('Failed to submit loan request. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  const handleRepayLoan = async (loanId, amount) => {
    try {
      const response = await loansAPI.create(loanId, {
        amountpaid: amount,
        status: 'pending',
      });

      if (response.success) {
        toast.success('Repayment submitted for approval');
        fetchData();
      } else {
        toast.error(response.error || 'Failed to submit repayment');
      }
    } catch (err) {
      toast.error('Failed to submit repayment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="dash">
        <SideBar />
        <div className="main">
          <DashboardNavBar />
          <div className="ml-content">
            <div className="loading-state">Loading loans...</div>
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
          <div className="ml-content">
            <div className="error-state">
              <h3>Oops! Something went wrong</h3>
              <p>{error}</p>
              <button onClick={fetchData} className="ml-retry-btn">Try Again</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeLoans = loans.filter((l) => l.status === 'active');
  const totalOwed = activeLoans.reduce((sum, l) => sum + (l.outstandingbalance || 0), 0);
  const totalMonthlyInterest = activeLoans.reduce((sum, l) => {
    const balance = l.outstandingbalance || 0;
    return sum + (balance * 0.20); // 20% monthly interest
  }, 0);

  const selectedLoan = selectedLoanIndex !== null ? loans[selectedLoanIndex] : null;
  const paid = selectedLoan ? (selectedLoan.principalamount || 0) - (selectedLoan.outstandingbalance || 0) : 0;
  const pct = selectedLoan && selectedLoan.principalamount > 0
    ? Math.round((paid / selectedLoan.principalamount) * 100)
    : 0;

  return (
    <div className="dash">
      <SideBar />
      <div className="main">
        <DashboardNavBar />
        <div className="ml-content">

          {/* Header */}
          <div className="ml-page-header">
            <div>
              <h2 className="ml-page-title">My Loans</h2>
              <p className="ml-page-sub">Track your motshelo loan balances and repayment history</p>
            </div>
            <button className="ml-request-btn" onClick={() => setShowRequest(true)}>
              + Request Loan
            </button>
          </div>

          {/* Summary */}
          <div className="ml-summary-strip">
            <div className="ml-summary-item">
              <span className="ml-summary-value">{activeLoans.length}</span>
              <span className="ml-summary-label">Active Loans</span>
            </div>
            <div className="ml-summary-divider" />
            <div className="ml-summary-item">
              <span className="ml-summary-value">P{totalOwed.toLocaleString()}</span>
              <span className="ml-summary-label">Total Outstanding</span>
            </div>
            <div className="ml-summary-divider" />
            <div className="ml-summary-item">
              <span className="ml-summary-value">P{Math.round(totalMonthlyInterest).toLocaleString()}</span>
              <span className="ml-summary-label">Monthly Interest</span>
            </div>
            <div className="ml-summary-divider" />
            <div className="ml-summary-item">
              <span className="ml-summary-value">20%</span>
              <span className="ml-summary-label">Interest Rate / Mo</span>
            </div>
          </div>

          <div className="ml-body">
            {/* Loan list */}
            <div className="ml-list">
              <div className="ml-section-label">All Loans</div>
              {loans.length > 0 ? (
                loans.map((l, i) => (
                  <div
                    key={l.loanid}
                    className={`ml-loan-item${selectedLoanIndex === i ? ' ml-loan-item--active' : ''}`}
                    onClick={() => setSelectedLoanIndex(i)}
                  >
                    <div className="ml-loan-item-top">
                      <span className="ml-loan-id">{l.loanid || `LN-${String(i + 1).padStart(3, '0')}`}</span>
                      <span
                        className="ml-loan-status"
                        style={STATUS_COLOR[l.status] || STATUS_COLOR.pending}
                      >
                        {STATUS_COLOR[l.status]?.label || l.status}
                      </span>
                    </div>
                    <div className="ml-loan-group">{l.groupname || 'Unknown Group'}</div>
                    <div className="ml-loan-item-amounts">
                      <span>Principal: P{(l.principalamount || 0).toLocaleString()}</span>
                      <span className="ml-balance">Balance: P{(l.outstandingbalance || 0).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="ml-empty-list">
                  <p>No loans found</p>
                  <button onClick={() => setShowRequest(true)} className="ml-request-first-btn">
                    Request Your First Loan
                  </button>
                </div>
              )}
            </div>

            {/* Loan detail */}
            {selectedLoan && (
              <div className="ml-detail">
                <div className="ml-detail-header">
                  <div>
                    <div className="ml-detail-id">
                      {selectedLoan.loanid || `LN-${String(loans.indexOf(selectedLoan) + 1).padStart(3, '0')}`} — {selectedLoan.groupname || 'Unknown Group'}
                    </div>
                    <div className="ml-detail-dates">
                      Disbursed {selectedLoan.createdat ? new Date(selectedLoan.createdat).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'} · Due {selectedLoan.duedate ? new Date(selectedLoan.duedate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}
                    </div>
                  </div>
                  <span className="ml-loan-status" style={STATUS_COLOR[selectedLoan.status] || STATUS_COLOR.pending}>
                    {STATUS_COLOR[selectedLoan.status]?.label || selectedLoan.status}
                  </span>
                </div>

                {/* Repayment progress */}
                <div className="ml-detail-panel">
                  <div className="ml-detail-panel-title">Repayment Progress</div>
                  <div className="ml-repay-grid">
                    <div className="ml-repay-stat">
                      <span className="ml-repay-val">P{(selectedLoan.principalamount || 0).toLocaleString()}</span>
                      <span className="ml-repay-lbl">Principal</span>
                    </div>
                    <div className="ml-repay-stat">
                      <span className="ml-repay-val">P{paid.toLocaleString()}</span>
                      <span className="ml-repay-lbl">Paid</span>
                    </div>
                    <div className="ml-repay-stat">
                      <span className="ml-repay-val ml-balance">P{(selectedLoan.outstandingbalance || 0).toLocaleString()}</span>
                      <span className="ml-repay-lbl">Remaining</span>
                    </div>
                    <div className="ml-repay-stat">
                      <span className="ml-repay-val">P{Math.round((selectedLoan.outstandingbalance || 0) * 0.20).toLocaleString()}</span>
                      <span className="ml-repay-lbl">Monthly Interest</span>
                    </div>
                  </div>
                  <div className="ml-prog-bar-wrap">
                    <div className="ml-prog-bar">
                      <div className="ml-prog-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="ml-prog-pct">{pct}% repaid</span>
                  </div>
                </div>

                {/* Payment history placeholder */}
                <div className="ml-detail-panel">
                  <div className="ml-detail-panel-title">Payment History</div>
                  <p className="ml-empty">Payment history will appear here once repayments are recorded.</p>
                </div>

                {selectedLoan.status === 'active' && (
                  <div className="ml-info-note">
                    <span>⚠</span> Interest of 20% is charged on outstanding balance each month. Repayments must be approved by 2 signatories to reflect.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request loan modal */}
      {showRequest && (
        <div className="ml-modal-overlay" onClick={() => setShowRequest(false)}>
          <div className="ml-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ml-modal-header">
              <span>Request a Loan</span>
              <button className="ml-modal-close" onClick={() => setShowRequest(false)}>✕</button>
            </div>
            <div className="ml-modal-body">
              <p className="ml-modal-note">Loans are charged 20% interest on outstanding balance per month. Both signatories must approve before disbursement.</p>
              <label>Group</label>
              <select 
                value={reqForm.groupid} 
                onChange={(e) => setReqForm({ ...reqForm, groupid: e.target.value })}
              >
                <option value="">Select a group</option>
                {groups.map((g) => (
                  <option key={g.groupid} value={g.groupid}>{g.groupname}</option>
                ))}
              </select>
              <label>Loan Amount (P)</label>
              <input
                type="number"
                placeholder="e.g. 3000"
                value={reqForm.amount}
                onChange={(e) => setReqForm({ ...reqForm, amount: e.target.value })}
              />
              <label>Purpose</label>
              <input
                type="text"
                placeholder="Brief description"
                value={reqForm.purpose}
                onChange={(e) => setReqForm({ ...reqForm, purpose: e.target.value })}
              />
              <button 
                className="ml-modal-submit" 
                onClick={handleRequestLoan}
                disabled={requesting}
              >
                {requesting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
