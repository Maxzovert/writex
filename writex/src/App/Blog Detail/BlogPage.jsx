import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../Components/Navbar';
import { useAuth } from '../../context/authContext';
import { getSafeImageUrl } from '../../lib/image-url';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  ThumbsUp, 
  Reply, 
  Trash2, 
  User,
  Calendar,
  Clock,
  Maximize2,
  Minimize2,
  Share2,
  Download,
  MoreHorizontal,
  FolderPlus,
} from 'lucide-react';
import { useFocusMode } from '@/hooks/use-focus-mode';
import { BookmarkSidebar } from '@/components/bookmarks/BookmarkSidebar';
import { RelatedBlogsSection } from '@/components/blog/RelatedBlogsSection';
import { CategoryBrowseSection } from '@/components/blog/CategoryBrowseSection';
import { TipTapContent } from '@/components/blog/TipTapContent';
import { PdfExportProgressDialog } from '@/components/blog/PdfExportProgressDialog';
import { SaveToFolderDialog } from '@/components/folders/SaveToFolderDialog';
import { BlogSidebarColumn } from '@/components/blog/BlogSidebarColumn';
import { BookmarkSelectionToolbar } from '@/components/bookmarks/BookmarkSelectionToolbar';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { getAnchorFromDomSelection } from '@/lib/bookmarks';
import { exportBlogPdf } from '@/lib/export-blog-pdf';
import { shareBlogWithFollowers } from '../../lib/follow-api';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import '@/components/bookmarks/bookmarks.scss';

const EMPTY_BOOKMARKS = [];

const BlogPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [newReply, setNewReply] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [saveFolderOpen, setSaveFolderOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [pdfProgress, setPdfProgress] = useState({
    status: 'exporting',
    percent: 0,
    message: 'Preparing…',
    errorMessage: '',
  });
  const { isFocusMode, toggleFocusMode } = useFocusMode();
  const contentRef = useRef(null);
  const focusContentRef = useRef(null);
  const documentId = id ? `blog-${id}` : 'blog-unknown';
  const userId = user?._id || user?.id;
  const {
    bookmarks,
    addBookmark,
    removeBookmark,
    goToBookmark,
  } = useBookmarks(userId, documentId, blog?.bookmarks || EMPTY_BOOKMARKS);

  const handleAddBookmark = (color) => {
    const container = focusContentRef.current ?? contentRef.current;
    if (!container) return;
    const result = getAnchorFromDomSelection(container);
    if (!result) {
      toast.warning('Select text to bookmark');
      return;
    }
    addBookmark(result.anchor, color, result.label);
    toast.success('Bookmark added');
  };

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        // Fire-and-forget view tracking; do not block content load
        void axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/interactions/blog/${id}/view`,
          {},
          { withCredentials: true }
        );

        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/interactions/blog/${id}/interactions`,
          { withCredentials: true }
        );
        setBlog(response.data.blog);
      } catch (error) {
        console.error('Error fetching blog:', error);
        console.error('Error response:', error.response?.data);
        toast.error('Error loading blog');
        navigate('/blogs');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id, navigate]);

  // Handle like/unlike blog post
  const handleLikePost = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/interactions/blog/${id}/like`,
        {},
        { withCredentials: true }
      );
      
      setBlog(prev => ({
        ...prev,
        isLiked: response.data.isLiked,
        likeCount: response.data.likeCount,
      }));
      
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Error liking post');
    }
  };

  // Handle like/unlike comment
  const handleLikeComment = async (commentId) => {
    if (!user) {
      toast.error('Please login to like comments');
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/interactions/blog/${id}/comment/${commentId}/like`,
        {},
        { withCredentials: true }
      );
      
      setBlog(prev => ({
        ...prev,
        comments: prev.comments.map(comment => 
          comment._id === commentId 
            ? {
                ...comment,
                isLiked: response.data.isLiked,
                likeCount: response.data.likeCount,
              }
            : comment
        )
      }));
      
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error liking comment:', error);
      toast.error('Error liking comment');
    }
  };

  // Handle like/unlike reply
  const handleLikeReply = async (commentId, replyId) => {
    if (!user) {
      toast.error('Please login to like replies');
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/interactions/blog/${id}/comment/${commentId}/reply/${replyId}/like`,
        {},
        { withCredentials: true }
      );
      
      setBlog(prev => ({
        ...prev,
        comments: prev.comments.map(comment => 
          comment._id === commentId 
            ? {
                ...comment,
                replies: comment.replies.map(reply =>
                  reply._id === replyId
                    ? {
                        ...reply,
                        isLiked: response.data.isLiked,
                        likeCount: response.data.likeCount,
                      }
                    : reply
                )
              }
            : comment
        )
      }));
      
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error liking reply:', error);
      toast.error('Error liking reply');
    }
  };

  // Handle add comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/interactions/blog/${id}/comment`,
        { content: newComment },
        { withCredentials: true }
      );
      
      setBlog(prev => ({
        ...prev,
        comments: [...prev.comments, response.data.comment]
      }));
      
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Error adding comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle add reply
  const handleAddReply = async (commentId) => {
    if (!user) {
      toast.error('Please login to reply');
      return;
    }

    const replyContent = newReply[commentId];
    if (!replyContent?.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setIsSubmittingReply(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/interactions/blog/${id}/comment/${commentId}/reply`,
        { content: replyContent },
        { withCredentials: true }
      );
      
      setBlog(prev => ({
        ...prev,
        comments: prev.comments.map(comment => 
          comment._id === commentId 
            ? { ...comment, replies: [...comment.replies, response.data.reply] }
            : comment
        )
      }));
      
      setNewReply(prev => ({ ...prev, [commentId]: '' }));
      setReplyingTo(null);
      toast.success('Reply added successfully');
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Error adding reply');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    if (!user) {
      toast.error('Please login to delete comments');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/interactions/blog/${id}/comment/${commentId}`,
        { withCredentials: true }
      );
      
      setBlog(prev => ({
        ...prev,
        comments: prev.comments.filter(comment => comment._id !== commentId)
      }));
      
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Error deleting comment');
    }
  };

  // Handle delete reply
  const handleDeleteReply = async (commentId, replyId) => {
    if (!user) {
      toast.error('Please login to delete replies');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this reply?')) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/interactions/blog/${id}/comment/${commentId}/reply/${replyId}`,
        { withCredentials: true }
      );
      
      setBlog(prev => ({
        ...prev,
        comments: prev.comments.map(comment => 
          comment._id === commentId 
            ? { ...comment, replies: comment.replies.filter(reply => reply._id !== replyId) }
            : comment
        )
      }));
      
      toast.success('Reply deleted successfully');
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error('Error deleting reply');
    }
  };

  const handleShareBlog = async () => {
    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: blog.title,
          text: blog.description || blog.title,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard");
      }
    } catch {
      // User cancelled native share sheet
    }

    if (!user) return;
    if (blog.status !== "published") return;

    try {
      setShareLoading(true);
      await shareBlogWithFollowers(id);
      toast.success("Shared with your followers");
    } catch (error) {
      if (error.response?.status !== 200) {
        toast.error(error.response?.data?.message || "Could not share with followers");
      }
    } finally {
      setShareLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!blog || pdfLoading) return;
    try {
      setPdfLoading(true);
      setPdfProgress({
        status: 'exporting',
        percent: 0,
        message: 'Preparing…',
        errorMessage: '',
      });
      setPdfDialogOpen(true);

      const rawName = blog.author?.username;
      const authorName = rawName
        ? rawName.charAt(0).toUpperCase() + rawName.slice(1)
        : undefined;
      const dateLabel = blog.createdAt
        ? new Date(blog.createdAt).toLocaleDateString()
        : undefined;

      await exportBlogPdf({
        title: blog.title,
        content: blog.content,
        authorName,
        dateLabel,
        onProgress: ({ percent, message }) => {
          setPdfProgress((prev) => ({
            ...prev,
            status: 'exporting',
            percent,
            message,
          }));
        },
      });

      setPdfProgress({
        status: 'done',
        percent: 100,
        message: 'PDF downloaded',
        errorMessage: '',
      });
      toast.success('PDF downloaded');
    } catch (error) {
      console.error('PDF export failed:', error);
      const errorMessage =
        error?.message || 'Could not create PDF. Download was not started.';
      setPdfProgress({
        status: 'error',
        percent: 100,
        message: 'Export failed',
        errorMessage,
      });
      setPdfDialogOpen(true);
      toast.error('Could not download PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="wx-desk-bg wx-sans min-h-screen text-foreground">
        <Navbar />
        <div className="flex h-[70vh] items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading note…</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="wx-desk-bg wx-sans min-h-screen text-foreground">
        <Navbar />
        <div className="flex h-[70vh] flex-col items-center justify-center gap-2">
          <p className="wx-serif text-3xl text-foreground">Note not found</p>
          <button
            type="button"
            onClick={() => navigate('/blogs')}
            className="text-sm text-primary hover:underline"
          >
            Back to Read
          </button>
        </div>
      </div>
    );
  }

  const firstUpperCase = (str) => {
    if (!str) return "Unknown";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const safeAuthorImage = getSafeImageUrl(blog.author?.profileImage);
  const safeMainImage = getSafeImageUrl(blog.mainImage);

  return (
    <div className="wx-desk-bg wx-sans min-h-screen text-foreground">
      {!isFocusMode && <Navbar />}
      {!isFocusMode && (
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/blogs')}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Read
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFocusMode}
            className="border-border bg-card text-foreground hover:bg-muted"
          >
            <Maximize2 className="h-4 w-4" />
            <span className="ml-1.5 hidden sm:inline">Reading mode</span>
          </Button>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <header className="mb-8">
              {blog.category && (
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                  {blog.category}
                </p>
              )}
              <h1 className="wx-serif text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.1] text-foreground">
                {blog.title}
              </h1>

              <div className="mt-6 flex flex-col gap-5 border-y border-border py-5 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  to={blog.author?.username ? `/author/${blog.author.username}` : "#"}
                  className="flex items-center gap-3 transition-opacity hover:opacity-80"
                >
                  {safeAuthorImage ? (
                    <img
                      src={safeAuthorImage}
                      alt={blog.author?.username || "Author"}
                      className="h-11 w-11 rounded-full object-cover ring-1 ring-border"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                      {firstUpperCase(blog.author?.username || "A").charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground">
                      {firstUpperCase(blog.author?.username)}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(blog.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      {blog.readTime > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {blog.readTime} min read
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <button
                    type="button"
                    onClick={handleLikePost}
                    className={`inline-flex items-center gap-1.5 transition-colors ${
                      blog.isLiked ? "text-red-500" : "hover:text-foreground"
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${blog.isLiked ? "fill-current" : ""}`} />
                    {blog.likeCount ?? blog.likes?.length ?? 0}
                  </button>
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    {blog.viewCount}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MessageCircle className="h-4 w-4" />
                    {blog.comments?.length || 0}
                  </span>

                  <Popover open={moreOpen} onOpenChange={setMoreOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-full border-border"
                        aria-label="More actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="ml-1.5">More</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="z-[200] w-48 p-1.5">
                      {user && blog.status === "published" ? (
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted"
                          onClick={() => {
                            setMoreOpen(false)
                            setSaveFolderOpen(true)
                          }}
                        >
                          <FolderPlus className="h-4 w-4 text-muted-foreground" />
                          Save to folder
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted disabled:opacity-50"
                        disabled={pdfLoading}
                        onClick={() => {
                          setMoreOpen(false)
                          handleDownloadPdf()
                        }}
                      >
                        <Download className="h-4 w-4 text-muted-foreground" />
                        {pdfLoading ? "Preparing PDF…" : "Download PDF"}
                      </button>
                      {blog.status === "published" ? (
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted disabled:opacity-50"
                          disabled={shareLoading}
                          onClick={() => {
                            setMoreOpen(false)
                            handleShareBlog()
                          }}
                        >
                          <Share2 className="h-4 w-4 text-muted-foreground" />
                          {shareLoading ? "Sharing…" : "Share"}
                        </button>
                      ) : null}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {safeMainImage && (
                <div className="mt-8 overflow-hidden rounded-2xl border border-border">
                  <img
                    src={safeMainImage}
                    alt={blog.title}
                    className="aspect-[21/9] w-full object-cover sm:aspect-[2.4/1]"
                  />
                </div>
              )}
            </header>

            {user && blog.status === "published" ? (
              <SaveToFolderDialog
                open={saveFolderOpen}
                onOpenChange={setSaveFolderOpen}
                blogId={id}
                blogTitle={blog.title}
              />
            ) : null}

            <div
              ref={contentRef}
              className="prose prose-lg mb-12 max-w-none prose-headings:wx-serif prose-headings:font-normal prose-a:text-[var(--wx-accent)] dark:prose-invert"
            >
              <TipTapContent content={blog.content} bookmarks={bookmarks} />
            </div>

            <div className="mb-12 rounded-2xl border border-[var(--wx-line)] bg-[var(--wx-elev)] p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--wx-mute)]">
                Written by
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <Link
                  to={blog.author?.username ? `/author/${blog.author.username}` : "#"}
                  className="flex items-center gap-3 transition-opacity hover:opacity-80"
                >
                  {safeAuthorImage ? (
                    <img
                      src={safeAuthorImage}
                      alt={blog.author?.username || "Author"}
                      className="h-12 w-12 rounded-full object-cover ring-1 ring-[var(--wx-line)]"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--wx-text)] text-sm font-semibold text-[var(--wx-bg)]">
                      {firstUpperCase(blog.author?.username || "A").charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-[var(--wx-text)]">
                      {firstUpperCase(blog.author?.username)}
                    </p>
                    <p className="text-sm text-[var(--wx-mute)]">
                      Published{" "}
                      {new Date(blog.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </Link>
                {blog.author?.username && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/author/${blog.author.username}`)}
                    className="border-[var(--wx-line)]"
                  >
                    View profile
                  </Button>
                )}
              </div>
            </div>

            <section className="border-t border-[var(--wx-line)] pt-10">
              <h2 className="wx-serif text-2xl text-[var(--wx-text)]">
                Comments
                <span className="ml-2 text-base text-[var(--wx-mute)]">
                  ({blog.comments?.length || 0})
                </span>
              </h2>

              {user ? (
                <form onSubmit={handleAddComment} className="mt-6 space-y-3">
                  <Textarea
                    placeholder="Write a comment…"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[96px] resize-none border-[var(--wx-line)] bg-[var(--wx-elev)]"
                    disabled={isSubmittingComment}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="bg-[var(--wx-text)] text-[var(--wx-bg)] hover:opacity-90"
                    >
                      {isSubmittingComment ? "Posting…" : "Post comment"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-[var(--wx-line)] bg-[var(--wx-soft)] px-5 py-8 text-center">
                  <p className="mb-3 text-sm text-[var(--wx-mute)]">Log in to join the discussion</p>
                  <Button
                    onClick={() => navigate('/login')}
                    className="bg-[var(--wx-text)] text-[var(--wx-bg)] hover:opacity-90"
                  >
                    Login
                  </Button>
                </div>
              )}

              <div className="mt-8 space-y-0 divide-y divide-[var(--wx-line)]">
                {blog.comments?.map((comment) => (
                  <div key={comment._id} className="py-6 first:pt-0">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {getSafeImageUrl(comment.user?.profileImage) ? (
                          <img
                            src={getSafeImageUrl(comment.user?.profileImage)}
                            alt={comment.user.username}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--wx-soft)]">
                            <User className="h-4 w-4 text-[var(--wx-mute)]" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-[var(--wx-text)]">
                            {comment.user?.username}
                          </p>
                          <p className="text-xs text-[var(--wx-mute)]">
                            {formatTimeAgo(comment.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          onClick={() => handleLikeComment(comment._id)}
                          variant="ghost"
                          size="sm"
                          className={`h-8 gap-1 px-2 ${
                            comment.isLiked
                              ? "text-red-500"
                              : "text-[var(--wx-mute)] hover:text-[var(--wx-text)]"
                          }`}
                        >
                          <ThumbsUp className={`h-3.5 w-3.5 ${comment.isLiked ? "fill-current" : ""}`} />
                          {comment.likeCount ?? comment.likes?.length ?? 0}
                        </Button>

                        <Button
                          onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-[var(--wx-mute)] hover:text-[var(--wx-text)]"
                        >
                          <Reply className="h-3.5 w-3.5" />
                        </Button>

                        {(user?.id === comment.user?._id || user?.id === blog.author?._id) && (
                          <Button
                            onClick={() => handleDeleteComment(comment._id)}
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-[var(--wx-mute)] hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <p className="text-[var(--wx-text)]/90 leading-relaxed">{comment.content}</p>

                    {replyingTo === comment._id && user && (
                      <div className="mt-4 ml-2 space-y-3 border-l-2 border-[var(--wx-line)] pl-4 sm:ml-4">
                        <Textarea
                          placeholder="Write a reply…"
                          value={newReply[comment._id] || ''}
                          onChange={(e) => setNewReply(prev => ({ ...prev, [comment._id]: e.target.value }))}
                          className="min-h-[72px] resize-none border-[var(--wx-line)] bg-[var(--wx-elev)] text-sm"
                          disabled={isSubmittingReply}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAddReply(comment._id)}
                            disabled={isSubmittingReply || !newReply[comment._id]?.trim()}
                            size="sm"
                            className="bg-[var(--wx-text)] text-[var(--wx-bg)] hover:opacity-90"
                          >
                            {isSubmittingReply ? "Posting…" : "Reply"}
                          </Button>
                          <Button
                            onClick={() => setReplyingTo(null)}
                            variant="outline"
                            size="sm"
                            className="border-[var(--wx-line)]"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {comment.replies?.length > 0 && (
                      <div className="mt-4 ml-2 space-y-4 border-l-2 border-[var(--wx-line)] pl-4 sm:ml-4">
                        {comment.replies.map((reply) => (
                          <div key={reply._id}>
                            <div className="mb-1.5 flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {getSafeImageUrl(reply.user?.profileImage) ? (
                                  <img
                                    src={getSafeImageUrl(reply.user?.profileImage)}
                                    alt={reply.user.username}
                                    className="h-6 w-6 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--wx-soft)]">
                                    <User className="h-3 w-3 text-[var(--wx-mute)]" />
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-medium text-[var(--wx-text)]">
                                    {reply.user?.username}
                                  </p>
                                  <p className="text-[11px] text-[var(--wx-mute)]">
                                    {formatTimeAgo(reply.createdAt)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <Button
                                  onClick={() => handleLikeReply(comment._id, reply._id)}
                                  variant="ghost"
                                  size="sm"
                                  className={`h-7 gap-1 px-1.5 ${
                                    reply.isLiked
                                      ? "text-red-500"
                                      : "text-[var(--wx-mute)] hover:text-[var(--wx-text)]"
                                  }`}
                                >
                                  <ThumbsUp className={`h-3 w-3 ${reply.isLiked ? "fill-current" : ""}`} />
                                  {reply.likeCount ?? reply.likes?.length ?? 0}
                                </Button>

                                {(user?.id === reply.user?._id || user?.id === blog.author?._id) && (
                                  <Button
                                    onClick={() => handleDeleteReply(comment._id, reply._id)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-1.5 text-[var(--wx-mute)] hover:text-red-500"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm leading-relaxed text-[var(--wx-text)]/85">
                              {reply.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <BlogSidebarColumn>
            <div className="space-y-6">
              <BookmarkSidebar
                variant="blog"
                bookmarks={bookmarks}
                onSelect={goToBookmark}
                onRemove={removeBookmark}
              />
              <RelatedBlogsSection
                currentBlogId={id}
                category={blog?.category}
              />
              <CategoryBrowseSection currentCategory={blog?.category} />
            </div>
          </BlogSidebarColumn>
        </div>
      </div>
      )}

      {isFocusMode && blog && (
        <div className="wx-desk-bg wx-sans fixed inset-0 z-[60] flex text-foreground">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--wx-line)] bg-[var(--wx-bg)]/95 px-4 py-3 backdrop-blur-sm sm:px-8">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--wx-accent)]">
                Reading mode
              </p>
              <h1 className="wx-serif truncate text-lg text-[var(--wx-text)] sm:text-xl">
                {blog.title}
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFocusMode}
              className="shrink-0 border-[var(--wx-line)]"
            >
              <Minimize2 className="h-4 w-4" />
              <span className="ml-1.5 hidden sm:inline">Exit focus</span>
            </Button>
          </header>

          <article className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
              {blog.category && (
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--wx-accent)]">
                  {blog.category}
                </p>
              )}
              <h1 className="wx-serif mb-6 text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.1] text-[var(--wx-text)]">
                {blog.title}
              </h1>

              <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--wx-line)] pb-6 text-sm text-[var(--wx-mute)]">
                <Link
                  to={blog.author?.username ? `/author/${blog.author.username}` : "#"}
                  className="flex items-center gap-2 hover:opacity-80"
                >
                  {safeAuthorImage ? (
                    <img
                      src={safeAuthorImage}
                      alt={blog.author?.username || "Author"}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--wx-soft)]">
                      <User className="h-4 w-4 text-[var(--wx-mute)]" />
                    </div>
                  )}
                  <span className="font-medium text-[var(--wx-text)]">
                    {firstUpperCase(blog.author?.username)}
                  </span>
                </Link>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(blog.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                {blog.readTime > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {blog.readTime} min read
                  </span>
                )}
              </div>

              {safeMainImage && (
                <div className="mb-10 overflow-hidden rounded-2xl border border-[var(--wx-line)]">
                  <img
                    src={safeMainImage}
                    alt={blog.title}
                    className="aspect-[21/9] w-full object-cover"
                  />
                </div>
              )}

              <div
                ref={focusContentRef}
                className="prose prose-lg max-w-none prose-headings:wx-serif prose-headings:font-normal prose-a:text-[var(--wx-accent)] dark:prose-invert sm:prose-xl"
              >
                <TipTapContent content={blog.content} bookmarks={bookmarks} />
              </div>

              <p className="mt-14 text-center text-xs text-[var(--wx-mute)]">
                Press Esc to exit reading mode
              </p>
            </div>
          </article>
          </div>

          <aside className="hidden w-72 shrink-0 overflow-hidden border-l border-[var(--wx-line)] bg-[var(--wx-elev)] lg:flex lg:flex-col">
            <BookmarkSidebar
              variant="panel"
              bookmarks={bookmarks}
              onSelect={goToBookmark}
              onRemove={removeBookmark}
            />
          </aside>
        </div>
      )}

      <BookmarkSelectionToolbar
        containerRef={isFocusMode ? focusContentRef : contentRef}
        onAdd={handleAddBookmark}
      />

      <PdfExportProgressDialog
        open={pdfDialogOpen}
        status={pdfProgress.status}
        percent={pdfProgress.percent}
        message={pdfProgress.message}
        errorMessage={pdfProgress.errorMessage}
        onClose={() => setPdfDialogOpen(false)}
      />
    </div>
  );
};

export default BlogPage;