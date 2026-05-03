-- ============================================================
-- RE-MMOGO MOTSHELO WEB APP - SQL SERVER DATABASE SCHEMA
-- INFS 202 Group Project

USE master;
GO

-- Create the database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'ReMmogoDB')
BEGIN
    CREATE DATABASE ReMmogoDB;
END
GO

USE ReMmogoDB;
GO

-- 1. USERS TABLE
CREATE TABLE Users (
    UserID          INT IDENTITY(1,1) PRIMARY KEY,
    FirstName       NVARCHAR(100)   NOT NULL,
    LastName        NVARCHAR(100)   NOT NULL,
    Email           NVARCHAR(255)   NOT NULL UNIQUE,
    PhoneNumber     NVARCHAR(20)    NULL,
    PasswordHash    NVARCHAR(512)   NOT NULL,   -- bcrypt/argon2 hash
    NationalID      NVARCHAR(50)    NULL UNIQUE, -- optional identity number
    IsActive        BIT             NOT NULL DEFAULT 1,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETDATE(),
    UpdatedAt       DATETIME2       NOT NULL DEFAULT GETDATE()
);
GO

-- 2. MOTSHELO GROUPS TABLE
CREATE TABLE MotsheloGroups (
    GroupID             INT IDENTITY(1,1) PRIMARY KEY,
    GroupName           NVARCHAR(200)   NOT NULL,
    Description         NVARCHAR(500)   NULL,
    MonthlyContribution DECIMAL(10,2)   NOT NULL DEFAULT 1000.00,  -- P1000 per month
    RequiredInterest    DECIMAL(10,2)   NOT NULL DEFAULT 5000.00,  -- P5000 interest/year
    LoanInterestRate    DECIMAL(5,4)    NOT NULL DEFAULT 0.20,     -- 20% per month
    YearStartDate       DATE            NOT NULL,
    YearEndDate         DATE            NOT NULL,
    IsActive            BIT             NOT NULL DEFAULT 1,
    CreatedAt           DATETIME2       NOT NULL DEFAULT GETDATE(),
    UpdatedAt           DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT CHK_GroupDates CHECK (YearEndDate > YearStartDate)
);
GO

-- ============================================================
-- 3. GROUP MEMBERS TABLE
-- Many memmbers can be in many groups and many groups can have many members
-- To fix that we have the group members table which links users to groups and tracks their role (member/signatory/admin)
-- ============================================================
CREATE TABLE GroupMembers (
    MemberID        INT IDENTITY(1,1) PRIMARY KEY,
    GroupID         INT             NOT NULL,
    UserID          INT             NOT NULL,
    Role            NVARCHAR(20)    NOT NULL DEFAULT 'member',
    -- 'member' | 'signatory' | 'admin'
    JoinDate        DATE            NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    IsActive        BIT             NOT NULL DEFAULT 1,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_GroupMembers_Group  FOREIGN KEY (GroupID) REFERENCES MotsheloGroups(GroupID),
    CONSTRAINT FK_GroupMembers_User   FOREIGN KEY (UserID)  REFERENCES Users(UserID),
    CONSTRAINT UQ_GroupMember         UNIQUE (GroupID, UserID),
    CONSTRAINT CHK_MemberRole         CHECK (Role IN ('member', 'signatory', 'admin'))
);
GO

-- ============================================================
-- 4. SIGNATORIES TABLE
-- Tracks the exactly two signatories per group
-- ============================================================
CREATE TABLE GroupSignatories (
    SignatoryID     INT IDENTITY(1,1) PRIMARY KEY,
    GroupID         INT             NOT NULL,
    MemberID        INT             NOT NULL,   -- must be a GroupMember with role='signatory'
    AssignedAt      DATETIME2       NOT NULL DEFAULT GETDATE(),
    IsActive        BIT             NOT NULL DEFAULT 1,

    CONSTRAINT FK_Signatories_Group  FOREIGN KEY (GroupID)  REFERENCES MotsheloGroups(GroupID),
    CONSTRAINT FK_Signatories_Member FOREIGN KEY (MemberID) REFERENCES GroupMembers(MemberID),
    CONSTRAINT UQ_Signatory          UNIQUE (GroupID, MemberID)
);
GO

