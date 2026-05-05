-- Re-Mmogo Database Setup Script
-- Run this on your PostgreSQL database after creating the 'remmogo' database

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables/views if they exist (for clean setup)
DROP VIEW IF EXISTS vw_year_end_report CASCADE;
DROP VIEW IF EXISTS vw_member_balances CASCADE;
DROP TABLE IF EXISTS repaymentapprovals CASCADE;
DROP TABLE IF EXISTS loanrepayments CASCADE;
DROP TABLE IF EXISTS loanapprovals CASCADE;
DROP TABLE IF EXISTS loaninterestschedule CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS contributionapprovals CASCADE;
DROP TABLE IF EXISTS monthlycontributions CASCADE;
DROP TABLE IF EXISTS groupsignatories CASCADE;
DROP TABLE IF EXISTS groupmembers CASCADE;
DROP TABLE IF EXISTS motshelogroups CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table
CREATE TABLE users (
    userid SERIAL PRIMARY KEY,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phonenumber VARCHAR(20),
    passwordhash VARCHAR(255) NOT NULL,
    nationalid VARCHAR(50),
    isactive BOOLEAN DEFAULT true,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Motshelo Groups table
CREATE TABLE motshelogroups (
    groupid SERIAL PRIMARY KEY,
    groupname VARCHAR(255) NOT NULL,
    description TEXT,
    monthlycontribution DECIMAL(12,2) DEFAULT 1000.00,
    requiredinterest DECIMAL(12,2) DEFAULT 5000.00,
    loaninterestrate DECIMAL(5,4) DEFAULT 0.20,
    yearstartdate DATE NOT NULL,
    yearenddate DATE NOT NULL,
    isactive BOOLEAN DEFAULT true,
    isopen BOOLEAN DEFAULT true,
    maxmembers INTEGER DEFAULT 12,
    location VARCHAR(255),
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Group Members table
CREATE TABLE groupmembers (
    memberid SERIAL PRIMARY KEY,
    groupid INTEGER REFERENCES motshelogroups(groupid) ON DELETE CASCADE,
    userid INTEGER REFERENCES users(userid) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joindate DATE DEFAULT CURRENT_DATE,
    isactive BOOLEAN DEFAULT true,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(groupid, userid)
);

-- Group Signatories table
CREATE TABLE groupsignatories (
    signatoryid SERIAL PRIMARY KEY,
    groupid INTEGER REFERENCES motshelogroups(groupid) ON DELETE CASCADE,
    memberid INTEGER REFERENCES groupmembers(memberid) ON DELETE CASCADE,
    assignedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isactive BOOLEAN DEFAULT true,
    UNIQUE(groupid, memberid)
);

-- Monthly Contributions table
CREATE TABLE monthlycontributions (
    contributionid SERIAL PRIMARY KEY,
    groupid INTEGER REFERENCES motshelogroups(groupid) ON DELETE CASCADE,
    memberid INTEGER REFERENCES groupmembers(memberid) ON DELETE CASCADE,
    contributionmonth VARCHAR(20) NOT NULL,
    amountdue DECIMAL(12,2) DEFAULT 1000.00,
    amountpaid DECIMAL(12,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'not_paid',
    proofofpayment TEXT,
    submittedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(groupid, memberid, contributionmonth)
);

-- Contribution Approvals table
CREATE TABLE contributionapprovals (
    approvalid SERIAL PRIMARY KEY,
    contributionid INTEGER REFERENCES monthlycontributions(contributionid) ON DELETE CASCADE,
    signatorymemberid INTEGER REFERENCES groupmembers(memberid) ON DELETE CASCADE,
    decision VARCHAR(50),
    decisionnote TEXT,
    decidedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(contributionid, signatorymemberid)
);

-- Loans table
CREATE TABLE loans (
    loanid SERIAL PRIMARY KEY,
    groupid INTEGER REFERENCES motshelogroups(groupid) ON DELETE CASCADE,
    borrowermemberid INTEGER REFERENCES groupmembers(memberid) ON DELETE CASCADE,
    principalamount DECIMAL(12,2) NOT NULL,
    interestrate DECIMAL(5,4) DEFAULT 0.20,
    outstandingbalance DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    purpose TEXT,
    requestedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    disbursedat TIMESTAMP,
    duedate DATE,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loan Approvals table
CREATE TABLE loanapprovals (
    loanapprovalid SERIAL PRIMARY KEY,
    loanid INTEGER REFERENCES loans(loanid) ON DELETE CASCADE,
    signatorymemberid INTEGER REFERENCES groupmembers(memberid) ON DELETE CASCADE,
    decision VARCHAR(50),
    decisionnote TEXT,
    decidedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(loanid, signatorymemberid)
);

-- Loan Repayments table
CREATE TABLE loanrepayments (
    repaymentid SERIAL PRIMARY KEY,
    loanid INTEGER REFERENCES loans(loanid) ON DELETE CASCADE,
    memberid INTEGER REFERENCES groupmembers(memberid) ON DELETE CASCADE,
    amountpaid DECIMAL(12,2) NOT NULL,
    repaymentdate DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'pending',
    proofofpayment TEXT,
    submittedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Repayment Approvals table
CREATE TABLE repaymentapprovals (
    repayapprovalid SERIAL PRIMARY KEY,
    repaymentid INTEGER REFERENCES loanrepayments(repaymentid) ON DELETE CASCADE,
    signatorymemberid INTEGER REFERENCES groupmembers(memberid) ON DELETE CASCADE,
    decision VARCHAR(50),
    decisionnote TEXT,
    decidedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(repaymentid, signatorymemberid)
);

-- Loan Interest Schedule table
CREATE TABLE loaninterestschedule (
    scheduleid SERIAL PRIMARY KEY,
    loanid INTEGER REFERENCES loans(loanid) ON DELETE CASCADE,
    periodmonth DATE NOT NULL,
    openingbalance DECIMAL(12,2) NOT NULL,
    interestcharged DECIMAL(12,2) NOT NULL,
    closingbalance DECIMAL(12,2) NOT NULL,
    isapplied BOOLEAN DEFAULT false,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(loanid, periodmonth)
);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Member Balances View
CREATE VIEW vw_member_balances AS
SELECT 
    gm.memberid,
    gm.groupid,
    gm.userid,
    u.firstname,
    u.lastname,
    u.email,
    gm.role,
    COUNT(DISTINCT mc.contributionid) AS totalcontributions,
    COALESCE(SUM(mc.amountpaid), 0) AS totalpaid,
    COALESCE(SUM(mc.amountdue), 0) AS totaldue,
    COALESCE(SUM(CASE WHEN mc.status = 'paid' THEN mc.amountpaid ELSE 0 END), 0) AS paidcontributions,
    COALESCE((
        SELECT SUM(l.outstandingbalance)
        FROM loans l
        WHERE l.borrowermemberid = gm.memberid AND l.status = 'active'
    ), 0) AS outstandingloans,
    COALESCE((
        SELECT SUM(l.principalamount)
        FROM loans l
        WHERE l.borrowermemberid = gm.memberid AND l.status IN ('active', 'settled')
    ), 0) AS totalloanstaken
FROM groupmembers gm
INNER JOIN users u ON u.userid = gm.userid
LEFT JOIN monthlycontributions mc ON mc.memberid = gm.memberid AND mc.status = 'paid'
WHERE gm.isactive = true
GROUP BY gm.memberid, gm.groupid, gm.userid, u.firstname, u.lastname, u.email, gm.role;

-- Year End Report View
CREATE VIEW vw_year_end_report AS
SELECT 
    gm.memberid,
    u.firstname,
    u.lastname,
    gm.groupid,
    mg.groupname,
    mg.yearstartdate,
    mg.yearenddate,
    COALESCE(SUM(mc.amountpaid), 0) AS totalcontributed,
    COALESCE(SUM(mc.amountdue), 0) AS totaldue,
    COALESCE((
        SELECT SUM(l.outstandingbalance)
        FROM loans l
        WHERE l.borrowermemberid = gm.memberid AND l.status = 'active'
    ), 0) AS outstandingloans,
    COALESCE((
        SELECT SUM(l.principalamount - l.outstandingbalance)
        FROM loans l
        WHERE l.borrowermemberid = gm.memberid
    ), 0) AS loansrepaid,
    (COALESCE(SUM(mc.amountpaid), 0) + 
     COALESCE((SELECT SUM(mc2.amountdue * 0.15) FROM monthlycontributions mc2 WHERE mc2.memberid = gm.memberid AND mc2.status = 'paid'), 0) -
     COALESCE((SELECT SUM(l.outstandingbalance) FROM loans l WHERE l.borrowermemberid = gm.memberid AND l.status = 'active'), 0)
    ) AS estimatedpayout
FROM groupmembers gm
INNER JOIN users u ON u.userid = gm.userid
INNER JOIN motshelogroups mg ON mg.groupid = gm.groupid
LEFT JOIN monthlycontributions mc ON mc.memberid = gm.memberid AND mc.contributionmonth LIKE CONCAT(EXTRACT(YEAR FROM mg.yearstartdate), '%') AND mc.status = 'paid'
WHERE gm.isactive = true
GROUP BY gm.memberid, gm.groupid, gm.userid, u.firstname, u.lastname, mg.groupname, mg.yearstartdate, mg.yearenddate;

-- ============================================================================
-- STORED PROCEDURES / FUNCTIONS
-- ============================================================================

-- Function to generate monthly contributions
CREATE OR REPLACE FUNCTION sp_generate_monthly_contributions(
    p_groupid INTEGER,
    p_periodmonth VARCHAR(20)
) RETURNS VOID AS $$
BEGIN
    INSERT INTO monthlycontributions (groupid, memberid, contributionmonth, amountdue, status)
    SELECT 
        p_groupid,
        gm.memberid,
        p_periodmonth,
        mg.monthlycontribution,
        'not_paid'
    FROM groupmembers gm
    CROSS JOIN motshelogroups mg
    WHERE gm.groupid = p_groupid 
      AND gm.isactive = true
      AND mg.groupid = p_groupid
      AND NOT EXISTS (
          SELECT 1 FROM monthlycontributions mc 
          WHERE mc.groupid = p_groupid 
            AND mc.memberid = gm.memberid 
            AND mc.contributionmonth = p_periodmonth
      )
    ON CONFLICT (groupid, memberid, contributionmonth) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to apply monthly loan interest
CREATE OR REPLACE FUNCTION sp_apply_monthly_loan_interest(
    p_groupid INTEGER,
    p_periodmonth DATE
) RETURNS VOID AS $$
BEGIN
    INSERT INTO loaninterestschedule (loanid, periodmonth, openingbalance, interestcharged, closingbalance)
    SELECT 
        l.loanid,
        p_periodmonth,
        l.outstandingbalance,
        l.outstandingbalance * l.interestrate,
        l.outstandingbalance + (l.outstandingbalance * l.interestrate)
    FROM loans l
    WHERE l.groupid = p_groupid 
      AND l.status = 'active'
      AND NOT EXISTS (
          SELECT 1 FROM loaninterestschedule lis 
          WHERE lis.loanid = l.loanid AND lis.periodmonth = p_periodmonth
      );
    
    UPDATE loans l
    SET outstandingbalance = outstandingbalance + (outstandingbalance * l.interestrate),
        updatedat = CURRENT_TIMESTAMP
    WHERE l.groupid = p_groupid 
      AND l.status = 'active';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_groupmembers_groupid ON groupmembers(groupid);
CREATE INDEX idx_groupmembers_userid ON groupmembers(userid);
CREATE INDEX idx_monthlycontributions_groupid ON monthlycontributions(groupid);
CREATE INDEX idx_monthlycontributions_memberid ON monthlycontributions(memberid);
CREATE INDEX idx_loans_groupid ON loans(groupid);
CREATE INDEX idx_loans_borrower ON loans(borrowermemberid);
CREATE INDEX idx_loans_status ON loans(status);

-- ============================================================================
-- SEED DATA (FOR TESTING)
-- ============================================================================

-- Insert test users (password: Password123 for all)
INSERT INTO users (firstname, lastname, email, phonenumber, passwordhash, nationalid) VALUES
('Kabo', 'Moeng', 'kabo.moeng@example.com', '+267 71234567', '$2b$10$rH0zXGJQ.yN7N8P5xKqQ8.vWZJ9K8N5xKqQ8.vWZJ9K8N5xKqQ8.vW', '123456789'),
('Selepe', 'Tau', 'selepe.tau@example.com', '+267 72345678', '$2b$10$rH0zXGJQ.yN7N8P5xKqQ8.vWZJ9K8N5xKqQ8.vWZJ9K8N5xKqQ8.vW', '234567890'),
('Neo', 'Sithole', 'neo.sithole@example.com', '+267 73456789', '$2b$10$rH0zXGJQ.yN7N8P5xKqQ8.vWZJ9K8N5xKqQ8.vWZJ9K8N5xKqQ8.vW', '345678901'),
('Thabo', 'Kerileng', 'thabo.kerileng@example.com', '+267 74567890', '$2b$10$rH0zXGJQ.yN7N8P5xKqQ8.vWZJ9K8N5xKqQ8.vWZJ9K8N5xKqQ8.vW', '456789012'),
('Lorato', 'Dube', 'lorato.dube@example.com', '+267 75678901', '$2b$10$rH0zXGJQ.yN7N8P5xKqQ8.vWZJ9K8N5xKqQ8.vWZJ9K8N5xKqQ8.vW', '567890123');

-- Insert test group
INSERT INTO motshelogroups (groupname, description, monthlycontribution, requiredinterest, loaninterestrate, yearstartdate, yearenddate, isactive, isopen, maxmembers) VALUES
('Kopano Savings Group', 'A community savings group focused on mutual financial support', 1000.00, 5000.00, 0.20, '2026-01-01', '2026-12-31', true, true, 12);

-- Make first two users signatories/admins
INSERT INTO groupmembers (groupid, userid, role, joindate) VALUES
(1, 1, 'admin', CURRENT_DATE),
(1, 2, 'signatory', CURRENT_DATE),
(1, 3, 'member', CURRENT_DATE),
(1, 4, 'member', CURRENT_DATE),
(1, 5, 'member', CURRENT_DATE);

-- Add signatories
INSERT INTO groupsignatories (groupid, memberid) VALUES
(1, 1),
(1, 2);

-- Generate test contributions for Jan-Mar 2026
SELECT sp_generate_monthly_contributions(1, 'Jan 2026');
SELECT sp_generate_monthly_contributions(1, 'Feb 2026');
SELECT sp_generate_monthly_contributions(1, 'Mar 2026');

-- Mark some contributions as paid
UPDATE monthlycontributions 
SET amountpaid = 1000, status = 'paid', updatedat = CURRENT_TIMESTAMP
WHERE contributionmonth IN ('Jan 2026', 'Feb 2026') AND memberid IN (1, 2, 3);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check tables created
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Check seed data
-- SELECT COUNT(*) FROM users;
-- SELECT COUNT(*) FROM motshelogroups;
-- SELECT COUNT(*) FROM groupmembers;
