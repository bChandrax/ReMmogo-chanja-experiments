# How to Run Database Setup in pgAdmin

## Step-by-Step Instructions

### Step 1: Open pgAdmin
1. Launch **pgAdmin** on your computer
2. Connect to your PostgreSQL server (if not already connected)

### Step 2: Connect to Render PostgreSQL

**Option A: If you already have the server configured**
1. In the left sidebar, find your **Render PostgreSQL** server
2. Click to expand it
3. Click on the **remmogo** database

**Option B: If you need to add the server**
1. Right-click **Servers** in the left sidebar
2. Select **Register** → **Server...**
3. **General tab**:
   - Name: `Render - ReMmogo`
4. **Connection tab**:
   - Host name/address: `dpg-d7t40p8sfn5c73aiq7j0-a.virginia-postgres.render.com`
   - Port: `5432`
   - Maintenance database: `remmogo`
   - Username: `remmogo_user`
   - Password: `UF3ZQitedyJDwmVkL2ZLPrK0Znwp9KKH`
   - Check **Save password?**
5. **SSL tab** (if available):
   - SSL mode: `Require`
6. Click **Save**

### Step 3: Open Query Tool
1. Right-click on the **remmogo** database
2. Select **Query Tool** (or click the Query Tool icon in the toolbar)

### Step 4: Load the SQL Script
1. In the Query Tool, click the **folder icon** (Open File) in the toolbar
2. Navigate to: `C:\Users\Administrator\re-mmogo\backend\database\setup-production.sql`
3. Select the file and click **Open**
4. The entire SQL script will load in the query window

### Step 5: Execute the Script
1. Click the **Play button** (▶️) in the toolbar, or press **F5**
2. Wait for execution to complete (this may take 30-60 seconds)
3. Watch the **Messages** tab at the bottom for progress

### Step 6: Verify Success
You should see output like:
```
CREATE EXTENSION
CREATE TABLE
CREATE TABLE
...
CREATE VIEW
CREATE FUNCTION
CREATE INDEX
...
```

If you see any errors, they will be shown in red in the Messages tab.

### Step 7: Verify Tables Created
1. In the left sidebar, expand your database
2. Expand **Schemas** → **public** → **Tables**
3. You should see all these tables:
   - users
   - motshelogroups
   - groupmembers
   - groupsignatories
   - monthlycontributions
   - contributionapprovals
   - loans
   - loanapprovals
   - loanrepayments
   - repaymentapprovals
   - loaninterestschedule
   - conversations
   - conversation_members
   - messages
   - message_reads
   - membershiprequests
   - notifications

### Step 8: Test the Application
1. Go to your Vercel app: https://re-mmogo.vercel.app
2. Try these features:
   - Record a contribution payment
   - Request a loan
   - Join a group
   - View group dashboard

All features should now work correctly!

---

## Troubleshooting

### "Connection failed: SSL/TLS required"
- Make sure you set SSL mode to **Require** in the server configuration
- Or add `?sslmode=require` to the connection string

### "Password authentication failed"
- Double-check the password: `UF3ZQitedyJDwmVkL2ZLPrK0Znwp9KKH`
- Make sure there are no extra spaces

### "Database does not exist"
- Make sure you're connecting to the correct database name: `remmogo`
- Check the Render dashboard to verify the database exists

### "Table already exists" errors
- This is normal if you've run the script before
- The script uses `IF NOT EXISTS` so it's safe to run multiple times
- You can ignore these errors

---

## Alternative: Using PSQL Command Line

If you prefer command line:

```bash
psql "postgresql://remmogo_user:UF3ZQitedyJDwmVkL2ZLPrK0Znwp9KKH@dpg-d7t40p8sfn5c73aiq7j0-a.virginia-postgres.render.com:5432/remmogo?sslmode=require" -f "C:\Users\Administrator\re-mmogo\backend\database\setup-production.sql"
```

---

## Contact Support

If you encounter any issues:
- Email: support@remmogo.bw
- Phone: +267 12 345 678