-- Enforce max 2 active signatories per group
CREATE OR ALTER TRIGGER TRG_MaxTwoSignatories
ON GroupSignatories
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (
        SELECT GroupID
        FROM GroupSignatories
        WHERE IsActive = 1
        GROUP BY GroupID
        HAVING COUNT(*) > 2
    )
    BEGIN
        RAISERROR('A Motshelo group cannot have more than 2 active signatories.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- ============================================================
-- 5. MONTHLY CONTRIBUTIONS TABLE
-- Each member's P1000 monthly contribution record
-- ============================================================
CREATE TABLE MonthlyContributions (
    ContributionID      INT IDENTITY(1,1) PRIMARY KEY,
    GroupID             INT             NOT NULL,
    MemberID            INT             NOT NULL,
    ContributionMonth   DATE            NOT NULL,  -- first day of the month, e.g. 2025-01-01
    AmountDue           DECIMAL(10,2)   NOT NULL DEFAULT 1000.00,
    AmountPaid          DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    Status              NVARCHAR(20)    NOT NULL DEFAULT 'pending',
    -- 'pending' | 'submitted' | 'approved' | 'rejected'
    SubmittedAt         DATETIME2       NULL,       -- when member clicked "I have paid"
    ProofOfPayment      NVARCHAR(500)   NULL,       -- file path / URL to uploaded proof
    CreatedAt           DATETIME2       NOT NULL DEFAULT GETDATE(),
    UpdatedAt           DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Contributions_Group  FOREIGN KEY (GroupID)  REFERENCES MotsheloGroups(GroupID),
    CONSTRAINT FK_Contributions_Member FOREIGN KEY (MemberID) REFERENCES GroupMembers(MemberID),
    CONSTRAINT UQ_MemberMonthContrib   UNIQUE (GroupID, MemberID, ContributionMonth),
    CONSTRAINT CHK_ContribStatus       CHECK (Status IN ('pending', 'submitted', 'approved', 'rejected')),
    CONSTRAINT CHK_ContribAmounts      CHECK (AmountPaid >= 0 AND AmountDue > 0)
);
GO

-- ============================================================
-- 6. CONTRIBUTION APPROVALS TABLE
-- Tracks which signatories approved a contribution payment
-- ============================================================
CREATE TABLE ContributionApprovals (
    ApprovalID          INT IDENTITY(1,1) PRIMARY KEY,
    ContributionID      INT             NOT NULL,
    SignatoryMemberID   INT             NOT NULL,   -- GroupMembers.MemberID of signatory
    Decision            NVARCHAR(10)    NOT NULL,   -- 'approved' | 'rejected'
    DecisionNote        NVARCHAR(500)   NULL,
    DecidedAt           DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_ContribApproval_Contribution FOREIGN KEY (ContributionID) REFERENCES MonthlyContributions(ContributionID),
    CONSTRAINT FK_ContribApproval_Signatory    FOREIGN KEY (SignatoryMemberID) REFERENCES GroupMembers(MemberID),
    CONSTRAINT UQ_ContribApprovalPerSignatory  UNIQUE (ContributionID, SignatoryMemberID),
    CONSTRAINT CHK_ContribApprovalDecision     CHECK (Decision IN ('approved', 'rejected'))
);
GO

-- ============================================================
-- 7. LOANS TABLE
-- Records each loan taken by a member
-- ============================================================
CREATE TABLE Loans (
    LoanID              INT IDENTITY(1,1) PRIMARY KEY,
    GroupID             INT             NOT NULL,
    BorrowerMemberID    INT             NOT NULL,
    PrincipalAmount     DECIMAL(10,2)   NOT NULL,
    InterestRate        DECIMAL(5,4)    NOT NULL DEFAULT 0.20,   -- 20% per month
    OutstandingBalance  DECIMAL(10,2)   NOT NULL,                -- updated each month
    Status              NVARCHAR(20)    NOT NULL DEFAULT 'pending_approval',
    -- 'pending_approval' | 'approved' | 'rejected' | 'disbursed' | 'settled'
    RequestedAt         DATETIME2       NOT NULL DEFAULT GETDATE(),
    DisbursedAt         DATETIME2       NULL,
    SettledAt           DATETIME2       NULL,
    Notes               NVARCHAR(500)   NULL,
    CreatedAt           DATETIME2       NOT NULL DEFAULT GETDATE(),
    UpdatedAt           DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Loans_Group    FOREIGN KEY (GroupID)          REFERENCES MotsheloGroups(GroupID),
    CONSTRAINT FK_Loans_Borrower FOREIGN KEY (BorrowerMemberID) REFERENCES GroupMembers(MemberID),
    CONSTRAINT CHK_LoanPrincipal CHECK (PrincipalAmount > 0),
    CONSTRAINT CHK_LoanStatus    CHECK (Status IN ('pending_approval','approved','rejected','disbursed','settled'))
);
GO

-- ============================================================
-- 8. LOAN APPROVALS TABLE
-- Each signatory's approval/rejection of a loan request
-- Both signatories must approve before disbursement
-- ============================================================
CREATE TABLE LoanApprovals (
    LoanApprovalID      INT IDENTITY(1,1) PRIMARY KEY,
    LoanID              INT             NOT NULL,
    SignatoryMemberID   INT             NOT NULL,
    Decision            NVARCHAR(10)    NOT NULL,   -- 'approved' | 'rejected'
    DecisionNote        NVARCHAR(500)   NULL,
    DecidedAt           DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_LoanApproval_Loan      FOREIGN KEY (LoanID)            REFERENCES Loans(LoanID),
    CONSTRAINT FK_LoanApproval_Signatory FOREIGN KEY (SignatoryMemberID) REFERENCES GroupMembers(MemberID),
    CONSTRAINT UQ_LoanApprovalPerSign    UNIQUE (LoanID, SignatoryMemberID),
    CONSTRAINT CHK_LoanApprovalDecision  CHECK (Decision IN ('approved', 'rejected'))
);
GO

-- ============================================================
-- 9. LOAN REPAYMENTS TABLE
-- Records each repayment event by borrower
-- Must be approved by signatories before balance is updated
-- ============================================================
CREATE TABLE LoanRepayments (
    RepaymentID         INT IDENTITY(1,1) PRIMARY KEY,
    LoanID              INT             NOT NULL,
    MemberID            INT             NOT NULL,   -- member making the repayment
    AmountPaid          DECIMAL(10,2)   NOT NULL,
    RepaymentDate       DATE            NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    Status              NVARCHAR(20)    NOT NULL DEFAULT 'submitted',
    -- 'submitted' | 'approved' | 'rejected'
    ProofOfPayment      NVARCHAR(500)   NULL,       -- file path / URL to proof
    SubmittedAt         DATETIME2       NOT NULL DEFAULT GETDATE(),
    CreatedAt           DATETIME2       NOT NULL DEFAULT GETDATE(),
    UpdatedAt           DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Repayment_Loan   FOREIGN KEY (LoanID)   REFERENCES Loans(LoanID),
    CONSTRAINT FK_Repayment_Member FOREIGN KEY (MemberID) REFERENCES GroupMembers(MemberID),
    CONSTRAINT CHK_RepaymentAmount CHECK (AmountPaid > 0),
    CONSTRAINT CHK_RepaymentStatus CHECK (Status IN ('submitted', 'approved', 'rejected'))
);
GO

-- ============================================================
-- 10. LOAN REPAYMENT APPROVALS TABLE
-- Signatories approve/reject each repayment submission
-- ============================================================
CREATE TABLE RepaymentApprovals (
    RepayApprovalID     INT IDENTITY(1,1) PRIMARY KEY,
    RepaymentID         INT             NOT NULL,
    SignatoryMemberID   INT             NOT NULL,
    Decision            NVARCHAR(10)    NOT NULL,
    DecisionNote        NVARCHAR(500)   NULL,
    DecidedAt           DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_RepayApproval_Repayment  FOREIGN KEY (RepaymentID)       REFERENCES LoanRepayments(RepaymentID),
    CONSTRAINT FK_RepayApproval_Signatory  FOREIGN KEY (SignatoryMemberID) REFERENCES GroupMembers(MemberID),
    CONSTRAINT UQ_RepayApprovalPerSign     UNIQUE (RepaymentID, SignatoryMemberID),
    CONSTRAINT CHK_RepayApprovalDecision   CHECK (Decision IN ('approved', 'rejected'))
);
GO

-- ============================================================
-- 11. LOAN INTEREST SCHEDULE TABLE
-- Monthly interest accrual log per loan (20% on balance each month)
-- ============================================================
CREATE TABLE LoanInterestSchedule (
    ScheduleID          INT IDENTITY(1,1) PRIMARY KEY,
    LoanID              INT             NOT NULL,
    PeriodMonth         DATE            NOT NULL,   -- first day of the month
    OpeningBalance      DECIMAL(10,2)   NOT NULL,
    InterestCharged     DECIMAL(10,2)   NOT NULL,   -- 20% of opening balance
    ClosingBalance      DECIMAL(10,2)   NOT NULL,
    CreatedAt           DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_InterestSchedule_Loan FOREIGN KEY (LoanID) REFERENCES Loans(LoanID),
    CONSTRAINT UQ_LoanMonthInterest     UNIQUE (LoanID, PeriodMonth)
);
GO

-- ============================================================
-- 12. MEMBER BALANCES VIEW
-- Convenience view: running totals per member per group
-- ============================================================
CREATE OR ALTER VIEW vw_MemberBalances AS
SELECT
    gm.MemberID,
    gm.GroupID,
    u.FirstName + ' ' + u.LastName                          AS MemberName,
    u.Email,
    gm.Role,

    -- Total contributions approved
    ISNULL(SUM(CASE WHEN mc.Status = 'approved' THEN mc.AmountPaid ELSE 0 END), 0)
                                                            AS TotalContributionsPaid,

    -- Total contributions due (all months up to today)
    ISNULL(SUM(mc.AmountDue), 0)                            AS TotalContributionsDue,

    -- Outstanding contribution balance
    ISNULL(SUM(mc.AmountDue), 0)
        - ISNULL(SUM(CASE WHEN mc.Status = 'approved' THEN mc.AmountPaid ELSE 0 END), 0)
                                                            AS ContributionBalance,

    -- Active loan balance
    ISNULL((
        SELECT SUM(l.OutstandingBalance)
        FROM Loans l
        WHERE l.BorrowerMemberID = gm.MemberID
          AND l.GroupID          = gm.GroupID
          AND l.Status           = 'disbursed'
    ), 0)                                                   AS ActiveLoanBalance,

    -- Total interest paid on loans
    ISNULL((
        SELECT SUM(lis.InterestCharged)
        FROM LoanInterestSchedule lis
        INNER JOIN Loans l ON l.LoanID = lis.LoanID
        WHERE l.BorrowerMemberID = gm.MemberID
          AND l.GroupID          = gm.GroupID
    ), 0)                                                   AS TotalInterestAccrued

FROM GroupMembers gm
INNER JOIN Users             u  ON u.UserID  = gm.UserID
LEFT  JOIN MonthlyContributions mc ON mc.MemberID = gm.MemberID
                                  AND mc.GroupID  = gm.GroupID
GROUP BY
    gm.MemberID, gm.GroupID,
    u.FirstName, u.LastName, u.Email, gm.Role;
GO

-- ============================================================
-- 13. YEAR-END REPORT VIEW
-- Summary for end-of-year payout calculation
-- ============================================================
CREATE OR ALTER VIEW vw_YearEndReport AS
SELECT
    mg.GroupID,
    mg.GroupName,
    mg.YearStartDate,
    mg.YearEndDate,
    mb.MemberID,
    mb.MemberName,
    mb.TotalContributionsPaid,
    mb.TotalContributionsDue,
    mb.ContributionBalance,
    mb.ActiveLoanBalance,
    mb.TotalInterestAccrued,

    -- Has member met the P5000 interest requirement?
    CASE WHEN mb.TotalInterestAccrued >= mg.RequiredInterest
         THEN 'Yes' ELSE 'No'
    END                                                     AS MetInterestTarget,

    -- Estimated year-end payout:
    -- contributions paid - outstanding loan balance
    mb.TotalContributionsPaid - mb.ActiveLoanBalance        AS EstimatedPayout

FROM vw_MemberBalances mb
INNER JOIN MotsheloGroups mg ON mg.GroupID = mb.GroupID;
GO

-- ============================================================
-- 14. STORED PROCEDURE: Apply Monthly Loan Interest
-- Run this once per month for each active loan
-- ============================================================
CREATE OR ALTER PROCEDURE sp_ApplyMonthlyLoanInterest
    @GroupID    INT,
    @PeriodMonth DATE   -- pass the first day of the month, e.g. '2025-02-01'
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        -- For every disbursed loan in the group, calculate and record interest
        INSERT INTO LoanInterestSchedule (LoanID, PeriodMonth, OpeningBalance, InterestCharged, ClosingBalance)
        SELECT
            l.LoanID,
            @PeriodMonth,
            l.OutstandingBalance                                AS OpeningBalance,
            ROUND(l.OutstandingBalance * l.InterestRate, 2)    AS InterestCharged,
            ROUND(l.OutstandingBalance * (1 + l.InterestRate), 2) AS ClosingBalance
        FROM Loans l
        WHERE l.GroupID = @GroupID
          AND l.Status  = 'disbursed'
          AND NOT EXISTS (
              SELECT 1 FROM LoanInterestSchedule lis
              WHERE lis.LoanID = l.LoanID AND lis.PeriodMonth = @PeriodMonth
          );

        -- Update outstanding balances on the loans
        UPDATE l
        SET l.OutstandingBalance = ROUND(l.OutstandingBalance * (1 + l.InterestRate), 2),
            l.UpdatedAt          = GETDATE()
        FROM Loans l
        WHERE l.GroupID = @GroupID
          AND l.Status  = 'disbursed'
          AND EXISTS (
              SELECT 1 FROM LoanInterestSchedule lis
              WHERE lis.LoanID = l.LoanID AND lis.PeriodMonth = @PeriodMonth
          );

        COMMIT TRANSACTION;
        PRINT 'Monthly interest applied successfully for period: ' + CAST(@PeriodMonth AS NVARCHAR);
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ============================================================
-- 15. STORED PROCEDURE: Approve Loan Repayment
-- Called when a signatory approves a repayment
-- Automatically settles loan if balance reaches zero
-- ============================================================
CREATE OR ALTER PROCEDURE sp_ApproveRepayment
    @RepaymentID        INT,
    @SignatoryMemberID  INT,
    @Decision           NVARCHAR(10),   -- 'approved' | 'rejected'
    @DecisionNote       NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        -- 1. Record this signatory's decision
        INSERT INTO RepaymentApprovals (RepaymentID, SignatoryMemberID, Decision, DecisionNote)
        VALUES (@RepaymentID, @SignatoryMemberID, @Decision, @DecisionNote);

        -- 2. If rejected, mark the repayment as rejected
        IF @Decision = 'rejected'
        BEGIN
            UPDATE LoanRepayments
            SET Status = 'rejected', UpdatedAt = GETDATE()
            WHERE RepaymentID = @RepaymentID;
        END

        -- 3. If both signatories have now approved → apply payment
        IF @Decision = 'approved'
        BEGIN
            DECLARE @ApprovalCount INT;
            SELECT @ApprovalCount = COUNT(*)
            FROM RepaymentApprovals
            WHERE RepaymentID = @RepaymentID AND Decision = 'approved';

            IF @ApprovalCount >= 2
            BEGIN
                DECLARE @AmountPaid DECIMAL(10,2), @LoanID INT;
                SELECT @AmountPaid = AmountPaid, @LoanID = LoanID
                FROM LoanRepayments WHERE RepaymentID = @RepaymentID;

                -- Mark repayment as approved
                UPDATE LoanRepayments
                SET Status = 'approved', UpdatedAt = GETDATE()
                WHERE RepaymentID = @RepaymentID;

                -- Reduce loan outstanding balance
                UPDATE Loans
                SET OutstandingBalance = CASE
                        WHEN OutstandingBalance - @AmountPaid <= 0 THEN 0
                        ELSE OutstandingBalance - @AmountPaid
                    END,
                    Status = CASE
                        WHEN OutstandingBalance - @AmountPaid <= 0 THEN 'settled'
                        ELSE Status
                    END,
                    SettledAt = CASE
                        WHEN OutstandingBalance - @AmountPaid <= 0 THEN GETDATE()
                        ELSE NULL
                    END,
                    UpdatedAt = GETDATE()
                WHERE LoanID = @LoanID;
            END
        END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ============================================================
-- 16. STORED PROCEDURE: Generate Member Contribution Schedule
-- Auto-creates pending contribution rows for all members
-- for a given month
-- ============================================================
CREATE OR ALTER PROCEDURE sp_GenerateMonthlyContributions
    @GroupID        INT,
    @PeriodMonth    DATE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO MonthlyContributions (GroupID, MemberID, ContributionMonth, AmountDue, Status)
    SELECT
        gm.GroupID,
        gm.MemberID,
        @PeriodMonth,
        mg.MonthlyContribution,
        'pending'
    FROM GroupMembers gm
    INNER JOIN MotsheloGroups mg ON mg.GroupID = gm.GroupID
    WHERE gm.GroupID = @GroupID
      AND gm.IsActive = 1
      AND NOT EXISTS (
          SELECT 1 FROM MonthlyContributions mc
          WHERE mc.GroupID = @GroupID
            AND mc.MemberID = gm.MemberID
            AND mc.ContributionMonth = @PeriodMonth
      );

    PRINT 'Contribution records generated for ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' members.';
END;
GO

-- ============================================================
-- 17. INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IX_GroupMembers_GroupID   ON GroupMembers(GroupID);
CREATE INDEX IX_GroupMembers_UserID    ON GroupMembers(UserID);

CREATE INDEX IX_Contributions_GroupID  ON MonthlyContributions(GroupID);
CREATE INDEX IX_Contributions_MemberID ON MonthlyContributions(MemberID);
CREATE INDEX IX_Contributions_Month    ON MonthlyContributions(ContributionMonth);
CREATE INDEX IX_Contributions_Status   ON MonthlyContributions(Status);

CREATE INDEX IX_Loans_GroupID          ON Loans(GroupID);
CREATE INDEX IX_Loans_BorrowerMemberID ON Loans(BorrowerMemberID);
CREATE INDEX IX_Loans_Status           ON Loans(Status);

CREATE INDEX IX_LoanRepayments_LoanID  ON LoanRepayments(LoanID);
CREATE INDEX IX_LoanRepayments_Status  ON LoanRepayments(Status);

CREATE INDEX IX_InterestSchedule_LoanID ON LoanInterestSchedule(LoanID);
CREATE INDEX IX_InterestSchedule_Month  ON LoanInterestSchedule(PeriodMonth);
GO

-- ============================================================
-- 18. SAMPLE SEED DATA (for development & testing)
-- ============================================================

-- Users (passwords here are placeholders — hash before inserting in app)
INSERT INTO Users (FirstName, LastName, Email, PhoneNumber, PasswordHash, NationalID)
VALUES
    ('Kagiso',   'Molefe',  'kagiso@remmogo.bw',  '+26771234567', '$2b$12$placeholder_hash_1', '123456789'),
    ('Naledi',   'Dikgang', 'naledi@remmogo.bw',  '+26772345678', '$2b$12$placeholder_hash_2', '234567890'),
    ('Thabo',    'Sithole', 'thabo@remmogo.bw',   '+26773456789', '$2b$12$placeholder_hash_3', '345678901'),
    ('Keitumetse','Tau',    'keitu@remmogo.bw',   '+26774567890', '$2b$12$placeholder_hash_4', '456789012'),
    ('Mpho',     'Kgosi',   'mpho@remmogo.bw',    '+26775678901', '$2b$12$placeholder_hash_5', '567890123');
GO

-- Motshelo Group
INSERT INTO MotsheloGroups (GroupName, Description, MonthlyContribution, RequiredInterest, LoanInterestRate, YearStartDate, YearEndDate)
VALUES ('Kopano Savings Group', 'Gaborone neighbourhood motshelo group 2025', 1000.00, 5000.00, 0.20, '2025-01-01', '2025-12-31');
GO

-- Enrol members (first two are signatories)
INSERT INTO GroupMembers (GroupID, UserID, Role, JoinDate)
VALUES
    (1, 1, 'signatory', '2025-01-01'),
    (1, 2, 'signatory', '2025-01-01'),
    (1, 3, 'member',    '2025-01-01'),
    (1, 4, 'member',    '2025-01-01'),
    (1, 5, 'member',    '2025-01-01');
GO

-- Assign signatories
INSERT INTO GroupSignatories (GroupID, MemberID)
VALUES (1, 1), (1, 2);
GO

-- Generate January 2025 contributions for all members
EXEC sp_GenerateMonthlyContributions @GroupID = 1, @PeriodMonth = '2025-01-01';
GO

-- ============================================================
-- SCHEMA SUMMARY
-- ============================================================
-- Tables:
--   Users                    - System accounts
--   MotsheloGroups           - Savings circles
--   GroupMembers             - Membership & roles
--   GroupSignatories         - The two approvers
--   MonthlyContributions     - P1000/month per member
--   ContributionApprovals    - Signatory sign-off on payments
--   Loans                    - Borrowing records
--   LoanApprovals            - Both signatories must approve
--   LoanRepayments           - Member repayment submissions
--   RepaymentApprovals       - Signatory sign-off on repayments
--   LoanInterestSchedule     - 20% monthly interest accrual log
--
-- Views:
--   vw_MemberBalances        - Per-member running totals
--   vw_YearEndReport         - Year-end payout calculation
--
-- Stored Procedures:
--   sp_ApplyMonthlyLoanInterest     - Accrue 20% interest monthly
--   sp_ApproveRepayment             - Dual-signatory repayment flow
--   sp_GenerateMonthlyContributions - Auto-create monthly rows
-- ============================================================