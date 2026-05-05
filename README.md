# Re-Mmogo - Motshelo Savings Group Management Platform

**Re-Mmogo** is a full-stack web application for managing **Motshelo** - traditional Botswana community savings groups. It enables communities to track contributions, manage loans, and handle approvals digitally.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)

---

## 🌟 Features

- **User Authentication** - Secure JWT-based login/registration
- **Group Management** - Create and manage motshelo savings groups
- **Member Enrollment** - Join groups and track membership
- **Contribution Tracking** - Record and approve monthly contributions
- **Loan Management** - Request, approve, and track loans with 20% monthly interest
- **Financial Reports** - Year-end statements and member balances
- **Responsive Design** - Works on desktop, tablet, and mobile devices

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API    │────▶│   Database      │
│   React 19      │     │   Node/Express   │     │   PostgreSQL    │
│   Vite          │     │   JWT Auth       │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Tech Stack

**Frontend:**
- React 19
- Vite
- React Router DOM
- Recharts (for data visualization)
- Lucide Icons
- Custom CSS

**Backend:**
- Node.js
- Express.js
- JWT Authentication
- bcrypt (password hashing)
- PostgreSQL (database)

---

## 📦 Project Structure

```
re-mmogo/
├── src/                      # Frontend React source
│   ├── components/           # Reusable UI components
│   ├── pages/                # Page components
│   ├── services/             # API services
│   ├── context/              # React context (Auth)
│   └── App.jsx               # Main app component
├── backend/                  # Backend Node.js API
│   ├── config/               # Database configuration
│   ├── controllers/          # Route controllers
│   ├── middleware/           # Auth middleware
│   ├── routes/               # API routes
│   ├── database/             # SQL schemas & migrations
│   └── server.js             # Express server
├── DEPLOYMENT.md             # Deployment guide
├── render.yaml               # Render deployment config
└── vercel.json               # Vercel deployment config
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL 18+ installed and running
- pnpm or npm package manager

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd re-mmogo
```

### 2. Setup Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE remmogo;

# Run schema
\i backend/database/remmogo_database.sql
```

### 3. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5175
NODE_ENV=development
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/remmogo
JWT_SECRET=your-development-secret-key
```

### 4. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (from root)
cd ..
pnpm install
```

### 5. Start Development Servers

```bash
# Terminal 1 - Backend (port 5175)
cd backend
npm run dev

# Terminal 2 - Frontend (port 5173)
pnpm run dev
```

Visit **http://localhost:5173** in your browser.

---

## 🔑 Default Test Credentials

After running the seed data:

| Email | Password | Role |
|-------|----------|------|
| kabo.moeng@example.com | Password123 | Signatory |
| selepe.tau@example.com | Password123 | Signatory |
| neo.sithole@example.com | Password123 | Member |

---

## 📱 Features Overview

### Authentication
- User registration with email validation
- Secure login with JWT tokens
- Protected routes with AuthContext
- Automatic token refresh

### Groups
- Create new motshelo groups
- Set contribution amounts and interest rates
- Manage member enrollment
- View group statistics

### Contributions
- Record monthly contributions (P1,000 standard)
- Upload proof of payment
- Signatory approval workflow
- Track payment history

### Loans
- Request loans from group pool
- 20% monthly interest rate
- Dual signatory approval
- Repayment tracking

### Reports
- Year-end payout calculations
- Member contribution statements
- Group financial summaries
- Interest raised tracking

---

## 🌐 Deployment

### Quick Deploy

#### Backend (Render)
1. Push code to GitHub
2. Connect repository to [Render](https://render.com)
3. Deploy using `render.yaml` blueprint
4. Set environment variables

#### Frontend (Vercel)
1. Import GitHub repo to [Vercel](https://vercel.com)
2. Set `VITE_API_URL` environment variable
3. Deploy automatically on push

📖 **See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions**

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user

### Groups
- `GET /api/groups` - Get all groups
- `GET /api/groups/mine` - Get user's groups
- `GET /api/groups/:id` - Get single group
- `POST /api/groups` - Create group
- `PUT /api/groups/:id` - Update group

### Members
- `POST /api/members/:groupId/enroll` - Join group
- `GET /api/members/:groupId` - Get group members
- `GET /api/members/:groupId/balances/all` - Get all balances
- `DELETE /api/members/:groupId/:memberId` - Remove member

### Contributions
- `GET /api/contributions/:groupId` - Get all contributions
- `GET /api/contributions/:groupId/mine` - Get my contributions
- `PUT /api/contributions/:id/submit` - Submit payment
- `PUT /api/contributions/:id/approve` - Approve contribution

### Loans
- `POST /api/loans/request` - Request loan
- `GET /api/loans/:groupId` - Get group loans
- `GET /api/loans/:groupId/mine` - Get my loans
- `PUT /api/loans/:id/approve` - Approve loan
- `POST /api/loans/:id/repay` - Submit repayment

### Reports
- `GET /api/reports/:groupId/year-end` - Year-end report
- `GET /api/reports/:groupId/summary` - Group summary
- `GET /api/reports/:groupId/member/:memberId` - Member statement

---

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Backend lint
cd backend
npm run lint

# Frontend lint
pnpm run lint
```

---

## 📝 Environment Variables

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | Yes |
| `NODE_ENV` | Environment | No |
| `DATABASE_URL` | PostgreSQL connection | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `ALLOWED_ORIGINS` | CORS origins | No |

### Frontend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Traditional Motshelo savings groups in Botswana
- React and Vite communities
- Express.js and PostgreSQL contributors

---

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Review API documentation above

---

**Built with ❤️ for Botswana's savings communities**

**Last Updated:** May 5, 2026
