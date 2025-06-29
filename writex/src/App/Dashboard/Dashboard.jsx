import React, { useState } from "react";
import { useAuth } from "../../context/authContext";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import FirstGrid from "../../assets/firstgrid.jpg";
import twoGrid from "../../assets/twoGrid.jpg";
import threeGrid from "../../assets/threeGrid.jpg";
import secondSec from "../../assets/secondSec.jpg";
import { BoxReveal } from "@/components/magicui/box-reveal";
import { TextReveal } from "@/components/magicui/text-reveal";
import { PulsatingButton } from "@/components/magicui/pulsating-button";
import Navbar from "../Components/Navbar";

const Dashboard = () => {
  const pathname = useLocation();
  const [currentTab, setCurrentTab] = useState("Home");
  const navigate = useNavigate();

  const topBlogs = [
    {
      id: 1,
      title: "Exploring the Hidden Gems of Northern India",
      author: "Priya Mehra",
      category: "Travel",
      date: "2025-06-08",
      content:
        "From remote villages in Himachal to offbeat spots in Uttarakhand, discover breathtaking destinations beyond the tourist radar.",
      profileImage: "/images/authors/priya.jpg",
      mainImage: secondSec,
    },
    {
      id: 2,
      title: "5 Quick & Healthy Breakfast Recipes You Can Make in 10 Minutes",
      author: "Chef Aman Singh",
      category: "Food",
      date: "2025-06-12",
      content:
        "Start your day with these easy and nutritious breakfast ideas — perfect for busy mornings without compromising on taste.",
      profileImage: "/images/authors/aman.jpg",
      mainImage: FirstGrid
    },
    {
      id: 3,
      title: "Top 7 JavaScript Trends to Watch in 2025",
      author: "Ritika Sharma",
      category: "Tech",
      date: "2025-06-15",
      content:
        "From AI integrations to edge computing, dive into the future of JavaScript development and what frameworks are rising.",
      profileImage: "/images/authors/ritika.jpg",
      mainImage: threeGrid,
    },
    {
      id: 4,
      title: "What Journaling Taught Me About Mindfulness",
      author: "Kabir Arora",
      category: "Journal",
      date: "2025-06-18",
      content:
        "A personal story on how daily journaling transformed my approach to life, focus, and emotional clarity.",
      profileImage: "/images/authors/kabir.jpg",
      mainImage: secondSec,
    },
    {
      id: 5,
      title: "What Journaling Taught Me About Mindfulness",
      author: "Kabir Arora",
      category: "Journal",
      date: "2025-06-18",
      content:
        "A personal story on how daily journaling transformed my approach to life, focus, and emotional clarity.",
      profileImage: "/images/authors/kabir.jpg",
      mainImage: twoGrid,
    },
    {
      id: 6,
      title: "What Journaling Taught Me About Mindfulness",
      author: "Kabir Arora",
      category: "Journal",
      date: "2025-06-18",
      content:
        "A personal story on how daily journaling transformed my approach to life, focus, and emotional clarity.",
      profileImage: "/images/authors/kabir.jpg",
      mainImage: twoGrid,
    },

  ];



  const startWritting = () => {
    navigate("/write");
  };

  return (
    <div>
      <Navbar/>
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

      {/* 2nd sec */}

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
              <h2 className="text-[25px] text-white font-semibold text-center mt-2 mb-1">
                Got a hot take, a cool hack, or a tutorial that slaps?
              </h2>
            </BoxReveal>
            <BoxReveal boxColor={"white"}>
              <h2 className="text-[25px] text-white font-semibold text-center">
                This is your space to share it.
              </h2>
            </BoxReveal>
            <PulsatingButton
              className="mt-8 bg-black text-white font-semibold text-xl mb-1"
              pulseColor="white"
              onClick={startWritting}
            >
              Start Writing
            </PulsatingButton>
          </div>
        </div>
      </div>

      <div className="bg-gray-200 w-full mt-24">
        <TextReveal className="relative mt-10 text-center text-white  tracking-wide leading-relaxed">
          Tutorials, tips, stories, if it slaps, post it. No pressure no
          gatekeeping, just real ones sharing real stuff
        </TextReveal>
      </div>

      <div className="mt-24 w-full min-h-screen px-6">
        {/* Heading */}
        <div className="text-[64px] md:text-[100px] lexend-txt font-bold text-center mb-12">
          Top Blogs
        </div>

        <div className="mt-12 overflow-x-auto">
          <div className="flex justify-around gap-8 px-4">
            {topBlogs.map((blog) => (
              <div
                key={blog.id}
                className="w-[350px] h-[500px] bg-white border border-gray-300 rounded-xl shadow-lg flex-shrink-0 overflow-hidden"
              >
                {/* Top 50% - Image */}
                <div className="h-1/2 w-full">
                  <img
                    src={blog.mainImage}
                    // alt={blog.title}
                    className="w-full h-full"
                  />
                </div>

                {/* Bottom 50% - Content */}
                <div className="h-1/2 p-4 flex flex-col justify-between">
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <img
                      src={blog.profileImage}
                      // alt={blog.author}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="font-semibold text-gray-700">
                      {blog.author}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold mt-2 text-gray-800 truncate">
                    {blog.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-gray-600 line-clamp-3 text-justify mt-1">
                    {blog.content}
                  </p>

                  {/* Read More */}
                  <a
                    href="#"
                    className="text-gray-600 text-sm font-semibold mt-3 hover:text-black self-start"
                  >
                    Read More →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <h1 className="text-center text-4xl font-semibold lexend-txt">Write Your blog and get a chance to be featured in the top 5</h1>
        </div>
      </div>

      {/* Footer TO DO */}
      <div className="bg-gray-200 w-full mt-24 rounded-t-4xl">
        <div className="">

        </div>
      </div>

    </div>
  );
};

export default Dashboard;
