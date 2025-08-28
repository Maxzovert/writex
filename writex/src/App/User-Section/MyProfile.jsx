import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit3, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Heart, 
  FileText,
  X,
  Plus,
  ExternalLink,
  Camera
} from 'lucide-react';
import { 
  FaInstagram, 
  FaLinkedin, 
  FaTwitter 
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../context/authContext';
import { uploadImageToSupabase } from '../../lib/supabase-storage';

const MyProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [selectedSocial, setSelectedSocial] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  
  // Profile state with real data
  const [profile, setProfile] = useState({
    name: "",
    bio: "Add Bio",
    profileImage: "",
    favoriteTopics: ["Technology", "Travel", "Food", "Lifestyle", "Business"],
    totalLikes: 0,
    totalPublishedBlogs: 0,
    socialLinks: {
      instagram: "",
      linkedin: "",
      twitter: ""
    }
  });

  const [editForm, setEditForm] = useState({
    name: "",
    bio: profile.bio,
    favoriteTopics: [...profile.favoriteTopics]
  });

  const socialPlatforms = [
    { 
      name: 'instagram', 
      icon: FaInstagram, 
      color: 'from-pink-500 to-purple-600',
      label: 'Instagram'
    },
    { 
      name: 'linkedin', 
      icon: LinkedInIcon, 
      color: 'from-blue-600 to-blue-700',
      label: 'LinkedIn'
    },
    { 
      name: 'twitter', 
      icon: FaTwitter, 
      color: 'from-blue-400 to-blue-500',
      label: 'Twitter'
    }
  ];

  // Custom LinkedIn icon component since it's not in react-icons
  function LinkedInIcon({ className }) {
  return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    );
  }

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        navigate('/login');
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/profile-stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const { user: userData, stats } = response.data;
      
      setProfile(prev => ({
        ...prev,
        name: userData.username || "User",
        profileImage: userData.profileImage || "",
        totalLikes: stats.totalLikes || 0,
        totalPublishedBlogs: stats.publishedBlogs || 0
      }));

      setEditForm(prev => ({
        ...prev,
        name: userData.username || "User"
      }));

    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch profile data');
      
      // Fallback to user context data
      if (user?.username) {
        setProfile(prev => ({
          ...prev,
          name: user.username
        }));
        setEditForm(prev => ({
          ...prev,
          name: user.username
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle profile image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      toast.info('Uploading image...');
      
      // Upload to Supabase
      const uploadResult = await uploadImageToSupabase(file);
      
      // Update backend
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/users/profile-image`,
        { profileImage: uploadResult.url },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update local state
      setProfile(prev => ({
        ...prev,
        profileImage: uploadResult.url
      }));

      // Update user context
      if (setUser && user) {
        setUser(prev => ({
          ...prev,
          profileImage: uploadResult.url
        }));
      }

      toast.success('Profile image updated successfully!');
      
    } catch (error) {
      console.error('Error uploading image:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to upload image. Please try again.');
      }
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Trigger file input
  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      name: profile.name,
      bio: profile.bio,
      favoriteTopics: [...profile.favoriteTopics]
    });
  };

  const handleSave = () => {
    setProfile(prev => ({
      ...prev,
      ...editForm
    }));
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: profile.name,
      bio: profile.bio,
      favoriteTopics: [...profile.favoriteTopics]
    });
  };

  const handleAddTopic = () => {
    const newTopic = prompt('Enter new topic:');
    if (newTopic && newTopic.trim()) {
      setEditForm(prev => ({
        ...prev,
        favoriteTopics: [...prev.favoriteTopics, newTopic.trim()]
      }));
    }
  };

  const handleRemoveTopic = (index) => {
    setEditForm(prev => ({
      ...prev,
      favoriteTopics: prev.favoriteTopics.filter((_, i) => i !== index)
    }));
  };

  const openSocialModal = (platform) => {
    setSelectedSocial(platform);
    setSocialUrl(profile.socialLinks[platform] || '');
    setShowSocialModal(true);
  };

  const handleSocialSave = () => {
    if (socialUrl.trim()) {
      setProfile(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [selectedSocial]: socialUrl.trim()
        }
      }));
      setShowSocialModal(false);
      setSocialUrl('');
      toast.success(`${socialPlatforms.find(p => p.name === selectedSocial)?.label} profile connected!`);
    } else {
      toast.error('Please enter a valid URL');
    }
  };

  const handleSocialRemove = (platform) => {
    setProfile(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: ""
      }
    }));
    toast.success(`${socialPlatforms.find(p => p.name === platform)?.label} profile removed!`);
  };

  const goBackToBlogs = () => {
    navigate('/blogs');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <motion.button
            onClick={goBackToBlogs}
            className="text-gray-500 hover:text-gray-700 transition-colors lexend-txt text-sm"
            whileHover={{ x: -2 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            ← Back to Blogs
          </motion.button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Profile Section */}
          <div className="text-center mb-16">
            {/* Profile Image */}
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100">
                {uploadingImage ? (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  </div>
                ) : profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                {/* Fallback avatar */}
                <div className={`w-full h-full bg-gray-100 flex items-center justify-center ${profile.profileImage ? 'hidden' : ''}`}>
                  <span className="text-2xl font-light text-gray-400 lexend-txt">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
              </div>
              {isEditing && (
                <button 
                  onClick={triggerImageUpload}
                  disabled={uploadingImage}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Name and Bio */}
            {isEditing ? (
              <div className="space-y-4 max-w-md mx-auto">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="text-3xl font-light text-gray-900 bg-transparent border-b border-gray-200 focus:border-gray-400 focus:outline-none text-center w-full transition-colors"
                  placeholder="Enter your name"
                />
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="text-gray-600 bg-transparent border-b border-gray-200 focus:border-gray-400 focus:outline-none resize-none text-center w-full transition-colors"
                  placeholder="Tell us about yourself"
                  rows={3}
                />
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-light text-gray-900 oxygen-bold mb-3">
                  {profile.name || "User"}
                </h1>
                <p className="text-gray-600 lexend-txt max-w-md mx-auto leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8">
              {isEditing ? (
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-gray-900 text-white text-sm rounded-full hover:bg-gray-800 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 text-gray-500 text-sm rounded-full hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEdit}
                  className="px-6 py-2 text-gray-500 text-sm rounded-full hover:text-gray-700 transition-colors border border-gray-200 hover:border-gray-300"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl font-light text-gray-900 oxygen-bold mb-2">
                {profile.totalLikes}
              </div>
              <div className="text-sm text-gray-500 lexend-txt">Total Likes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-light text-gray-900 oxygen-bold mb-2">
                {profile.totalPublishedBlogs}
              </div>
              <div className="text-sm text-gray-500 lexend-txt">Published Blogs</div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Favorite Topics */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-900 lexend-txt">Favorite Topics</h2>
                {isEditing && (
                  <button
                    onClick={handleAddTopic}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {(isEditing ? editForm.favoriteTopics : profile.favoriteTopics).map((topic, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-gray-50 text-gray-700 text-sm rounded-full lexend-txt flex items-center gap-2"
                  >
                    {topic}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveTopic(index)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 lexend-txt mb-6">Social Media</h2>
              
              <div className="space-y-3">
                {socialPlatforms.map((platform) => {
                  const Icon = platform.icon;
                  const hasLink = profile.socialLinks[platform.name];
                  
                  return (
                    <div key={platform.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-600">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-gray-700 lexend-txt">{platform.label}</span>
                      </div>
                      
                      {hasLink ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={hasLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Visit
                          </a>
                          <button
                            onClick={() => handleSocialRemove(platform.name)}
                            className="text-sm text-red-500 hover:text-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openSocialModal(platform.name)}
                          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Media Modal */}
      {showSocialModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 lexend-txt">
                Connect to {socialPlatforms.find(p => p.name === selectedSocial)?.label}
              </h3>
              <button
                onClick={() => setShowSocialModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 lexend-txt">
                  Profile URL
                </label>
                <input
                  type="url"
                  value={socialUrl}
                  onChange={(e) => setSocialUrl(e.target.value)}
                  placeholder={`Enter your ${socialPlatforms.find(p => p.name === selectedSocial)?.label} profile URL`}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none text-gray-900 lexend-txt"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleSocialSave}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowSocialModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 text-sm rounded-lg hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden"
        accept="image/*"
      />
    </div>
  );
};

export default MyProfile;
