import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { TbArticleFilled } from "react-icons/tb";
import { HiMenu, HiX } from "react-icons/hi";
import { NotificationPanel } from "../../components/notifications/NotificationPanel";

const ProfileAvatar = ({ user, className = "h-10 w-10 lg:h-12 lg:w-12" }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getSafeImageUrl(user?.profileImage);

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  return (
    <div
      className={`${className} rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-600 dark:to-zinc-700 flex items-center justify-center text-foreground font-semibold shadow-sm`}
    >
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={user?.username || "User"}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{user?.username?.[0]?.toUpperCase() || "U"}</span>
      )}
    </div>
  );
};


const Navbar = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const NAVITEMS = [
    {
      title: "Home",
      path: "/dashboard",
    },
    {
      title: "Blogs",
      path: "/blogs",
    },
    {
      title: "Write",
      path: "/write",
    },
    {
      title: "Community",
      path: "/community",
    },
  ];
  
  const USERITEMS = [
    {
      title: "Profile",
      path: "/profile",
      logo: <FaUser />
    },
    {
      title: "My Blogs",
      path: "/myblogs",
      logo: <TbArticleFilled />
    }
  ];
  
  const handleLogout = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/logout`);
      setUser(null);
      localStorage.removeItem('token');
      toast.success("Logout Successfully");
      navigate("/");
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.response?.data?.message || "Logout Failed");
    }
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  return (
    <div className="flex items-center justify-center mt-8 px-4">
      <div className="h-20 w-full max-w-7xl bg-card/90 backdrop-blur-md border border-border rounded-2xl shadow-lg relative z-40 text-card-foreground">
        <div className="flex flex-row items-center px-4 sm:px-6 h-full">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src={logo}
              alt="Writex Logo"
              className="h-10 w-auto sm:h-12 hover:opacity-80 transition-opacity"
            />
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex flex-1 justify-center">
            <ul className="flex flex-row items-center gap-4 lg:gap-6">
              {NAVITEMS.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className="relative px-3 lg:px-4 py-2 text-muted-foreground font-medium hover:text-foreground transition-colors duration-200
                               after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-foreground 
                               after:transition-all after:duration-300 hover:after:w-full"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            {user && <NotificationPanel />}
            <Popover>
              <PopoverTrigger>
                <div className="hover:shadow-md transition-shadow cursor-pointer">
                  <ProfileAvatar user={user} />
                </div>
              </PopoverTrigger>
              <PopoverContent>
                <div>
                  <div className="flex flex-row">
                    <ProfileAvatar user={user} className="h-12 w-12" />
                    <h2 className="font-semibold text-muted-foreground mt-2 ml-4 text-2xl">
                      {user?.username?.[0]?.toUpperCase() + user?.username.slice(1)}
                    </h2>
                  </div>
                  <div className="flex flex-col mt-4 text-muted-foreground">
                    {USERITEMS.map((item) => (
                      <Link to={item.path} key={item.title} className="flex flex-row hover:bg-accent p-2 hover:rounded-md">
                        <div className="mt-1">{item.logo}</div>
                        <h1 className="ml-2">{item.title}</h1>
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="flex flex-row hover:bg-accent p-2 hover:rounded-md w-full text-left"
                    >
                      <div className="mt-1"><FaSignOutAlt /></div>
                      <span className="ml-2">Logout</span>
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <HiX className="h-6 w-6" />
              ) : (
                <HiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card shadow-xl rounded-b-2xl absolute top-full left-0 right-0 z-50 text-card-foreground">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Navigation Items */}
              <ul className="space-y-3">
                {NAVITEMS.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.path}
                      onClick={closeMobileMenu}
                      className="block px-4 py-3 text-muted-foreground font-medium hover:text-foreground hover:bg-accent rounded-lg transition-colors duration-200"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Mobile User Section */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-3 mb-4">
                  <ProfileAvatar user={user} className="h-10 w-10" />
                  <div>
                    <h2 className="font-semibold text-foreground text-lg">
                      {user?.username?.[0]?.toUpperCase() + user?.username.slice(1)}
                    </h2>
                    <p className="text-sm text-muted-foreground">Welcome back!</p>
                  </div>
                </div>

                {/* Mobile User Menu Items */}
                <div className="space-y-2 mb-4">
                  {USERITEMS.map((item) => (
                    <Link 
                      to={item.path} 
                      key={item.title} 
                      onClick={closeMobileMenu}
                      className="flex items-center px-4 py-3 text-muted-foreground hover:bg-accent rounded-lg transition-colors"
                    >
                      <div className="text-muted-foreground">{item.logo}</div>
                      <span className="ml-3 font-medium">{item.title}</span>
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-muted-foreground hover:bg-accent rounded-lg transition-colors"
                  >
                    <FaSignOutAlt className="text-muted-foreground" />
                    <span className="ml-3 font-medium">Logout</span>
                  </button>
                </div>

                {/* Mobile Controls */}
                {user && (
                  <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                    <span className="text-sm font-medium text-foreground">Notifications</span>
                    <NotificationPanel />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
