import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../Components/Navbar';
import { useAuth } from '../../context/authContext';
import { getSafeImageUrl } from '../../lib/image-url';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  ThumbsUp, 
  Reply, 
  Trash2, 
  MoreHorizontal,
  Send,
  User,
  Calendar,
  Clock,
  Maximize2,
  Minimize2,
  Share2,
  Download,
} from 'lucide-react';
import { useFocusMode } from '@/hooks/use-focus-mode';
import { BookmarkSidebar } from '@/components/bookmarks/BookmarkSidebar';
import { RelatedBlogsSection } from '@/components/blog/RelatedBlogsSection';
import { CategoryBrowseSection } from '@/components/blog/CategoryBrowseSection';
import { TipTapContent } from '@/components/blog/TipTapContent';
import { PdfExportProgressDialog } from '@/components/blog/PdfExportProgressDialog';
import { SaveToFolderButton } from '@/components/folders/SaveToFolderDialog';
import { BlogSidebarColumn } from '@/components/blog/BlogSidebarColumn';
import { BookmarkSelectionToolbar } from '@/components/bookmarks/BookmarkSelectionToolbar';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { getAnchorFromDomSelection } from '@/lib/bookmarks';
import { exportBlogPdf } from '@/lib/export-blog-pdf';
import { shareBlogWithFollowers } from '../../lib/follow-api';
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
      <div>
        <Navbar />
        <div className="h-screen w-screen flex items-center justify-center">
          <div className="text-xl">Loading blog...</div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div>
        <Navbar />
        <div className="h-screen w-screen flex items-center justify-center">
          <div className="text-xl">Blog not found</div>
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
    <div className="min-h-screen bg-background text-foreground">
      {!isFocusMode && <Navbar />}
      {!isFocusMode && (
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        {/* Back button */}
        <div className="mb-8 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/blogs')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blogs
        </button>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFocusMode}
          className="border-gray-300 dark:border-zinc-600"
        >
          <Maximize2 className="h-4 w-4" />
          <span className="ml-1.5 hidden sm:inline">Reading mode</span>
        </Button>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Main Content */}
          <div className="min-w-0 flex-1">
            {/* Blog header */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-50 mb-6 leading-tight">
                {blog.title}
              </h1>
              
              {/* Author info and stats */}
              <div className="flex items-center justify-between mb-6">
                <Link
                  to={blog.author?.username ? `/author/${blog.author.username}` : "#"}
                  className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                >
                  {safeAuthorImage ? (
                    <img
                      src={safeAuthorImage}
                      alt={blog.author?.username || "Author"}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-zinc-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600 dark:text-zinc-200" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">{firstUpperCase(blog.author?.username)}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(blog.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      {blog.readTime > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {blog.readTime} min read
                        </div>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Interaction stats */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <button
                    type="button"
                    onClick={handleLikePost}
                    className={`flex items-center gap-1 transition-colors ${
                      blog.isLiked
                        ? "text-red-500"
                        : "hover:text-red-500"
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${blog.isLiked ? "fill-current" : ""}`} />
                    {blog.likeCount ?? blog.likes?.length ?? 0} likes
                  </button>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {blog.viewCount} views
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {blog.comments?.length || 0} comments
                  </div>
                  {user && blog.status === "published" && (
                    <SaveToFolderButton blogId={id} blogTitle={blog.title} />
                  )}
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={pdfLoading}
                    className="flex items-center gap-1 transition-colors hover:text-foreground"
                    title="Download PDF"
                  >
                    <Download className="h-4 w-4" />
                    {pdfLoading ? "Converting…" : "Download PDF"}
                  </button>
                  {blog.status === "published" && (
                    <button
                      type="button"
                      onClick={handleShareBlog}
                      disabled={shareLoading}
                      className="flex items-center gap-1 transition-colors hover:text-foreground"
                      title="Share blog"
                    >
                      <Share2 className="h-4 w-4" />
                      {shareLoading ? "Sharing..." : "Share"}
                    </button>
                  )}
                </div>
              </div>

              {/* Main image */}
              {safeMainImage && (
                <div className="mb-8">
                  <img
                    src={safeMainImage}
                    alt={blog.title}
                    className="w-full h-64 md:h-96 object-cover rounded-lg"
                  />
                </div>
              )}

            </div>

            {/* Blog content */}
            <div ref={contentRef} className="prose prose-lg max-w-none mb-8">
              <TipTapContent content={blog.content} bookmarks={bookmarks} />
            </div>

            {/* About the author */}
            <div className="mb-10 border-t border-gray-200 dark:border-zinc-700 pt-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-4">
                About the Author
              </h2>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <Link
                  to={blog.author?.username ? `/author/${blog.author.username}` : "#"}
                  className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                >
                  {safeAuthorImage ? (
                    <img
                      src={safeAuthorImage}
                      alt={blog.author?.username || "Author"}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-zinc-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-50">
                      {firstUpperCase(blog.author?.username)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Published on{" "}
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
                  >
                    View profile
                  </Button>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="pt-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">Comments ({blog.comments?.length || 0})</h2>
              
              {/* Add comment form */}
              {user ? (
                <Card className="mb-8">
                  <CardContent className="p-6">
                    <form onSubmit={handleAddComment} className="space-y-4">
                      <Textarea
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[100px] resize-none"
                        disabled={isSubmittingComment}
                      />
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={isSubmittingComment || !newComment.trim()}
                          className="bg-gray-900 hover:bg-gray-800 text-white"
                        >
                          {isSubmittingComment ? "Posting..." : "Post Comment"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card className="mb-8">
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Please login to comment</p>
                    <Button
                      onClick={() => navigate('/login')}
                      className="bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      Login
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Comments list */}
              <div className="space-y-6">
                {blog.comments?.map((comment) => (
                  <Card key={comment._id} className="border border-gray-200 dark:border-zinc-700">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getSafeImageUrl(comment.user?.profileImage) ? (
                            <img
                              src={getSafeImageUrl(comment.user?.profileImage)}
                              alt={comment.user.username}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-zinc-600 flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-50">{comment.user?.username}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatTimeAgo(comment.createdAt)}</p>
                          </div>
                        </div>
                        
                        {/* Comment actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleLikeComment(comment._id)}
                            variant={comment.isLiked ? "default" : "ghost"}
                            size="sm"
                            className={`flex items-center gap-1 ${
                              comment.isLiked 
                                ? "bg-red-500 hover:bg-red-600 text-white" 
                                : "text-gray-500 dark:text-gray-400 hover:text-red-500"
                            }`}
                          >
                            <ThumbsUp className={`w-3 h-3 ${comment.isLiked ? "fill-current" : ""}`} />
                            {comment.likeCount ?? comment.likes?.length ?? 0}
                          </Button>
                          
                          <Button
                            onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300"
                          >
                            <Reply className="w-3 h-3" />
                          </Button>
                          
                          {(user?.id === comment.user?._id || user?.id === blog.author?._id) && (
                            <Button
                              onClick={() => handleDeleteComment(comment._id)}
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 dark:text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 mb-4">{comment.content}</p>
                      
                      {/* Reply form */}
                      {replyingTo === comment._id && user && (
                        <div className="ml-8 border-l-2 border-gray-200 dark:border-zinc-700 pl-4 mb-4">
                          <div className="space-y-3">
                            <Textarea
                              placeholder="Write a reply..."
                              value={newReply[comment._id] || ''}
                              onChange={(e) => setNewReply(prev => ({ ...prev, [comment._id]: e.target.value }))}
                              className="min-h-[80px] resize-none text-sm"
                              disabled={isSubmittingReply}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleAddReply(comment._id)}
                                disabled={isSubmittingReply || !newReply[comment._id]?.trim()}
                                size="sm"
                                className="bg-gray-900 hover:bg-gray-800 text-white"
                              >
                                {isSubmittingReply ? "Posting..." : "Reply"}
                              </Button>
                              <Button
                                onClick={() => setReplyingTo(null)}
                                variant="outline"
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Replies */}
                      {comment.replies?.length > 0 && (
                        <div className="ml-8 border-l-2 border-gray-200 dark:border-zinc-700 pl-4 space-y-4">
                          {comment.replies.map((reply) => (
                            <div key={reply._id} className="bg-gray-50 dark:bg-zinc-800/60 p-4 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {getSafeImageUrl(reply.user?.profileImage) ? (
                                    <img
                                      src={getSafeImageUrl(reply.user?.profileImage)}
                                      alt={reply.user.username}
                                      className="w-6 h-6 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-zinc-600 flex items-center justify-center">
                                      <User className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-50">{reply.user?.username}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(reply.createdAt)}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <Button
                                    onClick={() => handleLikeReply(comment._id, reply._id)}
                                    variant={reply.isLiked ? "default" : "ghost"}
                                    size="sm"
                                    className={`flex items-center gap-1 ${
                                      reply.isLiked 
                                        ? "bg-red-500 hover:bg-red-600 text-white" 
                                        : "text-gray-500 dark:text-gray-400 hover:text-red-500"
                                    }`}
                                  >
                                    <ThumbsUp className={`w-3 h-3 ${reply.isLiked ? "fill-current" : ""}`} />
                                    {reply.likeCount ?? reply.likes?.length ?? 0}
                                  </Button>
                                  
                                  {(user?.id === reply.user?._id || user?.id === blog.author?._id) && (
                                    <Button
                                      onClick={() => handleDeleteReply(comment._id, reply._id)}
                                      variant="ghost"
                                      size="sm"
                                      className="text-gray-500 dark:text-gray-400 hover:text-red-500"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
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
        <div className="fixed inset-0 z-[60] flex bg-background text-foreground">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm sm:px-8">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Reading mode</p>
              <h1 className="truncate text-lg font-semibold text-foreground sm:text-xl">{blog.title}</h1>
            </div>
            <Button variant="outline" size="sm" onClick={toggleFocusMode} className="shrink-0 border-gray-300 dark:border-zinc-600">
              <Minimize2 className="h-4 w-4" />
              <span className="ml-1.5 hidden sm:inline">Exit focus</span>
            </Button>
          </header>

          <article className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:max-w-6xl sm:px-10 sm:py-12">
              <h1 className="mb-6 text-3xl font-bold leading-tight text-foreground sm:text-5xl">
                {blog.title}
              </h1>

              <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-zinc-700">
                      <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                  )}
                  <span className="font-medium text-foreground">{firstUpperCase(blog.author?.username)}</span>
                </Link>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(blog.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                {blog.readTime > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {blog.readTime} min read
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleLikePost}
                  className={`flex items-center gap-1 transition-colors ${
                    blog.isLiked ? "text-red-500" : "hover:text-red-500"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${blog.isLiked ? "fill-current" : ""}`} />
                  {blog.likeCount ?? blog.likes?.length ?? 0} likes
                </button>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {blog.viewCount} views
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {blog.comments?.length || 0} comments
                </div>
              </div>

              {safeMainImage && (
                <div className="mb-10 overflow-hidden rounded-2xl">
                  <img
                    src={safeMainImage}
                    alt={blog.title}
                    className="h-auto max-h-[28rem] w-full object-cover"
                  />
                </div>
              )}

              <div ref={focusContentRef} className="prose prose-lg max-w-none dark:prose-invert sm:prose-xl">
                <TipTapContent content={blog.content} bookmarks={bookmarks} />
              </div>

              <p className="mt-12 text-center text-xs text-muted-foreground">
                Press Esc to exit reading mode
              </p>
            </div>
          </article>
          </div>

          <aside className="hidden w-72 shrink-0 overflow-hidden border-l border-border bg-background lg:flex lg:flex-col">
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