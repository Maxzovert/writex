import React, { useRef, useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { Button } from "../../components/ui/button";
import axios from "axios";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-row flex-1 min-h-0">
        <div className="w-1/2 bg-gray-300 mt-20 rounded-r-4xl">
          {/* Preview area */}
        </div>
        {/* Editor */}
        <div className="w-1/2 flex flex-col">
          <div className="flex items-center justify-between mt-14 mb-2 px-4">
            {isEditMode && (
              <button
                onClick={handleNavigateAway}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to My Blogs
              </button>
            )}
            <h1 className="text-center font-bold text-3xl flex-1">
              {isEditMode ? "Edit Your Blog" : "Write Your Blog"}
            </h1>
            {isEditMode && <div className="w-24"></div>} {/* Spacer for centering */}
          </div>
          {isEditMode && (
            <p className="text-center text-gray-600 mb-4">
              Editing: {title}
            </p>
          )}
          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
            <SimpleEditor
              getEditorInstance={(editor) => (editorRef.current = editor)}
              onMainImageChange={handleMainImageChange}
            />
            <div className="flex justify-center mt-4 mb-4 gap-4">
              {isEditMode && (
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="text-center"
                >
                  Cancel Edit
                </Button>
              )}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    disabled={isPublishing}
                    className="text-center"
                    onClick={() => setDialogOpen(true)}
                  >
                    {isPublishing ? (isEditMode ? "Updating..." : "Publishing...") : (isEditMode ? "Update Blog" : "Publish Now")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[650px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-medium">
                      Complete Your Blog Details
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="title">
                        Blog Title *
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        className="bg-gray-200"
                        placeholder="Enter your blog title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="description">
                        Short Description *
                      </Label>
                      <Input
                        id="description"
                        name="description"
                        className="bg-gray-200"
                        placeholder="Enter a brief description of your blog"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="tags">
                        Tags (Optional)
                      </Label>
                      <Input
                        id="tags"
                        name="tags"
                        className="bg-gray-200"
                        placeholder="Enter tags separated by commas"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                      />
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="category">
                        Category *
                      </Label>
                      <Select
                        value={category}
                        onValueChange={(value) => setCategory(value)}
                      >
                        <SelectTrigger className="w-full bg-gray-200">
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

                  <DialogFooter className="gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      onClick={handlePublish}
                      disabled={isPublishing || !title.trim() || !description.trim()}
                    >
                      {isPublishing ? (isEditMode ? "Updating..." : "Publishing...") : (isEditMode ? "Update Blog" : "Publish Blog")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button 
                className="text-center" 
                variant="outline"
                onClick={handleSaveDraft}
              >
                Save as Draft
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteBlog;
