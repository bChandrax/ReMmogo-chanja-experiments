# PostgreSQL Setup Guide for Re-Mmogo

This guide will help you install and configure PostgreSQL on Windows for the Re-Mmogo application.

---

## Step 1: Download PostgreSQL

1. Go to the official PostgreSQL download page:
   - **https://www.postgresql.org/download/windows/**

2. Click on **"Download the installer"** (EnterpriseDB)

3. Download **PostgreSQL 16** (or latest version) for Windows

---

## Step 2: Install PostgreSQL

1. **Run the installer** (`postgresql-16-windows-x64.exe`)

2. **Installation Directory**: Keep the default (`C:\Program Files\PostgreSQL\16`)
   - Click **Next**

3. **Select Components**: Install all components
   - PostgreSQL Server ✓
   - pgAdmin 4 ✓
   - Command Line Tools ✓
   - Click **Next**

4. **Data Directory**: Keep the default
   - Click **Next**

5. **Password Setup** (IMPORTANT):
   - Enter a password for the `postgres` superuser
   - **Example**: `postgres123` or any secure password you prefer
   - **Write this down!** You'll need it for the `.env` file
   - Click **Next**

6. **Port**: Keep default **5432**
   - Click **Next**

7. **Locale**: Keep default (Default locale)
   - Click **Next**

8. **Install** and wait for completion

9. **Uncheck** "Stack Builder" (not needed)
   - Click **Finish**

---

## Step 3: Create the Database

### Option A: Using pgAdmin (GUI)

1. Open **pgAdmin 4** from Start Menu

2. Connect to PostgreSQL:
   - Expand **Servers** → **PostgreSQL 16**
   - Enter the password you set during installation

3. Create the database:
   - Right-click **Databases** → **Create** → **Database**
   - Name: `remmogo`
   - Click **Save**

### Option B: Using Command Line (psql)

1. Open **Command Prompt** as Administrator

2. Navigate to PostgreSQL bin folder:
   ```cmd
   cd "C:\Program Files\PostgreSQL\16\bin"
   ```

3. Connect as postgres user:
   ```cmd
   psql -U postgres
   ```
   - Enter your password when prompted

4. Create the database:
   ```sql
   CREATE DATABASE remmogo;
   ```

5. Exit psql:
   ```sql
   \q
   ```

---

## Step 4: Run Database Schema

1. Open **Command Prompt** as Administrator

2. Navigate to PostgreSQL bin folder:
   ```cmd
   cd "C:\Program Files\PostgreSQL\16\bin"
   ```

3. Run the schema file:
   ```cmd
   psql -U postgres -d remmogo -f "C:\Users\Administrator\re-mmogo\backend\database\remmogo_database.sql"
   ```
   - Enter your password when prompted

4. You should see output like:
   ```
   DROP TABLE
   CREATE TABLE
   CREATE TABLE
   ...
   ```

---

## Step 5: Update Backend .env File

1. Open `C:\Users\Administrator\re-mmogo\backend\.env`

2. Update the `DATABASE_URL` with your password:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/remmogo
   ```

   **Example** (if your password is `postgres123`):
   ```env
   DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/remmogo
   ```

3. Save the file

---

## Step 6: Test the Connection

1. **Start the backend server**:
   ```cmd
   cd C:\Users\Administrator\re-mmogo\backend
   npm run dev
   ```

2. You should see:
   ```
   Server running on port 5175
   Connected to PostgreSQL
   ```

3. If you see **"DB connection failed"**, check:
   - PostgreSQL service is running
   - Password in `.env` is correct
   - Database `remmogo` exists

---

## Troubleshooting

### Error: "password authentication failed"
- Wrong password in `.env` file
- Update `DATABASE_URL` with the correct password

### Error: "database does not exist"
- Database `remmogo` was not created
- Run Step 3 again

### Error: "connection refused"
- PostgreSQL service is not running
- Open **Services** (Win + R → `services.msc`)
- Find **postgresql-x64-16** and click **Start**

### Error: "relation 'users' does not exist"
- Database schema was not applied
- Run Step 4 again

---

## Quick Reference

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `remmogo` |
| Username | `postgres` |
| Password | (your chosen password) |

---

## pgAdmin Access

- **pgAdmin** is installed with PostgreSQL
- Open from Start Menu: **pgAdmin 4**
- Default connection: **PostgreSQL 16**
- Use the password you set during installation

---

## Uninstall PostgreSQL

If you need to start over:

1. Open **Control Panel** → **Programs and Features**
2. Find **PostgreSQL 16**
3. Click **Uninstall**
4. Delete data folder: `C:\Program Files\PostgreSQL\16`
5. Start from Step 1

---

## Next Steps

Once PostgreSQL is running:

1. **Start backend**: `npm run dev` (in `backend` folder)
2. **Start frontend**: `npm run dev` (in root folder)
3. **Test login**: Go to `http://localhost:5173/login`
4. **Register a new account** and test authentication!
