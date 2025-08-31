import React, { useEffect, useRef, useState } from "react";
import Navbar from "../Components/Navbar";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  Heart,
  ArrowRight,
  Calendar,
  Tag,
  Filter,
  Sparkles,
  BookHeart,
  Handshake,
  CircuitBoard,
  HeartPulse,
  BookA,
  Tv,
  Medal,
  ArrowBigUp
} from 'lucide-react';

const Blog = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const hasFatched = useRef(false);
  const navigate = useNavigate();

  const handleFetchAllBlogs = async () => {
    if (hasFatched.current) return;
    hasFatched.current = true;

    try {
      const fetchData = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/public/posts/blogs/`);
      console.log(fetchData.data.allBlogs)
      setData(fetchData.data.allBlogs);
      setFilteredData(fetchData.data.allBlogs);
      toast.success("Blog Fetched")
    } catch (error) {
      toast.error("Error in handle fetch all blogs");
    }
  }

  useEffect(() => {
    handleFetchAllBlogs();
  }, [])

  const CATAGORY = [
    {
      type: "All",
      icon: <Sparkles className="w-4 h-4" />,
      count: data.length
    },
    {
      type: "General",
      icon: <Tag className="w-4 h-4" />,
      count: data.filter(blog => blog.category === "General").length
    },
    {
      type: "Personal",
      icon: <BookHeart className="w-4 h-4" />,
      count: data.filter(blog => blog.category === "Personal").length
    },
    {
      type: "Business",
      icon: <Handshake className="w-4 h-4" />,
      count: data.filter(blog => blog.category === "Business").length
    },
    {
      type: "Tech",
      icon: <CircuitBoard className="w-4 h-4" />,
      count: data.filter(blog => blog.category === "Tech").length
    },
    {
      type: "Health",
      icon: <HeartPulse className="w-4 h-4" />,
      count: data.filter(blog => blog.category === "Health").length
    },
    {
      type: "Education",
      icon: <BookA className="w-4 h-4" />,
      count: data.filter(blog => blog.category === "Education").length
    },
    {
      type: "Entertainment",
      icon: <Tv className="w-4 h-4" />,
      count: data.filter(blog => blog.category === "Entertainment").length
    },
    {
      type: "Sports",
      icon: <Medal className="w-4 h-4" />,
      count: data.filter(blog => blog.category === "Sports").length
    },
    {
      type: "Other",
      icon: <ArrowBigUp className="w-4 h-4" />,
      count: data.filter(blog => !blog.category || !["General", "Personal", "Business", "Tech", "Health", "Education", "Entertainment", "Sports"].includes(blog.category)).length
    },
  ];

  const firstUpperCase = (str) => {
    const capName = str.charAt(0).toUpperCase() + str.slice(1);
    return capName;
  }

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter blogs by category
  const handleCategoryFilter = (category) => {
    setActiveCategory(category);
    if (category === "All") {
      setFilteredData(data);
    } else {
      const filtered = data.filter(blog => blog.category === category);
      setFilteredData(filtered);
    }
  };

  return (
    <div>
      <Navbar />

      {/* Enhanced Category Navigation */}
      <section className="py-16 px-4 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          {/* <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Discover Amazing Blogs
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Explore stories, insights, and perspectives from our community of writers
            </p>
          </motion.div> */}

          {/* Category Filter Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-gray-600 font-medium cursor-pointer" onClick={() => setShowFilters(!showFilters)}>Filter by Category</span>
          </motion.div>

          {/* Enhanced Category Grid */}
          {showFilters && <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto"
          >
            {CATAGORY.map((category, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                onClick={() => handleCategoryFilter(category.type)}
                className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${activeCategory === category.type
                    ? 'border-gray-900 bg-gray-900 text-white shadow-xl'
                    : 'border-gray-200 bg-white/80 backdrop-blur-sm text-gray-700 hover:border-gray-300 hover:bg-white'
                  }`}
              >
                {activeCategory === category.type && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute inset-0 bg-gray-900 rounded-2xl -z-10"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                <div className="text-center">
                  <div className={`flex items-center justify-center mb-2 ${activeCategory === category.type ? 'text-white' : 'text-gray-600'
                    }`}>
                    {category.icon}
                  </div>
                  <div className={`font-semibold text-sm mb-1 ${activeCategory === category.type ? 'text-white' : 'text-gray-900'
                    }`}>
                    {category.type}
                  </div>
                  <div className={`text-xs ${activeCategory === category.type ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                    {category.count} blogs
                  </div>
                </div>

                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${activeCategory === category.type ? 'hidden' : ''
                  }`} />
              </motion.button>
            ))}
          </motion.div>}

          {activeCategory !== "All" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mt-6"
            >
              <span className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium">
                <Tag className="w-4 h-4" />
                Showing {filteredData.length} blogs in {activeCategory}
                <button
                  onClick={() => handleCategoryFilter("All")}
                  className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
                >
                  ×
                </button>
              </span>
            </motion.div>
          )}
        </div>
      </section>

      {/* Blogs Grid */}
      <section className="py-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {filteredData.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center py-20"
            >
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <div className="text-gray-500 text-xl mb-2">
                {activeCategory === "All" ? "No blogs found yet." : `No blogs found in ${activeCategory}.`}
              </div>
              <div className="text-gray-400 text-sm">
                Be the first to write something amazing!
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {filteredData.map((blog, index) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    {blog.mainImage ? (
                      <img
                        src={blog.mainImage}
                        alt={blog.title || "Blog Image"}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-lg">No Image</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                        <Tag className="w-3 h-3" />
                        {blog.category || "General"}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Author Info */}
                    <div className="flex items-center gap-3 mb-4">
                      {blog.profileImage ? (
                        <img
                          src={blog.profileImage}
                          alt={blog.author?.username || "Author"}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {firstUpperCase(blog.author?.username || "A").charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {firstUpperCase(blog.author?.username) || "Unknown"}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(blog.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-gray-700 transition-colors">
                      {blog.title || "Untitled Blog"}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {typeof blog.content === "string"
                        ? blog.content
                        // : JSON.stringify(blog.content)}
                        : blog.description}
                    </p>

                    {/* Stats & Read More */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {blog.views || "0"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {blog.likes || "0"}
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/blog/${blog._id}`)}
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
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      {filteredData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16 mb-20 px-4 lg:px-8"
        >
          <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
            Found something interesting? Share your own story!
          </h3>
          <button
            onClick={() => navigate("/write")}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            Start Writing Now
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Blog;
