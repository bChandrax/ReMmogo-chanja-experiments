// ─── Base URL ───────────────────────────────────────────────
// During development this points to your local backend.
// Before deploying the frontend, change this to your Render URL:
//   const API_URL = "https://remmogo-backend.onrender.com/api";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── Helper ─────────────────────────────────────────────────
const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
};

// ─── AUTH ────────────────────────────────────────────────────
export const register = async ({ firstName, lastName, email, password, phoneNumber, nationalID }) =>
  handle(await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName, email, password, phoneNumber, nationalID }),
  }));

export const login = async ({ email, password }) =>
  handle(await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }));

export const getProfile = async () =>
  handle(await fetch(`${API_URL}/auth/profile`, { headers: authHeaders() }));

// ─── GROUPS ─────────────────────────────────────────────────
export const createGroup = async (data) =>
  handle(await fetch(`${API_URL}/groups`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }));

export const getMyGroups = async () =>
  handle(await fetch(`${API_URL}/groups/mine`, { headers: authHeaders() }));

export const getAllGroups = async () =>
  handle(await fetch(`${API_URL}/groups`, { headers: authHeaders() }));

export const getGroup = async (groupId) =>
  handle(await fetch(`${API_URL}/groups/${groupId}`, { headers: authHeaders() }));

export const updateGroup = async (groupId, data) =>
  handle(await fetch(`${API_URL}/groups/${groupId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  }));

export const generateContributions = async (groupId, periodMonth) =>
  handle(await fetch(`${API_URL}/groups/${groupId}/generate-contributions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ periodMonth }),
  }));

export const applyMonthlyInterest = async (groupId, periodMonth) =>
  handle(await fetch(`${API_URL}/groups/${groupId}/apply-interest`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ periodMonth }),
  }));

// ─── MEMBERS ─────────────────────────────────────────────────
export const enrollMember = async (groupId, { userId, role }) =>
  handle(await fetch(`${API_URL}/members/${groupId}/enroll`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ userId, role }),
  }));

export const getGroupMembers = async (groupId) =>
  handle(await fetch(`${API_URL}/members/${groupId}`, { headers: authHeaders() }));

export const getAllMemberBalances = async (groupId) =>
  handle(await fetch(`${API_URL}/members/${groupId}/balances/all`, { headers: authHeaders() }));

export const getMemberBalance = async (groupId, memberId) =>
  handle(await fetch(`${API_URL}/members/${groupId}/balances/${memberId}`, { headers: authHeaders() }));

export const removeMember = async (groupId, memberId) =>
  handle(await fetch(`${API_URL}/members/${groupId}/${memberId}`, {
    method: "DELETE",
    headers: authHeaders(),
  }));

// ─── CONTRIBUTIONS ───────────────────────────────────────────
export const getGroupContributions = async (groupId, month = null) => {
  const url = month
    ? `${API_URL}/contributions/${groupId}?month=${month}`
    : `${API_URL}/contributions/${groupId}`;
  return handle(await fetch(url, { headers: authHeaders() }));
};

export const getMyContributions = async (groupId) =>
  handle(await fetch(`${API_URL}/contributions/${groupId}/mine`, { headers: authHeaders() }));

export const submitContribution = async (contributionId, { amountPaid, proofOfPayment }) =>
  handle(await fetch(`${API_URL}/contributions/${contributionId}/submit`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ amountPaid, proofOfPayment }),
  }));

export const approveContribution = async (contributionId, { decision, decisionNote, groupId }) =>
  handle(await fetch(`${API_URL}/contributions/${contributionId}/approve`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ decision, decisionNote, groupId }),
  }));

// ─── LOANS ───────────────────────────────────────────────────
export const requestLoan = async ({ groupId, principalAmount, notes }) =>
  handle(await fetch(`${API_URL}/loans/request`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ groupId, principalAmount, notes }),
  }));

export const getGroupLoans = async (groupId, status = null) => {
  const url = status
    ? `${API_URL}/loans/${groupId}?status=${status}`
    : `${API_URL}/loans/${groupId}`;
  return handle(await fetch(url, { headers: authHeaders() }));
};

export const getMyLoans = async (groupId) =>
  handle(await fetch(`${API_URL}/loans/${groupId}/mine`, { headers: authHeaders() }));

export const approveLoan = async (loanId, { decision, decisionNote, groupId }) =>
  handle(await fetch(`${API_URL}/loans/${loanId}/approve`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ decision, decisionNote, groupId }),
  }));

export const submitRepayment = async (loanId, { amountPaid, proofOfPayment }) =>
  handle(await fetch(`${API_URL}/loans/${loanId}/repay`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ amountPaid, proofOfPayment }),
  }));

export const approveRepayment = async (repaymentId, { decision, decisionNote, groupId }) =>
  handle(await fetch(`${API_URL}/loans/repayments/${repaymentId}/approve`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ decision, decisionNote, groupId }),
  }));

export const getLoanInterest = async (loanId) =>
  handle(await fetch(`${API_URL}/loans/${loanId}/interest`, { headers: authHeaders() }));

// ─── REPORTS ─────────────────────────────────────────────────
export const getYearEndReport = async (groupId) =>
  handle(await fetch(`${API_URL}/reports/${groupId}/year-end`, { headers: authHeaders() }));

export const getGroupSummary = async (groupId) =>
  handle(await fetch(`${API_URL}/reports/${groupId}/summary`, { headers: authHeaders() }));

export const getMemberStatement = async (groupId, memberId) =>
  handle(await fetch(`${API_URL}/reports/${groupId}/member/${memberId}`, { headers: authHeaders() }));
