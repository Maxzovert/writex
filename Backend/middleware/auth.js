import jwt from "jsonwebtoken";
import User from "../models/userModel";

const protectRoute = async (req, res , next) => {
    
    const  token = req.cookies?.token;

    if(!token){
        return res.status(401).json({
            message: "Not authorized"
        })
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findByIdAndDelete(decode.id).select("-password");
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Not authorized"
        })
    }
    
}
export default protectRoute