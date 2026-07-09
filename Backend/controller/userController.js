import User from "../models/userModel.js";
import Blog from "../models/postModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createNotification } from "../utils/createNotification.js";

const formatPublicUser = (user) => ({
    _id: user._id,
    username: user.username,
    profileImage: user.profileImage || "",
    bio: user.bio || "",
    socialLinks: user.socialLinks || {},
    createdAt: user.createdAt,
    followerCount: user.followers?.length || 0,
    followingCount: user.following?.length || 0
});

const getIsFollowing = (user, targetUserId) => {
    if (!user || !targetUserId) return false;
    return user.following?.some((id) => id.toString() === targetUserId.toString());
};

const generateToken = (userId, rememberMe = false) => {
    return jwt.sign({id:userId}, process.env.JWT_SECRET,{
        expiresIn: rememberMe ? '365d' : '7d'
    })
}
const signup = async (req , res) => {
    const {username , email , password, rememberMe} = req.body;

    try {
        const userExist = await User.findOne({email});
        if(userExist){ 
            return res.status(400).json({message:"User Already Exists"})
        }

        const user = await User.create({ username, email, password});
        const token = generateToken(user._id, Boolean(rememberMe))

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
    const {email , password, rememberMe} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({message : "Invalid Credentials"})
        }

        const isMatch = await bcrypt.compare(password , user.password);
        if(!isMatch){
            return res.status(400).json({message : "Invalid Credentials"})
        }

        const token = generateToken(user._id, Boolean(rememberMe));

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
        const user = await User.findById(userId).select('username email profileImage bio socialLinks createdAt followers following');
        
        res.status(200).json({
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                bio: user.bio,
                socialLinks: user.socialLinks,
                createdAt: user.createdAt,
                followerCount: user.followers?.length || 0,
                followingCount: user.following?.length || 0
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

const getPublicProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, "i") } })
            .select("username profileImage bio socialLinks createdAt followers following");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const publishedBlogsCount = await Blog.countDocuments({
            author: user._id,
            status: "published"
        });

        const viewerId = req.user?._id?.toString();
        const isOwnProfile = viewerId === user._id.toString();
        let isFollowing = false;

        if (viewerId && !isOwnProfile) {
            const viewer = await User.findById(viewerId).select("following");
            isFollowing = getIsFollowing(viewer, user._id);
        }

        res.status(200).json({
            user: formatPublicUser(user),
            stats: {
                publishedBlogs: publishedBlogsCount
            },
            isOwnProfile,
            isFollowing
        });
    } catch (error) {
        console.error("Error in getPublicProfile:", error);
        res.status(500).json({
            message: "Error fetching public profile",
            error: error.message
        });
    }
};

const getPublicUserBlogs = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, "i") } }).select("_id");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const blogs = await Blog.find({ author: user._id, status: "published" })
            .populate("author", "username profileImage")
            .sort({ publishedAt: -1, createdAt: -1 });

        res.status(200).json({
            message: "Blogs fetched",
            blogs
        });
    } catch (error) {
        console.error("Error in getPublicUserBlogs:", error);
        res.status(500).json({
            message: "Error fetching user blogs",
            error: error.message
        });
    }
};

const followUser = async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        const currentUserId = req.user._id.toString();

        if (targetUserId === currentUserId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const currentUser = await User.findById(currentUserId);
        const alreadyFollowing = currentUser.following.some(
            (id) => id.toString() === targetUserId
        );

        if (alreadyFollowing) {
            return res.status(400).json({ message: "Already following this user" });
        }

        currentUser.following.push(targetUserId);
        targetUser.followers.push(currentUserId);

        await currentUser.save();
        await targetUser.save();

        await createNotification({
            recipientId: targetUserId,
            senderId: currentUserId,
            type: "follow"
        });

        res.status(200).json({
            message: "Followed successfully",
            followerCount: targetUser.followers.length,
            followingCount: currentUser.following.length,
            isFollowing: true
        });
    } catch (error) {
        console.error("Error in followUser:", error);
        res.status(500).json({
            message: "Error following user",
            error: error.message
        });
    }
};

const unfollowUser = async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        const currentUserId = req.user._id.toString();

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const currentUser = await User.findById(currentUserId);
        const wasFollowing = currentUser.following.some(
            (id) => id.toString() === targetUserId
        );

        if (!wasFollowing) {
            return res.status(400).json({ message: "You are not following this user" });
        }

        currentUser.following = currentUser.following.filter(
            (id) => id.toString() !== targetUserId
        );
        targetUser.followers = targetUser.followers.filter(
            (id) => id.toString() !== currentUserId
        );

        await currentUser.save();
        await targetUser.save();

        res.status(200).json({
            message: "Unfollowed successfully",
            followerCount: targetUser.followers.length,
            followingCount: currentUser.following.length,
            isFollowing: false
        });
    } catch (error) {
        console.error("Error in unfollowUser:", error);
        res.status(500).json({
            message: "Error unfollowing user",
            error: error.message
        });
    }
};

const getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId)
            .populate("followers", "username profileImage bio");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            users: user.followers,
            count: user.followers.length
        });
    } catch (error) {
        console.error("Error in getFollowers:", error);
        res.status(500).json({
            message: "Error fetching followers",
            error: error.message
        });
    }
};

const getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId)
            .populate("following", "username profileImage bio");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            users: user.following,
            count: user.following.length
        });
    } catch (error) {
        console.error("Error in getFollowing:", error);
        res.status(500).json({
            message: "Error fetching following",
            error: error.message
        });
    }
};

export default {
    signup,
    login,
    getCurrentUser,
    logout,
    getUserProfileStats,
    updateProfileImage,
    updateProfile,
    getPublicProfile,
    getPublicUserBlogs,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing
};
