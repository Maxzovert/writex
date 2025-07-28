import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const protectRoute = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decode.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "User Not Found" });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

export default protectRoute;