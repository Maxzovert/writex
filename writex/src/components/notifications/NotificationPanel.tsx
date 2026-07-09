import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Heart, MessageCircle, Share2, UserPlus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { getSafeImageUrl } from "@/lib/image-url";
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationItem,
} from "@/lib/notifications-api";

const formatTimeAgo = (date: string) => {
  const now = Date.now();
  const diff = Math.floor((now - new Date(date).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
};

const firstUpperCase = (str?: string) => {
  if (!str) return "Someone";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getNotificationIcon = (type: NotificationItem["type"]) => {
  switch (type) {
    case "follow":
      return <UserPlus className="h-4 w-4 text-blue-500" />;
    case "share":
      return <Share2 className="h-4 w-4 text-violet-500" />;
    case "like":
      return <Heart className="h-4 w-4 text-rose-500" />;
    case "comment":
      return <MessageCircle className="h-4 w-4 text-emerald-500" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

const getNotificationText = (notification: NotificationItem) => {
  const name = firstUpperCase(notification.sender?.username);

  switch (notification.type) {
    case "follow":
      return `${name} started following you`;
    case "share":
      return `${name} shared a blog${notification.blog?.title ? `: ${notification.blog.title}` : ""}`;
    case "like":
      return `${name} liked your blog${notification.blog?.title ? `: ${notification.blog.title}` : ""}`;
    case "comment":
      return `${name} commented on your blog${notification.blog?.title ? `: ${notification.blog.title}` : ""}`;
    default:
      return "New notification";
  }
};

const getNotificationLink = (notification: NotificationItem) => {
  if (notification.type === "follow" && notification.sender?.username) {
    return `/author/${notification.sender.username}`;
  }
  if (notification.blog?._id) {
    return `/blog/${notification.blog._id}`;
  }
  if (notification.sender?.username) {
    return `/author/${notification.sender.username}`;
  }
  return null;
};

export function NotificationPanel() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await fetchUnreadNotificationCount();
      setUnreadCount(count);
    } catch {
      // Ignore when logged out or network fails
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchNotifications(1, 25);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open, loadNotifications]);

  const handleNotificationClick = async (notification: NotificationItem) => {
    const link = getNotificationLink(notification);

    if (!notification.read) {
      try {
        const count = await markNotificationAsRead(notification._id);
        setUnreadCount(count);
        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notification._id ? { ...item, read: true } : item
          )
        );
      } catch {
        // Continue navigation even if mark-read fails
      }
    }

    setOpen(false);
    if (link) navigate(link);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch {
      // no-op
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(24rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-8 gap-1 px-2 text-xs">
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-[min(24rem,60vh)] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Bell className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm font-medium text-foreground">No notifications yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Follows, shares, likes, and comments will show up here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((notification) => {
                const avatar = getSafeImageUrl(notification.sender?.profileImage);
                return (
                  <li key={notification._id}>
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-accent ${
                        !notification.read ? "bg-muted/40" : ""
                      }`}
                    >
                      <div className="relative shrink-0">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={notification.sender?.username || "User"}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                            {notification.sender?.username?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-background bg-background">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug text-foreground">
                          {getNotificationText(notification)}
                        </p>
                        {notification.type === "comment" && notification.message && (
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            “{notification.message}”
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
