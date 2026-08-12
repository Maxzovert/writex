import Blog from "../models/postModel.js";
import User from "../models/userModel.js";
import BlogShare from "../models/blogShareModel.js";
import { createNotification, createNotificationsForUsers } from "../utils/createNotification.js";

const addComment = async (req, res) => {
    try {
        const { blogId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: "Comment content is required" });
        }

        const blog = await Blog.findById(blogId).select("author comments");
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        const newComment = {
            user: userId,
            content: content.trim(),
            createdAt: new Date(),
            updatedAt: new Date(),
            likes: [],
            replies: []
        };

        blog.comments.push(newComment);
        await blog.save();

        if (blog.author.toString() !== userId.toString()) {
            await createNotification({
                recipientId: blog.author,
                senderId: userId,
                type: "comment",
                blogId: blog._id,
                message: content.trim().slice(0, 120)
            });
        }

        const addedComment = blog.comments[blog.comments.length - 1];
        await Blog.populate(addedComment, {
            path: "user",
            select: "username profileImage"
        });

        res.status(201).json({
            message: "Comment added successfully",
            comment: addedComment
        });
    } catch (error) {
        console.error("Error in addComment:", error);
        res.status(500).json({ message: "Error adding comment", error: error.message });
    }
};

const addReply = async (req, res) => {
    try {
        const { blogId, commentId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: "Reply content is required" });
        }

        const blog = await Blog.findById(blogId).select("comments");
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        const comment = blog.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const newReply = {
            user: userId,
            content: content.trim(),
            createdAt: new Date(),
            likes: []
        };

        comment.replies.push(newReply);
        await blog.save();

        const addedReply = comment.replies[comment.replies.length - 1];
        await Blog.populate(addedReply, {
            path: "user",
            select: "username profileImage"
        });

        res.status(201).json({
            message: "Reply added successfully",
            reply: addedReply
        });
    } catch (error) {
        console.error("Error in addReply:", error);
        res.status(500).json({ message: "Error adding reply", error: error.message });
    }
};

const toggleLike = async (req, res) => {
    try {
        const { blogId } = req.params;
        const userId = req.user.id;

        const blog = await Blog.findById(blogId).select("author likes");
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        const isLiked = blog.likes.some((like) => like.toString() === userId.toString());

        let updated;
        if (isLiked) {
            updated = await Blog.findByIdAndUpdate(
                blogId,
                { $pull: { likes: userId } },
                { new: true }
            ).select("likes");
        } else {
            updated = await Blog.findByIdAndUpdate(
                blogId,
                { $addToSet: { likes: userId } },
                { new: true }
            ).select("likes");

            if (blog.author.toString() !== userId.toString()) {
                await createNotification({
                    recipientId: blog.author,
                    senderId: userId,
                    type: "like",
                    blogId: blog._id
                });
            }
        }

        res.status(200).json({
            message: isLiked ? "Post unliked successfully" : "Post liked successfully",
            isLiked: !isLiked,
            likeCount: updated?.likes?.length || 0
        });
    } catch (error) {
        console.error("Error in toggleLike:", error);
        res.status(500).json({ message: "Error toggling like", error: error.message });
    }
};

const toggleCommentLike = async (req, res) => {
    try {
        const { blogId, commentId } = req.params;
        const userId = req.user.id;

        const blog = await Blog.findById(blogId).select("comments");
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        const comment = blog.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const isLiked = comment.likes.some((like) => like.toString() === userId.toString());

        if (isLiked) {
            comment.likes = comment.likes.filter((like) => like.toString() !== userId.toString());
        } else {
            comment.likes.push(userId);
        }

        await blog.save();

        res.status(200).json({
            message: isLiked ? "Comment unliked successfully" : "Comment liked successfully",
            isLiked: !isLiked,
            likeCount: comment.likes.length
        });
    } catch (error) {
        console.error("Error in toggleCommentLike:", error);
        res.status(500).json({ message: "Error toggling comment like", error: error.message });
    }
};

const toggleReplyLike = async (req, res) => {
    try {
        const { blogId, commentId, replyId } = req.params;
        const userId = req.user.id;

        const blog = await Blog.findById(blogId).select("comments");
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        const comment = blog.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const reply = comment.replies.id(replyId);
        if (!reply) {
            return res.status(404).json({ message: "Reply not found" });
        }

        const isLiked = reply.likes.some((like) => like.toString() === userId.toString());

        if (isLiked) {
            reply.likes = reply.likes.filter((like) => like.toString() !== userId.toString());
        } else {
            reply.likes.push(userId);
        }

        await blog.save();

        res.status(200).json({
            message: isLiked ? "Reply unliked successfully" : "Reply liked successfully",
            isLiked: !isLiked,
            likeCount: reply.likes.length
        });
    } catch (error) {
        console.error("Error in toggleReplyLike:", error);
        res.status(500).json({ message: "Error toggling reply like", error: error.message });
    }
};

