import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  FileText,
  Heart,
  Instagram,
  Linkedin,
  Twitter,
  UserPlus,
  UserMinus,
  Eye,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "../Components/Navbar";
import { SiteFooter } from "../../components/layout/SiteFooter";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { useAuth } from "../../context/authContext";
import { getSafeImageUrl } from "../../lib/image-url";
import {
  fetchPublicProfile,
  fetchPublicUserBlogs,
  followUser,
  unfollowUser,
  fetchFollowers,
  fetchFollowing,
} from "../../lib/follow-api";

const firstUpperCase = (str) => {
  if (!str) return "Unknown";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const formatDate = (dateString) => {
  if (!dateString) return "Unknown";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

function UserListModal({ title, users, onClose, onUserClick }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[70vh] w-full max-w-md overflow-hidden rounded-xl border border-border bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-muted-foreground hover:bg-muted"
          >
            ×
          </button>
        </div>
        <div className="max-h-[55vh] overflow-y-auto p-2">
          {users.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">No users yet.</p>
          ) : (
            users.map((u) => (
              <button
                key={u._id}
                type="button"
                onClick={() => onUserClick(u.username)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted"
              >
                {getSafeImageUrl(u.profileImage) ? (
                  <img
                    src={getSafeImageUrl(u.profileImage)}
                    alt={u.username}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    {u.username?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                <div>
                  <p className="font-medium">{firstUpperCase(u.username)}</p>
                  {u.bio && (
                    <p className="line-clamp-1 text-xs text-muted-foreground">{u.bio}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const AuthorProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [followLoading, setFollowLoading] = useState(false);
  const [listModal, setListModal] = useState(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileData, userBlogs] = await Promise.all([
        fetchPublicProfile(username),
        fetchPublicUserBlogs(username),
      ]);
      setProfile(profileData);
      setBlogs(userBlogs);
    } catch (error) {
      toast.error(error.response?.data?.message || "Author not found");
      navigate("/blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) loadProfile();
  }, [username]);

  const handleFollowToggle = async () => {
    if (!user) {
      toast.info("Please log in to follow authors");
      navigate("/login");
      return;
    }
    if (!profile?.user?._id) return;

    try {
      setFollowLoading(true);
      if (profile.isFollowing) {
        const result = await unfollowUser(profile.user._id);
        setProfile((prev) => ({
          ...prev,
          isFollowing: false,
          user: {
            ...prev.user,
            followerCount: result.followerCount,
          },
        }));
        toast.success("Unfollowed");
      } else {
        const result = await followUser(profile.user._id);
        setProfile((prev) => ({
          ...prev,
          isFollowing: true,
          user: {
            ...prev.user,
            followerCount: result.followerCount,
          },
        }));
        toast.success("Following!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  const openUserList = async (type) => {
    if (!profile?.user?._id) return;
    try {
      const users =
        type === "followers"
          ? await fetchFollowers(profile.user._id)
          : await fetchFollowing(profile.user._id);
      setListModal({
        title: type === "followers" ? "Followers" : "Following",
        users,
      });
    } catch {
      toast.error("Failed to load list");
    }
  };

  const safeProfileImage = getSafeImageUrl(profile?.user?.profileImage);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-foreground" />
        </div>
      ) : profile ? (
        <main className="flex-1">
          <section className="border-b border-border bg-gradient-to-br from-muted/50 via-background to-background px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-6 h-28 w-28 overflow-hidden rounded-full border-4 border-background shadow-lg ring-2 ring-border sm:h-32 sm:w-32">
                  {safeProfileImage ? (
                    <img
                      src={safeProfileImage}
                      alt={profile.user.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-3xl font-semibold text-muted-foreground">
                      {profile.user.username?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>

                <h1 className="text-3xl font-bold sm:text-4xl">
                  {firstUpperCase(profile.user.username)}
                </h1>
                <p className="mt-2 max-w-xl text-muted-foreground">
                  {profile.user.bio || "No bio yet."}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm">
                  <button
                    type="button"
                    onClick={() => openUserList("followers")}
                    className="hover:text-foreground"
                  >
                    <span className="font-bold">{profile.user.followerCount}</span>{" "}
                    <span className="text-muted-foreground">Followers</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openUserList("following")}
                    className="hover:text-foreground"
                  >
                    <span className="font-bold">{profile.user.followingCount}</span>{" "}
                    <span className="text-muted-foreground">Following</span>
                  </button>
                  <div>
                    <span className="font-bold">{profile.stats.publishedBlogs}</span>{" "}
                    <span className="text-muted-foreground">Published blogs</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  {profile.isOwnProfile ? (
                    <Button onClick={() => navigate("/profile")}>Edit my profile</Button>
                  ) : (
                    <Button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      variant={profile.isFollowing ? "outline" : "default"}
                    >
                      {profile.isFollowing ? (
                        <>
                          <UserMinus className="mr-2 h-4 w-4" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {(profile.user.socialLinks?.instagram ||
                  profile.user.socialLinks?.linkedin ||
                  profile.user.socialLinks?.twitter) && (
                  <div className="mt-4 flex gap-3">
                    {profile.user.socialLinks.instagram && (
                      <a
                        href={profile.user.socialLinks.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                    )}
                    {profile.user.socialLinks.linkedin && (
                      <a
                        href={profile.user.socialLinks.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {profile.user.socialLinks.twitter && (
                      <a
                        href={profile.user.socialLinks.twitter}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </section>

          <section className="px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <div className="mb-8 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <h2 className="text-2xl font-bold">Published blogs</h2>
              </div>

              {blogs.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No published blogs yet.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {blogs.map((blog) => {
                    const safeMainImage = getSafeImageUrl(blog.mainImage);
                    return (
                      <motion.div
                        key={blog._id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
                      >
                        {safeMainImage && (
                          <div className="h-44 overflow-hidden">
                            <img
                              src={safeMainImage}
                              alt={blog.title}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                        )}
                        <div className="p-5">
                          <h3 className="mb-2 line-clamp-2 text-lg font-semibold">{blog.title}</h3>
                          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                            {blog.description || "Read this blog on WriteX."}
                          </p>
                          <div className="mb-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(blog.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {blog.viewCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {blog.likes?.length || 0}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/blog/${blog._id}`)}
                          >
                            Read blog
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </main>
      ) : null}

      {listModal && (
        <UserListModal
          title={listModal.title}
          users={listModal.users}
          onClose={() => setListModal(null)}
          onUserClick={(name) => {
            setListModal(null);
            navigate(`/author/${name}`);
          }}
        />
      )}

      <SiteFooter />
    </div>
  );
};

export default AuthorProfile;
