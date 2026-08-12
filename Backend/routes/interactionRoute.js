import express from "express";
import interactionController from "../controller/interactionController.js";
import protectRoute from "../middleware/auth.js";
import optionalAuth from "../middleware/optionalAuth.js";

const interactionRouter = express.Router();

// Public routes (optional auth for isLiked / unique views)
interactionRouter.get("/blog/:blogId/interactions", optionalAuth, interactionController.getBlogWithInteractions);
interactionRouter.post("/blog/:blogId/view", optionalAuth, interactionController.trackView);

// Protected routes (authentication required)
interactionRouter.post("/blog/:blogId/comment", protectRoute, interactionController.addComment);
interactionRouter.post("/blog/:blogId/comment/:commentId/reply", protectRoute, interactionController.addReply);
interactionRouter.post("/blog/:blogId/like", protectRoute, interactionController.toggleLike);
interactionRouter.post("/blog/:blogId/comment/:commentId/like", protectRoute, interactionController.toggleCommentLike);
interactionRouter.post("/blog/:blogId/comment/:commentId/reply/:replyId/like", protectRoute, interactionController.toggleReplyLike);
interactionRouter.post("/blog/:blogId/share", protectRoute, interactionController.shareBlog);
interactionRouter.delete("/blog/:blogId/comment/:commentId", protectRoute, interactionController.deleteComment);
interactionRouter.delete("/blog/:blogId/comment/:commentId/reply/:replyId", protectRoute, interactionController.deleteReply);

export default interactionRouter;
