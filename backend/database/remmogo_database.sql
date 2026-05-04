-- ============================================================
-- RE-MMOGO — PostgreSQL Database
-- Run this in your Render PostgreSQL console or any pg client
-- ============================================================

-- ============================================================
-- DROP TABLES (safe re-run)
-- ============================================================
DROP TABLE IF EXISTS loaninterestschedule   CASCADE;
DROP TABLE IF EXISTS repaymentapprovals     CASCADE;
DROP TABLE IF EXISTS loanrepayments         CASCADE;
DROP TABLE IF EXISTS loanapprovals          CASCADE;
DROP TABLE IF EXISTS loans                  CASCADE;
DROP TABLE IF EXISTS contributionapprovals  CASCADE;
DROP TABLE IF EXISTS monthlycontributions   CASCADE;
DROP TABLE IF EXISTS groupsignatories       CASCADE;
DROP TABLE IF EXISTS groupmembers           CASCADE;
DROP TABLE IF EXISTS motshelogroups         CASCADE;
DROP TABLE IF EXISTS users                  CASCADE;

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE users (
    userid          SERIAL PRIMARY KEY,
    firstname       VARCHAR(100)    NOT NULL,
    lastname        VARCHAR(100)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    phonenumber     VARCHAR(20),
    passwordhash    VARCHAR(512)    NOT NULL,
    nationalid      VARCHAR(50)     UNIQUE,
    isactive        BOOLEAN         NOT NULL DEFAULT TRUE,
    createdat       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updatedat       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. MOTSHELO GROUPS
-- ============================================================
CREATE TABLE motshelogroups (
    groupid             SERIAL PRIMARY KEY,
    groupname           VARCHAR(200)    NOT NULL,
    description         VARCHAR(500),
    monthlycontribution NUMERIC(10,2)   NOT NULL DEFAULT 1000.00,
    requiredinterest    NUMERIC(10,2)   NOT NULL DEFAULT 5000.00,
    loaninterestrate    NUMERIC(5,4)    NOT NULL DEFAULT 0.20,
    yearstartdate       DATE            NOT NULL,
    yearenddate         DATE            NOT NULL,
    isactive            BOOLEAN         NOT NULL DEFAULT TRUE,
    createdat           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updatedat           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_group_dates CHECK (yearenddate > yearstartdate)
);

-- ============================================================
-- 3. GROUP MEMBERS
-- ============================================================
CREATE TABLE groupmembers (
    memberid    SERIAL PRIMARY KEY,
    groupid     INT         NOT NULL REFERENCES motshelogroups(groupid),
    userid      INT         NOT NULL REFERENCES users(userid),
    role        VARCHAR(20) NOT NULL DEFAULT 'member',
    joindate    DATE        NOT NULL DEFAULT CURRENT_DATE,
    isactive    BOOLEAN     NOT NULL DEFAULT TRUE,
    createdat   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (groupid, userid),
    CONSTRAINT chk_member_role CHECK (role IN ('member', 'signatory', 'admin'))
);

-- ============================================================
-- 4. GROUP SIGNATORIES
-- ============================================================
CREATE TABLE groupsignatories (
    signatoryid SERIAL PRIMARY KEY,
    groupid     INT         NOT NULL REFERENCES motshelogroups(groupid),
    memberid    INT         NOT NULL REFERENCES groupmembers(memberid),
    assignedat  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    isactive    BOOLEAN     NOT NULL DEFAULT TRUE,
    UNIQUE (groupid, memberid)
);

-- Enforce max 2 active signatories per group
CREATE OR REPLACE FUNCTION check_max_signatories()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM groupsignatories
        WHERE groupid = NEW.groupid AND isactive = TRUE) > 2 THEN
        RAISE EXCEPTION 'A Motshelo group cannot have more than 2 active signatories.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_max_two_signatories
AFTER INSERT OR UPDATE ON groupsignatories
FOR EACH ROW EXECUTE FUNCTION check_max_signatories();

-- ============================================================
-- 5. MONTHLY CONTRIBUTIONS
-- ============================================================
CREATE TABLE monthlycontributions (
    contributionid      SERIAL PRIMARY KEY,
    groupid             INT             NOT NULL REFERENCES motshelogroups(groupid),
    memberid            INT             NOT NULL REFERENCES groupmembers(memberid),
    contributionmonth   DATE            NOT NULL,
    amountdue           NUMERIC(10,2)   NOT NULL DEFAULT 1000.00,
    amountpaid          NUMERIC(10,2)   NOT NULL DEFAULT 0.00,
    status              VARCHAR(20)     NOT NULL DEFAULT 'pending',
    submittedat         TIMESTAMPTZ,
    proofofpayment      VARCHAR(500),
    createdat           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updatedat           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    UNIQUE (groupid, memberid, contributionmonth),
    CONSTRAINT chk_contrib_status  CHECK (status IN ('pending','submitted','approved','rejected')),
    CONSTRAINT chk_contrib_amounts CHECK (amountpaid >= 0 AND amountdue > 0)
);

