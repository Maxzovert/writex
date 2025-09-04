import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { Button } from "../../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "../../context/authContext";
import axios from "axios";
import { toast } from "react-toastify";
import { FaUser } from "react-icons/fa";
import { TbArticleFilled } from "react-icons/tb";
import { HiMenu, HiX } from "react-icons/hi";
import { RiFolderInfoFill } from "react-icons/ri";


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
    },
    {
      title: "About",
      path: "/About",
      logo: <RiFolderInfoFill />
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
      <div className="h-20 w-full max-w-7xl bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg relative z-40">
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
                    className="relative px-3 lg:px-4 py-2 text-gray-700 font-medium hover:text-black transition-colors duration-200
                               after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-black 
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
            <div className="border-gray-300 w-16 lg:w-18 border-2 p-1.5 rounded-sm text-gray-600 text-[14px] lg:text-[16px] text-center font-semibold">
              Ctrl+k
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 transition-colors"
            >
              Logout
            </Button>
            <Popover>
              <PopoverTrigger>
                <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-700 font-semibold shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.username}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span className={`${user?.profileImage ? 'hidden' : ''}`}>
                    {user?.username?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
              </PopoverTrigger>
              <PopoverContent>
                <div>
                  <div className="flex flex-row">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-700 font-semibold shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      {user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.username}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span className={`${user?.profileImage ? 'hidden' : ''}`}>
                        {user?.username?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <h2 className="font-semibold text-gray-400 mt-2 ml-4 text-2xl">
                      {user?.username?.[0]?.toUpperCase() + user?.username.slice(1)}
                    </h2>
                  </div>
                  <div className="flex flex-col mt-4 text-gray-400">
                    {USERITEMS.map((item) => (
                      <Link to={item.path} key={item.title} className="flex flex-row hover:bg-gray-200 p-2 hover:rounded-md">
                        <div className="mt-1">{item.logo}</div>
                        <h1 className="ml-2">{item.title}</h1>
                      </Link>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
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
          <div className="md:hidden border-t border-gray-200 bg-white shadow-xl rounded-b-2xl absolute top-full left-0 right-0 z-50">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Navigation Items */}
              <ul className="space-y-3">
                {NAVITEMS.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.path}
                      onClick={closeMobileMenu}
                      className="block px-4 py-3 text-gray-700 font-medium hover:text-black hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Mobile User Section */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-700 font-semibold shadow-sm">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span className={`${user?.profileImage ? 'hidden' : ''}`}>
                      {user?.username?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-800 text-lg">
                      {user?.username?.[0]?.toUpperCase() + user?.username.slice(1)}
                    </h2>
                    <p className="text-sm text-gray-500">Welcome back!</p>
                  </div>
                </div>

                {/* Mobile User Menu Items */}
                <div className="space-y-2 mb-4">
                  {USERITEMS.map((item) => (
                    <Link 
                      to={item.path} 
                      key={item.title} 
                      onClick={closeMobileMenu}
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="text-gray-500">{item.logo}</div>
                      <span className="ml-3 font-medium">{item.title}</span>
                    </Link>
                  ))}
                </div>

                {/* Mobile Controls */}
                <div className="space-y-3">
                  <div className="border-gray-300 w-full border-2 p-3 rounded-lg text-gray-600 text-center font-semibold bg-gray-50">
                    Ctrl+k
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 transition-colors"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
