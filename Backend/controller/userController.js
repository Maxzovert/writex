import mongoose from "mongoose";
import User from "../models/userModel.js";
import Blog from "../models/postModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createNotification } from "../utils/createNotification.js";
import { fetchLeanBlogList, parsePagination } from "../utils/blogList.js";
import { notDeletedFilter } from "../utils/trash.js";
import {
    providersFromAuth0Sub,
    verifyAuth0IdToken,
} from "../utils/auth0.js";

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

        const user = await User.create({
            username,
            email,
            password,
            authProviders: ["password"],
        });
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
        if(!user || !user.password) {
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

const buildUsernameBase = (email, name) => {
    const fromName = (name || "")
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 20);
    const fromEmail = (email || "")
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 20);
    let base = fromName || fromEmail || "writer";
    if (base.length < 4) {
        base = `${base}user`.slice(0, 4);
    }
    return base;
};

const escapeRegex = (value = "") =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const usernameTaken = async (username) => {
    if (!username) return true;
    // Case-insensitive match so "WeMultify" and "wemultify" collide the same way
    return Boolean(
        await User.findOne({
            username: new RegExp(`^${escapeRegex(username)}$`, "i"),
        })
    );
};
const allocateUniqueUsername = async (email, name) => {
    const base = buildUsernameBase(email, name);
    for (let i = 0; i < 25; i += 1) {
        let candidate =
            i === 0
                ? base
                : `${base}${i}${Math.floor(Math.random() * 900 + 100)}`;
        candidate = candidate.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 30);
        if (candidate.length < 4) {
            candidate = `${candidate}user`.slice(0, 30);
        }
        if (!(await usernameTaken(candidate))) {
            return candidate;
        }
    }
    return `user${Date.now().toString(36)}`.slice(0, 30);
};

const mergeAuthProviders = (existing = [], incoming = []) => {
    return [...new Set([...(existing || []), ...(incoming || [])])];
};

const linkAuth0ToUser = async (user, profile, incomingProviders) => {
    user.auth0Sub = profile.sub;
    user.authProviders = mergeAuthProviders(
        user.authProviders,
        incomingProviders
    );
    if (!user.profileImage && profile.picture) {
        user.profileImage = profile.picture;
    }
    await user.save();
    return user;
};

/**
 * Exchange a verified Auth0 ID token for a Writex app JWT.
 * Links by auth0Sub first, then by email, so existing password users keep the same Mongo _id.
 */
const syncAuth0 = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const idToken =
            authHeader && authHeader.startsWith("Bearer ")
                ? authHeader.split(" ")[1]
                : null;

        if (!idToken) {
            return res.status(401).json({ message: "Auth0 token required" });
        }

        const { rememberMe, username: requestedUsername } = req.body || {};
        const profile = await verifyAuth0IdToken(idToken);

        if (!profile.email) {
            return res.status(400).json({
                message: "Auth0 account must include an email address",
            });
        }

        if (!profile.emailVerified) {
            return res.status(403).json({
                message: "Verify your email with Auth0 before continuing",
            });
        }

        const email = profile.email.toLowerCase().trim();
        const incomingProviders = providersFromAuth0Sub(profile.sub);

        let user = await User.findOne({ auth0Sub: profile.sub });

        if (!user) {
            user = await User.findOne({ email });
            if (user) {
                // Same email as an existing Writex account → link, do not create a duplicate
                user = await linkAuth0ToUser(user, profile, incomingProviders);
            } else {
                let username = requestedUsername?.trim()?.toLowerCase();
                if (username) {
                    if (username.length < 4) {
                        return res.status(400).json({
                            message: "Username must be at least 4 characters",
                        });
                    }
                    if (await usernameTaken(username)) {
                        return res.status(400).json({
                            message: "Username already taken",
                        });
                    }
                } else {
                    username = await allocateUniqueUsername(email, profile.name);
                }

                // Retry create on duplicate-key races (double callback / StrictMode)
                for (let attempt = 0; attempt < 5; attempt += 1) {
                    try {
                        user = await User.create({
                            username,
                            email,
                            auth0Sub: profile.sub,
                            authProviders: incomingProviders,
                            profileImage: profile.picture || "",
                        });
                        break;
                    } catch (createError) {
                        if (createError?.code !== 11000) {
                            throw createError;
                        }

                        // Another request already linked/created this Auth0 user or email
                        const bySub = await User.findOne({
                            auth0Sub: profile.sub,
                        });
                        if (bySub) {
                            user = bySub;
                            break;
                        }
                        const byEmail = await User.findOne({ email });
                        if (byEmail) {
                            user = await linkAuth0ToUser(
                                byEmail,
                                profile,
                                incomingProviders
                            );
                            break;
                        }

                        // Username collision only — pick another and retry
                        if (createError?.keyPattern?.username) {
                            username = await allocateUniqueUsername(
                                email,
                                `${profile.name || "writer"}${attempt + 1}`
                            );
                            continue;
                        }

                        throw createError;
                    }
                }

                if (!user) {
                    return res.status(500).json({
                        message: "Could not create account after Auth0 login",
                    });
                }
            }
        } else {
            user.authProviders = mergeAuthProviders(
                user.authProviders,
                incomingProviders
            );
            if (!user.profileImage && profile.picture) {
                user.profileImage = profile.picture;
            }
            if (user.email !== email) {
                // Prefer verified Auth0 email if it changed and is free
                const emailOwner = await User.findOne({ email });
                if (!emailOwner || emailOwner._id.equals(user._id)) {
                    user.email = email;
                }
            }
            await user.save();
        }

        const token = generateToken(user._id, Boolean(rememberMe));

        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            authProviders: user.authProviders,
            token,
            message: "Auth0 sync successful",
        });
    } catch (error) {
        console.error("Auth0 sync error:", error);
        const isDup = error?.code === 11000;
        const message =
            error?.code === "ERR_JWT_CLAIM_VALIDATION_FAILED" ||
            error?.code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED" ||
            error?.name === "JWTExpired"
                ? "Invalid or expired Auth0 token"
                : isDup
                  ? "Account already exists — try signing in again"
                  : error.message || "Error syncing Auth0 user";
        res.status(isDup ? 409 : 401).json({ message });
    }
};

