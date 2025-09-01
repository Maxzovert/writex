import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const protectRoute = async (req, res, next) => {
  console.log("Auth middleware called for:", req.method, req.path);
  console.log("Request headers:", req.headers);
  
  // Check if JWT_SECRET is configured
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET environment variable is not set!");
    return res.status(500).json({ message: "Server configuration error" });
  }
  
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  
  console.log("Auth header:", authHeader);
  console.log("Token extracted:", token ? "Yes" : "No");

  if (!token) {
    console.log("No token found, returning 401");
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    console.log("Verifying token...");
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded, user ID:", decode.id);
    
    req.user = await User.findById(decode.id).select("-password");
    if (!req.user) {
      console.log("User not found in database, returning 401");
      return res.status(401).json({ message: "User Not Found" });
    }
    
    console.log("User authenticated successfully:", req.user.username);
    next();
  } catch (error) {
    console.log("Token verification failed:", error.message);
    return res.status(401).json({ message: "Not authorized" });
  }
};

export default protectRoute;