import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../Components/Navbar';

const BlogPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/public/posts/blog/${id}`);
        setBlog(response.data.post);
        toast.success('Blog loaded successfully');
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

  // Function to render TipTap content
  const renderTipTapContent = (content) => {
    if (typeof content === "string") {
      return <div className="text-gray-700 leading-relaxed text-lg">{content}</div>;
    }

    // Debug: Log the content structure
    console.log('=== TIPTAP CONTENT DEBUG ===');
    console.log('Content type:', typeof content);
    console.log('Content:', content);
    console.log('Content.content:', content?.content);
    console.log('Content.content length:', content?.content?.length);
    
    if (content && content.content && Array.isArray(content.content)) {
      console.log('Processing content array...');
      return content.content.map((node, index) => {
        // Debug: Log each node
        console.log(`=== Node ${index} ===`);
        console.log('Node type:', node.type);
        console.log('Node attrs:', node.attrs);
        console.log('Node content:', node.content);
        console.log('Node marks:', node.marks);
        
        switch (node.type) {
          case 'paragraph':
            console.log('Processing paragraph node...');
            return (
              <p key={index} className="mb-4 text-gray-700 leading-relaxed text-lg">
                {node.content && node.content.map((textNode, textIndex) => {
                  console.log(`=== Text Node ${textIndex} ===`);
                  console.log('Text node type:', textNode.type);
                  console.log('Text node text:', textNode.text);
                  console.log('Text node marks:', textNode.marks);
                  
                  if (textNode.type === 'text') {
                    let text = textNode.text;
                    let className = '';
                    
                    // Apply marks (formatting) - keeping it simple like the editor
                    if (textNode.marks) {
                      console.log('Processing marks for text:', text);
                      textNode.marks.forEach((mark, markIndex) => {
                        console.log(`Processing mark ${markIndex}:`, mark.type, mark.attrs);
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
                          case 'highlight':
                            // Handle different highlight colors
                            if (mark.attrs && mark.attrs.color) {
                              const color = mark.attrs.color;
                              console.log('Highlight color detected:', color, mark.attrs);
                              
                              // Check if it's a CSS custom property or hex color
                              if (color.startsWith('var(--') || color.startsWith('#')) {
                                // For custom colors, we'll use inline styles
                                className += ' px-1 rounded';
                                // Store the color for later use
                                textNode.customHighlightColor = color;
                              } else {
                                // Handle predefined colors
                                switch (color) {
                                  case 'yellow':
                                    className += ' bg-yellow-200 px-1 rounded';
                                    break;
                                  case 'green':
                                    className += ' bg-green-200 px-1 rounded';
                                    break;
                                  case 'blue':
                                    className += ' bg-blue-200 px-1 rounded';
                                    break;
                                  case 'red':
                                    className += ' bg-red-200 px-1 rounded';
                                    break;
                                  case 'purple':
                                    className += ' bg-purple-200 px-1 rounded';
                                    break;
                                  case 'pink':
                                    className += ' bg-pink-200 px-1 rounded';
                                    break;
                                  case 'orange':
                                    className += ' bg-orange-200 px-1 rounded';
                                    break;
                                  case 'teal':
                                    className += ' bg-teal-200 px-1 rounded';
                                    break;
                                  case 'indigo':
                                    className += ' bg-indigo-200 px-1 rounded';
                                    break;
                                  case 'gray':
                                    className += ' bg-gray-200 px-1 rounded';
                                    break;
                                  default:
                                    className += ' bg-yellow-200 px-1 rounded'; // Fallback
                                    break;
                                }
                              }
                            } else {
                              className += ' bg-yellow-200 px-1 rounded'; // Fallback
                            }
                            break;
                          case 'code':
                            className += ' bg-gray-100 px-2 py-1 rounded font-mono text-sm';
                            break;
                          case 'link':
                            className += ' text-blue-600 underline';
                            break;
                        }
                      });
                    }
                    
                    // Check if we need to apply custom highlight color
                    if (textNode.customHighlightColor) {
                      return (
                        <span 
                          key={textIndex} 
                          className={className}
                          style={{ 
                            backgroundColor: textNode.customHighlightColor,
                            display: 'inline-block'
                          }}
                        >
                          {text}
                        </span>
                      );
                    }
                    
                    return (
                      <span key={textIndex} className={className}>
                        {text}
                      </span>
                    );
                  }
                  return null;
                })}
              </p>
            );
          
          case 'heading':
            const HeadingTag = `h${node.attrs?.level || 1}`;
            const headingStyles = {
              1: 'text-3xl font-bold text-gray-900 mb-4 mt-8 first:mt-0',
              2: 'text-2xl font-bold text-gray-800 mb-3 mt-6',
              3: 'text-xl font-semibold text-gray-800 mb-3 mt-5',
              4: 'text-lg font-semibold text-gray-700 mb-2 mt-4',
              5: 'text-base font-semibold text-gray-700 mb-2 mt-3',
              6: 'text-sm font-semibold text-gray-700 mb-2 mt-2'
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
          
          case 'image':
            return (
              <div key={index} className="my-4 text-center">
                <img
                  src={node.attrs?.src}
                  alt={node.attrs?.alt || 'Blog image'}
                  title={node.attrs?.title}
                  className="max-w-full h-auto rounded"
                  style={{ maxHeight: '500px' }}
                />
                {node.attrs?.alt && (
                  <p className="text-sm text-gray-500 mt-2 italic">{node.attrs.alt}</p>
                )}
              </div>
            );
          
          case 'blockquote':
            return (
              <blockquote key={index} className="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-600 bg-gray-50 py-2 rounded-r">
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
              <ul key={index} className="list-disc list-inside mb-4 text-gray-700 leading-relaxed">
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
              <ol key={index} className="list-decimal list-inside mb-4 text-gray-700 leading-relaxed">
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
              <ul key={index} className="list-none mb-4 text-gray-700 leading-relaxed space-y-2">
                {node.content && node.content.map((taskItem, taskIndex) => (
                  <li key={taskIndex} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={taskItem.attrs?.checked || false}
                      readOnly
                      className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
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
                  className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
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
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                  <code className="text-sm text-gray-800 font-mono">
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
          
          default:
            // For debugging - log unknown node types
            console.log('Unknown node type:', node.type, node);
            
            // Fallback: Try to render any content we can find
            if (node.content && Array.isArray(node.content)) {
              return (
                <div key={index} className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800 mb-2">
                    <strong>Content Type:</strong> {node.type}
                  </p>
                  <div className="text-gray-700">
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
      <div className="text-gray-700 leading-relaxed text-lg">
        <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded border">{JSON.stringify(content, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/blogs')}
          className="mb-8 flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blogs
        </button>

        {/* Blog header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {blog.title} <span className="text-sm text-gray-600 mb-4">{blog.status}</span>
          </h1>
          <div className="flex items-center gap-4">
            {blog.profileImage && (
              <img
                src={blog.profileImage}
                alt={blog.author?.username || "Author"}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <p className="font-semibold text-xl text-gray-800">{firstUpperCase(blog.author?.username)}</p>
              <p className="text-gray-600 text-lg">
                {new Date(blog.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Blog content */}
        <div className="prose prose-lg max-w-none">
          {renderTipTapContent(blog.content)}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;