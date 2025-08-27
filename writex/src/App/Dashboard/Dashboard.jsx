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
import { motion } from 'framer-motion';
import { 
  PenTool, 
  TrendingUp, 
  Clock, 
  Heart,
  Eye,
  ArrowRight,
  Calendar,
  User,
  Tag
} from 'lucide-react';

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
      views: "2.4K",
      likes: "156"
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
      mainImage: FirstGrid,
      views: "1.8K",
      likes: "89"
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
      views: "3.2K",
      likes: "234"
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
      views: "1.5K",
      likes: "67"
    },
  ];

  const stats = [
    { icon: <PenTool className="w-6 h-6" />, label: "Total Posts", value: "156" },
    { icon: <Eye className="w-6 h-6" />, label: "Total Views", value: "12.4K" },
    { icon: <Heart className="w-6 h-6" />, label: "Total Likes", value: "892" },
    { icon: <TrendingUp className="w-6 h-6" />, label: "Growth", value: "+23%" }
  ];

  const startWritting = () => {
    navigate("/write");
  };

  return (
    <div className="min-h-scree">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative w-full pt-16 pb-20 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Message */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 lexend-txt mb-6">
              Welcome back, <span className="text-gray-700">Writer!</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto oxygen-regular">
              Ready to create something amazing? Your next great story is just a click away.
            </p>
          </motion.div>

          {/* Category Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {/* Main Category */}
            <div className="lg:col-span-2 h-[600px] md:h-[700px] lg:h-[800px] rounded-3xl overflow-hidden relative group">
              <img
                src={FirstGrid}
                alt="Travel"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm mb-3">
                  <Tag className="w-4 h-4" />
                  Travel
                </div>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white lexend-txt">
                  Explore the World
                </h2>
              </div>
            </div>

            {/* Side Categories */}
            <div className="space-y-6 h-[600px] md:h-[700px] lg:h-[800px] flex flex-col justify-between">
              <div className="h-[290px] md:h-[340px] lg:h-[390px] rounded-3xl overflow-hidden relative group">
                <img
                  src={twoGrid}
                  alt="Food"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm mb-2">
                    <Tag className="w-4 h-4" />
                    Food
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white lexend-txt">
                    Culinary Adventures
                  </h3>
                </div>
              </div>

              <div className="h-[290px] md:h-[340px] lg:h-[390px] rounded-3xl overflow-hidden relative group">
                <img
                  src={threeGrid}
                  alt="Journal"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm mb-2">
                    <Tag className="w-4 h-4" />
                    Journal
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white lexend-txt">
                    Personal Stories
                  </h3>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative rounded-4xl overflow-hidden"
          >
            <img
              src={secondSec}
              alt="Start Writing"
              className="w-full h-[400px] md:h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute inset-0 z-10 flex items-center justify-center flex-col text-center px-6">
              <BoxReveal boxColor={"white"}>
                <h1 className="text-3xl md:text-5xl lg:text-6xl text-white font-bold lexend-txt mb-6">
                  GOT SOMETHING TO SAY??
                </h1>
              </BoxReveal>
              <BoxReveal boxColor={"white"}>
                <p className="text-lg md:text-xl lg:text-2xl text-white font-medium mb-8 max-w-3xl oxygen-regular">
                  Got a hot take, a cool hack, or a tutorial that slaps? 
                  This is your space to share it.
                </p>
              </BoxReveal>
              <PulsatingButton
                className="bg-white text-gray-900 font-semibold text-lg md:text-xl px-8 py-4 rounded-full hover:bg-gray-100 transition-colors"
                pulseColor="gray"
                onClick={startWritting}
              >
                Start Writing
              </PulsatingButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Top Blogs Section */}
      <section className="py-20 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 lexend-txt mb-6">
              Top Blogs
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto oxygen-regular">
              Discover the most engaging content from our community of writers
            </p>
          </motion.div>

          {/* Blogs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {topBlogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={blog.mainImage}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      <Tag className="w-3 h-3" />
                      {blog.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Author Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={blog.profileImage}
                      alt={blog.author}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{blog.author}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {blog.date}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 lexend-txt group-hover:text-gray-700 transition-colors">
                    {blog.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4 oxygen-regular">
                    {blog.content}
                  </p>

                  {/* Stats & Read More */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {blog.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {blog.likes}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/blog/${blog.id}`)}
                      className="flex items-center gap-1 text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors group-hover:gap-2"
                    >
                      Read More
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 lexend-txt mb-4">
              Write Your blog and get a chance to be featured in the top 5
            </h3>
            <button
              onClick={startWritting}
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              <PenTool className="w-4 h-4" />
              Start Writing Now
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 lg:px-8 mt-20 rounded-t-4xl">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-3 bg-gray-600 rounded-full">
              <PenTool className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold lexend-txt">Writex</span>
          </div>
          <p className="text-gray-300 mb-8 text-lg oxygen-regular max-w-2xl mx-auto">
            Empowering writers to share their stories with the world. Join our community and start creating today.
          </p>
          <div className="text-sm text-gray-500 oxygen-regular">
            © 2024 Writex. All rights reserved. Made with ❤️ for the writing community.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
