# Re-Mmogo Quick Start Scripts

## Windows (PowerShell)

### 1. Setup Database
```powershell
# Run the database setup script
psql -U postgres -d remmogo -f backend\database\setup.sql
```

### 2. Install Dependencies
```powershell
# Backend
cd backend
npm install

# Frontend (from root)
cd ..
pnpm install
```

### 3. Configure Environment
```powershell
# Copy example env files
Copy-Item backend\.env.example backend\.env
Copy-Item .env.example .env

# Edit backend\.env with your PostgreSQL password
# notepad backend\.env
```

### 4. Start Servers
```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
pnpm run dev
```

---

## Linux/Mac (Bash)

### 1. Setup Database
```bash
psql -U postgres -d remmogo -f backend/database/setup.sql
```

### 2. Install Dependencies
```bash
cd backend && npm install
cd .. && pnpm install
```

### 3. Configure Environment
```bash
cp backend/.env.example backend/.env
cp .env.example .env
# Edit backend/.env with your PostgreSQL password
```

### 4. Start Servers
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
pnpm run dev
```

---

## Deployment

### Render (Backend)
1. Push to GitHub
2. Import to Render using render.yaml
3. Set environment variables
4. Deploy

### Vercel (Frontend)
1. Import GitHub repo to Vercel
2. Set VITE_API_URL environment variable
3. Deploy

See DEPLOYMENT.md for detailed instructions.
