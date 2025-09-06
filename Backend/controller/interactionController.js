import Blog from "../models/postModel.js";
import User from "../models/userModel.js";

// Add a comment to a blog post
const addComment = async (req, res) => {
    try {
        const { blogId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: "Comment content is required" });
        }

        const blog = await Blog.findById(blogId);
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

        // Populate the comment with user details
        await blog.populate({
            path: 'comments.user',
            select: 'username profileImage'
        });

        const addedComment = blog.comments[blog.comments.length - 1];

        res.status(201).json({
            message: "Comment added successfully",
            comment: addedComment
        });
    } catch (error) {
        console.error("Error in addComment:", error);
        res.status(500).json({ message: "Error adding comment", error: error.message });
    }
};

// Add a reply to a comment
const addReply = async (req, res) => {
    try {
        const { blogId, commentId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: "Reply content is required" });
        }

        const blog = await Blog.findById(blogId);
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

        // Populate the reply with user details
        await blog.populate({
            path: 'comments.replies.user',
            select: 'username profileImage'
        });

        const addedReply = comment.replies[comment.replies.length - 1];

        res.status(201).json({
            message: "Reply added successfully",
            reply: addedReply
        });
    } catch (error) {
        console.error("Error in addReply:", error);
        res.status(500).json({ message: "Error adding reply", error: error.message });
    }
};

// Like/Unlike a blog post
const toggleLike = async (req, res) => {
    try {
        const { blogId } = req.params;
        const userId = req.user.id;

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        const isLiked = blog.likes.includes(userId);
        
        if (isLiked) {
            // Unlike the post
            blog.likes = blog.likes.filter(like => like.toString() !== userId);
        } else {
            // Like the post
            blog.likes.push(userId);
        }

        await blog.save();

        res.status(200).json({
            message: isLiked ? "Post unliked successfully" : "Post liked successfully",
            isLiked: !isLiked,
            likeCount: blog.likes.length
        });
    } catch (error) {
        console.error("Error in toggleLike:", error);
        res.status(500).json({ message: "Error toggling like", error: error.message });
    }
};

// Like/Unlike a comment
const toggleCommentLike = async (req, res) => {
    try {
        const { blogId, commentId } = req.params;
        const userId = req.user.id;

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        const comment = blog.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const isLiked = comment.likes.includes(userId);
        
        if (isLiked) {
            // Unlike the comment
            comment.likes = comment.likes.filter(like => like.toString() !== userId);
        } else {
            // Like the comment
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

// Like/Unlike a reply
const toggleReplyLike = async (req, res) => {
    try {
        const { blogId, commentId, replyId } = req.params;
        const userId = req.user.id;

        const blog = await Blog.findById(blogId);
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

        const isLiked = reply.likes.includes(userId);
        
        if (isLiked) {
            // Unlike the reply
            reply.likes = reply.likes.filter(like => like.toString() !== userId);
        } else {
            // Like the reply
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

// Track a view for a blog post
const trackView = async (req, res) => {
    try {
        const { blogId } = req.params;
        const userId = req.user?.id; // Optional for anonymous users

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Increment view count
        blog.viewCount += 1;

        // If user is logged in, track unique view
        if (userId) {
            const existingView = blog.uniqueViews.find(view => 
                view.user.toString() === userId
            );

            if (!existingView) {
                blog.uniqueViews.push({
                    user: userId,
                    viewedAt: new Date()
                });
            }
        }

        await blog.save();

        res.status(200).json({
            message: "View tracked successfully",
            viewCount: blog.viewCount,
            uniqueViewCount: blog.uniqueViews.length
        });
    } catch (error) {
        console.error("Error in trackView:", error);
        res.status(500).json({ message: "Error tracking view", error: error.message });
    }
};

// Get blog with all interactions
const getBlogWithInteractions = async (req, res) => {
    try {
        const { blogId } = req.params;
        const userId = req.user?.id;

        const blog = await Blog.findById(blogId)
            .populate('author', 'username profileImage')
            .populate('likes', 'username')
            .populate('comments.user', 'username profileImage')
            .populate('comments.likes', 'username')
            .populate('comments.replies.user', 'username profileImage')
            .populate('comments.replies.likes', 'username')
            .populate('uniqueViews.user', 'username');

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Check if current user has liked the post
        const isLiked = userId ? blog.likes.some(like => like._id.toString() === userId) : false;

        // Check if current user has liked each comment
        const commentsWithLikes = blog.comments.map(comment => {
            const isCommentLiked = userId ? comment.likes.some(like => like._id.toString() === userId) : false;
            
            const repliesWithLikes = comment.replies.map(reply => {
                const isReplyLiked = userId ? reply.likes.some(like => like._id.toString() === userId) : false;
                return {
                    ...reply.toObject(),
                    isLiked: isReplyLiked
                };
            });

            return {
                ...comment.toObject(),
                isLiked: isCommentLiked,
                replies: repliesWithLikes
            };
        });

        const blogWithInteractions = {
            ...blog.toObject(),
            isLiked,
            comments: commentsWithLikes,
            uniqueViewCount: blog.uniqueViews.length
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

// Delete a comment (only by the author or blog owner)
const deleteComment = async (req, res) => {
    try {
        const { blogId, commentId } = req.params;
        const userId = req.user.id;

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        const comment = blog.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if user is the comment author or blog owner
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

// Delete a reply (only by the author or blog owner)
const deleteReply = async (req, res) => {
    try {
        const { blogId, commentId, replyId } = req.params;
        const userId = req.user.id;

        const blog = await Blog.findById(blogId);
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

        // Check if user is the reply author or blog owner
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

export default {
    addComment,
    addReply,
    toggleLike,
    toggleCommentLike,
    toggleReplyLike,
    trackView,
    getBlogWithInteractions,
    deleteComment,
    deleteReply
};
