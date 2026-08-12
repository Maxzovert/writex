import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const AUTH_USER_SELECT = "_id username email profileImage";

const protectRoute = async (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET environment variable is not set!");
    return res.status(500).json({ message: "Server configuration error" });
  }

  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decode.id).select(AUTH_USER_SELECT);
    if (!req.user) {
      return res.status(401).json({ message: "User Not Found" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

export default protectRoute;
