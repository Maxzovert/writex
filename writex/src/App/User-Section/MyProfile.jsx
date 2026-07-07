import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
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
import Navbar from '../Components/Navbar';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../context/authContext';
import { uploadImageToCloudinary } from '../../lib/cloudinary-storage';
import { getSafeImageUrl } from '../../lib/image-url';

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
        bio: userData.bio || "Add Bio",
        socialLinks: userData.socialLinks || {
          instagram: "",
          linkedin: "",
          twitter: ""
        },
        totalLikes: stats.totalLikes || 0,
        totalPublishedBlogs: stats.publishedBlogs || 0
      }));

      setEditForm(prev => ({
        ...prev,
        name: userData.username || "User",
        bio: userData.bio || "Add Bio"
      }));

    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch profile data');
      
      // Fallback to user context data
      if (user?.username) {
        setProfile(prev => ({
          ...prev,
          name: user.username,
          bio: user.bio || "Add Bio"
        }));
        setEditForm(prev => ({
          ...prev,
          name: user.username,
          bio: user.bio || "Add Bio"
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
      
      const uploadResult = await uploadImageToCloudinary(file);
      
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

  const handleSave = async () => {
    try {
      // Make API call to update profile
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/users/profile`,
        { 
          username: editForm.name,
          bio: editForm.bio 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update local profile state
      setProfile(prev => ({
        ...prev,
        ...editForm
      }));

      // Update user context with new data
      if (setUser && user) {
        setUser(prev => ({
          ...prev,
          username: editForm.name,
          bio: editForm.bio
        }));
      }

      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update profile. Please try again.');
      }
    }
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

  const handleSocialSave = async () => {
    if (socialUrl.trim()) {
      try {
        // Make API call to update social links
        const token = localStorage.getItem('token');
        const formattedUrl = formatSocialUrl(socialUrl.trim());
        const updatedSocialLinks = {
          ...profile.socialLinks,
          [selectedSocial]: formattedUrl
        };

        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/users/profile`,
          { socialLinks: updatedSocialLinks },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        // Update local state
        setProfile(prev => ({
          ...prev,
          socialLinks: updatedSocialLinks
        }));

        setShowSocialModal(false);
        setSocialUrl('');
        toast.success(`${socialPlatforms.find(p => p.name === selectedSocial)?.label} profile connected!`);
      } catch (error) {
        console.error('Error updating social links:', error);
        toast.error('Failed to save social link. Please try again.');
      }
    } else {
      toast.error('Please enter a valid URL');
    }
  };

  const handleSocialRemove = async (platform) => {
    try {
      // Make API call to update social links
      const token = localStorage.getItem('token');
      const updatedSocialLinks = {
        ...profile.socialLinks,
        [platform]: ""
      };

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/users/profile`,
        { socialLinks: updatedSocialLinks },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update local state
      setProfile(prev => ({
        ...prev,
        socialLinks: updatedSocialLinks
      }));

      toast.success(`${socialPlatforms.find(p => p.name === platform)?.label} profile removed!`);
    } catch (error) {
      console.error('Error removing social link:', error);
      toast.error('Failed to remove social link. Please try again.');
    }
  };

  const formatSocialUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const safeProfileImage = getSafeImageUrl(profile.profileImage);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-foreground" />
        </div>
      ) : (
        <main className="flex-1">
          <section className="border-b border-border bg-gradient-to-br from-muted/50 via-background to-background px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center text-center"
              >
                <div className="relative mb-6">
                  <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-background shadow-lg ring-2 ring-border sm:h-32 sm:w-32">
                    {uploadingImage ? (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground" />
                      </div>
                    ) : safeProfileImage ? (
                      <img
                        src={safeProfileImage}
                        alt={profile.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`flex h-full w-full items-center justify-center bg-muted ${safeProfileImage ? 'hidden' : ''}`}>
                      <span className="text-3xl font-semibold text-muted-foreground">
                        {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                  </div>
                  {isEditing && (
                    <button
                      onClick={triggerImageUpload}
                      disabled={uploadingImage}
                      className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="w-full max-w-md space-y-4">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border-b border-border bg-transparent py-2 text-center text-3xl font-semibold text-foreground focus:border-foreground focus:outline-none"
                      placeholder="Enter your name"
                    />
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full resize-none border-b border-border bg-transparent py-2 text-center text-muted-foreground focus:border-foreground focus:outline-none"
                      placeholder="Tell us about yourself"
                      rows={3}
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                      {profile.name || 'User'}
                    </h1>
                    <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
                      {profile.bio}
                    </p>
                  </>
                )}

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave}>Save changes</Button>
                      <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={handleEdit} variant="outline">
                        <Edit3 className="h-4 w-4" />
                        Edit profile
                      </Button>
                      <Button variant="secondary" onClick={() => navigate('/myblogs')}>
                        <FileText className="h-4 w-4" />
                        My blogs
                      </Button>
                      <Button onClick={() => navigate('/write')}>
                        <Plus className="h-4 w-4" />
                        Write new
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </section>

          <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              <Card className="border-border/70 shadow-sm">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-foreground">{profile.totalLikes}</p>
                    <p className="text-sm text-muted-foreground">Total likes received</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/70 shadow-sm">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-foreground">{profile.totalPublishedBlogs}</p>
                    <p className="text-sm text-muted-foreground">Published blogs</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border/70 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg">Favorite topics</CardTitle>
                  {isEditing && (
                    <Button variant="ghost" size="icon" onClick={handleAddTopic}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(isEditing ? editForm.favoriteTopics : profile.favoriteTopics).map((topic, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm text-foreground"
                      >
                        {topic}
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveTopic(index)}
                            className="text-muted-foreground transition-colors hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Social profiles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {socialPlatforms.map((platform) => {
                    const Icon = platform.icon;
                    const hasLink = profile.socialLinks[platform.name];

                    return (
                      <div
                        key={platform.name}
                        className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/20 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-muted-foreground shadow-sm">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-foreground">{platform.label}</span>
                        </div>

                        {hasLink ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={formatSocialUrl(hasLink)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                              Visit
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                            <button
                              onClick={() => handleSocialRemove(platform.name)}
                              className="text-sm text-destructive transition-colors hover:opacity-80"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => openSocialModal(platform.name)}>
                            Connect
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
      )}

      <SiteFooter />

      {/* Social Media Modal */}
      {showSocialModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-card text-card-foreground rounded-lg p-6 max-w-md w-full mx-4 shadow-lg border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50 lexend-txt">
                Connect to {socialPlatforms.find(p => p.name === selectedSocial)?.label}
              </h3>
              <button
                onClick={() => setShowSocialModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 lexend-txt">
                  Profile URL
                </label>
                <input
                  type="url"
                  value={socialUrl}
                  onChange={(e) => setSocialUrl(e.target.value)}
                  placeholder={`Enter your ${socialPlatforms.find(p => p.name === selectedSocial)?.label} profile URL`}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:border-ring focus:outline-none text-gray-900 dark:text-gray-50 lexend-txt"
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
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 text-sm rounded-lg hover:text-gray-800 transition-colors"
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
