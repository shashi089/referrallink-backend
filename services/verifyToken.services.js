const jwt = require("jsonwebtoken");
const JWT_SECRET = "kdja3713$%^kjhd^&hjj";

function verifyToken(req, res, next) {
  const authHeader = req.headers.token;
  if (!authHeader) return res.status(401).send("You are NOT Authenticated");
  const token = authHeader;
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send("Token is not Valid");
    req.user = user;
    next();
  });
}

function verifyTokenAndAuthorization(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.userId === req.params.id || req.user.isAdmin) return next();
    res.status(403).send("You are not allowed");
  });
}

function verifyTokenAndAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (!req.user.isAdmin) return res.status(401).send("you are not allowed");
    next();
  });
}

module.exports = {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
};
