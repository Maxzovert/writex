import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import axiosInstance from "../../lib/axiosConfig";
import { toast } from "react-toastify";
import { motion } from 'framer-motion';
import { 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar, 
  Tag, 
  MoreVertical,
  PenTool,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus
} from 'lucide-react';

const MyBlog = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showActions, setShowActions] = useState({});
  const [operationLoading, setOperationLoading] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const hasFetched = useRef(false);
  const navigate = useNavigate();
  const actionsRef = useRef(null);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFetchUserBlogs = async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    try {
      setLoading(true);
      const fetchData = await axiosInstance.get(`/blog/myblogs/`);
      setData(fetchData.data.blogs);
      toast.success("Blogs fetched successfully");
    } catch (error) {
      toast.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  const refreshBlogs = () => {
    hasFetched.current = false;
    handleFetchUserBlogs();
  };

  useEffect(() => {
    handleFetchUserBlogs();
  }, []);

  const firstUpperCase = (str) => {
    if (!str) return "Unknown";
    const capName = str.charAt(0).toUpperCase() + str.slice(1);
    return capName;
  };

  const handleEditBlog = (blog) => {
    navigate(`/write`, { state: { editBlog: blog } });
  };

  const handleDeleteBlog = async (blogId) => {
    if (window.confirm("Are you sure you want to delete this blog? This action cannot be undone.")) {
      try {
        setOperationLoading(prev => ({ ...prev, [blogId]: true }));
        
        const response = await axiosInstance.delete(`/blog/deleteblog/${blogId}`);
        
        if (response.status === 200) {
          setData(prevData => {
            const newData = prevData.filter(blog => blog._id !== blogId);
            return newData;
          });
          toast.success("Blog deleted successfully");
        } else {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
            toast.error("Authentication failed. Please log in again.");
          } else if (error.response.status === 403) {
            toast.error("You don't have permission to delete this blog.");
          } else if (error.response.status === 404) {
            toast.error("Blog not found. It may have already been deleted.");
          } else {
            toast.error(`Failed to delete blog: ${error.response.data?.message || error.response.statusText}`);
          }
        } else if (error.request) {
          toast.error("Network error: Please check your internet connection");
        } else {
          toast.error(`Failed to delete blog: ${error.message}`);
        }
      } finally {
        setOperationLoading(prev => ({ ...prev, [blogId]: false }));
      }
    }
  };

  const handleToggleStatus = async (blog) => {
    try {
      setOperationLoading(prev => ({ ...prev, [blog._id]: true }));
      const newStatus = blog.status === 'published' ? 'draft' : 'published';
      
      const response = await axiosInstance.put(`/blog/updateblog/${blog._id}`, {
        title: blog.title,
        content: blog.content,
        category: blog.category,
        status: newStatus,
        mainImage: blog.mainImage,
        description: blog.description
      });
      
      if (response.data) {
        setData(prevData => 
          prevData.map(b => 
            b._id === blog._id ? { ...b, status: newStatus } : b
          )
        );
        
        toast.success(`Blog ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
      }
    } catch (error) {
      toast.error("Failed to update blog status");
    } finally {
      setOperationLoading(prev => ({ ...prev, [blog._id]: false }));
    }
  };

  const toggleActions = (blogId) => {
    setShowActions(prev => ({
      ...prev,
      [blogId]: !prev[blogId]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published':
        return <Eye className="w-4 h-4" />;
      case 'draft':
        return <EyeOff className="w-4 h-4" />;
      case 'archived':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredBlogs = data.filter(blog => {
    const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof blog.content === "string" && blog.content.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your blogs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative w-full pt-16 pb-20 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 lexend-txt mb-6">
              My <span className="text-gray-700">Blogs</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto oxygen-regular">
              Manage and organize your published content. Edit, unpublish, or delete your blogs as needed.
            </p>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16"
          >
            <div className="bg-white rounded-3xl p-6 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <PenTool className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{data.length}</div>
              <div className="text-gray-600">Total Blogs</div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {data.filter(blog => blog.status === 'published').length}
              </div>
              <div className="text-gray-600">Published</div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <EyeOff className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {data.filter(blog => blog.status === 'draft').length}
              </div>
              <div className="text-gray-600">Drafts</div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {data.reduce((total, blog) => total + (blog.viewCount || 0), 0)}
              </div>
              <div className="text-gray-600">Total Views</div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16"
          >
            <button
              onClick={() => navigate("/write")}
              className="inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Write New Blog
            </button>
            <button
              onClick={refreshBlogs}
              disabled={loading}
              className="inline-flex items-center gap-3 bg-white text-gray-900 px-6 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Refresh
            </button>
          </motion.div>

          {/* Filter Controls */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8"
          >
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent w-64"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Status Filter */}
            <div className="flex bg-white rounded-full border border-gray-200 p-1 shadow-sm">
              {['all', 'published', 'draft'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    statusFilter === status
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {status === 'all' ? 'All Blogs' : firstUpperCase(status)}
                  {status !== 'all' && (
                    <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                      {data.filter(blog => blog.status === status).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blogs Section */}
      <section className="py-20 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {data.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <PenTool className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No blogs yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start your writing journey by creating your first blog post. Share your thoughts, experiences, and knowledge with the world.
              </p>
              <button
                onClick={() => navigate("/write")}
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Write Your First Blog
              </button>
            </motion.div>
          ) : filteredBlogs.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <EyeOff className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No blogs found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchQuery ? 'No blogs match your search query.' : 'No blogs match your current filter.'} Try changing the filter or create a new blog post.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
                >
                  Show All Blogs
                </button>
                <button
                  onClick={() => navigate("/write")}
                  className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors border-2 border-gray-200"
                >
                  <Plus className="w-4 h-4" />
                  Write New Blog
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Results Counter */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center mb-8"
              >
                <p className="text-gray-600">
                  Showing {filteredBlogs.length} of {data.length} blogs
                  {searchQuery && ` matching "${searchQuery}"`}
                  {statusFilter !== 'all' && ` (${firstUpperCase(statusFilter)} only)`}
                </p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                {filteredBlogs.map((blog, index) => (
                  <motion.div
                    key={blog._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-3xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group"
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
                          <PenTool className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(blog.status)}`}>
                          {getStatusIcon(blog.status)}
                          {firstUpperCase(blog.status)}
                        </span>
                      </div>

                      {/* Actions Menu */}
                      <div className="absolute top-3 right-3">
                        <div className="relative" ref={actionsRef}>
                          <button
                            onClick={() => toggleActions(blog._id)}
                            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-700" />
                          </button>
                          
                          {showActions[blog._id] && (
                            <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 min-w-[160px] z-10">
                              <button
                                onClick={() => handleEditBlog(blog)}
                                disabled={operationLoading[blog._id]}
                                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {operationLoading[blog._id] ? (
                                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                ) : (
                                  <Edit3 className="w-4 h-4" />
                                )}
                                Edit Blog
                              </button>
                              <button
                                onClick={() => handleToggleStatus(blog)}
                                disabled={operationLoading[blog._id]}
                                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {operationLoading[blog._id] ? (
                                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                ) : blog.status === 'published' ? (
                                  <>
                                    <EyeOff className="w-4 h-4" />
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4" />
                                    Publish
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteBlog(blog._id)}
                                disabled={operationLoading[blog._id]}
                                className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {operationLoading[blog._id] ? (
                                  <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                                Delete Blog
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Meta Info */}
                      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(blog.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {firstUpperCase(blog.category || 'general')}
                        </div>
                        {blog.viewCount > 0 && (
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {blog.viewCount}
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 lexend-txt group-hover:text-gray-700 transition-colors">
                        {blog.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4 oxygen-regular">
                        {typeof blog.content === "string"
                          ? blog.content
                          : JSON.stringify(blog.content)}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <button
                          onClick={() => navigate(`/blog/${blog._id}`)}
                          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors group-hover:gap-3"
                        >
                          Read Full Blog
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditBlog(blog)}
                            disabled={operationLoading[blog._id]}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Edit Blog"
                          >
                            {operationLoading[blog._id] ? (
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                            ) : (
                              <Edit3 className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleToggleStatus(blog)}
                            disabled={operationLoading[blog._id]}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={blog.status === 'published' ? 'Unpublish Blog' : 'Publish Blog'}
                          >
                            {operationLoading[blog._id] ? (
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                            ) : blog.status === 'published' ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default MyBlog;
