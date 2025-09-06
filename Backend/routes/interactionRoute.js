import express from "express";
import interactionController from "../controller/interactionController.js";
import protectRoute from "../middleware/auth.js";

const interactionRouter = express.Router();

// Public routes (no authentication required)
interactionRouter.get("/blog/:blogId/interactions", interactionController.getBlogWithInteractions);
interactionRouter.post("/blog/:blogId/view", interactionController.trackView);

// Protected routes (authentication required)
interactionRouter.post("/blog/:blogId/comment", protectRoute, interactionController.addComment);
interactionRouter.post("/blog/:blogId/comment/:commentId/reply", protectRoute, interactionController.addReply);
interactionRouter.post("/blog/:blogId/like", protectRoute, interactionController.toggleLike);
interactionRouter.post("/blog/:blogId/comment/:commentId/like", protectRoute, interactionController.toggleCommentLike);
interactionRouter.post("/blog/:blogId/comment/:commentId/reply/:replyId/like", protectRoute, interactionController.toggleReplyLike);
interactionRouter.delete("/blog/:blogId/comment/:commentId", protectRoute, interactionController.deleteComment);
interactionRouter.delete("/blog/:blogId/comment/:commentId/reply/:replyId", protectRoute, interactionController.deleteReply);

export default interactionRouter;
