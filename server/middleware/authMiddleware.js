const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Get token from request header
    const token = req.header("Authorization");

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        message: "Access Denied. No token provided.",
      });
    }

    // Remove "Bearer " from token if present
    const actualToken = token.startsWith("Bearer ")
      ? token.slice(7)
      : token;

    // Verify token
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);

    // Store user ID in request
    req.user = decoded;

    // Continue to next function
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or Expired Token",
    });
  }
};

module.exports = authMiddleware;