import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Clock
} from 'lucide-react';

/** Renders TipTap `text` nodes (with marks) for paragraphs, table cells, etc. */
function renderTextRuns(nodes, keyPrefix = 't') {
  if (!nodes || !Array.isArray(nodes)) return null;
  return nodes.map((textNode, textIndex) => {
    if (textNode.type !== 'text') return null;

    let text = textNode.text;
    let className = '';
    let customHighlightColor = null;
    let linkHref = null;
    let linkTarget = null;

    if (textNode.marks) {
      textNode.marks.forEach((mark) => {
        switch (mark.type) {
          case 'bold':
            className += ' font-bold';
            break;
          case 'italic':
            className += ' italic';
            break;
          case 'underline':
            className += ' underline';
            break;
          case 'strike':
            className += ' line-through';
            break;
          case 'highlight':
            if (mark.attrs && mark.attrs.color) {
              const color = mark.attrs.color;
              if (color.startsWith('var(--') || color.startsWith('#')) {
                className +=
                  ' px-1 rounded text-gray-900 dark:text-gray-100 ring-1 ring-black/10 dark:ring-white/20';
                customHighlightColor = color;
              } else {
                switch (color) {
                  case 'yellow':
                    className +=
                      ' bg-yellow-200 dark:bg-yellow-950/80 text-gray-900 dark:text-yellow-50 px-1 rounded';
                    break;
                  case 'green':
                    className +=
                      ' bg-green-200 dark:bg-green-950/80 text-gray-900 dark:text-green-50 px-1 rounded';
                    break;
                  case 'blue':
                    className +=
                      ' bg-blue-200 dark:bg-blue-950/80 text-gray-900 dark:text-blue-50 px-1 rounded';
                    break;
                  case 'red':
                    className +=
                      ' bg-red-200 dark:bg-red-950/80 text-gray-900 dark:text-red-50 px-1 rounded';
                    break;
                  case 'purple':
                    className +=
                      ' bg-purple-200 dark:bg-purple-950/80 text-gray-900 dark:text-purple-50 px-1 rounded';
                    break;
                  case 'pink':
                    className +=
                      ' bg-pink-200 dark:bg-pink-950/80 text-gray-900 dark:text-pink-50 px-1 rounded';
                    break;
                  case 'orange':
                    className +=
                      ' bg-orange-200 dark:bg-orange-950/80 text-gray-900 dark:text-orange-50 px-1 rounded';
                    break;
                  case 'teal':
                    className +=
                      ' bg-teal-200 dark:bg-teal-950/80 text-gray-900 dark:text-teal-50 px-1 rounded';
                    break;
                  case 'indigo':
                    className +=
                      ' bg-indigo-200 dark:bg-indigo-950/80 text-gray-900 dark:text-indigo-50 px-1 rounded';
                    break;
                  case 'gray':
                    className +=
                      ' bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 px-1 rounded';
                    break;
                  default:
                    className +=
                      ' bg-yellow-200 dark:bg-yellow-950/80 text-gray-900 dark:text-yellow-50 px-1 rounded';
                    break;
                }
              }
            } else {
              className +=
                ' bg-yellow-200 dark:bg-yellow-950/80 text-gray-900 dark:text-yellow-50 px-1 rounded';
            }
            break;
          case 'code':
            className +=
              ' bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2 py-1 rounded font-mono text-sm border border-zinc-200 dark:border-zinc-600';
            break;
          case 'link':
            linkHref = mark.attrs?.href;
            linkTarget = mark.attrs?.target;
            className += ' text-blue-600 dark:text-blue-400 underline';
            break;
          default:
            break;
        }
      });
    }

    const key = `${keyPrefix}-${textIndex}`;

    if (linkHref) {
      return (
        <a
          key={key}
          href={linkHref}
          target={linkTarget ?? undefined}
          rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
          className={className}
        >
          {text}
        </a>
      );
    }

    if (customHighlightColor) {
      return (
        <span
          key={key}
          className={className}
          style={{
            backgroundColor: customHighlightColor,
            display: 'inline-block',
          }}
        >
          {text}
        </span>
      );
    }

    return (
      <span key={key} className={className}>
        {text}
      </span>
    );
  });
}

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

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        // First, track the view
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/interactions/blog/${id}/view`, {}, {
          withCredentials: true
        });
        
        // Then fetch the blog with interactions
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/interactions/blog/${id}/interactions`, {
          withCredentials: true
        });
        setBlog(response.data.blog);
      } catch (error) {
        console.error('Error fetching blog:', error);
        console.error('Error response:', error.response?.data);
        toast.error('Error loading blog');
        // Redirect back to blogs page if blog not found
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
        likes: response.data.isLiked 
          ? [...prev.likes, { _id: user.id, username: user.username }]
          : prev.likes.filter(like => like._id !== user.id)
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
                likes: response.data.isLiked 
                  ? [...comment.likes, { _id: user.id, username: user.username }]
                  : comment.likes.filter(like => like._id !== user.id)
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
                        likes: response.data.isLiked 
                          ? [...reply.likes, { _id: user.id, username: user.username }]
                          : reply.likes.filter(like => like._id !== user.id)
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

  // Function to render TipTap content
  const renderTipTapContent = (content) => {
    if (typeof content === "string") {
      return <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">{content}</div>;
    }

    if (content && content.content && Array.isArray(content.content)) {
      return content.content.map((node, index) => {
        switch (node.type) {
          case 'paragraph':
            return (
              <p key={index} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {renderTextRuns(node.content, `p-${index}`)}
              </p>
            );
          
          case 'heading':
            const HeadingTag = `h${node.attrs?.level || 1}`;
            const headingStyles = {
              1: 'text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4 mt-8 first:mt-0',
              2: 'text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3 mt-6',
              3: 'text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-5',
              4: 'text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 mt-4',
              5: 'text-base font-semibold text-gray-700 dark:text-gray-300 mb-2 mt-3',
              6: 'text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 mt-2'
            };
            
            return (
              <HeadingTag 
                key={index} 
                className={headingStyles[node.attrs?.level || 1]}
              >
                {node.content && node.content.map((textNode, textIndex) => {
                  if (textNode.type === 'text') {
                    return textNode.text;
                  }
                  return null;
                })}
              </HeadingTag>
            );
          
          case 'image': {
            const safeNodeImage = getSafeImageUrl(node.attrs?.src);
            if (!safeNodeImage) return null;
            return (
              <div key={index} className="my-4 text-center">
                <img
                  src={safeNodeImage}
                  alt={node.attrs?.alt || 'Blog image'}
                  title={node.attrs?.title}
                  className="max-w-full h-auto rounded"
                  style={{ maxHeight: '500px' }}
                />
                {node.attrs?.alt && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">{node.attrs.alt}</p>
                )}
              </div>
            );
          }
          
          case 'blockquote':
            return (
              <blockquote key={index} className="border-l-4 border-gray-300 dark:border-zinc-600 pl-4 my-4 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800/60 py-2 rounded-r">
                {node.content && node.content.map((contentNode, contentIndex) => {
                  if (contentNode.type === 'text') {
                    return contentNode.text;
                  } else if (contentNode.type === 'paragraph') {
                    // Handle nested paragraphs in blockquotes
                    return contentNode.content && contentNode.content.map((textNode, textIndex) => {
                      if (textNode.type === 'text') {
                        return textNode.text;
                      }
                      return null;
                    });
                  }
                  return null;
                })}
              </blockquote>
            );
          
          case 'bulletList':
            return (
              <ul key={index} className="list-disc list-inside mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                {node.content && node.content.map((listItem, listIndex) => (
                  <li key={listIndex} className="mb-1">
                    {listItem.content && listItem.content.map((contentNode, contentIndex) => {
                      if (contentNode.type === 'text') {
                        return contentNode.text;
                      } else if (contentNode.type === 'paragraph') {
                        // Handle nested paragraphs in list items
                        return contentNode.content && contentNode.content.map((textNode, textIndex) => {
                          if (textNode.type === 'text') {
                            return textNode.text;
                          }
                          return null;
                        });
                      }
                      return null;
                    })}
                  </li>
                ))}
              </ul>
            );
          
          case 'orderedList':
            return (
              <ol key={index} className="list-decimal list-inside mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                {node.content && node.content.map((listItem, listIndex) => (
                  <li key={listIndex} className="mb-1">
                    {listItem.content && listItem.content.map((contentNode, contentIndex) => {
                      if (contentNode.type === 'text') {
                        return contentNode.text;
                      } else if (contentNode.type === 'paragraph') {
                        // Handle nested paragraphs in list items
                        return contentNode.content && contentNode.content.map((textNode, textIndex) => {
                          if (textNode.type === 'text') {
                            return textNode.text;
                          }
                          return null;
                        });
                      }
                      return null;
                    })}
                  </li>
                ))}
              </ol>
            );
          
          case 'taskList':
            return (
              <ul key={index} className="list-none mb-4 text-gray-700 dark:text-gray-300 leading-relaxed space-y-2">
                {node.content && node.content.map((taskItem, taskIndex) => (
                  <li key={taskIndex} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={taskItem.attrs?.checked || false}
                      readOnly
                      className="mt-1 w-4 h-4 text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 rounded focus:ring-blue-500"
                    />
                    <span className="flex-1">
                      {taskItem.content && taskItem.content.map((contentNode, contentIndex) => {
                        // Handle different content types within task items
                        if (contentNode.type === 'text') {
                          return contentNode.text;
                        } else if (contentNode.type === 'paragraph') {
                          // If it's a paragraph, render its content
                          return contentNode.content && contentNode.content.map((textNode, textIndex) => {
                            if (textNode.type === 'text') {
                              return textNode.text;
                            }
                            return null;
                          });
                        }
                        return null;
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            );
          
          case 'taskItem':
            return (
              <div key={index} className="flex items-start gap-3 mb-2">
                <input
                  type="checkbox"
                  checked={node.attrs?.checked || false}
                  readOnly
                  className="mt-1 w-4 h-4 text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 rounded focus:ring-blue-500"
                />
                <span className="flex-1">
                  {node.content && node.content.map((contentNode, contentIndex) => {
                    // Handle different content types within task items
                    if (contentNode.type === 'text') {
                      return contentNode.text;
                    } else if (contentNode.type === 'paragraph') {
                      // If it's a paragraph, render its content
                      return contentNode.content && contentNode.content.map((textNode, textIndex) => {
                        if (textNode.type === 'text') {
                          return textNode.text;
                        }
                        return null;
                      });
                    }
                    return null;
                  })}
                </span>
              </div>
            );
          
          case 'codeBlock':
            return (
              <div key={index} className="my-4">
                <pre className="bg-gray-100 dark:bg-zinc-900 p-4 rounded overflow-x-auto border border-zinc-200 dark:border-zinc-700">
                  <code className="text-sm text-gray-800 dark:text-zinc-200 font-mono">
                    {node.content && node.content.map((textNode, textIndex) => {
                      if (textNode.type === 'text') {
                        return textNode.text;
                      }
                      return null;
                    })}
                  </code>
                </pre>
              </div>
            );

          case 'table': {
            const rows = node.content || [];
            const firstRow = rows[0];
            const useThead =
              firstRow?.content?.length > 0 &&
              firstRow.content.every((c) => c.type === 'tableHeader');
            const bodyRows = useThead ? rows.slice(1) : rows;

            const renderRow = (row, ri, keyPrefix) => (
              <tr key={`${keyPrefix}-${ri}`} className="border-b border-gray-200 dark:border-zinc-700">
                {row.content?.map((cell, ci) => {
                  const CellTag = cell.type === 'tableHeader' ? 'th' : 'td';
                  return (
                    <CellTag
                      key={ci}
                      colSpan={cell.attrs?.colspan ?? 1}
                      rowSpan={cell.attrs?.rowspan ?? 1}
                      className={
                        cell.type === 'tableHeader'
                          ? 'border border-gray-300 dark:border-zinc-600 bg-gray-100 dark:bg-zinc-700 px-3 py-2 text-left text-sm font-semibold text-gray-900 dark:text-zinc-100'
                          : 'border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-3 py-2 align-top text-sm text-gray-800 dark:text-zinc-200'
                      }
                      style={
                        cell.attrs?.minHeight != null && cell.attrs.minHeight > 0
                          ? { minHeight: `${cell.attrs.minHeight}px` }
                          : undefined
                      }
                    >
                      {cell.content?.map((block, bi) => {
                        if (block.type === 'paragraph') {
                          return (
                            <p
                              key={bi}
                              className="mb-1 last:mb-0 leading-relaxed text-inherit"
                            >
                              {renderTextRuns(
                                block.content,
                                `${keyPrefix}-${ri}-${ci}-${bi}`
                              )}
                            </p>
                          );
                        }
                        return null;
                      })}
                    </CellTag>
                  );
                })}
              </tr>
            );

            return (
              <div key={index} className="my-6 w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-950">
                <table className="w-full min-w-[280px] border-collapse text-left text-foreground">
                  {useThead && firstRow ? (
                    <thead>{renderRow(firstRow, 0, `tbl-${index}`)}</thead>
                  ) : null}
                  <tbody>
                    {bodyRows.map((row, ri) =>
                      renderRow(row, ri, `tbl-${index}-b`)
                    )}
                  </tbody>
                </table>
              </div>
            );
          }
          
          default:
            // Fallback: Try to render any content we can find
            if (node.content && Array.isArray(node.content)) {
              return (
                <div key={index} className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-800 rounded">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                    <strong>Content Type:</strong> {node.type}
                  </p>
                  <div className="text-gray-700 dark:text-gray-300">
                    {node.content.map((contentNode, contentIndex) => {
                      if (contentNode.type === 'text') {
                        return <span key={contentIndex}>{contentNode.text}</span>;
                      } else if (contentNode.type === 'paragraph') {
                        return (
                          <p key={contentIndex} className="mb-2">
                            {contentNode.content && contentNode.content.map((textNode, textIndex) => {
                              if (textNode.type === 'text') {
                                return textNode.text;
                              }
                              return null;
                            })}
                          </p>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              );
            }
            
            return null;
        }
      });
    }
    
    // Fallback for other content types
    return (
      <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
        <pre className="whitespace-pre-wrap bg-gray-100 dark:bg-zinc-800 p-4 rounded border border-border">{JSON.stringify(content, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/blogs')}
          className="mb-8 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-50 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blogs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Blog header */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-50 mb-6 leading-tight">
                {blog.title}
              </h1>
              
              {/* Author info and stats */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
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
                </div>

                {/* Interaction stats */}
                <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {blog.viewCount} views
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {blog.comments?.length || 0} comments
                  </div>
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
            <div className="prose prose-lg max-w-none mb-8">
              {renderTipTapContent(blog.content)}
            </div>

            {/* Like button */}
            <div className="mb-12">
              <Button
                onClick={handleLikePost}
                variant={blog.isLiked ? "default" : "outline"}
                className={`flex items-center gap-2 ${
                  blog.isLiked 
                    ? "bg-red-500 hover:bg-red-600 text-white" 
                    : "border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                }`}
              >
                <Heart className={`w-4 h-4 ${blog.isLiked ? "fill-current" : ""}`} />
                {blog.isLiked ? "Liked" : "Like"} ({blog.likes?.length || 0})
              </Button>
            </div>

            {/* Comments Section */}
            <div className="border-t border-gray-200 dark:border-zinc-700 pt-8">
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
                            {comment.likes?.length || 0}
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
                                    {reply.likes?.length || 0}
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

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Blog stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Blog Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Views</span>
                    </div>
                    <span className="font-semibold">{blog.viewCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Likes</span>
                    </div>
                    <span className="font-semibold">{blog.likes?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Comments</span>
                    </div>
                    <span className="font-semibold">{blog.comments?.length || 0}</span>
                  </div>
                  {blog.uniqueViewCount && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Unique Views</span>
                      </div>
                      <span className="font-semibold">{blog.uniqueViewCount}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Author info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About the Author</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    {safeAuthorImage ? (
                      <img
                        src={safeAuthorImage}
                        alt={blog.author.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-zinc-600 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-50">{blog.author?.username}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Blog Author</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Published on {new Date(blog.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;