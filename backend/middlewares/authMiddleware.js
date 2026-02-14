// JWT module ko import kiya – token verify karne ke liye
const jwt = require("jsonwebtoken");

// Middleware function – har protected route se pehle chalega
const protect = (req, res, next) => {

  const token=req.cookies.token;

  // console.log("token:",token);

  if(!token){
    return res.status(401).json({message:'Access Denied. No token provided.'})
  }
 

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("decoded user::",decoded);
    req.user = decoded;
    next();

  } catch (error) {
    
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Middleware ko export kiya – taaki kisi bhi route me use kar sake
module.exports = { protect };
