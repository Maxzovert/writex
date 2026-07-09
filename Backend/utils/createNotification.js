import Notification from "../models/notificationModel.js";

export const createNotification = async ({
    recipientId,
    senderId,
    type,
    blogId = null,
    message = ""
}) => {
    if (!recipientId || !senderId || !type) return null;
    if (recipientId.toString() === senderId.toString()) return null;

    try {
        return await Notification.create({
            recipient: recipientId,
            sender: senderId,
            type,
            blog: blogId,
            message
        });
    } catch (error) {
        console.error("Failed to create notification:", error.message);
        return null;
    }
};

export const createNotificationsForUsers = async ({
    recipientIds,
    senderId,
    type,
    blogId = null,
    message = ""
}) => {
    if (!recipientIds?.length || !senderId || !type) return [];

    const docs = recipientIds
        .filter((id) => id.toString() !== senderId.toString())
        .map((recipientId) => ({
            recipient: recipientId,
            sender: senderId,
            type,
            blog: blogId,
            message
        }));

    if (!docs.length) return [];

    try {
        return await Notification.insertMany(docs);
    } catch (error) {
        console.error("Failed to create bulk notifications:", error.message);
        return [];
    }
};
