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
  Tag,
  MessageCircle,
  Users,
  Trophy,
  Star,
  Share2,
  ThumbsUp,
  Reply,
  Bell,
  Search,
  Filter,
  Plus,
  Award,
  Target,
  Zap,
  Lightbulb,
  TrendingDown,
  BookOpen,
  Calendar as CalendarIcon,
  Sparkles,
  BarChart3
} from 'lucide-react';

const Dashboard = () => {
  const pathname = useLocation();
  const [currentTab, setCurrentTab] = useState("Home");
  const navigate = useNavigate();

  // Community & Engagement Data
  const recentComments = [
    {
      id: 1,
      author: "Sarah Chen",
      avatar: "/images/authors/sarah.jpg",
      comment: "This is exactly what I needed! Your travel tips saved me so much time planning my trip to Japan.",
      postTitle: "Ultimate Japan Travel Guide",
      timeAgo: "2 hours ago",
      likes: 12,
      isLiked: false
    },
    {
      id: 2,
      author: "Mike Rodriguez",
      avatar: "/images/authors/mike.jpg",
      comment: "Great insights on productivity! I've been implementing your morning routine for a week now.",
      postTitle: "5 Morning Habits That Changed My Life",
      timeAgo: "5 hours ago",
      likes: 8,
      isLiked: true
    },
    {
      id: 3,
      author: "Emma Thompson",
      avatar: "/images/authors/emma.jpg",
      comment: "Could you write more about sustainable living? Your previous post was so helpful!",
      postTitle: "Zero Waste Kitchen Tips",
      timeAgo: "1 day ago",
      likes: 15,
      isLiked: false
    }
  ];

  const followerActivity = [
    {
      id: 1,
      type: "new_follower",
      user: "Alex Kumar",
      avatar: "/images/authors/alex.jpg",
      action: "started following you",
      timeAgo: "30 minutes ago"
    },
    {
      id: 2,
      type: "mention",
      user: "Lisa Park",
      avatar: "/images/authors/lisa.jpg",
      action: "mentioned you in their post",
      postTitle: "Best Writing Tools for Beginners",
      timeAgo: "2 hours ago"
    },
    {
      id: 3,
      type: "share",
      user: "David Wilson",
      avatar: "/images/authors/david.jpg",
      action: "shared your post",
      postTitle: "10 Productivity Hacks for Writers",
      timeAgo: "4 hours ago"
    }
  ];

  const trendingTopics = [
    {
      id: 1,
      title: "AI in Daily Life",
      category: "Technology",
      searchVolume: "12.5K",
      trend: "up",
      difficulty: "Medium",
      tags: ["AI", "Productivity", "Future Tech"]
    },
    {
      id: 2,
      title: "Sustainable Living Tips",
      category: "Lifestyle",
      searchVolume: "8.9K",
      trend: "up",
      difficulty: "Easy",
      tags: ["Eco-friendly", "Green Living", "Sustainability"]
    },
    {
      id: 3,
      title: "Remote Work Productivity",
      category: "Business",
      searchVolume: "15.2K",
      trend: "stable",
      difficulty: "Medium",
      tags: ["Work from Home", "Productivity", "Career"]
    }
  ];

  const contentIdeas = [
    {
      id: 1,
      title: "10 Morning Routines That Changed My Life",
      type: "Listicle",
      estimatedReadTime: "8 min",
      difficulty: "Easy",
      category: "Lifestyle",
      inspiration: "Based on your previous productivity posts"
    },
    {
      id: 2,
      title: "The Complete Guide to Building a Personal Brand",
      type: "Guide",
      estimatedReadTime: "15 min",
      difficulty: "Medium",
      category: "Business",
      inspiration: "Trending in your network"
    },
    {
      id: 3,
      title: "5 JavaScript Frameworks Every Developer Should Know in 2025",
      type: "Tutorial",
      estimatedReadTime: "12 min",
      difficulty: "Hard",
      category: "Technology",
      inspiration: "High search volume topic"
    }
  ];

  const seasonalContent = [
    {
      id: 1,
      month: "January",
      theme: "New Year, New Goals",
      suggestions: ["Goal Setting", "Habit Formation", "Year Planning"],
      color: "bg-gray-900 text-white"
    },
    {
      id: 2,
      month: "February",
      theme: "Love & Relationships",
      suggestions: ["Self-Love", "Relationship Tips", "Valentine's Content"],
      color: "bg-gray-100 text-gray-700"
    },
    {
      id: 3,
      month: "March",
      theme: "Spring & Growth",
      suggestions: ["Spring Cleaning", "Personal Growth", "Fresh Starts"],
      color: "bg-gray-900 text-white"
    }
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

      {/* Community & Engagement Hub */}
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
              Community Hub
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto oxygen-regular">
              Connect, engage, and grow with your writing community
            </p>
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Recent Comments */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 lexend-txt flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-blue-500" />
                  Recent Comments
                </h3>
                <button className="text-blue-500 hover:text-blue-600 font-medium text-sm flex items-center gap-1">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                {recentComments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                    className="p-4 bg-gray-50/50 rounded-2xl hover:bg-gray-100/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={comment.avatar}
                        alt={comment.author}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 text-sm">{comment.author}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{comment.timeAgo}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{comment.comment}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-blue-600 font-medium">on "{comment.postTitle}"</span>
                          <div className="flex items-center gap-3">
                            <button className={`flex items-center gap-1 text-xs ${comment.isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 transition-colors`}>
                              <ThumbsUp className="w-3 h-3" />
                              {comment.likes}
                            </button>
                            <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors">
                              <Reply className="w-3 h-3" />
                              Reply
                            </button>
                          </div>
                        </div>
                  </div>
                </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Follower Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 lexend-txt flex items-center gap-2">
                  <Bell className="w-5 h-5 text-green-500" />
                  Activity
                </h3>
                <button className="text-green-500 hover:text-green-600 font-medium text-sm">
                  Mark All Read
                </button>
              </div>
              
              <div className="space-y-4">
                {followerActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="p-3 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={activity.avatar}
                        alt={activity.user}
                        className="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">{activity.user}</span> {activity.action}
                        </p>
                        {activity.postTitle && (
                          <p className="text-xs text-blue-600 mt-1">"{activity.postTitle}"</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{activity.timeAgo}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
                  </div>

          {/* Content Ideas & Inspiration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-gray-900 lexend-txt flex items-center gap-3">
                <Lightbulb className="w-8 h-8 text-blue-500" />
                Content Ideas & Inspiration
                  </h3>
              <button className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full font-medium hover:bg-gray-800 transition-colors">
                <Sparkles className="w-4 h-4" />
                Generate Ideas
              </button>
            </div>

            {/* Trending Topics */}
            <div className="mb-12">
              <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Trending Topics
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trendingTopics.map((topic, index) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-1 bg-gray-900 text-white text-xs rounded-full font-medium">
                        {topic.category}
                      </span>
                      <div className="flex items-center gap-1">
                        {topic.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-blue-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-xs text-gray-500">{topic.searchVolume}</span>
                      </div>
                    </div>
                    
                    <h5 className="text-lg font-bold text-gray-900 mb-2 lexend-txt">{topic.title}</h5>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {topic.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        topic.difficulty === 'Easy' ? 'bg-gray-900 text-white' :
                        topic.difficulty === 'Medium' ? 'bg-gray-100 text-gray-700' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {topic.difficulty}
                      </span>
                      <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
                        Write About This
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* AI-Suggested Content Ideas */}
            <div className="mb-12">
              <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                AI-Suggested Content Ideas
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {contentIdeas.map((idea, index) => (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-1 bg-gray-900 text-white text-xs rounded-full font-medium">
                        {idea.type}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {idea.estimatedReadTime}
                      </div>
                    </div>
                    
                    <h5 className="text-lg font-bold text-gray-900 mb-2 lexend-txt">{idea.title}</h5>
                    <p className="text-sm text-gray-600 mb-3 oxygen-regular">{idea.inspiration}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        idea.difficulty === 'Easy' ? 'bg-gray-900 text-white' :
                        idea.difficulty === 'Medium' ? 'bg-gray-100 text-gray-700' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {idea.difficulty}
                      </span>
                      <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
                        Start Writing
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Seasonal Content Calendar */}
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-500" />
                Seasonal Content Calendar
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {seasonalContent.map((season, index) => (
                  <motion.div
                    key={season.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${season.color}`}>
                        {season.month}
                      </span>
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    
                    <h5 className="text-lg font-bold text-gray-900 mb-3 lexend-txt">{season.theme}</h5>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 font-medium">Content Suggestions:</p>
                      <div className="flex flex-wrap gap-1">
                        {season.suggestions.map((suggestion, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {suggestion}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <button className="w-full mt-4 bg-gray-900 text-white py-2 rounded-xl font-medium hover:bg-gray-800 transition-colors">
                      Plan Content
                    </button>
                  </motion.div>
                ))}
                  </div>
                </div>
              </motion.div>


          {/* Bottom CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 lexend-txt mb-4">
              Ready to engage with your community?
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={startWritting}
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              <PenTool className="w-4 h-4" />
                Start Writing
              </button>
              <button onClick={() => navigate("/community")} className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-600 transition-colors">
                <Users className="w-4 h-4" />
                Join Community
            </button>
            </div>
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
