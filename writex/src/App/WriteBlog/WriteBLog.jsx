import React, { useRef, useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const WriteBlog = () => {
  const editorRef = useRef(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [isPublishing, setIsPublishing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mainImage, setMainImage] = useState(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editBlogId, setEditBlogId] = useState(null);
  const [originalStatus, setOriginalStatus] = useState("draft");
  const [aiMessage, setAiMessage] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState([
    "Improve your blog title to be more engaging",
    "Add more descriptive content to your introduction",
    "Consider adding relevant images to support your points",
    "Break down complex ideas into smaller paragraphs",
    "End with a strong conclusion that summarizes your main points"
  ]);
  
  const location = useLocation();
  const navigate = useNavigate();

  const handleMainImageChange = React.useCallback((imageUrl) => {
    setMainImage(imageUrl);
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTags("");
    setCategory("General");
    setMainImage(null);
    setIsEditMode(false);
    setEditBlogId(null);
    setOriginalStatus("draft");
    setAiMessage("");
    
    if (editorRef.current) {
      editorRef.current.commands.clearContent();
    }
  };

  const hasUnsavedChanges = () => {
    if (!isEditMode) return false;
    
    // Check if any field has changed from the original
    const originalBlog = location.state?.editBlog;
    if (!originalBlog) return false;
    
    return (
      title !== originalBlog.title ||
      category !== originalBlog.category ||
      description !== originalBlog.description ||
      tags !== originalBlog.tags ||
      mainImage !== originalBlog.mainImage
    );
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges()) {
      if (window.confirm("You have unsaved changes. Are you sure you want to cancel editing? All changes will be lost.")) {
        resetForm();
        navigate("/myblogs");
      }
    } else {
      resetForm();
      navigate("/myblogs");
    }
  };

  const handleNavigateAway = () => {
    if (isEditMode && hasUnsavedChanges()) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        resetForm();
        navigate("/myblogs");
      }
    } else {
      navigate("/myblogs");
    }
  };

  // Handle edit mode when component mounts
  useEffect(() => {
    if (location.state?.editBlog) {
      const blog = location.state.editBlog;
      setIsEditMode(true);
      setEditBlogId(blog._id);
      setTitle(blog.title || "");
      setCategory(blog.category || "General");
      setMainImage(blog.mainImage || null);
      setDescription(blog.description || "");
      setTags(blog.tags || "");
      setOriginalStatus(blog.status || "draft");
      
      // Set editor content after a short delay to ensure editor is initialized
      setTimeout(() => {
        if (editorRef.current && blog.content) {
          try {
            // Handle both string and JSON content
            const content = typeof blog.content === 'string' ? JSON.parse(blog.content) : blog.content;
            editorRef.current.commands.setContent(content);
          } catch (error) {
            console.error("Error setting editor content:", error);
            // If parsing fails, set as plain text
            if (typeof blog.content === 'string') {
              editorRef.current.commands.setContent([{
                type: 'paragraph',
                content: [{ type: 'text', text: blog.content }]
              }]);
            }
          }
        }
      }, 100);
    }

    // Cleanup function to reset form when component unmounts
    return () => {
      if (isEditMode) {
        resetForm();
      }
    };
  }, [location.state, isEditMode]);

  // Warn user before leaving if they have unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isEditMode && hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isEditMode, hasUnsavedChanges]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (e) => {
      if (isEditMode && hasUnsavedChanges()) {
        e.preventDefault();
        if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
          resetForm();
          navigate("/myblogs");
        } else {
          // Push the current state back to prevent navigation
          window.history.pushState(null, '', window.location.pathname);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isEditMode, hasUnsavedChanges, navigate]);

  const handlePublish = async (e) => {
    e.preventDefault();
    
    // Validation checks
    if (!mainImage) {
      toast.warning("Please upload at least one image");
      return;
    }
    if (!description.trim()) {
      toast.warning("Please enter a short description");
      return;
    }
    if (!title.trim()) {
      toast.warning("Please enter a title");
      return;
    }
    if (!editorRef.current) {
      toast.warning("Editor not initialized, please refresh the page");
      return;
    }

    setIsPublishing(true);

    try {
      const editorContent = editorRef.current.getJSON();
      
      // Additional validation
      if (!editorContent || Object.keys(editorContent).length === 0) {
        toast.warning("Please add some content to your blog before publishing");
        setIsPublishing(false);
        return;
      }

      const blogData = {
        title: title.trim(),
        mainImage,
        content: editorContent,
        category: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
        status: "published",
        tags: tags.trim() || [],
        description: description.trim(),
      };

      let response;
      
      if (isEditMode) {
        // Update existing blog
        response = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/blog/updateblog/${editBlogId}`, 
          blogData,
          { withCredentials: true }
        );
        toast.success("Blog updated successfully!");
      } else {
        // Create new blog
        response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/blog/addblog`, 
          blogData,
          { withCredentials: true }
        );
        toast.success("Blog published successfully!");
      }

      if (response.data) {
        setDialogOpen(false);
        
        if (isEditMode) {
          // Navigate back to MyBlog page after successful edit
          navigate("/myblogs");
        } else {
          // Reset form for new blog
          setTitle("");
          setDescription("");
          setTags("");
          setCategory("General");
          setMainImage(null);
          
          // Clear editor content
          if (editorRef.current) {
            editorRef.current.commands.clearContent();
          }
        }
      }
    } catch (error) {
      console.error("Publishing error:", error);
      
      if (error.response) {
        // Server responded with error
        const errorMessage = error.response.data?.message || error.response.data?.error || "Server error occurred";
        toast.error(`${isEditMode ? 'Updating' : 'Publishing'} failed: ${errorMessage}`);
      } else if (error.request) {
        // Network error
        toast.error("Network error: Please check your internet connection");
      } else {
        // Other error
        toast.error(`${isEditMode ? 'Updating' : 'Publishing'} failed: ${error.message}`);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim() && !description.trim()) {
      toast.warning("Please add at least a title or description to save as draft");
      return;
    }

    try {
      const editorContent = editorRef.current ? editorRef.current.getJSON() : {};
      
      const draftData = {
        title: title.trim() || "Untitled Draft",
        mainImage: mainImage || null,
        content: editorContent,
        category: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
        status: "draft",
        tags: tags.trim() || [],
        description: description.trim() || "No description",
      };

      let response;
      
      if (isEditMode) {
        // Update existing blog as draft
        response = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/blog/updateblog/${editBlogId}`, 
          draftData,
          { withCredentials: true }
        );
        toast.success("Draft updated successfully!");
      } else {
        // Create new draft
        response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/blog/addblog`, 
          draftData,
          { withCredentials: true }
        );
        toast.success("Draft saved successfully!");
      }

      if (response.data && isEditMode) {
        // Navigate back to MyBlog page after successful edit
        navigate("/myblogs");
      }
    } catch (error) {
      console.error("Saving draft error:", error);
      toast.error(`Failed to save draft: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAiSuggestion = (suggestion) => {
    setAiMessage(suggestion);
  };

  const handleAiMessageSend = () => {
    if (aiMessage.trim()) {
      // Here you would typically send the message to an AI service
      // For now, we'll just show a toast
      toast.info("AI Assistant: " + aiMessage);
      setAiMessage("");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="flex h-[calc(100vh-4rem)] mt-16">
        {/* AI Assistant Sidebar */}
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
          {/* AI Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">AI Assistant</h2>
                <p className="text-gray-500">Your writing companion</p>
              </div>
            </div>
          </div>

          {/* AI Content */}
          <div className="flex-1 p-8 space-y-8">
            {/* Writing Tips */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Writing Tips
              </h3>
              <div className="space-y-3">
                {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => handleAiSuggestion(suggestion)}
                  >
                    <p className="text-sm text-gray-700 leading-relaxed">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-gray-200" />

            {/* AI Chat */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Ask AI
              </h3>
              <div className="space-y-3">
                <Textarea
                  placeholder="Ask me anything about your blog..."
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  className="min-h-[100px] text-sm bg-white border-gray-300 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAiMessageSend();
                    }
                  }}
                />
                <Button
                  onClick={handleAiMessageSend}
                  disabled={!aiMessage.trim()}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Send Message
                </Button>
              </div>
            </div>

            <Separator className="bg-gray-200" />

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => handleAiSuggestion("Generate a compelling title for my blog")}
                >
                  Generate Title
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => handleAiSuggestion("Help me improve my blog's introduction")}
                >
                  Improve Introduction
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => handleAiSuggestion("Suggest relevant tags for my blog")}
                >
                  Suggest Tags
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Section */}
        <div className="flex-1 bg-white flex flex-col">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-10 py-8 border-b border-gray-200">
            <div className="flex items-center gap-6">
              {isEditMode && (
                <Button
                  variant="ghost"
                  onClick={handleNavigateAway}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? "Edit Blog" : "Write New Blog"}
                </h1>
                <p className="text-gray-500 mt-1">
                  {isEditMode ? "Make your changes and publish" : "Create something amazing"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline"
                onClick={handleSaveDraft}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6"
              >
                Save Draft
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    disabled={isPublishing}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-6"
                  >
                    {isPublishing ? (isEditMode ? "Updating..." : "Publishing...") : (isEditMode ? "Update Blog" : "Publish")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                      Complete Your Blog Details
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="title" className="text-sm font-medium">
                        Blog Title *
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        className="bg-gray-50 border-gray-300"
                        placeholder="Enter your blog title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="description" className="text-sm font-medium">
                        Short Description *
                      </Label>
                      <Input
                        id="description"
                        name="description"
                        className="bg-gray-50 border-gray-300"
                        placeholder="Enter a brief description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="tags" className="text-sm font-medium">
                        Tags (Optional)
                      </Label>
                      <Input
                        id="tags"
                        name="tags"
                        className="bg-gray-50 border-gray-300"
                        placeholder="Enter tags separated by commas"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                      />
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="category" className="text-sm font-medium">
                        Category *
                      </Label>
                      <Select
                        value={category}
                        onValueChange={(value) => setCategory(value)}
                      >
                        <SelectTrigger className="w-full bg-gray-50 border-gray-300">
                          <SelectValue placeholder="Select category"/>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General">General</SelectItem>
                          <SelectItem value="Personal">Personal</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="Tech">Tech</SelectItem>
                          <SelectItem value="Health">Health</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Entertainment">Entertainment</SelectItem>
                          <SelectItem value="Sports">Sports</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter className="gap-3">
                    <DialogClose asChild>
                      <Button variant="outline" className="border-gray-300 text-gray-700">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      onClick={handlePublish}
                      disabled={isPublishing || !title.trim() || !description.trim()}
                      className="bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      {isPublishing ? (isEditMode ? "Updating..." : "Publishing...") : (isEditMode ? "Update Blog" : "Publish Blog")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Editor Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <SimpleEditor
              getEditorInstance={(editor) => (editorRef.current = editor)}
              onMainImageChange={handleMainImageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteBlog;