-- ============================================================
-- 6. CONTRIBUTION APPROVALS
-- ============================================================
CREATE TABLE contributionapprovals (
    approvalid          SERIAL PRIMARY KEY,
    contributionid      INT         NOT NULL REFERENCES monthlycontributions(contributionid),
    signatorymemberid   INT         NOT NULL REFERENCES groupmembers(memberid),
    decision            VARCHAR(10) NOT NULL,
    decisionnote        VARCHAR(500),
    decidedat           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (contributionid, signatorymemberid),
    CONSTRAINT chk_contrib_approval_decision CHECK (decision IN ('approved','rejected'))
);

-- ============================================================
-- 7. LOANS
-- ============================================================
CREATE TABLE loans (
    loanid              SERIAL PRIMARY KEY,
    groupid             INT             NOT NULL REFERENCES motshelogroups(groupid),
    borrowermemberid    INT             NOT NULL REFERENCES groupmembers(memberid),
    principalamount     NUMERIC(10,2)   NOT NULL,
    interestrate        NUMERIC(5,4)    NOT NULL DEFAULT 0.20,
    outstandingbalance  NUMERIC(10,2)   NOT NULL,
    status              VARCHAR(20)     NOT NULL DEFAULT 'pending_approval',
    requestedat         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    disbursedat         TIMESTAMPTZ,
    settledat           TIMESTAMPTZ,
    notes               VARCHAR(500),
    createdat           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updatedat           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_loan_principal CHECK (principalamount > 0),
    CONSTRAINT chk_loan_status    CHECK (status IN ('pending_approval','approved','rejected','disbursed','settled'))
);

-- ============================================================
-- 8. LOAN APPROVALS
-- ============================================================
CREATE TABLE loanapprovals (
    loanapprovalid      SERIAL PRIMARY KEY,
    loanid              INT         NOT NULL REFERENCES loans(loanid),
    signatorymemberid   INT         NOT NULL REFERENCES groupmembers(memberid),
    decision            VARCHAR(10) NOT NULL,
    decisionnote        VARCHAR(500),
    decidedat           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (loanid, signatorymemberid),
    CONSTRAINT chk_loan_approval_decision CHECK (decision IN ('approved','rejected'))
);

-- ============================================================
-- 9. LOAN REPAYMENTS
-- ============================================================
CREATE TABLE loanrepayments (
    repaymentid     SERIAL PRIMARY KEY,
    loanid          INT             NOT NULL REFERENCES loans(loanid),
    memberid        INT             NOT NULL REFERENCES groupmembers(memberid),
    amountpaid      NUMERIC(10,2)   NOT NULL,
    repaymentdate   DATE            NOT NULL DEFAULT CURRENT_DATE,
    status          VARCHAR(20)     NOT NULL DEFAULT 'submitted',
    proofofpayment  VARCHAR(500),
    submittedat     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    createdat       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updatedat       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_repayment_amount CHECK (amountpaid > 0),
    CONSTRAINT chk_repayment_status CHECK (status IN ('submitted','approved','rejected'))
);

-- ============================================================
-- 10. REPAYMENT APPROVALS
-- ============================================================
CREATE TABLE repaymentapprovals (
    repayapprovalid     SERIAL PRIMARY KEY,
    repaymentid         INT         NOT NULL REFERENCES loanrepayments(repaymentid),
    signatorymemberid   INT         NOT NULL REFERENCES groupmembers(memberid),
    decision            VARCHAR(10) NOT NULL,
    decisionnote        VARCHAR(500),
    decidedat           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (repaymentid, signatorymemberid),
    CONSTRAINT chk_repay_approval_decision CHECK (decision IN ('approved','rejected'))
);

-- ============================================================
-- 11. LOAN INTEREST SCHEDULE
-- ============================================================
CREATE TABLE loaninterestschedule (
    scheduleid      SERIAL PRIMARY KEY,
    loanid          INT             NOT NULL REFERENCES loans(loanid),
    periodmonth     DATE            NOT NULL,
    openingbalance  NUMERIC(10,2)   NOT NULL,
    interestcharged NUMERIC(10,2)   NOT NULL,
    closingbalance  NUMERIC(10,2)   NOT NULL,
    createdat       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    UNIQUE (loanid, periodmonth)
);