const trackView = async (req, res) => {
    try {
        const { blogId } = req.params;
        const userId = req.user?.id;

        const blog = await Blog.findByIdAndUpdate(
            blogId,
            { $inc: { viewCount: 1 } },
            { new: true }
        ).select("viewCount");

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        let uniqueViewCount;
        if (userId) {
            const uniqueResult = await Blog.findOneAndUpdate(
                { _id: blogId, "uniqueViews.user": { $ne: userId } },
                {
                    $push: {
                        uniqueViews: { user: userId, viewedAt: new Date() },
                    },
                },
                { new: true }
            ).select("uniqueViews");

            if (uniqueResult) {
                uniqueViewCount = uniqueResult.uniqueViews.length;
            } else {
                const existing = await Blog.findById(blogId)
                    .select("uniqueViews")
                    .lean();
                uniqueViewCount = existing?.uniqueViews?.length || 0;
            }
        }

        res.status(200).json({
            message: "View tracked successfully",
            viewCount: blog.viewCount,
            ...(uniqueViewCount !== undefined ? { uniqueViewCount } : {}),
        });
    } catch (error) {
        console.error("Error in trackView:", error);
        res.status(500).json({ message: "Error tracking view", error: error.message });
    }
};

const getBlogWithInteractions = async (req, res) => {
    try {
        const { blogId } = req.params;
        const userId = req.user?.id;

        const blog = await Blog.findById(blogId)
            .select("-uniqueViews")
            .populate("author", "username profileImage")
            .populate("comments.user", "username profileImage")
            .populate("comments.replies.user", "username profileImage")
            .lean();

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        const likeCount = Array.isArray(blog.likes) ? blog.likes.length : 0;
        const isLiked = userId
            ? blog.likes.some((like) => like.toString() === userId.toString())
            : false;

        const commentsWithLikes = (blog.comments || []).map((comment) => {
            const commentLikes = comment.likes || [];
            const isCommentLiked = userId
                ? commentLikes.some((like) => like.toString() === userId.toString())
                : false;

            const repliesWithLikes = (comment.replies || []).map((reply) => {
                const replyLikes = reply.likes || [];
                const isReplyLiked = userId
                    ? replyLikes.some((like) => like.toString() === userId.toString())
                    : false;
                return {
                    ...reply,
                    likes: undefined,
                    likeCount: replyLikes.length,
                    isLiked: isReplyLiked
                };
            });

            return {
                ...comment,
                likes: undefined,
                likeCount: commentLikes.length,
                isLiked: isCommentLiked,
                replies: repliesWithLikes
            };
        });

        const { likes, ...blogRest } = blog;
        const blogWithInteractions = {
            ...blogRest,
            likes: undefined,
            likeCount,
            isLiked,
            comments: commentsWithLikes
        };

        res.status(200).json({
            message: "Blog with interactions fetched successfully",
            blog: blogWithInteractions
        });
    } catch (error) {
        console.error("Error in getBlogWithInteractions:", error);
        res.status(500).json({ message: "Error fetching blog with interactions", error: error.message });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { blogId, commentId } = req.params;
        const userId = req.user.id;

        const blog = await Blog.findById(blogId).select("author comments");
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        const comment = blog.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const isCommentAuthor = comment.user.toString() === userId;
        const isBlogOwner = blog.author.toString() === userId;

        if (!isCommentAuthor && !isBlogOwner) {
            return res.status(403).json({ message: "You can only delete your own comments" });
        }

        blog.comments.pull(commentId);
        await blog.save();

        res.status(200).json({
            message: "Comment deleted successfully"
        });
    } catch (error) {
        console.error("Error in deleteComment:", error);
        res.status(500).json({ message: "Error deleting comment", error: error.message });
    }
};

const deleteReply = async (req, res) => {
    try {
        const { blogId, commentId, replyId } = req.params;
        const userId = req.user.id;

        const blog = await Blog.findById(blogId).select("author comments");
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        const comment = blog.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const reply = comment.replies.id(replyId);
        if (!reply) {
            return res.status(404).json({ message: "Reply not found" });
        }

        const isReplyAuthor = reply.user.toString() === userId;
        const isBlogOwner = blog.author.toString() === userId;

        if (!isReplyAuthor && !isBlogOwner) {
            return res.status(403).json({ message: "You can only delete your own replies" });
        }

        comment.replies.pull(replyId);
        await blog.save();

        res.status(200).json({
            message: "Reply deleted successfully"
        });
    } catch (error) {
        console.error("Error in deleteReply:", error);
        res.status(500).json({ message: "Error deleting reply", error: error.message });
    }
};

const shareBlog = async (req, res) => {
    try {
        const { blogId } = req.params;
        const userId = req.user._id;

        const blog = await Blog.findById(blogId).select("status title author");
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        if (blog.status !== "published") {
            return res.status(400).json({ message: "Only published blogs can be shared" });
        }

        const existingShare = await BlogShare.findOne({ user: userId, blog: blogId }).select("_id");
        if (existingShare) {
            return res.status(200).json({
                message: "Blog already shared with your followers",
                shareCount: await BlogShare.countDocuments({ blog: blogId })
            });
        }

        await BlogShare.create({ user: userId, blog: blogId });

        const sharer = await User.findById(userId).select("followers");
        if (sharer?.followers?.length) {
            await createNotificationsForUsers({
                recipientIds: sharer.followers,
                senderId: userId,
                type: "share",
                blogId: blog._id,
                message: blog.title || ""
            });
        }

        const shareCount = await BlogShare.countDocuments({ blog: blogId });

        res.status(201).json({
            message: "Blog shared with your followers",
            shareCount
        });
    } catch (error) {
        console.error("Error in shareBlog:", error);
        res.status(500).json({ message: "Error sharing blog", error: error.message });
    }
};

export default {
    addComment,
    addReply,
    toggleLike,
    toggleCommentLike,
    toggleReplyLike,
    trackView,
    getBlogWithInteractions,
    deleteComment,
    deleteReply,
    shareBlog
};
