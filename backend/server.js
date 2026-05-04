const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./config/db");

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:4173",
    ];
    if (!origin || allowed.includes(origin) || origin.endsWith(".vercel.app") || origin.endsWith(".netlify.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Connect DB
connectDB();

// Health check — Render uses this to confirm the service is up
app.get("/", (req, res) => res.json({ message: "Re-Mmogo API running" }));

// Routes
app.use("/api/auth",          require("./routes/authRoutes"));
app.use("/api/groups",        require("./routes/groupRoutes"));
app.use("/api/members",       require("./routes/memberRoutes"));
app.use("/api/contributions", require("./routes/contributionRoutes"));
app.use("/api/loans",         require("./routes/loanRoutes"));
app.use("/api/reports",       require("./routes/reportRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