-- ============================================================
-- 12. VIEW: MEMBER BALANCES
-- ============================================================
CREATE OR REPLACE VIEW vw_member_balances AS
SELECT
    gm.memberid,
    gm.groupid,
    u.firstname || ' ' || u.lastname                            AS membername,
    u.email,
    gm.role,
    COALESCE(SUM(CASE WHEN mc.status = 'approved' THEN mc.amountpaid ELSE 0 END), 0)
                                                                AS totalcontributionspaid,
    COALESCE(SUM(mc.amountdue), 0)                              AS totalcontributionsdue,
    COALESCE(SUM(mc.amountdue), 0)
        - COALESCE(SUM(CASE WHEN mc.status = 'approved' THEN mc.amountpaid ELSE 0 END), 0)
                                                                AS contributionbalance,
    COALESCE((
        SELECT SUM(l.outstandingbalance)
        FROM loans l
        WHERE l.borrowermemberid = gm.memberid
          AND l.groupid          = gm.groupid
          AND l.status           = 'disbursed'
    ), 0)                                                       AS activeloanbalance,
    COALESCE((
        SELECT SUM(lis.interestcharged)
        FROM loaninterestschedule lis
        INNER JOIN loans l ON l.loanid = lis.loanid
        WHERE l.borrowermemberid = gm.memberid
          AND l.groupid          = gm.groupid
    ), 0)                                                       AS totalinterestaccrued
FROM groupmembers gm
INNER JOIN users u ON u.userid = gm.userid
LEFT  JOIN monthlycontributions mc ON mc.memberid = gm.memberid AND mc.groupid = gm.groupid
GROUP BY gm.memberid, gm.groupid, u.firstname, u.lastname, u.email, gm.role;

-- ============================================================
-- 13. VIEW: YEAR-END REPORT
-- ============================================================
CREATE OR REPLACE VIEW vw_year_end_report AS
SELECT
    mg.groupid,
    mg.groupname,
    mg.yearstartdate,
    mg.yearenddate,
    mb.memberid,
    mb.membername,
    mb.totalcontributionspaid,
    mb.totalcontributionsdue,
    mb.contributionbalance,
    mb.activeloanbalance,
    mb.totalinterestaccrued,
    CASE WHEN mb.totalinterestaccrued >= mg.requiredinterest THEN 'Yes' ELSE 'No' END AS metinteresttarget,
    mb.totalcontributionspaid - mb.activeloanbalance AS estimatedpayout
FROM vw_member_balances mb
INNER JOIN motshelogroups mg ON mg.groupid = mb.groupid;

