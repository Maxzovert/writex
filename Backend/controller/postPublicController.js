import Blog from "../models/postModel.js";
import BlogShare from "../models/blogShareModel.js";
import User from "../models/userModel.js";

const getAllBlogs = async(req, res) => {
    try {
        const allBlogs = await Blog.find({status : 'published'})
        .populate("author" , "username profileImage")
        .sort({publsihedAt : -1});
        
        res.status(200).json({message: "Blog fetched" , allBlogs})
    } catch (error) {
        console.error("Erron in getALlBlogs", error);
        res.status(500).json({message : "Error in postPublicController", error : error.message})
    }
}

const getBlogById = async (req,res) => {
    try {
        const {id} = req.params;
        const blog = await Blog.findById(id).populate("author" , "username profileImage");

        if(!blog){
            return res.status(404).json({message : "Blog Not Found"})
        }
        res.status(200).json({
            message : "Blog Found",
            post : blog
        })

    } catch (error) {
        console.error("Error in getBlogById" , error);
        res.status(500).json({message : "Failed to fetch error in post public controller" , error : error.message})
    }
}

const getBlogBySlug = async (req , res) => {
    try {
        const {slug} = req.params;

        const blog = await Blog.findOne({slug}).populate("author" , "username profileImage");

        if(!blog){
            return res.status(404).json({message : "Blog Not Found"})
        }
        res.status(200).json({
            message : "Blog Finded",
            post : blog
        });
    } catch (error) {
        console.error("Error in getBlogBySlug", error);
        res.status(500).json({message : "Failed to fetch error in post public controller" , error : error.message})
    }
};

const getFollowingFeed = async (req, res) => {
    try {
        const userId = req.user._id;
        const currentUser = await User.findById(userId).select("following");

        if (!currentUser?.following?.length) {
            return res.status(200).json({
                message: "Following feed fetched",
                allBlogs: [],
                sharedBlogs: []
            });
        }

        const followingIds = currentUser.following;

        const allBlogs = await Blog.find({
            author: { $in: followingIds },
            status: "published"
        })
            .populate("author", "username profileImage")
            .sort({ publishedAt: -1, createdAt: -1 });

        const shares = await BlogShare.find({ user: { $in: followingIds } })
            .populate({
                path: "blog",
                match: { status: "published" },
                populate: { path: "author", select: "username profileImage" }
            })
            .populate("user", "username profileImage")
            .sort({ createdAt: -1 });

        const sharedBlogs = shares
            .filter((share) => share.blog)
            .map((share) => ({
                ...share.blog.toObject(),
                sharedBy: share.user,
                sharedAt: share.createdAt
            }));

        res.status(200).json({
            message: "Following feed fetched",
            allBlogs,
            sharedBlogs
        });
    } catch (error) {
        console.error("Error in getFollowingFeed", error);
        res.status(500).json({
            message: "Error fetching following feed",
            error: error.message
        });
    }
};

export default { getBlogBySlug, getAllBlogs, getBlogById, getFollowingFeed };