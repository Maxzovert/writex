import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = (userId) => {
    return jwt.sign({id:userId}, process.env.JWT_SECRET,{
        expiresIn:'7d'
    })
}
const signup = async (req , res) => {
    const {username , email , password} = req.body;

    try {
        const userExist = await User.findOne({email});
        if(userExist){ 
            return res.status(400).json({message:"User Already Exists"})
        }

        const user = await User.create({username , email, password});
        const token = generateToken(user._id)

        res .cookie('token' ,token , {
            httpOnly : true,
            secure : process.env.NODE_ENV === "production",
            sameSite : "strict",
            maxAge : 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            _id: user._id,
            username:user.username,
            email:user.email,
            message : "user created"
        })
        

    } catch (error) {
        res.status(500).json({message : "error userController (signUp)"})
    }
}


const login = async (req , res) => {
    const {email , password} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({message : "Invalid Credentials"})
        }

        const isMatch = await bcrypt.compare(password , user.password);
        if(!isMatch){
            return res.status(400).json({message : "Invalid Credentials"})
        }

        const token = generateToken(user._id);

        res.cookie('token' , token , {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        res.status(200).json({
            _id : user._id,
            username : user.username,
            email : user.email,
            message : "Login Successful"
        })
    } catch (error) {
        res.status(500).json({ message: "Error in login", error: error.message });
    }
}

export  default { signup, login };
