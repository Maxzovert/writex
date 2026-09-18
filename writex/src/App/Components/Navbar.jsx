import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "../../context/authContext";
import { getSafeImageUrl } from "../../lib/image-url";
import axios from "axios";
import { toast } from "react-toastify";
import { FaUser, FaSignOutAlt, FaTrashAlt, FaCog } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import { NotificationPanel } from "../../components/notifications/NotificationPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { isAuth0Configured, AUTH0_LOGOUT_FLAG, AUTH0_RETURN_TO_KEY } from "@/lib/auth0-config";

function displayName(user) {
  const name = user?.username?.trim();
  if (!name) return "Writer";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

const ProfileAvatar = ({ user, className = "h-9 w-9", loading = false }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getSafeImageUrl(user?.profileImage);

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  if (loading && !user) {
    return (
      <div
        className={cn(
          className,
          "animate-pulse rounded-full bg-muted ring-1 ring-border"
        )}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={cn(
        className,
        "flex items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-semibold text-foreground ring-1 ring-border"
      )}
    >
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={displayName(user)}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{displayName(user).charAt(0)}</span>
      )}
    </div>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearLocalSession, loading: authLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const NAVITEMS = [
    { title: "Desk", path: "/dashboard" },
    { title: "Read", path: "/blogs" },
    { title: "Library", path: "/myblogs" },
    { title: "Community", path: "/community" },
  ];

  const USERITEMS = [
    { title: "Profile", path: "/profile", logo: <FaUser className="h-3.5 w-3.5" /> },
    { title: "Settings", path: "/settings", logo: <FaCog className="h-3.5 w-3.5" /> },
    {
      title: "Recycle Bin",
      path: "/myblogs?view=trash",
      logo: <FaTrashAlt className="h-3.5 w-3.5" />,
    },
  ];

  const handleLogout = async () => {
    setProfileOpen(false);
    setIsMobileMenuOpen(false);

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/logout`);
    } catch (error) {
      console.error("Logout error:", error);
    }

    // Prevent Auth0SessionBridge from immediately syncing you back in
    sessionStorage.setItem(AUTH0_LOGOUT_FLAG, "1");
    sessionStorage.removeItem(AUTH0_RETURN_TO_KEY);
    clearLocalSession();
    toast.success("Logout Successfully");

    if (isAuth0Configured()) {
      const domain = import.meta.env.VITE_AUTH0_DOMAIN;
      const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
      const returnTo = encodeURIComponent(`${window.location.origin}/`);
      window.location.assign(
        `https://${domain}/v2/logout?client_id=${clientId}&returnTo=${returnTo}`
      );
      return;
    }

    navigate("/");
  };

  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/dashboard" && location.pathname.startsWith(path));

  const closeProfile = () => setProfileOpen(false);

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6">
      <div className="relative z-40 mx-auto flex h-14 max-w-6xl items-center gap-3 rounded-2xl border border-border/80 bg-card/90 px-3 shadow-sm backdrop-blur-md sm:h-16 sm:px-5">
        <Link to="/dashboard" className="inline-flex shrink-0 items-center gap-2.5">
          <img
            src={logo}
            alt="WriteX"
            className="h-8 w-auto dark:brightness-0 dark:invert"
          />
          <span className="wx-script hidden text-2xl tracking-tight text-foreground sm:inline">
            WriteX
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {NAVITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium transition",
                isActive(item.path)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Link
            to="/write"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
            Write
          </Link>
          <ThemeToggle className="h-9 w-9 shadow-none" />
          {user ? <NotificationPanel /> : null}

          {authLoading && !user ? (
            <ProfileAvatar user={null} loading />
          ) : user ? (
            <Popover open={profileOpen} onOpenChange={setProfileOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Open profile menu"
                  className="rounded-full outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <ProfileAvatar user={user} />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={10}
                className="z-[200] w-64 overflow-hidden rounded-2xl border-border/80 bg-card p-0 shadow-lg"
              >
                <div className="border-b border-border bg-muted/40 px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar user={user} className="h-11 w-11" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {displayName(user)}
                      </p>
                      {user.email ? (
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="p-1.5">
                  {USERITEMS.map((item) => (
                    <Link
                      to={item.path}
                      key={item.title}
                      onClick={closeProfile}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground transition hover:bg-muted"
                    >
                      <span className="text-muted-foreground">{item.logo}</span>
                      <span>{item.title}</span>
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-destructive transition hover:bg-destructive/10"
                  >
                    <FaSignOutAlt className="h-3.5 w-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          ) : null}
        </div>

        <div className="ml-auto flex items-center gap-2 md:hidden">
          <ThemeToggle className="h-9 w-9 shadow-none" />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="rounded-full border border-border p-2 text-muted-foreground"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <HiX className="h-5 w-5" />
            ) : (
              <HiMenu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <div className="relative z-50 mx-auto mt-2 max-w-6xl rounded-2xl border border-border bg-card p-4 shadow-lg md:hidden">
          <div className="space-y-1">
            {NAVITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "block rounded-xl px-3 py-3 text-sm font-medium",
                  isActive(item.path)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {item.title}
              </Link>
            ))}
            <Link
              to="/write"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-2 block rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
            >
              Write
            </Link>
          </div>
          {user ? (
            <div className="mt-4 border-t border-border pt-4">
              <div className="mb-3 flex items-center gap-3">
                <ProfileAvatar user={user} className="h-10 w-10" />
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {displayName(user)}
                  </p>
                  {user.email ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Welcome back</p>
                  )}
                </div>
              </div>
              {USERITEMS.map((item) => (
                <Link
                  key={item.title}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground hover:bg-muted"
                >
                  {item.logo}
                  {item.title}
                </Link>
              ))}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-destructive hover:bg-destructive/10"
              >
                <FaSignOutAlt />
                Logout
              </button>
              <div className="mt-2 flex items-center justify-between rounded-xl border border-border px-3 py-3">
                <span className="text-sm font-medium">Notifications</span>
                <NotificationPanel />
              </div>
            </div>
          ) : authLoading ? (
            <div className="mt-4 border-t border-border pt-4">
              <div className="flex items-center gap-3">
                <ProfileAvatar user={null} loading className="h-10 w-10" />
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
