import User from "../models/userModel.js";
import Blog from "../models/postModel.js";
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

        const user = await User.create({ username, email, password});
        const token = generateToken(user._id)

        // res.cookie('token' ,token , {
        //     httpOnly : true,
        //     secure : process.env.NODE_ENV === "production",
        //     sameSite : "strict",
        //     maxAge : 7 * 24 * 60 * 60 * 1000
        // });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token,
            message : "user created"
        })
        

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({message : error.message || "Error in signup"})
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

        // res.cookie('token' , token , {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === "production",
        //     sameSite: "strict",
        //     maxAge: 7 * 24 * 60 * 60 * 1000,
        // })

        res.status(200).json({
            _id : user._id,
            username : user.username,
            email : user.email,
            token,
            message : "Login Successful"
        })
    } catch (error) {
        res.status(500).json({ message: "Error in login", error: error.message });
    }
}

const  getCurrentUser = async (req , res) => {
    try {
        const user = req.user;
    
        if(!user){
            return res.status(404).json({message: "User not Found"});
        }
        
        res.status(200).json({
            _id : user._id,
            username : user.username,
            email : user.email
        }) 
    } catch (error) {
        res.status(500).json({message : "Error in GetCurrentUser" , error : error.message})
    }
}

const logout = async (req,res) => {
    try {
        res.status(200).json({message : "Logout Successfully"})
    } catch (error) {
        res.status(500).json({message : "Error in logot" , error : error.message})
    }
}

const getUserProfileStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get user's published blogs count
        const publishedBlogsCount = await Blog.countDocuments({ 
            author: userId, 
            status: 'published' 
        });
        
        // Get total likes received by user's blogs
        const userBlogs = await Blog.find({ author: userId });
        const totalLikes = userBlogs.reduce((total, blog) => total + (blog.likes?.length || 0), 0);
        
        // Get user basic info including profile image, bio, and social links
        const user = await User.findById(userId).select('username email profileImage bio socialLinks createdAt');
        
        res.status(200).json({
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                bio: user.bio,
                socialLinks: user.socialLinks,
                createdAt: user.createdAt
            },
            stats: {
                publishedBlogs: publishedBlogsCount,
                totalLikes: totalLikes
            }
        });
        
    } catch (error) {
        console.error("Error in getUserProfileStats:", error);
        res.status(500).json({ 
            message: "Error fetching user profile stats", 
            error: error.message 
        });
    }
};

const updateProfileImage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { profileImage } = req.body;
        
        if (!profileImage) {
            return res.status(400).json({ message: "Profile image URL is required" });
        }
        
        const user = await User.findByIdAndUpdate(
            userId,
            { profileImage },
            { new: true }
        ).select('username email profileImage createdAt');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json({
            message: "Profile image updated successfully",
            user
        });
        
    } catch (error) {
        console.error("Error in updateProfileImage:", error);
        res.status(500).json({ 
            message: "Error updating profile image", 
            error: error.message 
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, bio, socialLinks } = req.body;
        
        const updateData = {};
        if (username) updateData.username = username;
        if (bio) updateData.bio = bio;
        if (socialLinks) updateData.socialLinks = socialLinks;
        
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No valid fields to update" });
        }
        
        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('username email profileImage bio socialLinks createdAt');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json({
            message: "Profile updated successfully",
            user
        });
        
    } catch (error) {
        console.error("Error in updateProfile:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "Username already exists" });
        }
        res.status(500).json({ 
            message: "Error updating profile", 
            error: error.message 
        });
    }
};

export default { signup, login, getCurrentUser, logout, getUserProfileStats, updateProfileImage, updateProfile };
