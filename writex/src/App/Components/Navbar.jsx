import React from "react";
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

const Navbar = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
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
      title: "About",
      path: "/about",
    },
  ];
  const USERITEMS = [
    {
      title : "Profile",
      path : "/profile",
      logo : <FaUser/>
    },
    {
      title : "My Blogs",
      path : "/myblogs",
      logo : <TbArticleFilled/>
    }
  ];
  const handleLogout = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/logout`);
      setUser(null);
      toast.success("Logout Successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.response?.data?.message || "Logout Failed");
    }
  };
  return (
    <div className="flex items-center justify-center mt-8">
      <div className="h-20 w-full mx-64 bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg">
        <div className="flex flex-row items-center justify-between px-6 h-full">
          <div className="flex items-center">
            <img
              src={logo}
              alt="Writex Logo"
              className="h-12 w-auto hover:opacity-80 transition-opacity"
            />
          </div>

          <div className="flex-1 mx-12">
            <ul className="flex flex-row items-center justify-center gap-6">
              {NAVITEMS.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className="relative px-4 py-2 text-gray-700 font-medium hover:text-black transition-colors duration-200
                               after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-black 
                               after:transition-all after:duration-300 hover:after:w-full"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-4">
            <div className="border-gray-300 w-18 border-2 p-1.5 rounded-sm text-gray-600 text-[16px] text-center font-semibold">
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
                <div
                  className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 
                flex items-center justify-center text-gray-700 font-semibold shadow-sm
                hover:shadow-md transition-shadow cursor-pointer"
                >
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              </PopoverTrigger>
              <PopoverContent>
                <div>
                  <div className="flex flex-row">
                    <div
                      className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 
                flex items-center justify-center text-gray-700 font-semibold shadow-sm
                hover:shadow-md transition-shadow cursor-pointer"
                    >
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <h2 className="font-semibold text-gray-400 mt-2 ml-4 text-2xl">
                      Abdullah
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
        </div>
      </div>
    </div>
  );
};

export default Navbar;
