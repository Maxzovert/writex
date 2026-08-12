import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const AUTH_USER_SELECT = "_id username email profileImage";

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (!token || !process.env.JWT_SECRET) {
    return next();
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decode.id).select(AUTH_USER_SELECT);
  } catch {
    req.user = null;
  }

  next();
};

export default optionalAuth;
