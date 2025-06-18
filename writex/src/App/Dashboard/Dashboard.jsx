import React, { useState } from "react";
import { useAuth } from "../../context/authContext";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logo.png";
import FirstGrid from "../../assets/firstgrid.jpg";
import twoGrid from "../../assets/twoGrid.jpg";
import threeGrid from "../../assets/threeGrid.jpg";
import secondSec from "../../assets/secondSec.jpg";
import { Button } from "../../components/ui/button";
import { BoxReveal } from "@/components/magicui/box-reveal";
import { TextReveal } from "@/components/magicui/text-reveal";
import { PulsatingButton } from "@/components/magicui/pulsating-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Dashboard = () => {
  const pathname = useLocation();
  const [currentTab, setCurrentTab] = useState("Home");
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

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
      path: "/addblog",
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

  const startWritting = () => {
    navigate("/addblog");
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
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

    
          {/* MID SECTION */}
          <div className="relative w-full h-[800px] mt-20 flex flex-row justify-center">
        {/* Left Large Image Box */}
        <div className="w-[60%] h-[800px] ml-20 mr-4 rounded-4xl overflow-hidden relative">
          <img
            src={FirstGrid}
            alt="Travel"
            className="w-full h-full object-cover rounded-4xl"
          />
          <h1 className="absolute bottom-6 left-6 text-white text-[100px] font-bold lexend-txt">
            1. Travel
          </h1>
        </div>

        {/* Right Side Boxes */}
        <div className="w-[30%] h-[800px] mr-20 flex flex-col justify-between">
          {/* Top Box */}
          <div className="w-full h-[395px] rounded-4xl overflow-hidden relative">
            <img
              src={twoGrid}
              alt="Food"
              className="w-full h-full object-cover rounded-4xl"
            />
            <h1 className="absolute bottom-4 left-4 text-white text-[60px] lexend-txt font-semibold">
              2. Food
            </h1>
          </div>

          {/* Bottom Box */}
          <div className="w-full h-[395px] rounded-4xl overflow-hidden relative">
            <img
              src={threeGrid}
              alt="Journal"
              className="w-full h-full object-cover rounded-4xl"
            />
            <h1 className="absolute bottom-4 left-4 text-[60px] lexend-txt font-bold text-white">
              3. Journal
            </h1>
          </div>
        </div>
      </div>



      {/* divider */}
      <div className="border-b-2 border-gray-400 mt-24 mr-16 ml-16"></div>

      <div className="flex w-full h-[1000px] mt-24 justify-center">
        <div className="w-[85%] h-[700px] relative">
          <img
            src={secondSec}
            alt=""
            className="rounded-4xl w-full object-cover"
          />
          <div className="absolute inset-0 z-10 flex items-center justify-center flex-col">
            <BoxReveal boxColor={"white"}>
              <h1 className="text-[60px] text-white font-bold">
                GOT SOMETHING TO SAY??
              </h1>
            </BoxReveal>
            <BoxReveal boxColor={"white"}>
              <h2 className="text-[25px] text-white font-semibold text-center mt-2">
                Got a hot take, a cool hack, or a tutorial that slaps?
              </h2>
            </BoxReveal>
            <BoxReveal boxColor={"white"}>
              <h2 className="text-[25px] text-white font-semibold text-center mt-2">
                This is your space to share it.
              </h2>
            </BoxReveal>
            <PulsatingButton
              className="mt-8 bg-black text-white font-semibold text-xl"
              pulseColor="white"
              onClick={startWritting}
            >
              Start Writing
            </PulsatingButton>
          </div>
        </div>
      </div>

      <div className="bg-gray-200 w-full mt-24">
        <TextReveal className="relative mt-10 text-center text-white">
          Tutorials, tips, stories, if it slaps, post it.
          No pressure no gatekeeping, just real ones sharing real stuff
        </TextReveal>
      </div>

      <div className="border-b-2 border-gray-400 mt-24 mr-16 ml-16"></div>
      
    </div>
  );
};

export default Dashboard;

                 