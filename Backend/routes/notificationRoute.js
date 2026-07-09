import express from "express";
import protectRoute from "../middleware/auth.js";
import notificationController from "../controller/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/", protectRoute, notificationController.getNotifications);
notificationRouter.get("/unread-count", protectRoute, notificationController.getUnreadCount);
notificationRouter.patch("/read-all", protectRoute, notificationController.markAllAsRead);
notificationRouter.patch("/:notificationId/read", protectRoute, notificationController.markAsRead);

export default notificationRouter;