-- ============================================================
-- 14. FUNCTION: Generate Monthly Contributions
-- ============================================================
CREATE OR REPLACE FUNCTION sp_generate_monthly_contributions(p_groupid INT, p_periodmonth DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO monthlycontributions (groupid, memberid, contributionmonth, amountdue, status)
    SELECT gm.groupid, gm.memberid, p_periodmonth, mg.monthlycontribution, 'pending'
    FROM groupmembers gm
    INNER JOIN motshelogroups mg ON mg.groupid = gm.groupid
    WHERE gm.groupid = p_groupid AND gm.isactive = TRUE
      AND NOT EXISTS (
          SELECT 1 FROM monthlycontributions mc
          WHERE mc.groupid = p_groupid
            AND mc.memberid = gm.memberid
            AND mc.contributionmonth = p_periodmonth
      );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 15. FUNCTION: Apply Monthly Loan Interest
-- ============================================================
CREATE OR REPLACE FUNCTION sp_apply_monthly_loan_interest(p_groupid INT, p_periodmonth DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO loaninterestschedule (loanid, periodmonth, openingbalance, interestcharged, closingbalance)
    SELECT
        l.loanid,
        p_periodmonth,
        l.outstandingbalance,
        ROUND(l.outstandingbalance * l.interestrate, 2),
        ROUND(l.outstandingbalance * (1 + l.interestrate), 2)
    FROM loans l
    WHERE l.groupid = p_groupid AND l.status = 'disbursed'
      AND NOT EXISTS (
          SELECT 1 FROM loaninterestschedule lis
          WHERE lis.loanid = l.loanid AND lis.periodmonth = p_periodmonth
      );

    UPDATE loans
    SET outstandingbalance = ROUND(outstandingbalance * (1 + interestrate), 2),
        updatedat          = NOW()
    WHERE groupid = p_groupid AND status = 'disbursed'
      AND EXISTS (
          SELECT 1 FROM loaninterestschedule lis
          WHERE lis.loanid = loans.loanid AND lis.periodmonth = p_periodmonth
      );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 16. FUNCTION: Approve Loan Repayment
-- ============================================================
CREATE OR REPLACE FUNCTION sp_approve_repayment(
    p_repaymentid       INT,
    p_signatorymemberid INT,
    p_decision          VARCHAR(10),
    p_decisionnote      VARCHAR(500) DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_approvalcount INT;
    v_amountpaid    NUMERIC(10,2);
    v_loanid        INT;
BEGIN
    INSERT INTO repaymentapprovals (repaymentid, signatorymemberid, decision, decisionnote)
    VALUES (p_repaymentid, p_signatorymemberid, p_decision, p_decisionnote);

    IF p_decision = 'rejected' THEN
        UPDATE loanrepayments SET status = 'rejected', updatedat = NOW()
        WHERE repaymentid = p_repaymentid;
        RETURN;
    END IF;

    IF p_decision = 'approved' THEN
        SELECT COUNT(*) INTO v_approvalcount
        FROM repaymentapprovals
        WHERE repaymentid = p_repaymentid AND decision = 'approved';

        IF v_approvalcount >= 2 THEN
            SELECT amountpaid, loanid INTO v_amountpaid, v_loanid
            FROM loanrepayments WHERE repaymentid = p_repaymentid;

            UPDATE loanrepayments SET status = 'approved', updatedat = NOW()
            WHERE repaymentid = p_repaymentid;

            UPDATE loans
            SET outstandingbalance = GREATEST(outstandingbalance - v_amountpaid, 0),
                status    = CASE WHEN outstandingbalance - v_amountpaid <= 0 THEN 'settled' ELSE status END,
                settledat = CASE WHEN outstandingbalance - v_amountpaid <= 0 THEN NOW() ELSE NULL END,
                updatedat = NOW()
            WHERE loanid = v_loanid;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 17. INDEXES
-- ============================================================
CREATE INDEX ix_groupmembers_groupid    ON groupmembers(groupid);
CREATE INDEX ix_groupmembers_userid     ON groupmembers(userid);
CREATE INDEX ix_contributions_groupid   ON monthlycontributions(groupid);
CREATE INDEX ix_contributions_memberid  ON monthlycontributions(memberid);
CREATE INDEX ix_contributions_month     ON monthlycontributions(contributionmonth);
CREATE INDEX ix_contributions_status    ON monthlycontributions(status);
CREATE INDEX ix_loans_groupid           ON loans(groupid);
CREATE INDEX ix_loans_borrowermemberid  ON loans(borrowermemberid);
CREATE INDEX ix_loans_status            ON loans(status);
CREATE INDEX ix_loanrepayments_loanid   ON loanrepayments(loanid);
CREATE INDEX ix_loanrepayments_status   ON loanrepayments(status);
CREATE INDEX ix_interestschedule_loanid ON loaninterestschedule(loanid);
CREATE INDEX ix_interestschedule_month  ON loaninterestschedule(periodmonth);

-- ============================================================
-- 18. SEED DATA
-- All 5 test users share the password: Password123
-- ============================================================
INSERT INTO users (firstname, lastname, email, phonenumber, passwordhash, nationalid) VALUES
    ('Kagiso',     'Molefe',  'kagiso@remmogo.bw', '+26771234567', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '123456789'),
    ('Naledi',     'Dikgang', 'naledi@remmogo.bw', '+26772345678', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '234567890'),
    ('Thabo',      'Sithole', 'thabo@remmogo.bw',  '+26773456789', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '345678901'),
    ('Keitumetse', 'Tau',     'keitu@remmogo.bw',  '+26774567890', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '456789012'),
    ('Mpho',       'Kgosi',   'mpho@remmogo.bw',   '+26775678901', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '567890123');

INSERT INTO motshelogroups (groupname, description, monthlycontribution, requiredinterest, loaninterestrate, yearstartdate, yearenddate)
VALUES ('Kopano Savings Group', 'Gaborone neighbourhood motshelo group 2025', 1000.00, 5000.00, 0.20, '2025-01-01', '2025-12-31');

INSERT INTO groupmembers (groupid, userid, role, joindate) VALUES
    (1, 1, 'signatory', '2025-01-01'),
    (1, 2, 'signatory', '2025-01-01'),
    (1, 3, 'member',    '2025-01-01'),
    (1, 4, 'member',    '2025-01-01'),
    (1, 5, 'member',    '2025-01-01');

INSERT INTO groupsignatories (groupid, memberid) VALUES (1, 1), (1, 2);

SELECT sp_generate_monthly_contributions(1, '2025-01-01');
SELECT sp_generate_monthly_contributions(1, '2025-02-01');
SELECT sp_generate_monthly_contributions(1, '2025-03-01');

-- ============================================================
-- DONE. Database is ready.
-- ============================================================