const logout = async (req,res) => {
    try {
        res.status(200).json({message : "Logout Successfully"})
    } catch (error) {
        res.status(500).json({message : "Error in logot" , error : error.message})
    }
}

const getUserProfileStats = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const authorOid = new mongoose.Types.ObjectId(userId);

        const [statsAgg, userAgg] = await Promise.all([
            Blog.aggregate([
                { $match: { author: authorOid, deletedAt: null } },
                {
                    $group: {
                        _id: null,
                        publishedBlogs: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "published"] }, 1, 0],
                            },
                        },
                        totalLikes: {
                            $sum: {
                                $cond: [
                                    { $isArray: "$likes" },
                                    { $size: "$likes" },
                                    0,
                                ],
                            },
                        },
                    },
                },
            ]),
            User.aggregate([
                { $match: { _id: authorOid } },
                {
                    $project: {
                        username: 1,
                        email: 1,
                        profileImage: 1,
                        bio: 1,
                        socialLinks: 1,
                        createdAt: 1,
                        followerCount: {
                            $size: { $ifNull: ["$followers", []] },
                        },
                        followingCount: {
                            $size: { $ifNull: ["$following", []] },
                        },
                    },
                },
            ]),
        ]);

        const user = userAgg[0];
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const stats = statsAgg[0] || { publishedBlogs: 0, totalLikes: 0 };

        res.status(200).json({
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                bio: user.bio,
                socialLinks: user.socialLinks,
                createdAt: user.createdAt,
                followerCount: user.followerCount || 0,
                followingCount: user.followingCount || 0,
            },
            stats: {
                publishedBlogs: stats.publishedBlogs,
                totalLikes: stats.totalLikes,
            },
        });
    } catch (error) {
        console.error("Error in getUserProfileStats:", error);
        res.status(500).json({
            message: "Error fetching user profile stats",
            error: error.message,
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
            status: "published",
            ...notDeletedFilter,
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
        const { page, limit, skip } = parsePagination(req.query);
        const user = await User.findOne({
            username: { $regex: new RegExp(`^${username}$`, "i") },
        }).select("_id");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { total, blogs, hasMore } = await fetchLeanBlogList({
            Blog,
            filter: { author: user._id, status: "published", ...notDeletedFilter },
            skip,
            limit,
            sort: { publishedAt: -1, createdAt: -1 },
        });

        res.status(200).json({
            message: "Blogs fetched",
            blogs,
            page,
            limit,
            total,
            hasMore,
        });
    } catch (error) {
        console.error("Error in getPublicUserBlogs:", error);
        res.status(500).json({
            message: "Error fetching user blogs",
            error: error.message,
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
    syncAuth0,
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
