const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const authHeader = req.header('Authorization');
  // console.log("Auth Header:", authHeader); // Debugging: Check if token is coming in request

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  const token = authHeader.split(' ')[1];
  // console.log("Token extracted:", token); // Debugging: Token extraction

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user to the request
    // console.log("Decoded user:", req.user); // Debugging: Decoded user info
    next(); // Proceed to next middleware or route handler
  } catch (error) {
    // console.error("Error verifying token:", error); // Debugging: Error during token verification
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = { protect };
