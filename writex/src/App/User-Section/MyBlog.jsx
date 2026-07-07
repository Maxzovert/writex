import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { SiteFooter } from "../../components/layout/SiteFooter";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import axiosInstance from "../../lib/axiosConfig";
import { getSafeImageUrl } from "../../lib/image-url";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../../assets/logo.png";
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
  Plus,
  Search,
  Sparkles,
  FileText,
  BarChart3,
} from "lucide-react";

const STATUS_STYLES = {
  published: {
    badge:
      "bg-emerald-500/15 text-emerald-700 border-emerald-500/25 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  draft: {
    badge: "bg-amber-500/15 text-amber-700 border-amber-500/25 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  archived: {
    badge: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
};

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <Card className="overflow-hidden border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function BlogCard({
  blog,
  index,
  isMenuOpen,
  onToggleMenu,
  onEdit,
  onToggleStatus,
  onDelete,
  onRead,
  operationLoading,
  formatDate,
  firstUpperCase,
}) {
  const safeMainImage = getSafeImageUrl(blog.mainImage);
  const statusStyle =
    STATUS_STYLES[blog.status] || STATUS_STYLES.archived;
  const excerpt =
    typeof blog.content === "string"
      ? blog.content
      : blog.description || "No description yet.";

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-md"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {safeMainImage ? (
          <img
            src={safeMainImage}
            alt={blog.title || "Blog cover"}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <img src={Logo} alt="" className="h-14 w-14 opacity-40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-md ${statusStyle.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
            {firstUpperCase(blog.status)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
            <Tag className="h-3 w-3" />
            {firstUpperCase(blog.category || "general")}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <div className="flex items-center gap-3 text-xs text-white/90">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(blog.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {blog.viewCount || 0}
            </span>
          </div>

          <div className="relative">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-white/90 text-foreground shadow-sm hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMenu(blog._id);
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full right-0 z-20 mb-2 min-w-[168px] overflow-hidden rounded-xl border border-border bg-popover py-1 shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onEdit(blog)}
                    disabled={operationLoading}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleStatus(blog)}
                    disabled={operationLoading}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    {blog.status === "published" ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        Publish
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(blog._id)}
                    disabled={operationLoading}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-foreground/80">
          {blog.title || "Untitled blog"}
        </h3>
        <p className="mb-5 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {excerpt}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/60 pt-4">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-0 text-foreground hover:bg-transparent hover:text-foreground/70"
            onClick={() => onRead(blog._id)}
          >
            Open post
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Button>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(blog)}
              disabled={operationLoading}
              title="Edit"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onToggleStatus(blog)}
              disabled={operationLoading}
              title={blog.status === "published" ? "Unpublish" : "Publish"}
            >
              {blog.status === "published" ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

const MyBlog = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [operationLoading, setOperationLoading] = useState({});
  const [deleteTargetBlogId, setDeleteTargetBlogId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const hasFetched = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFetchUserBlogs = async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    try {
      setLoading(true);
      const fetchData = await axiosInstance.get(`/blog/myblogs/`);
      setData(fetchData.data.blogs);
    } catch {
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
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleEditBlog = (blog) => {
    setOpenMenuId(null);
    navigate(`/write`, { state: { editBlog: blog } });
  };

  const handleDeleteBlog = async (blogId) => {
    try {
      setOperationLoading((prev) => ({ ...prev, [blogId]: true }));

      const response = await axiosInstance.delete(
        `/blog/deleteblog/${blogId}`
      );

      if (response.status === 200) {
        setData((prevData) => prevData.filter((blog) => blog._id !== blogId));
        toast.success("Blog deleted successfully");
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.");
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to delete this blog.");
      } else if (error.response?.status === 404) {
        toast.error("Blog not found. It may have already been deleted.");
      } else {
        toast.error("Failed to delete blog");
      }
    } finally {
      setOperationLoading((prev) => ({ ...prev, [blogId]: false }));
      setDeleteTargetBlogId(null);
    }
  };

  const handleToggleStatus = async (blog) => {
    try {
      setOperationLoading((prev) => ({ ...prev, [blog._id]: true }));
      setOpenMenuId(null);
      const newStatus = blog.status === "published" ? "draft" : "published";

      const response = await axiosInstance.put(
        `/blog/updateblog/${blog._id}`,
        {
          title: blog.title,
          content: blog.content,
          category: blog.category,
          status: newStatus,
          mainImage: blog.mainImage,
          description: blog.description,
        }
      );

      if (response.data) {
        setData((prevData) =>
          prevData.map((b) =>
            b._id === blog._id ? { ...b, status: newStatus } : b
          )
        );
        toast.success(
          `Blog ${newStatus === "published" ? "published" : "unpublished"} successfully`
        );
      }
    } catch {
      toast.error("Failed to update blog status");
    } finally {
      setOperationLoading((prev) => ({ ...prev, [blog._id]: false }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredBlogs = data.filter((blog) => {
    const matchesStatus =
      statusFilter === "all" || blog.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof blog.content === "string" &&
        blog.content.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const publishedCount = data.filter((b) => b.status === "published").length;
  const draftCount = data.filter((b) => b.status === "draft").length;
  const totalViews = data.reduce(
    (total, blog) => total + (blog.viewCount || 0),
    0
  );

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Navbar />
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-md space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <PenTool className="h-6 w-6 animate-pulse text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Loading your blogs...</p>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-2xl bg-muted/70"
                />
              ))}
            </div>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
          <div className="pointer-events-none absolute -left-24 top-8 h-48 w-48 rounded-full bg-muted/60 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  Writing dashboard
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  My Blogs
                </h1>
                <p className="mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
                  Draft, publish, and track every post from one place.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-wrap gap-3"
              >
                <Button
                  size="lg"
                  className="rounded-full px-6 shadow-sm"
                  onClick={() => navigate("/write")}
                >
                  <Plus className="h-4 w-4" />
                  New blog
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-6"
                  onClick={refreshBlogs}
                >
                  Refresh
                </Button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              <StatCard
                icon={FileText}
                label="Total posts"
                value={data.length}
                accent="bg-foreground text-background"
              />
              <StatCard
                icon={Eye}
                label="Published"
                value={publishedCount}
                accent="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              />
              <StatCard
                icon={Clock}
                label="Drafts"
                value={draftCount}
                accent="bg-amber-500/15 text-amber-600 dark:text-amber-400"
              />
              <StatCard
                icon={BarChart3}
                label="Total views"
                value={totalViews}
                accent="bg-blue-500/15 text-blue-600 dark:text-blue-400"
              />
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {data.length > 0 && (
            <Card className="mb-8 border-border/70 bg-card/60 shadow-sm backdrop-blur-sm">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by title or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-full border-border/70 bg-background pl-10"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { key: "all", label: "All", count: data.length },
                    { key: "published", label: "Published", count: publishedCount },
                    { key: "draft", label: "Drafts", count: draftCount },
                  ].map(({ key, label, count }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setStatusFilter(key)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        statusFilter === key
                          ? "bg-foreground text-background shadow-sm"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {label}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-xs ${
                          statusFilter === key
                            ? "bg-background/20 text-background"
                            : "bg-background text-muted-foreground"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {data.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-lg rounded-3xl border border-dashed border-border bg-card/50 px-8 py-16 text-center"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
                <PenTool className="h-9 w-9 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground">
                Your first post is waiting
              </h3>
              <p className="mt-3 text-muted-foreground">
                Start writing and build your personal library of ideas, stories,
                and guides.
              </p>
              <Button
                size="lg"
                className="mt-8 rounded-full px-8"
                onClick={() => navigate("/write")}
              >
                <Plus className="h-4 w-4" />
                Create your first blog
              </Button>
            </motion.div>
          ) : filteredBlogs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-lg rounded-3xl border border-border bg-card px-8 py-14 text-center"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <Search className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                No matches found
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery
                  ? `Nothing matched "${searchQuery}".`
                  : "Try a different filter or create something new."}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    setStatusFilter("all");
                    setSearchQuery("");
                  }}
                >
                  Clear filters
                </Button>
                <Button
                  className="rounded-full"
                  onClick={() => navigate("/write")}
                >
                  <Plus className="h-4 w-4" />
                  New blog
                </Button>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {filteredBlogs.length}
                  </span>{" "}
                  of {data.length} posts
                </p>
                {publishedCount > 0 && (
                  <p className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    {totalViews} total views across your library
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredBlogs.map((blog, index) => (
                  <BlogCard
                    key={blog._id}
                    blog={blog}
                    index={index}
                    isMenuOpen={openMenuId === blog._id}
                    onToggleMenu={(id) =>
                      setOpenMenuId((prev) => (prev === id ? null : id))
                    }
                    onEdit={handleEditBlog}
                    onToggleStatus={handleToggleStatus}
                    onDelete={setDeleteTargetBlogId}
                    onRead={(id) => navigate(`/blog/${id}`)}
                    operationLoading={operationLoading[blog._id]}
                    formatDate={formatDate}
                    firstUpperCase={firstUpperCase}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      <Dialog
        open={Boolean(deleteTargetBlogId)}
        onOpenChange={(open) => !open && setDeleteTargetBlogId(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this blog?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The post will be permanently removed
              from your library.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteTargetBlogId(null)}
              disabled={operationLoading[deleteTargetBlogId]}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteBlog(deleteTargetBlogId)}
              disabled={operationLoading[deleteTargetBlogId]}
            >
              {operationLoading[deleteTargetBlogId] ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SiteFooter />
    </div>
  );
};

export default MyBlog;
