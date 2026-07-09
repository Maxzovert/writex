import axiosInstance from "./axiosConfig";

export type NotificationType = "follow" | "share" | "like" | "comment";

export interface NotificationItem {
  _id: string;
  type: NotificationType;
  message?: string;
  read: boolean;
  createdAt: string;
  sender?: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  blog?: {
    _id: string;
    title?: string;
  };
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
  total: number;
  page: number;
  hasMore: boolean;
}

export async function fetchNotifications(page = 1, limit = 20): Promise<NotificationsResponse> {
  const { data } = await axiosInstance.get("/api/notifications", {
    params: { page, limit },
  });
  return data;
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const { data } = await axiosInstance.get("/api/notifications/unread-count");
  return data.unreadCount ?? 0;
}

export async function markNotificationAsRead(notificationId: string): Promise<number> {
  const { data } = await axiosInstance.patch(`/api/notifications/${notificationId}/read`);
  return data.unreadCount ?? 0;
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await axiosInstance.patch("/api/notifications/read-all");
}
