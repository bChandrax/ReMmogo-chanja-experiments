const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const bearer = req.headers.authorization;

  if (!bearer || !bearer.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = bearer.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: "Token expired" });
      }
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  });
};

const requireSignatory = async (req, res, next) => {
  const { db } = require("../config/db");
  const groupId = req.params.groupId || req.body.groupId;

  if (!groupId) {
    return res.status(400).json({ error: "Group ID is required" });
  }

  try {
    const result = await db.query(
      `SELECT gm.memberid, gm.role FROM groupmembers gm
       WHERE gm.userid = $1 AND gm.groupid = $2
         AND gm.role IN ('signatory', 'admin') AND gm.isactive = true`,
      [req.user.id, groupId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: "Signatory access required" });
    }

    req.memberID = result.rows[0].memberid;
    req.signatoryRole = result.rows[0].role;
    next();
  } catch (err) {
    console.error("Signatory check error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Optional: Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  const { db } = require("../config/db");

  try {
    const result = await db.query(
      `SELECT gm.memberid FROM groupmembers gm
       WHERE gm.userid = $1 AND gm.role = 'admin' AND gm.isactive = true`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: "Admin access required" });
    }

    req.memberID = result.rows[0].memberid;
    next();
  } catch (err) {
    console.error("Admin check error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { protect, requireSignatory, requireAdmin };
