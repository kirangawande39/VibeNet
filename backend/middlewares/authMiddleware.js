// JWT module ko import kiya – token verify karne ke liye
const jwt = require("jsonwebtoken");

// Middleware function – har protected route se pehle chalega
const protect = (req, res, next) => {

  // Authorization header ko read kiya – yahan token aata hai
  const authHeader = req.header('Authorization');

  // Check kiya: token hai ya nahi, aur "Bearer " se start hota hai ya nahi
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  // "Authorization" header hota hai format me: "Bearer <token>"
  // Hum usko space (' ') se split karte hain => ["Bearer", "<token>"]
  // Index [1] se hum sirf <token> part nikaalte hain jo verify karne ke kaam aata hai
  const token = authHeader.split(' ')[1];


  try {
    // JWT token ko verify karte hain using secret key (from .env)
    // Agar token valid hai to decoded payload (user data like id, name, etc.) milta hai
    // Agar token invalid ya expired ho, to error throw hota hai
    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    // Token valid hone par user ka data request me attach kar diya
    req.user = decoded;

    // Sab sahi hai, to next middleware/route handler pe jao
    next();

  } catch (error) {
    // Agar token invalid ya expire ho gaya ho to error return
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Middleware ko export kiya – taaki kisi bhi route me use kar sake
module.exports = { protect };
