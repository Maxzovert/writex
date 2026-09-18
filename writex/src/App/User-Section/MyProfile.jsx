import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Edit3, 
  Linkedin, 
  Heart, 
  FileText,
  X,
  Plus,
  ExternalLink,
  Camera,
  Users,
} from 'lucide-react';
import { 
  FaInstagram, 
  FaTwitter 
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../context/authContext';
import { uploadImageToCloudinary } from '../../lib/cloudinary-storage';
import { getSafeImageUrl } from '../../lib/image-url';

const SOCIAL_PLATFORMS = [
  { name: 'instagram', icon: FaInstagram, label: 'Instagram' },
  { name: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
  { name: 'twitter', icon: FaTwitter, label: 'Twitter' },
];

function buildProfileFromUser(authUser, stats = {}) {
  return {
    name: authUser?.username || "User",
    bio: authUser?.bio || "Add Bio",
    profileImage: authUser?.profileImage || "",
    favoriteTopics: ["Technology", "Travel", "Food", "Lifestyle", "Business"],
    totalLikes: stats.totalLikes ?? 0,
    totalPublishedBlogs: stats.publishedBlogs ?? 0,
    followerCount: authUser?.followerCount ?? 0,
    followingCount: authUser?.followingCount ?? 0,
    socialLinks: {
      instagram: authUser?.socialLinks?.instagram || "",
      linkedin: authUser?.socialLinks?.linkedin || "",
      twitter: authUser?.socialLinks?.twitter || "",
    },
  };
}

const MyProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [selectedSocial, setSelectedSocial] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const fetchedRef = useRef(false);

  const [profile, setProfile] = useState(() => buildProfileFromUser(user));

  const [editForm, setEditForm] = useState(() => ({
    name: user?.username || "",
    bio: user?.bio || "Add Bio",
    favoriteTopics: ["Technology", "Travel", "Food", "Lifestyle", "Business"],
  }));

  const socialPlatforms = SOCIAL_PLATFORMS;

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get("/users/profile-stats");
      const { user: userData, stats } = response.data || {};

      if (!userData) {
        throw new Error("No profile data returned");
      }

      const nextProfile = buildProfileFromUser(userData, stats);
      setProfile((prev) => ({
        ...nextProfile,
        favoriteTopics: prev.favoriteTopics?.length
          ? prev.favoriteTopics
          : nextProfile.favoriteTopics,
      }));
      setEditForm((prev) => ({
        ...prev,
        name: nextProfile.name,
        bio: nextProfile.bio,
      }));
      setUser((prev) => ({
        ...(prev || {}),
        ...userData,
      }));
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch profile data');
      if (user?.username) {
        setProfile((prev) => ({
          ...prev,
          ...buildProfileFromUser(user),
          favoriteTopics: prev.favoriteTopics,
        }));
      }
    } finally {
      // no-op: page is never blocked on this fetch
    }
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      if (setUser) {
        setUser((prev) => ({
          ...(prev || {}),
          ...response.data.user,
          profileImage: uploadResult.url,
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
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-10 text-foreground">
      <main className="flex-1">
          <section className="border-b border-border bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-card shadow-md ring-1 ring-border sm:h-32 sm:w-32">
                    {uploadingImage ? (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
                      </div>
                    ) : safeProfileImage ? (
                      <img
                        src={safeProfileImage}
                        alt={profile.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={`flex h-full w-full items-center justify-center bg-primary/10 ${
                        safeProfileImage ? 'hidden' : ''
                      }`}
                    >
                      <span className="wx-serif text-4xl text-primary sm:text-5xl">
                        {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={triggerImageUpload}
                      disabled={uploadingImage}
                      className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:brightness-110 disabled:opacity-50"
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
                      className="w-full border-b border-border bg-transparent py-2 text-center text-3xl font-semibold text-foreground focus:border-primary focus:outline-none"
                      placeholder="Enter your name"
                    />
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full resize-none border-b border-border bg-transparent py-2 text-center text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="Tell us about yourself"
                      rows={3}
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="wx-serif text-4xl tracking-tight text-foreground sm:text-5xl">
                      {profile.name || 'User'}
                    </h1>
                    <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
                      {profile.bio === 'Add Bio' ? 'No bio yet — click Edit profile to add one.' : profile.bio}
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
                      <Button onClick={handleEdit} variant="outline" className="border-border text-foreground">
                        <Edit3 className="h-4 w-4" />
                        Edit profile
                      </Button>
                      <Button
                        variant="outline"
                        className="border-border text-foreground"
                        onClick={() => navigate('/myblogs')}
                      >
                        <FileText className="h-4 w-4" />
                        My blogs
                      </Button>
                      <Button
                        variant="outline"
                        className="border-border text-foreground"
                        onClick={() => navigate(`/author/${profile.name}`)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Public profile
                      </Button>
                      <Button onClick={() => navigate('/write')}>
                        <Plus className="h-4 w-4" />
                        Write new
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border/70 shadow-sm">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-foreground">{profile.followerCount}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/70 shadow-sm">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-foreground">{profile.followingCount}</p>
                    <p className="text-sm text-muted-foreground">Following</p>
                  </div>
                </CardContent>
              </Card>
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
