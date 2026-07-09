import Notification from "../models/notificationModel.js";

const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const limit = Math.min(parseInt(req.query.limit, 10) || 30, 50);
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const skip = (page - 1) * limit;

        const [notifications, unreadCount, total] = await Promise.all([
            Notification.find({ recipient: userId })
                .populate("sender", "username profileImage")
                .populate("blog", "title")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Notification.countDocuments({ recipient: userId, read: false }),
            Notification.countDocuments({ recipient: userId })
        ]);

        res.status(200).json({
            notifications,
            unreadCount,
            total,
            page,
            hasMore: skip + notifications.length < total
        });
    } catch (error) {
        console.error("Error in getNotifications:", error);
        res.status(500).json({
            message: "Error fetching notifications",
            error: error.message
        });
    }
};

const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const unreadCount = await Notification.countDocuments({
            recipient: userId,
            read: false
        });

        res.status(200).json({ unreadCount });
    } catch (error) {
        console.error("Error in getUnreadCount:", error);
        res.status(500).json({
            message: "Error fetching unread count",
            error: error.message
        });
    }
};

const markAsRead = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { notificationId } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        const unreadCount = await Notification.countDocuments({
            recipient: userId,
            read: false
        });

        res.status(200).json({ message: "Marked as read", unreadCount });
    } catch (error) {
        console.error("Error in markAsRead:", error);
        res.status(500).json({
            message: "Error marking notification as read",
            error: error.message
        });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        await Notification.updateMany(
            { recipient: userId, read: false },
            { read: true }
        );

        res.status(200).json({ message: "All notifications marked as read", unreadCount: 0 });
    } catch (error) {
        console.error("Error in markAllAsRead:", error);
        res.status(500).json({
            message: "Error marking all notifications as read",
            error: error.message
        });
    }
};

export default {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
};
