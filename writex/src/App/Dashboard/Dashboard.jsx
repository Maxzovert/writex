import React from "react";
import { useAuth } from "../../context/authContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logo.png";
import { Button } from "../../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Dashboard = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const NAVITEMS = [
    {
      title: "Home",
      path: "/",
    },
    {
      title: "Blogs",
      path: "/blogs",
    },
    {
      title: "About",
      path: "/about",
    },
  ];

  const handleLogout = async () => {
    try {
      const res = await axios.post("/api/users/logout");
      setUser(null);
      toast.success("Logout Successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.response?.data?.message || "Logout Failed");
    }
  };

  return (
    <div>
      {/* NAVBAR */}
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
                    <a
                      href={item.path}
                      className="relative px-4 py-2 text-gray-700 font-medium hover:text-black transition-colors duration-200
                             after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-black 
                             after:transition-all after:duration-300 hover:after:w-full"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-4">
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
                      <h2 className="font-semibold text-gray-400 mt-2 ml-4 text-2xl">Abdullah</h2>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      {/* MID SECTION */}
      <div className="relative w-full h-[800px] mt-20 flex flex-row justify-center">
        <div className="w-[60%] h-[800px] bg-gray-400 ml-20 mr-4 rounded-4xl"></div>
        <div className="w-[30%] h-[800px] mr-20 rounded-4xl flex flex-col justify-between">
          <div className="w-full h-[395px] bg-gray-400 rounded-4xl"></div>
          <div className="w-full h-[395px] bg-gray-400 rounded-4xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
