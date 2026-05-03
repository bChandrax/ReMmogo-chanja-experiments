const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const bearer = req.headers.authorization;

  if (!bearer || !bearer.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = bearer.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = decoded;
    next();
  });
};

// Middleware to check if user is a signatory of a group
const requireSignatory = async (req, res, next) => {
  const { sql } = require("../config/db");
  const groupId = req.params.groupId || req.body.groupId;

  try {
    const result = await sql.query`
      SELECT gm.MemberID FROM GroupMembers gm
      WHERE gm.UserID = ${req.user.id}
        AND gm.GroupID = ${groupId}
        AND gm.Role IN ('signatory', 'admin')
        AND gm.IsActive = 1
    `;

    if (result.recordset.length === 0) {
      return res.status(403).json({ error: "Signatory access required" });
    }

    req.memberID = result.recordset[0].MemberID;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { protect, requireSignatory };